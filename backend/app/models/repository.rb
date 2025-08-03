# frozen_string_literal: true

class Repository < ApplicationRecord
  belongs_to :user
  has_many :file_items, dependent: :destroy
  has_many :extensions, dependent: :destroy

  accepts_nested_attributes_for :extensions, allow_destroy: true

  validates :commit_hash, presence: true
  validates :name, presence: true
  validates :url, presence: true

  BATCH_SIZE = 1000

  def file_items_grouped_by_parent
    file_items = self.file_items.to_a
    file_items.group_by(&:parent_id)
  end

  def save_with_file_items(client)
    transaction do
      is_saved = save && save_file_items_with_status?(client)
      raise ActiveRecord::Rollback unless is_saved

      true
    end
  end

  def progress
    files = file_items.where(type: :file)
    if files.empty?
      1.0
    else
      typed_count = files.where(status: :typed).count
      typed_count.to_f / files.count
    end
  end

  private

  def save_file_items_with_status?(client)
    file_tree_data = client.tree(url, commit_hash, recursive: true)
    create_file_items_by_depth?(file_tree_data.tree) && update_directories_status
  end

  def create_file_items_by_depth?(file_tree)
    file_tree_grouped_by_depth = file_tree.group_by { |file_item| depth_of(file_item.path) }
    directory_items_map = {} # typeがtreeで作成済みfile_itemのマップ（path => FileItem）

    file_tree_grouped_by_depth.keys.sort.each do |depth|
      file_tree_at_depth = file_tree_grouped_by_depth[depth]
      file_items_batch = build_file_items_batch(file_tree_at_depth, directory_items_map)
      import_result = FileItem.import(file_items_batch, batch_size: BATCH_SIZE, timestamps: true)

      if import_result.failed_instances.any?
        import_result.failed_instances.each do |failed_item|
          failed_item.errors.each do |error|
            errors.add("file_item.#{error.attribute}", error.message)
          end
        end

        return false
      end

      new_directory_items = extract_directory_items(file_tree_at_depth, file_items_batch)
      directory_items_map.merge!(new_directory_items)
    end

    true
  end

  def update_directories_status
    directory_items = file_items.where(type: :dir).includes(:children, repository: :extensions)
    sorted_directory_items = directory_items.sort_by { |dir| -depth_of(dir.path) }

    sorted_directory_items.each do |directory_item|
      children = directory_item.children.reload
      is_active = children.any?(&:is_active)
      is_typed = children.all? { |child| !child.is_active || child.typed? }

      directory_item.update(is_active: is_active, status: is_typed ? :typed : :untyped)
    end
  end

  def build_file_items_batch(file_items, directory_items_map)
    file_items.map do |file_item|
      parent_item = find_parent_item(file_item.path, directory_items_map)
      is_active = calculate_is_active(file_item)

      FileItem.new(
        repository: self,
        parent: parent_item,
        name: File.basename(file_item.path),
        path: file_item.path,
        type: directory?(file_item) ? :dir : :file,
        content: nil,
        status: :untyped,
        is_active: is_active
      )
    end
  end

  def calculate_is_active(file_item)
    return false if directory?(file_item) # ディレクトリは後で子の状態に基づいて更新されるため、仮でfalseとする

    file_extension = File.extname(file_item.path)
    file_extension = 'without extension' if file_extension.empty?

    extension = extensions.find { |ext| ext.name == file_extension }
    extension.is_active
  end

  def extract_directory_items(file_items, created_file_items)
    file_items.filter_map.with_index do |file_item, index|
      [file_item.path, created_file_items[index]] if directory?(file_item)
    end.to_h
  end

  def depth_of(path)
    path.count('/')
  end

  def directory?(file_item)
    file_item.type == 'tree'
  end

  def find_parent_item(path, directory_items_map)
    parent_path = File.dirname(path)
    return nil if parent_path == '.'

    directory_items_map[parent_path]
  end
end

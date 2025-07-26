# frozen_string_literal: true

class Repository < ApplicationRecord
  belongs_to :user
  has_many :file_items, dependent: :destroy

  validates :commit_hash, presence: true
  validates :name, presence: true
  validates :url, presence: true

  BATCH_SIZE = 1000

  def save_with_file_items(client)
    transaction do
      is_saved = save && save_file_items?(client)
      raise ActiveRecord::Rollback unless is_saved

      true
    end
  end

  private

  def save_file_items?(client)
    file_tree_data = client.tree(url, commit_hash, recursive: true)
    create_file_items_by_depth?(file_tree_data.tree)
  end

  def create_file_items_by_depth?(file_tree)
    file_items_grouped_by_depth = file_tree.group_by { |file_item| depth_of(file_item.path) }
    directory_items_map = {} # typeがtreeで作成済みfile_itemのマップ（path => FileItem）

    file_items_grouped_by_depth.keys.sort.each do |depth|
      file_items_at_depth = file_items_grouped_by_depth[depth]
      file_items_to_import = build_file_items_batch(file_items_at_depth, directory_items_map)
      import_result = FileItem.import(file_items_to_import, batch_size: BATCH_SIZE, timestamps: true)

      if import_result.failed_instances.any?
        import_result.failed_instances.each do |failed_item|
          failed_item.errors.each do |error|
            errors.add("file_item.#{error.attribute}", error.message)
          end
        end

        return false
      end

      new_directory_items = extract_directory_items(file_items_at_depth, file_items_to_import)
      directory_items_map.merge!(new_directory_items)
    end

    true
  end

  def build_file_items_batch(file_items, directory_items_map)
    file_items.map do |file_item|
      parent_item = find_parent_item(file_item.path, directory_items_map)

      FileItem.new(
        repository: self,
        parent: parent_item,
        name: File.basename(file_item.path),
        type: directory?(file_item) ? :dir : :file,
        content: nil,
        status: :untyped
      )
    end
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
    return nil if root_directory?(parent_path)

    directory_items_map[parent_path]
  end

  def root_directory?(path)
    path == '.'
  end
end

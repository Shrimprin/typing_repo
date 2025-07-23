# frozen_string_literal: true

class Repository < ApplicationRecord
  belongs_to :user
  has_many :file_items, dependent: :destroy

  validates :commit_hash, presence: true
  validates :name, presence: true
  validates :url, presence: true

  def save_with_file_items(client)
    transaction do
      save && save_file_items(client)
    end
  end

  private

  def save_file_items(client)
    file_tree_data = client.tree(url, commit_hash, recursive: true)
    create_file_items_by_depth(file_tree_data.tree)
  end

  def create_file_items_by_depth(file_tree)
    file_items_grouped_by_depth = file_tree.group_by { |file_item| file_item.path.count('/') }
    created_file_items_map = {} # typeがtreeで作成済みfile_itemのマップ（path => FileItem）

    file_items_grouped_by_depth.keys.sort.each do |depth|
      file_items_at_depth = file_items_grouped_by_depth[depth]
      created_file_items = create_file_items_batch(file_items_at_depth, created_file_items_map)
      new_file_items_map = build_file_items_map(file_items_at_depth, created_file_items)
      created_file_items_map.merge!(new_file_items_map)
    end
  end

  def create_file_items_batch(file_items, created_file_items_map)
    file_items_to_import = file_items.map do |file_item|
      parent_path = File.dirname(file_item.path)
      parent_item = parent_path == '.' ? nil : created_file_items_map[parent_path]

      FileItem.new(
        repository: self,
        parent: parent_item,
        name: File.basename(file_item.path),
        type: file_item.type == 'tree' ? :dir : :file,
        content: nil,
        status: :untyped
      )
    end

    FileItem.import(file_items_to_import, batch_size: 1000, timestamps: true)

    file_items_to_import
  end

  def build_file_items_map(file_items, created_file_items)
    file_items_map = {}
    file_items.each_with_index do |file_item, index|
      file_items_map[file_item.path] = created_file_items[index] if file_item.type == 'tree'
    end
    file_items_map
  end
end

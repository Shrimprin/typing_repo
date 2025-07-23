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
    tree = client.tree(url, commit_hash, recursive: true)
    created_file_items_map = {} # 作成済みfile_itemのマップ（path => FileItem）
    sorted_items = tree.tree.sort_by { |item| item.path.count('/') }

    sorted_items.each do |item|
      parent_path = File.dirname(item.path)
      parent_item = parent_path == '.' ? nil : created_file_items_map[parent_path]
      file_item_scope = parent_item ? parent_item.children : file_items
      file_name = File.basename(item.path)
      file_type = item.type == 'tree' ? :dir : :file

      file_item = file_item_scope.create!(
        repository: self,
        name: file_name,
        type: file_type,
        content: nil,
        status: :untyped
      )
      created_file_items_map[item.path] = file_item
    end
  end
end

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

  def save_file_items(client, parent_file_item = nil, file_path = '')
    files = client.contents(url, path: file_path)
    files.each do |file|
      file_item_scope = parent_file_item ? parent_file_item.children : FileItem
      file_name = file[:name]
      file_type = file[:type]

      file_item = file_item_scope.create!(repository: self, name: file_name, type: file_type, content: nil,
                                          status: :untyped)
      save_file_items(client, file_item, file[:path]) if file_type == 'dir'
    end
  end
end

# frozen_string_literal: true

class FileItemSerializer
  include Alba::Serializer

  attributes :id, :name, :type, :status, :repository_id

  attribute :content, if: proc { params[:content] } do |file_item|
    file_item.content || ''
  end

  attribute :file_items, if: proc { params[:children] } do |file_item|
    file_item.children.map { |child| FileItemSerializer.new(child, params: { children: true }) }
  end

  attribute :full_path, if: proc { params[:full_path] } do |file_item|
    path = file_item.name
    parent = file_item.parent

    while parent
      path = "#{parent.name}/#{path}"
      parent = parent.parent
    end

    "#{file_item.repository.name}/#{path}"
  end
end

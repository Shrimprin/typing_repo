# frozen_string_literal: true

class FileItemSerializer
  include Alba::Serializer

  attributes :id, :name, :repository_id, :status, :type

  attribute :content, if: proc { params[:content] } do |file_item|
    file_item.content || ''
  end

  attribute :file_items, if: proc { params[:children] } do |file_item|
    file_item.children.map { |child| FileItemSerializer.new(child, params: { children: true }) }
  end

  attribute :full_path, if: proc { params[:full_path] }, &:full_path
end

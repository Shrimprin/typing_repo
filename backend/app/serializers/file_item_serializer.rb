# frozen_string_literal: true

class FileItemSerializer
  include Alba::Serializer

  attributes :id, :name, :status, :type

  attribute :content, if: proc { params[:content] } do |file_item|
    file_item.content || ''
  end

  attribute :file_items, if: proc { params[:children] } do |file_item|
    file_items_grouped_by_parent = params[:file_items_grouped_by_parent]
    if file_items_grouped_by_parent
      child_file_items = file_items_grouped_by_parent[file_item.id] || []
      FileItemSerializer.new(child_file_items, params: { children: true, file_items_grouped_by_parent: })
    else
      file_item.children.map { |child| FileItemSerializer.new(child, params: { children: true }) }
    end
  end

  # attribute :full_path, &:full_path #  TODO: これも高速化する or showアクションの時のみ呼ぶ

  attribute :typing_progress, if: proc { params[:typing_progress] } do |file_item|
    file_item.typing_progress ? TypingProgressSerializer.new(file_item.typing_progress) : nil
  end
end

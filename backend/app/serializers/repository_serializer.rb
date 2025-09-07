# frozen_string_literal: true

class RepositorySerializer
  include Alba::Serializer

  attributes :id, :last_typed_at, :name

  attribute :file_items, if: proc { params[:file_items] } do |repository|
    file_items_grouped_by_parent = repository.file_items_grouped_by_parent
    top_level_file_items = file_items_grouped_by_parent[nil] || []

    FileItemSerializer.new(top_level_file_items, params: { children: true, file_items_grouped_by_parent: })
  end

  # attribute :progress, if: proc { params[:progress] }, &:progress
  attribute :progress do |repository|
    1
  end
end

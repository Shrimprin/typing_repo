# frozen_string_literal: true

class RepositorySerializer
  include Alba::Serializer

  attributes :id, :last_typed_at, :name, :user_id

  attribute :file_items, if: proc { params[:file_items] } do |repository|
    file_items = repository.file_items.to_a # N+1問題を回避するために全てのfile_itemsを取得
    file_items_grouped_by_parent = file_items.group_by(&:parent_id)

    top_level_file_items = file_items_grouped_by_parent[nil] || []
    top_level_file_items.map do |file_item|
      FileItemSerializer.new(file_item, params: { children: true, file_items_grouped_by_parent: })
    end
  end

  attribute :progress, if: proc { params[:progress] } do |repository|
    files = repository.file_items.where(type: :file)
    if files.empty?
      1.0
    else
      typed_count = files.where(status: :typed).count
      typed_count.to_f / files.count
    end
  end
end

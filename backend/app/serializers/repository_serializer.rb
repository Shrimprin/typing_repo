# frozen_string_literal: true

class RepositorySerializer
  include Alba::Serializer

  attributes :id, :last_typed_at, :name, :user_id

  attribute :file_items, if: proc { params[:file_items] } do |repository|
    top_level_file_items = repository.file_items.where(parent_id: nil)
    top_level_file_items.map { |fi| FileItemSerializer.new(fi, params: { children: true }) }
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

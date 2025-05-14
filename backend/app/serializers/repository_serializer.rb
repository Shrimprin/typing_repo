# frozen_string_literal: true

class RepositorySerializer
  include Alba::Serializer

  root_key :repository, :repositories

  attributes :id, :user_id, :name, :last_typed_at

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

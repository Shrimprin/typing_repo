# frozen_string_literal: true

class RepositorySerializer
  include Alba::Serializer

  root_key :repository, :repositories

  attributes :id, :user_id, :name, :last_typed_at
end

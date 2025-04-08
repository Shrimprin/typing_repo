# frozen_string_literal: true

FactoryBot.define do
  factory :repository do
    id { '' }
    user_id { '' }
    name { 'MyString' }
    url { 'MyString' }
    commit_hash { 'MyString' }
    last_typed_at { '2025-04-08 20:30:08' }
  end
end

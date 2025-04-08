# frozen_string_literal: true

FactoryBot.define do
  factory :file_item do
    id { '' }
    repository_id { '' }
    parent_id { '' }
    name { 'MyString' }
    type { 1 }
    content { 'MyText' }
    status { 1 }
  end
end

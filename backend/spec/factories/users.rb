# frozen_string_literal: true

FactoryBot.define do
  factory :user do
    id { '' }
    name { 'MyString' }
    github_id { 'MyString' }
    is_mute { false }
  end
end

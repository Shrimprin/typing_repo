# frozen_string_literal: true

FactoryBot.define do
  factory :repository do
    sequence(:name) { |n| "repository#{n}" }
    sequence(:url) { |n| "user/repo#{n}" }
    sequence(:commit_hash) { |n| "abc123def456#{n}" }
    user
  end
end

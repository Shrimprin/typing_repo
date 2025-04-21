# frozen_string_literal: true

FactoryBot.define do
  factory :user do
    name { Faker::Name.name }
    sequence(:github_id) { |n| n }
    is_mute { false }
  end
end

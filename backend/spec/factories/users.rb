# frozen_string_literal: true

FactoryBot.define do
  factory :user do
    name { Faker::Name.name }
    sequence(:github_id) { |_n| Faker::Number.number(digits: 9) }
    is_mute { false }
  end
end

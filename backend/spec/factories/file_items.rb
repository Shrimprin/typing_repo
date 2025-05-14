# frozen_string_literal: true

FactoryBot.define do
  factory :file_item do
    repository
    sequence(:name) { |n| "file_item_#{n}" }
    type { :file }
    content { Faker::Lorem.paragraphs(number: 3) }
    status { :untyped }

    trait :directory do
      type { :dir }
      content { nil }
    end

    trait :typing do
      status { :typing }
    end

    trait :typed do
      status { :typed }
    end
  end
end

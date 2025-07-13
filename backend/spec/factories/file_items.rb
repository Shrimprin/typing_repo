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

    trait :with_typing_progress do
      after(:create) do |file_item|
        create(:typing_progress,
               row: file_item.content.lines.count,
               column: file_item.content.lines.first.length,
               time: 0,
               total_typo_count: 0,
               file_item:)
      end
    end
  end
end

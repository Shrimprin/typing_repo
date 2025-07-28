# frozen_string_literal: true

FactoryBot.define do
  factory :file_item do
    repository
    sequence(:name) { |n| "file_item_#{n}" }
    content { Faker::Lorem.paragraphs(number: 3) }
    path { parent.present? ? "#{parent.path}/#{name}" : name }
    status { :untyped }
    type { :file }

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

    trait :nil_content do
      content { nil }
    end

    trait :with_typing_progress do
      after(:create) do |file_item|
        create(:typing_progress,
               row: 0,
               column: 0,
               time: 0,
               total_typo_count: 0,
               file_item:)
      end
    end
  end
end

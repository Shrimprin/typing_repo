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
        create(:typing_progress, file_item:)
      end
    end

    trait :with_typing_progress_and_typos do
      after(:create) do |file_item|
        create(:typing_progress, :with_typos, file_item:)
      end
    end
  end
end

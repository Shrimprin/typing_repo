# frozen_string_literal: true

FactoryBot.define do
  factory :typing_progress do
    file_item
    row { 0 }
    column { 0 }
    elapsed_seconds { 0 }
    total_correct_type_count { 0 }
    total_typo_count { 0 }

    trait :with_typos do
      after(:create) do |typing_progress|
        create_list(:typo, 2, typing_progress:)
      end
    end
  end
end

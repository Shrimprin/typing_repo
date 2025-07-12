# frozen_string_literal: true

FactoryBot.define do
  factory :typo do
    typing_progress
    row { rand(1..100) }
    column { rand(1..80) }
    character { %w[a b c d e f g h i j].sample }

    trait :space_character do
      character { ' ' }
    end
  end
end

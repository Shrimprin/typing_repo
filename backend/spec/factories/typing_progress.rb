# frozen_string_literal: true

FactoryBot.define do
  factory :typing_progress do
    file_item
    row { 0 }
    column { 0 }
    elapsed_seconds { 0 }
    total_typo_count { 0 }
  end
end

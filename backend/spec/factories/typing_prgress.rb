# frozen_string_literal: true

FactoryBot.define do
  factory :typing_progress do
    file_item
    row { 1 }
    column { 1 }
    time { 0 }
    total_typo_count { 0 }
  end
end

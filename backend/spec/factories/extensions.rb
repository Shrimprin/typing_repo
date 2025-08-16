# frozen_string_literal: true

FactoryBot.define do
  factory :extension do
    repository
    name { '.rb' }
    is_active { true }
  end
end

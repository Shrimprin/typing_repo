# frozen_string_literal: true

FactoryBot.define do
  factory :repository do
    user
    sequence(:name) { |n| "repository_#{n}" }
    sequence(:url) { |n| "user/repository_#{n}" }
    commit_hash { SecureRandom.hex(20) }
    last_typed_at { nil }

    trait :with_extensions do
      after(:create) do |repository|
        create(:extension, repository:, name: '.rb', is_active: true)
        create(:extension, repository:, name: '.md', is_active: false)
      end
    end

    trait :with_file_items do
      after(:create) do |repository|
        directory = create(:file_item, :directory, repository:)
        create_list(:file_item, 2, :typed, repository:, parent_id: directory.id)
        create_list(:file_item, 3, repository:)
      end
    end
  end
end

# frozen_string_literal: true

FactoryBot.define do
  factory :repository do
    user
    sequence(:name) { |n| "repository_#{n}" }
    sequence(:url) { |n| "user/repository_#{n}" }
    commit_hash { SecureRandom.hex(20) }
    last_typed_at { nil }

    trait :with_file_items do
      after(:create) do |repository|
        directory = create(:file_item, :directory, repository: repository)
        create_list(:file_item, 2, :typed, repository: repository, parent_id: directory.id)
        create_list(:file_item, 3, repository: repository)
      end
    end
  end
end

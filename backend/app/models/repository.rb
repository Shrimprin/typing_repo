# frozen_string_literal: true

class Repository < ApplicationRecord
  belongs_to :user
  has_many :file_items, dependent: :destroy

  validates :name, presence: true
  validates :url, presence: true
  validates :commit_hash, presence: true
end

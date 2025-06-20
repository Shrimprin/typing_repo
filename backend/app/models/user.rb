# frozen_string_literal: true

class User < ApplicationRecord
  has_many :repositories, dependent: :destroy

  validates :github_id, presence: true, uniqueness: true
  validates :is_mute, inclusion: { in: [true, false] }
  validates :name, presence: true
end

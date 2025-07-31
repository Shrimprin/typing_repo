# frozen_string_literal: true

class Extension < ApplicationRecord
  belongs_to :repository

  validates :name, presence: true
  validates :is_active, inclusion: { in: [true, false] }
  validates :name, uniqueness: { scope: :repository_id }
end

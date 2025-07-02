# frozen_string_literal: true

class TypingProgress < ApplicationRecord
  belongs_to :file_item
  has_many :typo_positions, dependent: :destroy

  accepts_nested_attributes_for :typo_positions, allow_destroy: true

  validates :character, presence: true
  validates :line, presence: true
  validates :time, presence: true
  validates :typo, presence: true
end

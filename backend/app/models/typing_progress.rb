# frozen_string_literal: true

class TypingProgress < ApplicationRecord
  belongs_to :file_item
  has_many :typos, dependent: :destroy

  accepts_nested_attributes_for :typos, allow_destroy: true

  validates :row, presence: true
  validates :column, presence: true
  validates :elapsed_seconds, presence: true
  validates :total_correct_type_count, presence: true, numericality: { greater_than_or_equal_to: 0 }
  validates :total_typo_count, presence: true, numericality: { greater_than_or_equal_to: 0}
end

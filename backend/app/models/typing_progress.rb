# frozen_string_literal: true

class TypingProgress < ApplicationRecord
  belongs_to :file_item
  has_many :typos, dependent: :destroy

  accepts_nested_attributes_for :typos, allow_destroy: true

  validates :row, presence: true
  validates :column, presence: true
  validates :time, presence: true
  validates :total_typo_count, presence: true
end

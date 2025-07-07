# frozen_string_literal: true

class Typo < ApplicationRecord
  belongs_to :typing_progress

  validates :row, presence: true
  validates :column, presence: true
  validates :character, presence: true
end

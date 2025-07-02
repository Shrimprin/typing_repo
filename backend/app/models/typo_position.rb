# frozen_string_literal: true

class TypoPosition < ApplicationRecord
  belongs_to :typing_progress

  validates :character, presence: true
  validates :line, presence: true
end

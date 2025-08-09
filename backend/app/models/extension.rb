# frozen_string_literal: true

class Extension < ApplicationRecord
  belongs_to :repository

  validates :name, presence: true
  validates :is_active, inclusion: { in: [true, false] }
  validates :name, uniqueness: { scope: :repository_id }

  NO_EXTENSION_NAME = 'no extension'

  def self.extract_extension_name(path)
    basename = File.basename(path)

    return basename if basename.start_with?('.')

    extension_name = File.extname(path)
    extension_name.empty? ? NO_EXTENSION_NAME : extension_name
  end
end

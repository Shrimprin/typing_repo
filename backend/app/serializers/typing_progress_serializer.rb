# frozen_string_literal: true

class TypingProgressSerializer
  include Alba::Serializer

  attributes :row, :column, :time, :total_typo_count, :typos

  attribute :typos do |typing_progress|
    typing_progress.typos.map do |typo|
      {
        row: typo.row,
        column: typo.column,
        character: typo.character
      }
    end
  end
end

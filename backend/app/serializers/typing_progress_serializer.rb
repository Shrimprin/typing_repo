# frozen_string_literal: true

class TypingProgressSerializer
  include Alba::Serializer

  attributes :row, :column, :elapsed_seconds, :total_correct_type_count, :total_typo_count

  attribute :accuracy do |typing_progress|
    total_chars = typing_progress.total_correct_type_count + typing_progress.total_typo_count
    if total_chars.zero?
      100.0
    else
      ((typing_progress.total_correct_type_count.to_f / total_chars) * 100).round(1)
    end
  end

  attribute :wpm do |typing_progress|
    elapsed_minutes = typing_progress.elapsed_seconds / 60.0
    if elapsed_minutes.zero?
      0.0
    else
      typed_words = typing_progress.total_correct_type_count / 5
      (typed_words / elapsed_minutes).round(1)
    end
  end

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

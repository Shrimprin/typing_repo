# frozen_string_literal: true

class TypingProgressSerializer
  include Alba::Serializer

  attributes :row, :column, :elapsed_seconds, :total_correct_type_count, :total_typo_count

  attribute :accuracy do |typing_progress|
    total_chars = typing_progress.total_correct_type_count + typing_progress.total_typo_count
    if total_chars.positive?
      ((typing_progress.total_correct_type_count.to_f / total_chars) * 100).round
    else
      100
    end
  end

  attribute :wpm do |typing_progress|
    elapsed_minutes = typing_progress.elapsed_seconds / 60.0
    if elapsed_minutes.positive? && typing_progress.total_correct_type_count.positive?
      (typing_progress.total_correct_type_count / 5.0 / elapsed_minutes).round
    else
      0
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

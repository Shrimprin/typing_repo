# frozen_string_literal: true

class TypingProgressSerializer
  include Alba::Serializer

  attributes :time, :typo, :line, :character, :typo_positions

  attribute :typo_positions do |typing_progress|
    typing_progress.typo_positions.map do |typo_position|
      {
        line: typo_position.line,
        character: typo_position.character
      }
    end
  end
end

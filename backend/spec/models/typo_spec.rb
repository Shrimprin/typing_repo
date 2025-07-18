# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Typo, type: :model do
  describe 'character_not_nil_or_empty_string validation' do
    let(:typing_progress) { create(:typing_progress) }

    context 'when character is nil' do
      it 'adds error' do
        typo = build(:typo, typing_progress: typing_progress, character: nil)
        typo.valid?
        expect(typo.errors[:character]).to include("can't be blank")
      end
    end

    context 'when character is empty string' do
      it 'adds error' do
        typo = build(:typo, typing_progress: typing_progress, character: '')
        typo.valid?
        expect(typo.errors[:character]).to include("can't be blank")
      end
    end

    context 'when character is a space' do
      it 'does not add error' do
        typo = build(:typo, :space_character, typing_progress: typing_progress)
        typo.valid?
        expect(typo.errors[:character]).to be_empty
      end
    end

    context 'when character is a letter' do
      it 'does not add error' do
        typo = build(:typo, typing_progress: typing_progress, character: 'a')
        typo.valid?
        expect(typo.errors[:character]).to be_empty
      end
    end
  end
end

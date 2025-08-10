# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Extension, type: :model do
  describe '.extract_extension_name' do
    context 'when path has extension' do
      it 'returns the extension name' do
        expect(described_class.extract_extension_name('file.rb')).to eq('.rb')
      end
    end

    context 'when path does not have extension' do
      it 'returns no extension name' do
        expect(described_class.extract_extension_name('Gemfile')).to eq(Extension::NO_EXTENSION_NAME)
      end
    end

    context 'when path does not have extension and starts with a dot' do
      it 'returns the path itself' do
        expect(described_class.extract_extension_name('.gitignore')).to eq('.gitignore')
      end
    end
  end
end

# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Repository, type: :model do
  let(:repository) { build(:repository) }

  describe '#save_with_file_items' do
    let(:github_client_mock) { instance_double(Octokit::Client) }

    context 'when saved successfully' do
      before do
        allow(repository).to receive(:save).and_return(true)
        allow(repository).to receive(:save_file_items?).with(github_client_mock).and_return(true)
      end

      it 'returns true' do
        expect(repository.save_with_file_items(github_client_mock)).to be true
      end
    end

    context 'when save failed' do
      before do
        allow(repository).to receive(:save).and_return(false)
        allow(repository).to receive(:save_file_items?).with(github_client_mock).and_return(true)
      end

      it 'returns nil' do
        expect(repository.save_with_file_items(github_client_mock)).to be_nil
      end

      it 'does not create a repository' do
        expect do
          repository.save_with_file_items(github_client_mock)
        end.not_to change(described_class, :count)
      end
    end

    context 'when save_file_items? failed' do
      before do
        allow(repository).to receive(:save).and_return(true)
        allow(repository).to receive(:save_file_items?).with(github_client_mock).and_return(false)
      end

      it 'returns nil' do
        expect(repository.save_with_file_items(github_client_mock)).to be_nil
      end

      it 'rolls backs the transaction and does not create a repository' do
        expect do
          repository.save_with_file_items(github_client_mock)
        end.not_to change(described_class, :count)
      end
    end
  end

  describe '#save_file_items?' do
    let(:github_client_mock) { instance_double(Octokit::Client) }
    let(:tree_response) { double('tree_response', tree: tree_items) }
    let(:tree_items) do
      [
        double('tree_item', path: 'file1.rb', type: 'blob'),
        double('tree_item', path: 'file2.rb', type: 'blob'),
        double('tree_item', path: 'directory1', type: 'tree'),
        double('tree_item', path: 'directory1/file3.rb', type: 'blob'),
        double('tree_item', path: 'directory1/directory2', type: 'tree'),
        double('tree_item', path: 'directory1/directory2/file4.rb', type: 'blob')
      ]
    end

    before do
      allow(github_client_mock).to receive(:tree)
        .with(repository.url, repository.commit_hash, recursive: true)
        .and_return(tree_response)

      repository.save!
    end

    it 'saves repository and file_items' do
      expect(repository.file_items.count).to eq(0)
      repository.send(:save_file_items?, github_client_mock)

      expect(repository.file_items.count).to eq(6)
      expect(repository.file_items.where(type: 'file').count).to eq(4)
      expect(repository.file_items.where(type: 'dir').count).to eq(2)
    end
  end
end

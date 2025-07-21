# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Repository, type: :model do
  let(:repository) { build(:repository) }

  describe '#save_with_file_items' do
    let(:github_client_mock) { instance_double(Octokit::Client) }

    context 'when saved successfully' do
      before do
        allow(repository).to receive(:save).and_return(true)
        allow(repository).to receive(:save_file_items).with(github_client_mock).and_return(true)
      end

      it 'returns true' do
        expect(repository.save_with_file_items(github_client_mock)).to be true
      end
    end

    context 'when save failed' do
      before do
        allow(repository).to receive(:save).and_return(false)
        allow(repository).to receive(:save_file_items).with(github_client_mock).and_return(true)
      end

      it 'returns false' do
        expect(repository.save_with_file_items(github_client_mock)).to be false
      end

      it 'does not create a repository' do
        expect do
          repository.save_with_file_items(github_client_mock)
        end.not_to change(described_class, :count)
      end
    end

    context 'when save_file_items failed' do
      before do
        allow(repository).to receive(:save).and_return(true)
        allow(repository).to receive(:save_file_items).with(github_client_mock).and_return(false)
      end

      it 'returns false' do
        expect(repository.save_with_file_items(github_client_mock)).to be false
      end

      it 'rolls backs the transaction and does not create a repository' do
        expect do
          repository.save_with_file_items(github_client_mock)
        end.not_to change(described_class, :count)
      end
    end
  end

  describe '#save_file_items' do
    let(:github_client_mock) { instance_double(Octokit::Client) }

    before do
      allow(github_client_mock).to receive(:contents)
        .with(repository.url, path: '')
        .and_return([
                      { name: 'file1.rb', type: 'file', path: 'file1.rb' },
                      { name: 'file2.rb', type: 'file', path: 'file2.rb' },
                      { name: 'directory1', type: 'dir', path: 'directory1' }
                    ])

      allow(github_client_mock).to receive(:contents).with(repository.url, path: 'file1.rb').and_return(
        { content: Base64.encode64('file1 content') }
      )

      allow(github_client_mock).to receive(:contents).with(repository.url, path: 'file2.rb').and_return(
        { content: Base64.encode64('file2 content') }
      )

      allow(github_client_mock).to receive(:contents)
        .with(repository.url, path: 'directory1')
        .and_return([
                      { name: 'file3.rb', type: 'file', path: 'directory1/file3.rb' },
                      { name: 'directory2', type: 'dir', path: 'directory1/directory2' }
                    ])

      allow(github_client_mock).to receive(:contents)
        .with(repository.url, path: 'directory1/file3.rb')
        .and_return(
          { content: Base64.encode64('file3 content') }
        )

      allow(github_client_mock).to receive(:contents)
        .with(repository.url, path: 'directory1/directory2')
        .and_return([
                      { name: 'file4.rb', type: 'file', path: 'directory1/directory2/file4.rb' }
                    ])

      allow(github_client_mock).to receive(:contents)
        .with(repository.url, path: 'directory1/directory2/file4.rb')
        .and_return(
          { content: Base64.encode64('file4 content') }
        )
    end

    it 'saves repository and file_items' do
      expect(repository.file_items.count).to eq(0)
      repository.send(:save_file_items, github_client_mock)

      expect(repository.file_items.count).to eq(6)
      expect(repository.file_items.where(type: 'file').count).to eq(4)
      expect(repository.file_items.where(type: 'dir').count).to eq(2)
    end
  end
end

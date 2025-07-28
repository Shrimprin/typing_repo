# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Repository, type: :model do
  describe '#file_items_grouped_by_parent' do
    let(:repository) { build(:repository) }

    context 'when no file_items exist' do
      it 'returns empty hash' do
        expect(repository.file_items_grouped_by_parent).to be_empty
      end
    end

    context 'when only root level file_items' do
      let!(:readme_file) { create(:file_item, repository: repository, parent: nil) }
      let!(:license_file) { create(:file_item, repository: repository, parent: nil) }
      let!(:src_directory) { create(:file_item, :directory, repository: repository, parent: nil) }

      it 'groups all file_items under nil key' do
        result = repository.file_items_grouped_by_parent

        expect(result.keys).to eq([nil])
        expect(result[nil]).to contain_exactly(readme_file, license_file, src_directory)
      end
    end

    context 'when nested file structure' do
      let!(:root_dir) { create(:file_item, :directory, repository: repository, parent: nil) }
      let!(:sub_dir) { create(:file_item, :directory, repository: repository, parent: root_dir) }
      let!(:readme_file) { create(:file_item, repository: repository, parent: nil) }
      let!(:main_file) { create(:file_item, repository: repository, parent: nil) }
      let!(:controller_file) { create(:file_item, repository: repository, parent: root_dir) }
      let!(:model_file) { create(:file_item, repository: repository, parent: root_dir) }
      let!(:config_file) { create(:file_item, repository: repository, parent: sub_dir) }

      it 'groups file_items by their parent_id correctly' do
        result = repository.file_items_grouped_by_parent

        expect(result.keys).to contain_exactly(nil, root_dir.id, sub_dir.id)
        expect(result[nil]).to contain_exactly(root_dir, readme_file, main_file)
        expect(result[root_dir.id]).to contain_exactly(sub_dir, controller_file, model_file)
        expect(result[sub_dir.id]).to contain_exactly(config_file)
      end
    end

    context 'when multiple children under same parent' do
      let!(:parent_dir) { create(:file_item, :directory, repository: repository, parent: nil) }
      let!(:service_file) { create(:file_item, repository: repository, parent: parent_dir) }
      let!(:helper_file) { create(:file_item, repository: repository, parent: parent_dir) }
      let!(:utils_directory) { create(:file_item, :directory, repository: repository, parent: parent_dir) }

      it 'groups multiple children under the same parent_id' do
        result = repository.file_items_grouped_by_parent

        expect(result[parent_dir.id]).to contain_exactly(service_file, helper_file, utils_directory)
      end
    end
  end

  describe '#progress' do
    let!(:repository) { create(:repository) }

    context 'when no file_items exist' do
      it 'returns 1.0' do
        expect(repository.progress).to eq(1.0)
      end
    end

    context 'when some files are typed (50%)' do
      it 'returns 0.5' do
        create(:file_item, :typed, repository: repository)
        create(:file_item, repository: repository, status: :untyped)

        expect(repository.progress).to eq(0.5)
      end
    end

    context 'when all files are typed (100%)' do
      it 'returns 1.0' do
        create(:file_item, :typed, repository: repository)
        create(:file_item, :typed, repository: repository)

        expect(repository.progress).to eq(1.0)
      end
    end
  end

  describe '#save_with_file_items' do
    let(:repository) { build(:repository) }
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
    let(:repository) { build(:repository) }
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

    it 'saves file_items with tree structure' do
      expect(repository.file_items.count).to eq(0)
      repository.send(:save_file_items?, github_client_mock)

      expect(repository.file_items.count).to eq(6)
      expect(repository.file_items.where(type: 'file').count).to eq(4)
      expect(repository.file_items.where(type: 'dir').count).to eq(2)

      root_directory = repository.file_items.find_by(path: 'directory1')
      expect(root_directory.parent_id).to be_nil
      expect(root_directory.children.count).to eq(2)

      child_file = root_directory.children.find_by(path: 'directory1/file3.rb')
      expect(child_file.parent_id).to eq(root_directory.id)

      child_directory = root_directory.children.find_by(path: 'directory1/directory2')
      expect(child_directory.parent_id).to eq(root_directory.id)
      expect(child_directory.children.count).to eq(1)

      grandchild_file = child_directory.children.find_by(path: 'directory1/directory2/file4.rb')
      expect(grandchild_file.parent_id).to eq(child_directory.id)
    end
  end

  describe '#create_file_items_by_depth?' do
    let!(:repository) { create(:repository) }

    context 'when file tree is given' do
      let(:file_tree) do
        [
          double('tree_item', path: 'README.md', type: 'blob'),
          double('tree_item', path: 'src', type: 'tree'),
          double('tree_item', path: 'src/main.rb', type: 'blob'),
          double('tree_item', path: 'src/utils', type: 'tree'),
          double('tree_item', path: 'src/utils/helper.rb', type: 'blob')
        ]
      end

      it 'returns true' do
        expect(repository.send(:create_file_items_by_depth?, file_tree)).to be true
      end

      it 'creates file_items with tree structure' do
        expect(repository.file_items.count).to eq(0)

        repository.send(:create_file_items_by_depth?, file_tree)

        expect(repository.file_items.count).to eq(5)

        readme = repository.file_items.find_by(path: 'README.md')
        expect(readme.parent_id).to be_nil

        src_dir = repository.file_items.find_by(path: 'src')
        expect(src_dir.parent_id).to be_nil

        main_file = repository.file_items.find_by(path: 'src/main.rb')
        expect(main_file.parent_id).to eq(src_dir.id)

        utils_dir = repository.file_items.find_by(path: 'src/utils')
        expect(utils_dir.parent_id).to eq(src_dir.id)

        helper_file = repository.file_items.find_by(path: 'src/utils/helper.rb')
        expect(helper_file.parent_id).to eq(utils_dir.id)
      end
    end

    context 'when empty file tree is given' do
      let(:file_tree) { [] }

      it 'returns true without creating any file_items' do
        expect(repository.file_items.count).to eq(0)

        result = repository.send(:create_file_items_by_depth?, file_tree)

        expect(result).to be true
        expect(repository.file_items.count).to eq(0)
      end
    end

    context 'when invalid file_items are given' do
      let(:file_tree) do
        [
          double('tree_item', path: 'invalid_file.rb', type: 'blob'),
          double('tree_item', path: 'valid_file.rb', type: 'blob')
        ]
      end

      before do
        invalid_file_item = FileItem.new(
          repository: repository,
          name: '',
          path: '',
          type: :file,
          status: :untyped
        )
        valid_file_item = FileItem.new(
          repository: repository,
          name: 'valid_file.rb',
          path: 'valid_file.rb',
          type: :file,
          status: :untyped
        )

        allow(repository).to receive(:build_file_items_batch)
          .and_return([invalid_file_item, valid_file_item])
      end

      it 'returns false' do
        expect(repository.send(:create_file_items_by_depth?, file_tree)).to be false
      end

      it 'returns false and adds validation errors' do
        expect(repository.file_items.count).to eq(0)

        repository.send(:create_file_items_by_depth?, file_tree)

        expect(repository.errors['file_item.name']).to include("can't be blank")
        expect(repository.errors['file_item.path']).to include("can't be blank")
        expect(repository.file_items.count).to eq(1) # この時点でロールバックはされないため、正常なfile_item1つは作成される
      end
    end
  end

  describe '#build_file_items_batch' do
    let(:repository) { create(:repository) }
    let(:parent_dir) { create(:file_item, :directory, repository: repository, path: 'src') }
    let(:file_items) do
      [
        double('tree_item', path: 'README.md', type: 'blob'),
        double('tree_item', path: 'src', type: 'tree'),
        double('tree_item', path: 'src/main.rb', type: 'blob')
      ]
    end

    let(:directory_items_map) { { 'src' => parent_dir } }

    it 'creates file_items with tree structure' do
      result = repository.send(:build_file_items_batch, file_items, directory_items_map)

      expect(result.size).to eq(3)

      readme = result[0]
      expect(readme.name).to eq('README.md')
      expect(readme.path).to eq('README.md')
      expect(readme.type).to eq('file')
      expect(readme.parent).to be_nil

      src_dir = result[1]
      expect(src_dir.name).to eq('src')
      expect(src_dir.path).to eq('src')
      expect(src_dir.type).to eq('dir')
      expect(src_dir.parent).to be_nil

      main_file = result[2]
      expect(main_file.name).to eq('main.rb')
      expect(main_file.path).to eq('src/main.rb')
      expect(main_file.type).to eq('file')
      expect(main_file.parent).to eq(parent_dir)
    end
  end

  describe '#extract_directory_items' do
    let(:repository) { build(:repository) }
    let(:file_items) do
      [
        double('tree_item', path: 'README.md', type: 'blob'),
        double('tree_item', path: 'src', type: 'tree'),
        double('tree_item', path: 'Gemfile', type: 'blob'),
        double('tree_item', path: 'lib', type: 'tree')
      ]
    end

    let(:file_items_batch) do
      [
        FileItem.new(path: 'README.md', type: :file),
        FileItem.new(path: 'src', type: :dir),
        FileItem.new(path: 'Gemfile', type: :file),
        FileItem.new(path: 'lib', type: :dir)
      ]
    end

    it 'extracts directory items and maps them' do
      result = repository.send(:extract_directory_items, file_items, file_items_batch)

      expect(result.keys).to contain_exactly('src', 'lib')
      expect(result.size).to eq(2)

      expect(result['src']).to eq(file_items_batch[1])
      expect(result['lib']).to eq(file_items_batch[3])
    end

    it 'does not include file items' do
      result = repository.send(:extract_directory_items, file_items, file_items_batch)

      expect(result.keys).not_to include('README.md', 'Gemfile')
    end
  end

  describe '#depth_of' do
    let(:repository) { build(:repository) }

    it 'calculates path depth correctly' do
      expect(repository.send(:depth_of, 'file.rb')).to eq(0)
      expect(repository.send(:depth_of, 'src/main.rb')).to eq(1)
      expect(repository.send(:depth_of, 'src/lib/helper.rb')).to eq(2)
    end
  end

  describe '#directory?' do
    let(:repository) { build(:repository) }

    it 'identifies directories correctly' do
      tree_item = double('tree_item', type: 'tree')
      blob_item = double('blob_item', type: 'blob')

      expect(repository.send(:directory?, tree_item)).to be true
      expect(repository.send(:directory?, blob_item)).to be false
    end
  end

  describe '#find_parent_item' do
    let(:repository) { build(:repository) }

    it 'finds parent item from directory_items_map' do
      parent_item = double('parent_item')
      directory_items_map = { 'src' => parent_item }

      result = repository.send(:find_parent_item, 'src/main.rb', directory_items_map)
      expect(result).to eq(parent_item)
    end

    it 'returns nil for root level files' do
      directory_items_map = { 'src' => double('parent_item') }

      result = repository.send(:find_parent_item, 'README.md', directory_items_map)
      expect(result).to be_nil
    end

    it 'returns nil when parent not found in map' do
      directory_items_map = {}

      result = repository.send(:find_parent_item, 'src/main.rb', directory_items_map)
      expect(result).to be_nil
    end
  end
end

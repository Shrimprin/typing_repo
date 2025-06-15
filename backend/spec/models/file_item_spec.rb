# frozen_string_literal: true

require 'rails_helper'

RSpec.describe FileItem, type: :model do
  describe '#full_path' do
    let(:repository) { create(:repository, name: 'test_repo') }
    let(:root_dir) { create(:file_item, :directory, name: 'root_dir', repository:) }
    let(:middle_dir) { create(:file_item, :directory, name: 'middle_dir', repository:, parent: root_dir) }
    let(:file_item) { create(:file_item, name: 'test_file.rb', repository:, parent: middle_dir) }

    it 'return the full path' do
      expect(file_item.full_path).to eq('test_repo/root_dir/middle_dir/test_file.rb')
    end
  end

  describe '#update_with_parent' do
    let(:repository) { create(:repository) }
    let(:parent_dir) { create(:file_item, :directory, repository:) }
    let(:untyped_file_item) { create(:file_item, repository:, parent: parent_dir) }

    context 'when all siblings are typed after update' do
      before do
        create(:file_item, :typed, repository:, parent: parent_dir)
      end

      it 'returns true' do
        expect(untyped_file_item.update_with_parent(status: :typed)).to be true
      end

      it 'updates both file item and parent status' do
        untyped_file_item.update_with_parent(status: :typed)

        expect(untyped_file_item.reload.status).to eq('typed')
        expect(parent_dir.reload.status).to eq('typed')
      end
    end

    context 'when not all siblings are typed after update' do
      before do
        create(:file_item, repository:, parent: parent_dir)
      end

      it 'returns true' do
        expect(untyped_file_item.update_with_parent(status: :typed)).to be true
      end

      it 'updates only the file item status but not parent status' do
        untyped_file_item.update_with_parent(status: :typed)

        expect(untyped_file_item.reload.status).to eq('typed')
        expect(parent_dir.reload.status).to eq('untyped')
      end
    end

    context 'when update failed' do
      before do
        allow(untyped_file_item).to receive(:update).and_return(false)
      end

      it 'returns false' do
        expect(untyped_file_item.update_with_parent(status: :typed)).to be false
      end

      it 'does not update both file item and parent status' do
        untyped_file_item.update_with_parent(status: :typed)

        expect(untyped_file_item.reload.status).to eq('untyped')
        expect(parent_dir.reload.status).to eq('untyped')
      end
    end

    context 'when update_parent_status failed' do
      before do
        allow(untyped_file_item).to receive(:update_parent_status).and_raise(ActiveRecord::Rollback)
      end

      it 'returns nil' do
        expect(untyped_file_item.update_with_parent(status: :typed)).to be_nil
      end

      it 'does not update both file item and parent status' do
        untyped_file_item.update_with_parent(status: :typed)

        expect(untyped_file_item.reload.status).to eq('untyped')
        expect(parent_dir.reload.status).to eq('untyped')
      end
    end
  end

  describe '#update_parent_status' do
    let(:repository) { create(:repository) }
    let(:parent_dir) { create(:file_item, :directory, repository:, status: :untyped) }
    let(:typed_file_item) { create(:file_item, :typed, repository:, parent: parent_dir) }

    context 'when all siblings are typed' do
      it 'updates parent status to typed' do
        create(:file_item, :typed, repository:, parent: parent_dir)

        expect(typed_file_item.update_parent_status).to be true
        expect(parent_dir.reload.status).to eq('typed')
      end
    end

    context 'when not all siblings are typed' do
      it 'does not update parent status' do
        create(:file_item, repository:, parent: parent_dir)

        expect(typed_file_item.update_parent_status).to be true
        expect(parent_dir.reload.status).to eq('untyped')
      end
    end

    context 'with all descendants are typed' do
      it 'recursively updates all parents when all children are typed' do
        root_dir = create(:file_item, :directory, repository:)
        child_dir = create(:file_item, :directory, repository:, parent: root_dir)
        grand_child_file_item = create(:file_item, :typed, repository:, parent: child_dir)

        expect(grand_child_file_item.update_parent_status).to be true
        expect(root_dir.reload.status).to eq('typed')
        expect(child_dir.reload.status).to eq('typed')
      end
    end
  end
end

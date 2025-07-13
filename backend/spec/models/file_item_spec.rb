# frozen_string_literal: true

require 'rails_helper'

RSpec.describe FileItem, type: :model do
  describe '#full_path' do
    let(:repository) { create(:repository, name: 'test_repo') }
    let(:root_dir) { create(:file_item, :directory, name: 'root_dir', repository:) }
    let(:middle_dir) { create(:file_item, :directory, name: 'middle_dir', repository:, parent: root_dir) }
    let(:file_item) { create(:file_item, name: 'test_file.rb', repository:, parent: middle_dir) }

    it 'returns the full path' do
      expect(file_item.full_path).to eq('test_repo/root_dir/middle_dir/test_file.rb')
    end
  end

  describe '#update_with_parent' do
    let(:repository) { create(:repository) }
    let(:parent_dir) { create(:file_item, :directory, repository:) }
    let(:untyped_file_item) { create(:file_item, :with_typing_progress, repository:, parent: parent_dir) }
    let(:params) do
      {
        status: :typed,
        typing_progress: {
          row: untyped_file_item.content.lines.count,
          column: untyped_file_item.content.lines.first.length,
          time: 0,
          total_typo_count: 0
        }
      }
    end

    context 'when all siblings are typed after update' do
      before do
        create(:file_item, :typed, repository:, parent: parent_dir)
      end

      it 'returns true' do
        expect(untyped_file_item.update_with_parent(params)).to be true
      end

      it 'updates both file item and parent status' do
        untyped_file_item.update_with_parent(valid_params)

        expect(untyped_file_item.status).to eq('typed')
        expect(parent_dir.status).to eq('typed')
      end
    end

    context 'when not all siblings are typed after update' do
      before do
        create(:file_item, repository:, parent: parent_dir)
      end

      it 'returns true' do
        expect(untyped_file_item.update_with_parent(params)).to be true
      end

      it 'updates only the file item status but not parent status' do
        untyped_file_item.update_with_parent(params)

        expect(untyped_file_item.status).to eq('typed')
        expect(parent_dir.status).to eq('untyped')
      end
    end

    context 'when update_with_typing_progress failed' do
      before do
        allow(untyped_file_item).to receive(:update_with_typing_progress).and_return(nil)
      end

      it 'returns nil' do
        expect(untyped_file_item.update_with_parent(status: :typed)).to be_nil
      end

      it 'does not update both file item and parent status' do
        untyped_file_item.update_with_parent(status: :typed)

        expect(untyped_file_item.status).to eq('untyped')
        expect(parent_dir.status).to eq('untyped')
      end
    end

    context 'when update_parent_status failed' do
      before do
        allow(untyped_file_item).to receive(:update_parent_status).and_return(false)
      end

      it 'returns nil' do
        expect(untyped_file_item.update_with_parent(params)).to be_nil
      end

      it 'does not update both file item and parent status' do
        untyped_file_item.update_with_parent(params)

        expect(untyped_file_item.reload.status).to eq('untyped')
        expect(parent_dir.status).to eq('untyped')
      end
    end
  end

  describe '#update_parent_status' do
    let(:repository) { create(:repository) }
    let(:parent_dir) { create(:file_item, :directory, repository:) }
    let(:typed_file_item) { create(:file_item, :typed, repository:, parent: parent_dir) }

    context 'when all siblings are typed' do
      it 'updates parent status to typed' do
        create(:file_item, :typed, repository:, parent: parent_dir)

        expect(typed_file_item.update_parent_status).to be true
        expect(parent_dir.status).to eq('typed')
      end
    end

    context 'when not all siblings are typed' do
      it 'does not update parent status' do
        create(:file_item, repository:, parent: parent_dir)

        expect(typed_file_item.update_parent_status).to be true
        expect(parent_dir.status).to eq('untyped')
      end
    end

    context 'with all descendants are typed' do
      it 'recursively updates all parents when all children are typed' do
        root_dir = create(:file_item, :directory, repository:)
        child_dir = create(:file_item, :directory, repository:, parent: root_dir)
        grand_child_file_item = create(:file_item, :typed, repository:, parent: child_dir)

        expect(grand_child_file_item.update_parent_status).to be true
        expect(root_dir.status).to eq('typed')
        expect(child_dir.status).to eq('typed')
      end
    end
  end

  describe '#update_with_typing_progress' do
    let(:repository) { create(:repository) }
    let(:untyped_file_item) { create(:file_item, :with_typing_progress, repository:) }
    let(:params) do
      {
        status: :typed,
        typing_progress: {
          row: untyped_file_item.content.lines.count,
          column: untyped_file_item.content.lines.first.length,
          time: 0,
          total_typo_count: 0,
          typos_attributes: [
            {
              row: 1,
              column: 1,
              character: 'a'
            },
            {
              row: 2,
              column: 2,
              character: 'b'
            }
          ]
        }
      }
    end

    it 'returns true' do
      expect(untyped_file_item.update_with_typing_progress(params)).to be true
    end

    it 'updates the file item status to typed' do
      untyped_file_item.update_with_typing_progress(params)

      expect(untyped_file_item.status).to eq('typed')
    end

    it 'updates the typing progress and typos' do
      untyped_file_item.update_with_typing_progress(params)

      updated_typing_progress = untyped_file_item.typing_progress
      expect(updated_typing_progress.row).to eq(untyped_file_item.content.lines.count)
      expect(updated_typing_progress.column).to eq(untyped_file_item.content.lines.first.length)
      expect(updated_typing_progress.time).to eq(0)
      expect(updated_typing_progress.total_typo_count).to eq(0)

      updated_typos = updated_typing_progress.typos
      expect(updated_typos.count).to eq(2)
      expect(updated_typos.first.row).to eq(1)
      expect(updated_typos.first.column).to eq(1)
      expect(updated_typos.first.character).to eq('a')
      expect(updated_typos.second.row).to eq(2)
      expect(updated_typos.second.column).to eq(2)
      expect(updated_typos.second.character).to eq('b')
    end

    context 'when update failed' do
      before do
        allow(untyped_file_item).to receive(:update).and_return(false)
      end

      it 'returns nil' do
        expect(untyped_file_item.update_with_typing_progress(params)).to be_nil
      end

      it 'does not update the file item status' do
        untyped_file_item.update_with_typing_progress(params)

        expect(untyped_file_item.status).to eq('untyped')
      end

      it 'does not update the typing progress and typos' do
        untyped_file_item.update_with_typing_progress(params)

        non_updated_typing_progress = untyped_file_item.typing_progress
        expect(non_updated_typing_progress.row).to eq(0)
        expect(non_updated_typing_progress.column).to eq(0)
        expect(non_updated_typing_progress.time).to eq(0)
        expect(non_updated_typing_progress.total_typo_count).to eq(0)
        expect(non_updated_typing_progress.typos.count).to eq(0)
      end
    end

    context 'when save_typing_progress failed' do
      before do
        allow(untyped_file_item).to receive(:save_typing_progress).and_return(false)
      end

      it 'returns nil' do
        expect(untyped_file_item.update_with_typing_progress(params)).to be_nil
      end

      it 'does not update the file item status' do
        untyped_file_item.update_with_typing_progress(params)

        expect(untyped_file_item.reload.status).to eq('untyped')
      end

      it 'does not update the typing progress and typos' do
        untyped_file_item.update_with_typing_progress(params)

        non_updated_typing_progress = untyped_file_item.typing_progress
        expect(non_updated_typing_progress.row).to eq(0)
        expect(non_updated_typing_progress.column).to eq(0)
        expect(non_updated_typing_progress.time).to eq(0)
        expect(non_updated_typing_progress.total_typo_count).to eq(0)
        expect(non_updated_typing_progress.typos.count).to eq(0)
      end
    end
  end

  describe '#save_typing_progress' do
    let(:repository) { create(:repository) }
    let(:untyped_file_item) { create(:file_item, :with_typing_progress, repository:) }
    let(:params) do
      {
        status: :typed,
        typing_progress: {
          row: untyped_file_item.content.lines.count,
          column: untyped_file_item.content.lines.first.length,
          time: 0,
          total_typo_count: 0,
          typos_attributes: [
            {
              row: 1,
              column: 1,
              character: 'a'
            },
            {
              row: 2,
              column: 2,
              character: 'b'
            }
          ]
        }
      }
    end

    it 'returns true' do
      expect(untyped_file_item.send(:save_typing_progress, params)).to be true
    end

    it 'creates a new typing progress' do
      untyped_file_item.send(:save_typing_progress, params)

      created_typing_progress = untyped_file_item.typing_progress
      expect(created_typing_progress.row).to eq(untyped_file_item.content.lines.count)
      expect(created_typing_progress.column).to eq(untyped_file_item.content.lines.first.length)
      expect(created_typing_progress.time).to eq(0)
      expect(created_typing_progress.total_typo_count).to eq(0)

      created_typos = created_typing_progress.typos
      expect(created_typos.count).to eq(2)
      expect(created_typos.first.row).to eq(1)
      expect(created_typos.first.column).to eq(1)
      expect(created_typos.first.character).to eq('a')
      expect(created_typos.second.row).to eq(2)
      expect(created_typos.second.column).to eq(2)
      expect(created_typos.second.character).to eq('b')
    end

    context 'when save failed' do
      let(:invalid_params) do
        {
          status: :typed,
          typing_progress: {
            row: nil,
            column: nil,
            time: nil,
            total_typo_count: nil
          }
        }
      end

      it 'returns false' do
        expect(untyped_file_item.send(:save_typing_progress, invalid_params)).to be false
      end

      it 'adds errors to file_item' do
        untyped_file_item.send(:save_typing_progress, invalid_params)

        errors = untyped_file_item.errors
        expect(errors[:'typing_progress.row']).to include("can't be blank")
        expect(errors[:'typing_progress.column']).to include("can't be blank")
        expect(errors[:'typing_progress.time']).to include("can't be blank")
        expect(errors[:'typing_progress.total_typo_count']).to include("can't be blank")
      end
    end
  end
end

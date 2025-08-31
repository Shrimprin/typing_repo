# frozen_string_literal: true

require 'rails_helper'

RSpec.describe FileItem, type: :model do
  let(:repository) { create(:repository, name: 'test_repo') }
  let(:parent_dir) { create(:file_item, :directory, repository:) }
  let(:untyped_file_item) { create(:file_item, :with_typing_progress, repository:, parent: parent_dir) }
  let(:valid_typing_progress_params) do
    {
      row: untyped_file_item.content.lines.count,
      column: untyped_file_item.content.lines.first.length,
      elapsed_seconds: 0,
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
  end

  let(:valid_params) do
    {
      status: :typed,
      typing_progress: valid_typing_progress_params
    }
  end

  let(:invalid_params) do
    {
      status: :typed,
      typing_progress: {
        row: nil,
        column: nil,
        elapsed_seconds: nil,
        total_typo_count: nil
      }
    }
  end

  def expect_typing_progress_attributes(typing_progress, file_item)
    expect(typing_progress.row).to eq(file_item.content.lines.count)
    expect(typing_progress.column).to eq(file_item.content.lines.first.length)
    expect(typing_progress.elapsed_seconds).to be_zero
    expect(typing_progress.total_typo_count).to be_zero
  end

  def expect_typo_attributes(typos)
    expect(typos.count).to eq(2)
    expect_first_typo(typos[0])
    expect_second_typo(typos[1])
  end

  def expect_first_typo(typo)
    expect(typo.row).to eq(1)
    expect(typo.column).to eq(1)
    expect(typo.character).to eq('a')
  end

  def expect_second_typo(typo)
    expect(typo.row).to eq(2)
    expect(typo.column).to eq(2)
    expect(typo.character).to eq('b')
  end

  def expect_initial_typing_progress_attributes(typing_progress)
    expect(typing_progress.row).to be_zero
    expect(typing_progress.column).to be_zero
    expect(typing_progress.elapsed_seconds).to be_zero
    expect(typing_progress.total_typo_count).to be_zero
    expect(typing_progress.typos.count).to be_zero
  end

  def expect_validation_errors(file_item)
    errors = file_item.errors
    expect(errors[:'typing_progress.row']).to include("can't be blank")
    expect(errors[:'typing_progress.column']).to include("can't be blank")
    expect(errors[:'typing_progress.elapsed_seconds']).to include("can't be blank")
    expect(errors[:'typing_progress.total_typo_count']).to include("can't be blank")
  end

  shared_examples 'does not update file item status and typing progress' do
    it 'does not update the file item status' do
      subject
      expect(untyped_file_item.reload.status).to eq('untyped')
    end

    it 'does not update the typing progress and typos' do
      subject
      non_updated_typing_progress = untyped_file_item.typing_progress
      expect_initial_typing_progress_attributes(non_updated_typing_progress)
    end
  end

  describe '.decode_file_content' do
    it 'correctly decodes Base64 text' do
      base64_text = '44GT44KT44Gr44Gh44Gv44CB5LiW55WM77yB'
      decoded_text = described_class.decode_file_content(base64_text)

      expect(decoded_text).to eq('こんにちは、世界！')
      expect(decoded_text.encoding.name).to eq('UTF-8')
    end

    it 'handles invalid UTF-8 encoding' do
      # 無効なUTF-8シーケンスを含むBase64エンコードされたテキスト
      invalid_bytes = [0xFF, 0xFE, 0xFD].pack('C*') + 'こんにちは、世界！'.dup.force_encoding('ASCII-8BIT')
      invalid_base64_text = Base64.strict_encode64(invalid_bytes)
      decoded_text = described_class.decode_file_content(invalid_base64_text)

      expect(decoded_text).to include('こんにちは、世界！')
      expect(decoded_text.encoding.name).to eq('UTF-8')
      expect(decoded_text.valid_encoding?).to be true
    end
  end

  describe '#full_path' do
    let(:root_dir) { create(:file_item, :directory, name: 'root_dir', repository:) }
    let(:middle_dir) { create(:file_item, :directory, name: 'middle_dir', repository:, parent: root_dir) }
    let(:file_item) { create(:file_item, name: 'test_file.rb', repository:, parent: middle_dir) }

    it 'returns the full path' do
      expect(file_item.full_path).to eq('test_repo/root_dir/middle_dir/test_file.rb')
    end
  end

  describe '#update_with_parent' do
    context 'when all siblings are typed after update' do
      before do
        create(:file_item, :typed, repository:, parent: parent_dir)
      end

      it 'returns true' do
        expect(untyped_file_item.update_with_parent(valid_params)).to be true
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
        expect(untyped_file_item.update_with_parent(valid_params)).to be true
      end

      it 'updates only the file item status but not parent status' do
        untyped_file_item.update_with_parent(valid_params)

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
        expect(untyped_file_item.update_with_parent(valid_params)).to be_nil
      end

      it 'does not update both file item and parent status' do
        untyped_file_item.update_with_parent(valid_params)

        expect(untyped_file_item.reload.status).to eq('untyped')
        expect(parent_dir.status).to eq('untyped')
      end
    end
  end

  describe '#update_parent_status' do
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
    context 'when successful' do
      subject(:update_file_item_with_typing_progress) { untyped_file_item.update_with_typing_progress(valid_params) }

      it 'returns true' do
        expect(update_file_item_with_typing_progress).to be true
      end

      it 'updates file item status to typed' do
        update_file_item_with_typing_progress
        expect(untyped_file_item.status).to eq('typed')
      end

      it 'updates the typing progress and typos' do
        update_file_item_with_typing_progress
        updated_typing_progress = untyped_file_item.typing_progress
        expect_typing_progress_attributes(updated_typing_progress, untyped_file_item)
        expect_typo_attributes(updated_typing_progress.typos)
      end
    end

    context 'when update failed' do
      subject(:update_file_item_with_typing_progress) { untyped_file_item.update_with_typing_progress(valid_params) }

      before do
        allow(untyped_file_item).to receive(:update).and_return(false)
      end

      it 'returns nil' do
        expect(update_file_item_with_typing_progress).to be_nil
      end

      it_behaves_like 'does not update file item status and typing progress'
    end

    context 'when save_typing_progress failed' do
      subject(:update_file_item_with_typing_progress) { untyped_file_item.update_with_typing_progress(valid_params) }

      before do
        allow(untyped_file_item).to receive(:save_typing_progress?).and_return(false)
      end

      it 'returns nil' do
        expect(update_file_item_with_typing_progress).to be_nil
      end

      it_behaves_like 'does not update file item status and typing progress'
    end
  end

  describe '#save_typing_progress' do
    context 'when successful' do
      subject(:save_typing_progress) { untyped_file_item.send(:save_typing_progress?, valid_params) }

      it 'returns true' do
        expect(save_typing_progress).to be true
      end

      it 'creates a new typing progress' do
        save_typing_progress
        created_typing_progress = untyped_file_item.typing_progress
        expect_typing_progress_attributes(created_typing_progress, untyped_file_item)
        expect_typo_attributes(created_typing_progress.typos)
      end
    end

    context 'when save failed' do
      subject(:save_typing_progress) { untyped_file_item.send(:save_typing_progress?, invalid_params) }

      it 'returns false' do
        expect(save_typing_progress).to be false
      end

      it 'adds errors to file_item' do
        save_typing_progress
        expect_validation_errors(untyped_file_item)
      end
    end
  end
end

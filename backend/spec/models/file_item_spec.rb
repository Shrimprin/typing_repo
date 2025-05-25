# frozen_string_literal: true

require 'rails_helper'

RSpec.describe FileItem, type: :model do
  describe '#full_path' do
    let(:repository) { create(:repository, name: 'test_repo') }
    let(:root_dir) { create(:file_item, :directory, name: 'root_dir', repository: repository) }
    let(:middle_dir) { create(:file_item, :directory, name: 'middle_dir', repository: repository, parent: root_dir) }
    let(:file_item) { create(:file_item, name: 'test_file.rb', repository: repository, parent: middle_dir) }

    it 'return the full path' do
      expect(file_item.full_path).to eq('test_repo/root_dir/middle_dir/test_file.rb')
    end
  end
end

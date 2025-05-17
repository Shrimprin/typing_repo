# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Api::FileItems', type: :request do
  include_context 'with authenticated user'

  let!(:repository) { create(:repository, :with_file_items, user: user) }
  let!(:file_item) { repository.file_items.where(type: :file).first }

  describe 'GET /api/repositories/:repository_id/file_items/:id' do
    context 'when file item exists' do
      it 'returns the file item and success status' do
        get api_repository_file_item_path(repository_id: repository.id, id: file_item.id), headers: headers
        expect(response).to have_http_status(:ok)
        json = response.parsed_body
        expect(json['id']).to eq(file_item.id)
        expect(json['name']).to eq(file_item.name)
        expect(json['type']).to eq(file_item.type)
        expect(json['status']).to eq(file_item.status)
        expect(json['content']).to eq(file_item.content)
      end
    end

    context 'when file item does not exist' do
      it 'returns not found status' do
        get api_repository_file_item_path(repository_id: repository.id, id: 0), headers: headers
        expect(response).to have_http_status(:not_found)
      end
    end
  end
end

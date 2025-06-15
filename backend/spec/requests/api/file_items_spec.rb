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
        expect(json['full_path']).to eq(file_item.full_path)
      end
    end

    context 'when file item does not exist' do
      it 'returns not found status' do
        get api_repository_file_item_path(repository_id: repository.id, id: 0), headers: headers
        expect(response).to have_http_status(:not_found)
      end
    end
  end

  describe 'PATCH /api/repositories/:repository_id/file_items/:id' do
    let(:untyped_file_item) { repository.file_items.where(type: :file, status: :untyped).first }

    context 'when update successfully' do
      it 'returns success status' do
        patch api_repository_file_item_path(repository_id: repository.id, id: untyped_file_item.id),
              params: { file_item: { status: :typed } }, headers: headers

        expect(response).to have_http_status(:ok)
      end

      it 'updates the file item and returns success status' do
        patch api_repository_file_item_path(repository_id: repository.id, id: untyped_file_item.id),
              params: { file_item: { status: :typed } }, headers: headers

        json = response.parsed_body
        updated_file_item = json.find { |item| item['id'] == untyped_file_item.id }
        expect(updated_file_item['status']).to eq('typed')
      end

      it 'returns all file items' do
        patch api_repository_file_item_path(repository_id: repository.id, id: untyped_file_item.id),
              params: { file_item: { status: :typed } }, headers: headers

        expect(response).to have_http_status(:ok)
        json = response.parsed_body
        expect(json.length).to eq(4)
        expect(json.first['file_items'].length).to eq(2)
      end
    end

    context 'when update failed' do
      it 'returns unprocessable entity status' do
        patch api_repository_file_item_path(repository_id: repository.id, id: file_item.id),
              params: { file_item: { status: '' } }, headers: headers

        expect(response).to have_http_status(:unprocessable_entity)
        json = response.parsed_body
        expect(json['status']).to eq(['can\'t be blank'])
      end
    end

    context 'when unexpected error occurs' do
      it 'returns internal server error status' do
        patch api_repository_file_item_path(repository_id: repository.id, id: file_item.id),
              params: { file_item: { status: :invalid } }, headers: headers

        expect(response).to have_http_status(:internal_server_error)
      end
    end
  end
end

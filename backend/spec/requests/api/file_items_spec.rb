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

    context 'when status is typed' do
      before do
        patch api_repository_file_item_path(repository_id: repository.id, id: untyped_file_item.id),
              params: {
                file_item: {
                  status: :typed,
                  typing_progress: {
                    row: untyped_file_item.content.split("\n").size - 1,
                    column: untyped_file_item.content.split("\n").last.size,
                    time: 330.5,
                    typos_attributes: [
                      { row: 1, column: 1, character: 'a' },
                      { row: 2, column: 2, character: 'b' }
                    ]
                  }
                }
              }, headers: headers
      end

      it 'returns success status' do
        expect(response).to have_http_status(:ok)
      end

      it 'returns all file items' do
        expect(response).to have_http_status(:ok)
        json = response.parsed_body
        expect(json.length).to eq(4)
        expect(json.find { |item| item['type'] == 'dir' }['file_items'].length).to eq(2)
      end

      it 'updates the file item status to typed' do
        updated_file_item = FileItem.find(untyped_file_item.id)
        expect(updated_file_item.status).to eq('typed')
      end

      it 'updates the file item typing progress and typos' do
        updated_file_item = FileItem.find(untyped_file_item.id)
        expect(updated_file_item.typing_progress.row).to eq(untyped_file_item.content.split("\n").size - 1)
        expect(updated_file_item.typing_progress.column).to eq(untyped_file_item.content.split("\n").last.size)
        expect(updated_file_item.typing_progress.time).to eq(330.5)

        expect(updated_file_item.typing_progress.typos.length).to eq(2)
        expect(updated_file_item.typing_progress.typos[0].row).to eq(1)
        expect(updated_file_item.typing_progress.typos[0].column).to eq(1)
        expect(updated_file_item.typing_progress.typos[0].character).to eq('a')
        expect(updated_file_item.typing_progress.typos[1].row).to eq(2)
        expect(updated_file_item.typing_progress.typos[1].column).to eq(2)
        expect(updated_file_item.typing_progress.typos[1].character).to eq('b')
      end
    end

    context 'when status is typing' do
      before do
        patch api_repository_file_item_path(repository_id: repository.id, id: untyped_file_item.id),
              params: {
                file_item: {
                  status: :typing,
                  typing_progress: {
                    row: 3,
                    column: 1,
                    time: 330.5,
                    typos_attributes: [
                      { row: 1, column: 1, character: 'a' },
                      { row: 2, column: 2, character: 'b' }
                    ]
                  }
                }
              }, headers: headers
      end

      it 'returns success status' do
        expect(response).to have_http_status(:ok)
      end

      it 'returns file item' do
        json = response.parsed_body
        expect(json['id']).to eq(untyped_file_item.id)
      end

      it 'updates the file item status to typing' do
        updated_file_item = FileItem.find(untyped_file_item.id)
        expect(updated_file_item.status).to eq('typing')
      end

      it 'updates the typing progress and typos' do
        updated_file_item = FileItem.find(untyped_file_item.id)
        expect(updated_file_item.typing_progress.row).to eq(3)
        expect(updated_file_item.typing_progress.column).to eq(1)
        expect(updated_file_item.typing_progress.time).to eq(330.5)
        expect(updated_file_item.typing_progress.typos.length).to eq(2)

        expect(updated_file_item.typing_progress.typos.length).to eq(2)
        expect(updated_file_item.typing_progress.typos[0].row).to eq(1)
        expect(updated_file_item.typing_progress.typos[0].column).to eq(1)
        expect(updated_file_item.typing_progress.typos[0].character).to eq('a')
        expect(updated_file_item.typing_progress.typos[1].row).to eq(2)
        expect(updated_file_item.typing_progress.typos[1].column).to eq(2)
        expect(updated_file_item.typing_progress.typos[1].character).to eq('b')
      end
    end

    context 'when repository does not exist' do
      it 'returns not found status' do
        patch api_repository_file_item_path(repository_id: 0, id: file_item.id),
              params: { file_item: { status: :typed } }, headers: headers

        expect(response).to have_http_status(:not_found)
      end
    end

    context 'when invalid params is given' do
      it 'returns unprocessable entity status for both typed and typing status' do
        # typedとtypingの両方のパターンをテストする
        # それぞれを別のテストに分けるとrubocopのRepeatExample警告が出るためまとめた

        # status: typed
        patch api_repository_file_item_path(repository_id: repository.id, id: untyped_file_item.id),
              params: { file_item: { status: :typed } }, headers: headers

        expect(response).to have_http_status(:unprocessable_entity)
        json = response.parsed_body
        expect(json['typing_progress.row']).to include("can't be blank")
        expect(json['typing_progress.column']).to include("can't be blank")
        expect(json['typing_progress.time']).to include("can't be blank")

        # status: typing
        patch api_repository_file_item_path(repository_id: repository.id, id: untyped_file_item.id),
              params: { file_item: { status: :typing } }, headers: headers

        expect(response).to have_http_status(:unprocessable_entity)
        json = response.parsed_body
        expect(json['typing_progress.row']).to include("can't be blank")
        expect(json['typing_progress.column']).to include("can't be blank")
        expect(json['typing_progress.time']).to include("can't be blank")
      end
    end

    context 'when invalid status is given' do
      it 'returns bad request status' do
        patch api_repository_file_item_path(repository_id: repository.id, id: file_item.id),
              params: { file_item: { status: :invalid } }, headers: headers

        expect(response).to have_http_status(:bad_request)
        json = response.parsed_body
        expect(json['error']).to eq('Invalid status')
      end
    end
  end
end

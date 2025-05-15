# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Api::Repositories', type: :request do
  include_context 'with authenticated user'

  describe 'GET /api/repositories' do
    context 'when user has repositories' do
      let!(:repositories) { create_list(:repository, 3, :with_file_items, user: user) }

      it 'returns repositories and success status' do
        get api_repositories_path, headers: headers
        json = response.parsed_body
        expect(response).to have_http_status(:ok)
        expect(json['repositories'].length).to eq(3)
        expect(json['repositories'].map { |r| r['id'] }).to match_array(repositories.map(&:id))
        repositories.each do |repository|
          repository_json = json['repositories'].find { |r| r['id'] == repository.id }
          expect(repository_json['name']).to eq(repository.name)
          expect(repository_json['user_id']).to eq(repository.user_id)
          expect(repository_json['last_typed_at']).to eq(repository.last_typed_at&.as_json)
          expect(repository_json['progress']).to eq(0.4)
        end
      end
    end

    context 'when user has no repositories' do
      it 'returns an empty array' do
        get api_repositories_path, headers: headers
        json = response.parsed_body
        expect(json['repositories']).to be_empty
      end
    end

    context 'when repository has any file items' do
      it 'returns progress 1.0' do
        create(:repository, user: user)
        get api_repositories_path, headers: headers
        json = response.parsed_body
        expect(json['repositories'].length).to eq(1)
        expect(json['repositories'][0]['progress']).to eq(1.0)
      end
    end
  end

  describe 'GET /api/repositories/:id' do
    let!(:repository) { create(:repository, :with_file_items, user: user) }

    context 'when repository exists' do
      it 'returns the repository and success status' do
        get api_repository_path(repository), headers: headers
        expect(response).to have_http_status(:ok)
        json = response.parsed_body
        expect(json['repository']['id']).to eq(repository.id)
        expect(json['repository']['name']).to eq(repository.name)
        expect(json['repository']['user_id']).to eq(repository.user_id)
        expect(json['last_typed_at']).to eq(repository.last_typed_at&.as_json)
        expect(json['repository']['file_items'].length).to eq(4)
        expect(json['repository']['file_items'][0]['children'].length).to eq(2)
      end
    end

    context 'when repository does not exist' do
      it 'returns not found status' do
        get api_repository_path(id: 0), headers: headers
        expect(response).to have_http_status(:not_found)
        json = response.parsed_body
        expect(json['error']).to eq('リポジトリが存在しません。')
      end
    end
  end

  describe 'POST /api/repositories' do
    let(:valid_url) { 'https://github.com/username/repository' }
    let(:valid_repository_url) { 'username/repository' }

    before do
      allow(ENV).to receive(:fetch).with('GITHUB_ACCESS_TOKEN').and_return('github_access_token')
    end

    context 'when saved successfully' do
      let(:repository_info) do
        instance_double(Octokit::Repository, name: 'repository')
      end

      let(:commit) do
        double('commit', sha: 'commit_hash')
      end

      before do
        github_client_mock = instance_double(Octokit::Client)
        allow(Octokit::Client).to receive(:new).and_return(github_client_mock)
        allow(github_client_mock).to receive(:repository).with(valid_repository_url).and_return(repository_info)
        allow(github_client_mock).to receive(:commits).with(valid_repository_url).and_return([commit])

        allow(github_client_mock).to receive(:contents)
          .with(valid_repository_url, path: '')
          .and_return([])
      end

      it 'create repository' do
        post api_repositories_path, params: { repository: { url: valid_url } }, headers: headers
        expect(response).to have_http_status(:created)
        json = response.parsed_body
        expect(json.length).to eq 1
        expect(json['repository']['name']).to eq('repository')
      end
    end

    context 'when save failed' do
      # nameが空のrepositoryを用意してバリデーションエラーを発生させる
      let(:repository_info) do
        instance_double(Octokit::Repository, name: '')
      end

      let(:commit) do
        double('commit', sha: 'commit_hash')
      end

      before do
        github_client_mock = instance_double(Octokit::Client)
        allow(Octokit::Client).to receive(:new).and_return(github_client_mock)
        allow(github_client_mock).to receive(:repository).with(valid_repository_url).and_return(repository_info)
        allow(github_client_mock).to receive(:commits).with(valid_repository_url).and_return([commit])
      end

      it 'returns unprocessable_entity status' do
        post api_repositories_path, params: { repository: { url: valid_url } }, headers: headers
        expect(response).to have_http_status(:unprocessable_entity)
        json = response.parsed_body
        expect(json['name']).to eq(['can\'t be blank'])
      end
    end

    context 'when url is invalid' do
      it 'returns unprocessable_entity status' do
        invalid_url = 'https://invalid_url.com'
        post api_repositories_path, params: { repository: { url: invalid_url } }, headers: headers
        expect(response).to have_http_status(:unprocessable_entity)
        json = response.parsed_body
        expect(json['error']).to eq('無効なURLです。')
      end
    end

    context 'when repository is non-existent' do
      before do
        non_existent_repository_url = 'username/invalid_url'
        github_client_mock = instance_double(Octokit::Client)
        allow(Octokit::Client).to receive(:new).and_return(github_client_mock)
        allow(github_client_mock).to receive(:repository).with(non_existent_repository_url).and_raise(Octokit::NotFound)
      end

      it 'returns not found status' do
        non_existent_url = 'https://github.com/username/invalid_url'
        post api_repositories_path, params: { repository: { url: non_existent_url } }, headers: headers
        expect(response).to have_http_status(:not_found)
        json = response.parsed_body
        expect(json['error']).to eq('リポジトリが存在しません。')
      end
    end

    context 'when too many requests' do
      before do
        github_client_mock = instance_double(Octokit::Client)
        allow(Octokit::Client).to receive(:new).and_return(github_client_mock)
        allow(github_client_mock).to receive(:repository).with(valid_repository_url).and_raise(Octokit::TooManyRequests)
      end

      it 'returns too_many_requests status' do
        post api_repositories_path, params: { repository: { url: valid_url } }, headers: headers
        expect(response).to have_http_status(:too_many_requests)
        json = response.parsed_body
        expect(json['error']).to eq('APIリクエストが多すぎます。少し時間をおいてから再度実行してください。')
      end
    end

    context 'when unauthorized' do
      before do
        github_client_mock = instance_double(Octokit::Client)
        allow(Octokit::Client).to receive(:new).and_return(github_client_mock)
        allow(github_client_mock).to receive(:repository).with(valid_repository_url).and_raise(Octokit::Unauthorized)
      end

      it 'returns unauthorized status' do
        post api_repositories_path, params: { repository: { url: valid_url } }, headers: headers
        expect(response).to have_http_status(:unauthorized)
        json = response.parsed_body
        expect(json['error']).to eq('アクセストークンが無効です。')
      end
    end

    context 'when unexpected error occurs' do
      before do
        github_client_mock = instance_double(Octokit::Client)
        allow(Octokit::Client).to receive(:new).and_return(github_client_mock)
        allow(github_client_mock).to receive(:repository).with(valid_repository_url).and_raise(StandardError)
      end

      it 'returns internal_server_error status' do
        post api_repositories_path, params: { repository: { url: valid_url } }, headers: headers
        expect(response).to have_http_status(:internal_server_error)
        json = response.parsed_body
        expect(json['error']).to eq('リポジトリ情報の取得中にエラーが発生しました。')
      end
    end
  end
end

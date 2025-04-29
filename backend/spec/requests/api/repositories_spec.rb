# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Api::Repositories', type: :request do
  describe 'POST /api/repositories' do
    let(:headers) { { 'Authorization' => 'Bearer jwt' } }
    let(:valid_url) { 'https://github.com/username/repository' }
    let(:valid_repository_url) { 'username/repository' }

    before do
      create(:user)
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

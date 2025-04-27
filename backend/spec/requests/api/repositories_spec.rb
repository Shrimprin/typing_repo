# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Api::Repositories', type: :request do
  describe 'POST /api/repositories' do
    let(:headers) { { 'Authorization' => 'Bearer jwt' } }
    let(:valid_url) { 'https://github.com/username/repository' }
    let(:valid_repository_url) { 'username/repository' }

    let(:repository_info) do
      instance_double(Octokit::Repository, name: 'repository')
    end

    let(:commit) do
      double('commit', sha: 'commit_hash')
    end

    before do
      allow(ENV).to receive(:fetch).with('GITHUB_ACCESS_TOKEN').and_return('github_access_token')
    end

    context 'when request is valid' do
      before do
        create(:user)
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
  end
end

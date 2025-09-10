# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Api::Repositories', type: :request do
  include_context 'with authenticated user'

  describe 'GET /api/repositories' do
    context 'when user has repositories' do
      it 'returns repositories and success status' do
        repositories = create_list(:repository, 3, :with_file_items, user: user)

        get api_repositories_path, headers: headers

        json = response.parsed_body
        expect(response).to have_http_status(:ok)
        expect(json.length).to eq(3)
        expect(json.pluck('id')).to match_array(repositories.map(&:id))

        repositories.each do |repository|
          repository_json = json.find { |r| r['id'] == repository.id }
          expect(repository_json).to have_json_attributes(
            name: repository.name,
            last_typed_at: repository.last_typed_at,
            progress: 0.4
          )
        end
      end

      it 'returns repositories in ascending order of last_typed_at' do
        old_repo = create(:repository, user: user, last_typed_at: 2.days.ago)
        recent_repo = create(:repository, user: user, last_typed_at: 1.day.ago)
        untyped_repo = create(:repository, user: user, last_typed_at: nil)

        get api_repositories_path, headers: headers

        json = response.parsed_body
        expect(json.length).to eq(3)
        expect(json[0]['id']).to eq(old_repo.id)
        expect(json[1]['id']).to eq(recent_repo.id)
        expect(json[2]['id']).to eq(untyped_repo.id)
      end
    end

    context 'with pagination' do
      before do
        create_list(:repository, 11, :with_file_items, user: user)
      end

      it 'returns first page when page parameter is 1' do
        get api_repositories_path(page: 1), headers: headers

        json = response.parsed_body
        expect(json.length).to eq(10)
        expect(response.headers['Current-Page']).to eq('1')
        expect(response.headers['Total-Count']).to eq('11')
        expect(response.headers['Page-Items']).to eq('10')
        expect(response.headers['Total-Pages']).to eq('2')
      end

      it 'returns second page with remaining items' do
        get api_repositories_path(page: 2), headers: headers

        json = response.parsed_body
        expect(json.length).to eq(1)
        expect(response.headers['Current-Page']).to eq('2')
        expect(response.headers['Total-Count']).to eq('11')
        expect(response.headers['Page-Items']).to eq('10')
        expect(response.headers['Total-Pages']).to eq('2')
      end

      it 'defaults to page 1 when page parameter is not provided' do
        get api_repositories_path, headers: headers

        json = response.parsed_body
        expect(json.length).to eq(10)
        expect(response.headers['Current-Page']).to eq('1')
      end

      it 'returns empty array when page parameter is greater than total pages' do
        get api_repositories_path(page: 3), headers: headers

        json = response.parsed_body
        expect(json).to be_empty
      end
    end

    context 'when user has no repositories' do
      it 'returns an empty array' do
        get api_repositories_path, headers: headers

        json = response.parsed_body
        expect(json).to be_empty
      end
    end

    context 'when repository has any file items' do
      it 'returns progress 1.0' do
        create(:repository, user: user)
        get api_repositories_path, headers: headers

        json = response.parsed_body
        expect(json.length).to eq(1)
        expect(json[0]['progress']).to eq(1.0)
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
        expect(json).to have_json_attributes(
          id: repository.id,
          name: repository.name,
          last_typed_at: repository.last_typed_at&.as_json
        )
        expect(json['file_items'].length).to eq(4)
        expect(json['file_items'][0]['file_items'].length).to eq(2)
      end
    end

    context 'when repository does not exist' do
      it 'returns not found status' do
        get api_repository_path(id: 0), headers: headers

        expect(response).to have_http_status(:not_found)
        json = response.parsed_body
        expect(json['error']).to eq('Repository not found')
      end
    end
  end

  describe 'POST /api/repositories' do
    let(:valid_url) { 'https://github.com/username/repository' }
    let(:valid_repository_url) { 'username/repository' }
    let(:extensions_attributes) { [{ name: '.rb', is_active: true }, { name: '.md', is_active: false }] }

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

        tree_response = double('tree_response', tree: [])
        allow(github_client_mock).to receive(:tree)
          .with(valid_repository_url, 'commit_hash', recursive: true)
          .and_return(tree_response)

        post api_repositories_path,
             params: { repository: { url: valid_url, extensions_attributes: extensions_attributes } }, headers: headers
      end

      it 'returns created repository' do
        expect(response).to have_http_status(:created)

        json = response.parsed_body
        expect(json).to have_json_attributes(
          name: 'repository',
          last_typed_at: nil
        )
      end

      it 'creates extensions' do
        created_repository = Repository.find(response.parsed_body['id'])
        expect(created_repository.extensions.length).to eq(2)

        ruby_extension = created_repository.extensions.find { |extension| extension.name == '.rb' }
        expect(ruby_extension.is_active).to be true

        md_extension = created_repository.extensions.find { |extension| extension.name == '.md' }
        expect(md_extension.is_active).to be false
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

      it 'returns unprocessable_content status' do
        post api_repositories_path, params: { repository: { url: valid_url } }, headers: headers

        expect(response).to have_http_status(:unprocessable_content)
        json = response.parsed_body
        expect(json['name']).to eq(['can\'t be blank'])
      end
    end

    context 'when url is invalid' do
      it 'returns unprocessable_content status' do
        invalid_url = 'https://invalid_url.com'
        post api_repositories_path, params: { repository: { url: invalid_url } }, headers: headers

        expect(response).to have_http_status(:unprocessable_content)
        json = response.parsed_body
        expect(json['error']).to eq('Invalid URL')
      end
    end

    context 'when repository is non-existent' do
      before do
        non_existent_repository_url = 'username/invalid_url'
        github_client_mock = instance_double(Octokit::Client)
        allow(Octokit::Client).to receive(:new).and_return(github_client_mock)
        allow(github_client_mock).to receive(:repository).with(non_existent_repository_url).and_raise(Octokit::NotFound)

        non_existent_url = 'https://github.com/username/invalid_url'
        post api_repositories_path, params: { repository: { url: non_existent_url } }, headers: headers
      end

      it 'returns not found status' do
        expect(response).to have_http_status(:not_found)
        json = response.parsed_body
        expect(json['error']).to eq('Repository not found')
      end
    end

    context 'when too many requests' do
      before do
        github_client_mock = instance_double(Octokit::Client)
        allow(Octokit::Client).to receive(:new).and_return(github_client_mock)
        allow(github_client_mock).to receive(:repository).with(valid_repository_url).and_raise(Octokit::TooManyRequests)

        post api_repositories_path, params: { repository: { url: valid_url } }, headers: headers
      end

      it 'returns too_many_requests status' do
        expect(response).to have_http_status(:too_many_requests)
        json = response.parsed_body
        expect(json['error']).to eq('Too many requests. Please try again later.')
      end
    end

    context 'when unauthorized' do
      before do
        github_client_mock = instance_double(Octokit::Client)
        allow(Octokit::Client).to receive(:new).and_return(github_client_mock)
        allow(github_client_mock).to receive(:repository).with(valid_repository_url).and_raise(Octokit::Unauthorized)

        post api_repositories_path, params: { repository: { url: valid_url } }, headers: headers
      end

      it 'returns unauthorized status' do
        expect(response).to have_http_status(:unauthorized)
        json = response.parsed_body
        expect(json['error']).to eq('Invalid access token')
      end
    end

    context 'when unexpected error occurs' do
      before do
        github_client_mock = instance_double(Octokit::Client)
        allow(Octokit::Client).to receive(:new).and_return(github_client_mock)
        allow(github_client_mock).to receive(:repository).with(valid_repository_url).and_raise(StandardError)

        post api_repositories_path, params: { repository: { url: valid_url } }, headers: headers
      end

      it 'returns internal_server_error status' do
        expect(response).to have_http_status(:internal_server_error)
        json = response.parsed_body
        expect(json['error']).to eq('An error occurred. Please try again.')
      end
    end
  end

  describe 'GET /api/repositories/preview' do
    let(:valid_url) { 'https://github.com/username/repository' }
    let(:valid_repository_url) { 'username/repository' }

    context 'when url is valid' do
      let(:repository_info) do
        instance_double(Octokit::Repository, name: 'repository')
      end

      let(:commit) do
        double('commit', sha: 'commit_hash')
      end

      let(:file_tree_data) do
        double('file_tree_data', tree: [
                 double('node', path: 'directory', type: 'tree'),
                 double('node', path: 'ruby_file1.rb', type: 'blob'),
                 double('node', path: 'ruby_file2.rb', type: 'blob'),
                 double('node', path: 'ruby_file3.rb', type: 'blob'),
                 double('node', path: 'html_file1.html', type: 'blob'),
                 double('node', path: 'html_file2.html', type: 'blob'),
                 double('node', path: 'Gemfile', type: 'blob'),
                 double('node', path: '.gitignore', type: 'blob')
               ])
      end

      before do
        github_client_mock = instance_double(Octokit::Client)
        allow(Octokit::Client).to receive(:new).and_return(github_client_mock)
        allow(github_client_mock).to receive(:repository).with(valid_repository_url).and_return(repository_info)
        allow(github_client_mock).to receive(:commits).with(valid_repository_url).and_return([commit])

        allow(github_client_mock).to receive(:tree)
          .with(valid_repository_url, 'commit_hash', recursive: true)
          .and_return(file_tree_data)

        get preview_api_repositories_path, params: { repository_preview: { url: valid_url } }, headers: headers
      end

      it 'returns ok status' do
        expect(response).to have_http_status(:ok)
      end

      it 'returns repository name and url' do
        json = response.parsed_body
        expect(json['name']).to eq('repository')
        expect(json['url']).to eq(valid_url)
      end

      it 'returns extensions order by file count and name' do
        json_extensions = response.parsed_body['extensions']

        expect(json_extensions.length).to eq(4)
        expect(json_extensions[0]).to have_json_attributes(name: '.rb', file_count: 3, is_active: true)
        expect(json_extensions[1]).to have_json_attributes(name: '.html', file_count: 2, is_active: true)
        expect(json_extensions[2]).to have_json_attributes(name: '.gitignore', file_count: 1, is_active: true)
        expect(json_extensions[3]).to have_json_attributes(name: Extension::NO_EXTENSION_NAME, file_count: 1,
                                                           is_active: true)
      end

      it 'does not return directory' do
        json_extensions = response.parsed_body['extensions']

        directory = json_extensions.find { |extension| extension['name'] == 'directory' }
        expect(directory).to be_nil
      end
    end

    context 'when url is invalid' do
      it 'returns unprocessable_content status' do
        invalid_url = 'https://invalid_url.com'
        get preview_api_repositories_path, params: { repository_preview: { url: invalid_url } }, headers: headers

        expect(response).to have_http_status(:unprocessable_content)
        json = response.parsed_body
        expect(json['error']).to eq('Invalid URL')
      end
    end

    context 'when repository is non-existent' do
      before do
        non_existent_repository_url = 'username/invalid_url'
        github_client_mock = instance_double(Octokit::Client)
        allow(Octokit::Client).to receive(:new).and_return(github_client_mock)
        allow(github_client_mock).to receive(:repository).with(non_existent_repository_url).and_raise(Octokit::NotFound)

        non_existent_url = 'https://github.com/username/invalid_url'
        get preview_api_repositories_path, params: { repository_preview: { url: non_existent_url } }, headers: headers
      end

      it 'returns not found status' do
        expect(response).to have_http_status(:not_found)
        json = response.parsed_body
        expect(json['error']).to eq('Repository not found')
      end
    end

    context 'when too many requests' do
      before do
        github_client_mock = instance_double(Octokit::Client)
        allow(Octokit::Client).to receive(:new).and_return(github_client_mock)
        allow(github_client_mock).to receive(:repository).with(valid_repository_url).and_raise(Octokit::TooManyRequests)

        get preview_api_repositories_path, params: { repository_preview: { url: valid_url } }, headers: headers
      end

      it 'returns too_many_requests status' do
        expect(response).to have_http_status(:too_many_requests)
        json = response.parsed_body
        expect(json['error']).to eq('Too many requests. Please try again later.')
      end
    end

    context 'when unauthorized' do
      before do
        github_client_mock = instance_double(Octokit::Client)
        allow(Octokit::Client).to receive(:new).and_return(github_client_mock)
        allow(github_client_mock).to receive(:repository).with(valid_repository_url).and_raise(Octokit::Unauthorized)

        get preview_api_repositories_path, params: { repository_preview: { url: valid_url } }, headers: headers
      end

      it 'returns unauthorized status' do
        expect(response).to have_http_status(:unauthorized)
        json = response.parsed_body
        expect(json['error']).to eq('Invalid access token')
      end
    end

    context 'when unexpected error occurs' do
      before do
        github_client_mock = instance_double(Octokit::Client)
        allow(Octokit::Client).to receive(:new).and_return(github_client_mock)
        allow(github_client_mock).to receive(:repository).with(valid_repository_url).and_raise(StandardError)

        get preview_api_repositories_path, params: { repository_preview: { url: valid_url } }, headers: headers
      end

      it 'returns internal_server_error status' do
        expect(response).to have_http_status(:internal_server_error)
        json = response.parsed_body
        expect(json['error']).to eq('An error occurred. Please try again.')
      end
    end
  end
end

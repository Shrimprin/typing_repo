# frozen_string_literal: true

module Api
  class RepositoriesController < ApplicationController
    def index
      render json: { message: 'Success!' }
    end

    def create
      url = repository_params[:url]
      if invalid_url?(url)
        render json: { error: '無効なURLです。' }, status: :unprocessable_entity
        return
      end

      repository_url = URI(url).path[1..]

      begin
        client = Octokit::Client.new(access_token: ENV.fetch('GITHUB_ACCESS_TOKEN'))
        repository_info = client.repository(repository_url)
        repository_name = repository_info.name
        latest_commit = client.commits(repository_url).first
        commit_hash = latest_commit.sha
        repository = Repository.new(user: @current_user, name: repository_name, url: repository_url, commit_hash:)

        if repository.save_with_file_items(client)
          render json: RepositorySerializer.new(repository), status: :created
        else
          render json: repository.errors, status: :unprocessable_entity
        end
      rescue Octokit::NotFound
        render json: { error: 'リポジトリが存在しません。' }, status: :not_found
      rescue Octokit::TooManyRequests
        render json: { error: 'APIリクエストが多すぎます。少し時間をおいてから再度実行してください。' }, status: :too_many_requests
      rescue Octokit::Unauthorized
        render json: { error: 'アクセストークンが無効です。' }, status: :unauthorized
      rescue StandardError
        render json: { error: 'リポジトリ情報の取得中にエラーが発生しました。' }, status: :internal_server_error
      end
    end

    private

    def repository_params
      params.expect(repository: [:url])
    end

    def invalid_url?(url)
      !%r{^https://github\.com/[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+$}.match?(url)
    end
  end
end

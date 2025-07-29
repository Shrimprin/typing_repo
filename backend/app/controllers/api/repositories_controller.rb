# frozen_string_literal: true

module Api
  class RepositoriesController < ApplicationController
    after_action { pagy_headers_merge(@pagy) if @pagy }

    def index
      @pagy, repositories = pagy(@current_user.repositories)
      render json: RepositorySerializer.new(repositories, params: { progress: true }), status: :ok
    end

    def show
      repository = @current_user.repositories.find(params[:id])
      render json: RepositorySerializer.new(repository, params: { file_items: true }), status: :ok
    rescue ActiveRecord::RecordNotFound
      render json: { error: 'Repository not found' }, status: :not_found
    end

    def create
      url = repository_params[:url]
      if invalid_url?(url)
        render json: { error: 'Invalid URL' }, status: :unprocessable_entity
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
        render json: { error: 'Repository not found' }, status: :not_found
      rescue Octokit::TooManyRequests
        render json: { error: 'Too many requests. Please try again later.' }, status: :too_many_requests
      rescue Octokit::Unauthorized
        render json: { error: 'Invalid access token' }, status: :unauthorized
      rescue StandardError
        render json: { error: 'An error occurred. Please try again.' }, status: :internal_server_error
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

# frozen_string_literal: true

module Api
  class RepositoriesController < ApplicationController
    after_action { pagy_headers_merge(@pagy) if @pagy }

    def index
      @pagy, repositories = pagy(@current_user.repositories.order(last_typed_at: :asc))
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
      repository_url = UrlUtils.extract_github_repository_path(url)

      if repository_url.nil?
        render json: { error: 'Invalid URL' }, status: :unprocessable_entity
        return
      end

      client = Octokit::Client.new(access_token: ENV.fetch('GITHUB_ACCESS_TOKEN'))
      repository = build_repository(client, repository_url)

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

    def preview
      url = preview_params[:url]
      repository_url = UrlUtils.extract_github_repository_path(url)

      if repository_url.nil?
        render json: { error: 'Invalid URL' }, status: :unprocessable_entity
        return
      end

      client = Octokit::Client.new(access_token: ENV.fetch('GITHUB_ACCESS_TOKEN'))
      repository_preview_data = build_repository_preview_data(client, repository_url, url)

      render json: repository_preview_data, status: :ok
    rescue Octokit::NotFound
      render json: { error: 'Repository not found' }, status: :not_found
    rescue Octokit::TooManyRequests
      render json: { error: 'Too many requests. Please try again later.' }, status: :too_many_requests
    rescue Octokit::Unauthorized
      render json: { error: 'Invalid access token' }, status: :unauthorized
    rescue StandardError
      render json: { error: 'An error occurred. Please try again.' }, status: :internal_server_error
    end

    private

    def repository_params
      params.expect(repository: [:url, { extensions_attributes: [%i[name is_active]] }])
    end

    def preview_params
      params.expect(repository_preview: [:url])
    end

    def build_repository(client, repository_url)
      repository_info = client.repository(repository_url)
      repository_name = repository_info.name
      latest_commit = client.commits(repository_url).first
      commit_hash = latest_commit.sha

      Repository.new(
        user: @current_user,
        name: repository_name,
        url: repository_url,
        commit_hash:,
        extensions_attributes: repository_params[:extensions_attributes] || []
      )
    end

    def build_repository_preview_data(client, repository_url, url)
      repository_info = client.repository(repository_url)
      latest_commit = client.commits(repository_url).first
      extensions = extract_extensions_from_repository(client, repository_url, latest_commit.sha)

      {
        name: repository_info.name,
        url:,
        extensions:
      }
    end

    def extract_extensions_from_repository(client, repository_url, commit_hash)
      file_tree_data = client.tree(repository_url, commit_hash, recursive: true)
      extension_counts = Hash.new(0)

      file_tree_data.tree.each do |node|
        next unless node.type == 'blob'

        extension = Extension.extract_extension_name(node.path)
        extension_counts[extension] += 1
      end

      extensions = extension_counts.map do |extension, count|
        {
          name: extension,
          file_count: count,
          is_active: true
        }
      end

      extensions.sort_by { |ext| [-ext[:file_count], -ext[:name]] }
    end
  end
end

# frozen_string_literal: true

module Api
  class FileItemsController < ApplicationController
    before_action :set_repository, only: %i[show update]
    before_action :set_file_item, only: %i[show update]

    def show
      fetch_file_content
      render json: FileItemSerializer.new(
        @file_item,
        params: { content: true, typing_progress: true, children: true }
      ), status: :ok
    rescue Octokit::TooManyRequests
      render json: { error: 'Too many requests. Please try again later.' }, status: :too_many_requests
    rescue Octokit::Unauthorized
      render json: { error: 'Invalid access token' }, status: :unauthorized
    rescue StandardError
      render json: { error: 'An error occurred. Please try again.' }, status: :internal_server_error
    end

    def update
      case file_item_params[:status]
      when 'typed'
        if @file_item.update_with_parent(file_item_params) && @repository.update(last_typed_at: Time.zone.now)
          render json: typed_file_items_response, status: :ok
        else
          render json: @file_item.errors, status: :unprocessable_entity
        end
      when 'typing'
        if @file_item.update_with_typing_progress(file_item_params) && @repository.update(last_typed_at: Time.zone.now)
          render json: FileItemSerializer.new(@file_item, params: { children: true }), status: :ok
        else
          render json: @file_item.errors, status: :unprocessable_entity
        end
      else
        render json: { error: 'Invalid status' }, status: :bad_request
      end
    end

    private

    def file_item_params
      params.expect(file_item: [:status, {
                      typing_progress: [:row, :column, :time, :total_typo_count, {
                        typos_attributes: [%i[row column character _destroy]]
                      }]
                    }])
    end

    def set_repository
      @repository = @current_user.repositories.find(params[:repository_id])
    rescue ActiveRecord::RecordNotFound
      render json: { error: 'Repository not found' }, status: :not_found
    end

    def set_file_item
      repository = @repository || @current_user.repositories.find(params[:repository_id])
      @file_item = repository.file_items.find(params[:id])
    rescue ActiveRecord::RecordNotFound
      render json: { error: 'File not found' }, status: :not_found
    end

    def fetch_file_content
      return if @file_item.content.present? || @file_item.dir?

      client = Octokit::Client.new(access_token: ENV.fetch('GITHUB_ACCESS_TOKEN'))
      file_content = client.contents(@repository.url, path: @file_item.path, ref: @repository.commit_hash)[
        :content
      ]
      decoded_file_content = FileItem.decode_file_content(file_content)
      @file_item.update(content: decoded_file_content)
    end

    def typed_file_items_response
      file_items_grouped_by_parent = @repository.file_items_grouped_by_parent
      top_level_file_items = file_items_grouped_by_parent[nil] || []

      FileItemSerializer.new(
        top_level_file_items,
        params: { children: true, file_items_grouped_by_parent: }
      )
    end
  end
end

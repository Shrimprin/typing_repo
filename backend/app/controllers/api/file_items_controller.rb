# frozen_string_literal: true

module Api
  class FileItemsController < ApplicationController
    before_action :set_repository, only: %i[update]
    before_action :set_file_item, only: %i[show update]

    def show
      render json: FileItemSerializer.new(
        @file_item,
        params: { content: true, typing_progress: true, children: true }
      ), status: :ok
    end

    def update
      case file_item_params[:status]
      when 'typed'
        if @file_item.update_with_parent(file_item_params) && @repository.update(last_typed_at: Time.zone.now)
          top_level_file_items = @repository.file_items.roots
          render json: FileItemSerializer.new(top_level_file_items, params: { children: true }), status: :ok
        else
          render json: @file_item.errors, status: :unprocessable_entity
        end
      when 'typing'
        if @file_item.update_with_typing_progress(file_item_params) && @repository.update(last_typed_at: Time.zone.now)
          top_level_file_items = @repository.file_items.roots
          render json: FileItemSerializer.new(top_level_file_items, params: { children: true }), status: :ok
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
                      typing_progress: [:time, :typo, :line, :character, {
                        typo_positions_attributes: [%i[line character _destroy]]
                      }]
                    }])
    end

    def set_repository
      @repository = @current_user.repositories.find(params[:repository_id])
    rescue ActiveRecord::RecordNotFound
      render json: { error: 'Repository not found' }, status: :not_found
    end

    def set_file_item
      repository = @current_user.repositories.find(params[:repository_id])
      @file_item = repository.file_items.find(params[:id])
    rescue ActiveRecord::RecordNotFound
      render json: { error: 'File not found' }, status: :not_found
    end
  end
end

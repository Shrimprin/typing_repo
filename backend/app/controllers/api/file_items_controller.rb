# frozen_string_literal: true

module Api
  class FileItemsController < ApplicationController
    def show
      repository = @current_user.repositories.find(params[:repository_id])
      file_item = repository.file_items.find(params[:id])
      render json: FileItemSerializer.new(file_item, params: { content: true, full_path: true }), status: :ok
    rescue ActiveRecord::RecordNotFound
      render json: { error: 'ファイルが存在しません。' }, status: :not_found
    end

    def update
      repository = @current_user.repositories.find(params[:repository_id])
      file_item = repository.file_items.find(params[:id])
      if file_item.update_with_parent(file_item_params)
        top_level_file_items = repository.file_items.roots
        render json: FileItemSerializer.new(top_level_file_items, params: { children: true }), status: :ok
      else
        render json: { error: 'ファイルの更新に失敗しました。' }, status: :unprocessable_entity
      end
    end

    private

    def file_item_params
      params.expect(file_item: [:status])
    end
  end
end

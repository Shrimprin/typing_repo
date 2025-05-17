# frozen_string_literal: true

module Api
  class FileItemsController < ApplicationController
    def show
      repository = @current_user.repositories.find(params[:repository_id])
      file_item = repository.file_items.find(params[:id])
      render json: FileItemSerializer.new(file_item)
    rescue ActiveRecord::RecordNotFound
      render json: { error: 'ファイルが存在しません。' }, status: :not_found
    end
  end
end

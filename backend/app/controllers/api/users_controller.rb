# frozen_string_literal: true

module Api
  class UsersController < ApplicationController
    def destroy
      user_id = params[:id].to_i

      if @current_user.id != user_id
        render json: { message: 'Unauthorized access.' }, status: :forbidden
        return
      end

      @current_user.destroy!
      render json: { message: 'Account has been successfully deleted.' }, status: :ok
    rescue ActiveRecord::RecordNotDestroyed
      render json: { message: 'Failed to delete account' }, status: :unprocessable_content
    rescue StandardError
      render json: { message: 'An error occurred. Please try again later.' }, status: :internal_server_error
    end
  end
end

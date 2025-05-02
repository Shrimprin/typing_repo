# frozen_string_literal: true

module Api
  class AuthController < ApplicationController
    skip_before_action :authenticate_request!

    def login
      user = User.find_or_create_by!(login_params)
      access_token = JsonWebToken.encode(user_id: user.id)
      if user
        render json: { access_token: access_token }, status: :ok
      else
        render json: { error: 'ログインに失敗しました' }, status: unprocessable_entity
      end
    rescue ActiveRecord::RecordInvalid => e
      render json: { error: e.message }, status: :unprocessable_entity
    rescue StandardError => e
      render json: { error: e.message }, status: :internal_server_error
    end

    private

    def login_params
      params.permit(:github_id, :name)
    end
  end
end

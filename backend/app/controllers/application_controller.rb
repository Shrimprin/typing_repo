# frozen_string_literal: true

class ApplicationController < ActionController::API
  include Pagy::Backend

  before_action :authenticate_request!

  private

  def authenticate_request!
    header = request.headers['Authorization']
    token = header.split.last if header
    decoded_token = JsonWebToken.decode(token)

    if decoded_token
      @current_user = User.find(decoded_token[:user_id])
    else
      render json: { error: 'Please login.' }, status: :unauthorized
    end
  rescue ActiveRecord::RecordNotFound, JWT::DecodeError
    render json: { error: 'Please login.' }, status: :unauthorized
  end
end

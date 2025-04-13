# frozen_string_literal: true

class ApplicationController < ActionController::API
  before_action :authenticate_request!

  def authenticate_request!
    # TODO: ログイン実装までは仮実装
    @current_user = User.first
  end
end

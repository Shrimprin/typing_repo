# frozen_string_literal: true

class JsonWebToken
  SECRET_KEY = Rails.application.credentials.secret_key_base

  def self.encode(user_id, expires_at)
    payload = { user_id:, exp: expires_at.to_i }
    JWT.encode(payload, SECRET_KEY) # デフォルトではHS256アルゴリズムが使用される
  end

  def self.decode(token)
    decoded = JWT.decode(token, SECRET_KEY)[0]
    ActiveSupport::HashWithIndifferentAccess.new(decoded)
  rescue JWT::DecodeError
    nil
  end
end

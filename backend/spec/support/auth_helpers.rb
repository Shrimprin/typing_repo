# frozen_string_literal: true

module AuthHelpers
  def authenticated_headers(user = nil)
    user ||= create(:user)
    token = JsonWebToken.encode(user_id: user.id)
    { 'Authorization' => "Bearer #{token}" }
  end
end

RSpec.shared_context 'with authenticated user' do
  let(:user) { create(:user) }
  let(:headers) { authenticated_headers(user) }
end

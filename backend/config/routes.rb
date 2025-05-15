Rails.application.routes.draw do
  post '/api/auth/callback/github', to: 'api/auth#login'

  namespace :api do
    resources :repositories, only: [:index, :show, :create]
  end
end

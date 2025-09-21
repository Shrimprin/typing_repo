Rails.application.routes.draw do
  post '/api/auth/callback/github', to: 'api/auth#login'

  namespace :api do
    resources :users, only: [:destroy]
    resources :repositories, only: [:index, :show, :create, :destroy] do
      resources :file_items, only: [:show, :update]
      get :preview, on: :collection
    end
  end
end

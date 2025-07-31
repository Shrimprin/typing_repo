Rails.application.routes.draw do
  post '/api/auth/callback/github', to: 'api/auth#login'

  namespace :api do
    resources :repositories, only: [:index, :show, :create] do
      resources :file_items, only: [:show, :update]
      member do
        get :extensions
      end
      collection do
        post :preview
      end
    end
  end
end

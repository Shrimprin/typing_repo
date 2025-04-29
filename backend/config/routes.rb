Rails.application.routes.draw do
  namespace :api do
    resources :repositories, only: [:create]
  end
end

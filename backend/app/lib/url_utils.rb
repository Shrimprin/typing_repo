# frozen_string_literal: true

module UrlUtils
  GITHUB_REPOSITORY_URL_PATTERN = %r{^https://github\.com/[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+$}

  module_function

  def valid_github_repository_url?(url)
    return false if url.blank?

    GITHUB_REPOSITORY_URL_PATTERN.match?(url)
  end

  def extract_github_repository_path(url)
    return nil unless valid_github_repository_url?(url)

    URI(url).path.delete_prefix('/')
  end
end

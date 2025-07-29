# frozen_string_literal: true

Pagy::DEFAULT[:limit]       = 10

# Headers extra: http response headers (and other helpers) useful for API pagination
# See https://ddnexus.github.io/pagy/docs/extras/headers
require 'pagy/extras/headers'
Pagy::DEFAULT[:headers] = { page: 'Current-Page',
                           limit: 'Page-Items',
                           count: 'Total-Count',
                           pages: 'Total-Pages' }

Pagy::DEFAULT.freeze

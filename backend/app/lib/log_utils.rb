# frozen_string_literal: true

module LogUtils
  module_function

  def log_error(error, location)
    Rails.logger.error("[#{location}]: #{error.message}")
    Rails.logger.error(error.backtrace.join("\n")) if error.backtrace.present?
  end

  def log_warn(error, location)
    Rails.logger.warn("[#{location}]: #{error.message}")
  end
end

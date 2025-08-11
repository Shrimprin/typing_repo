# frozen_string_literal: true

RSpec::Matchers.define :have_json_attributes do |expected|
  match do |actual|
    return false unless actual.respond_to?(:[]) && actual.respond_to?(:keys)

    expected.all? do |key, expected_value|
      actual_value = fetch_value(actual, key)
      actual_value == expected_value
    end
  rescue ArgumentError
    false
  end

  failure_message do |actual|
    "Expected JSON attributes #{format_kv(actual)} to match #{format_kv(expected)}"
  end

  failure_message_when_negated do |actual|
    "Expected JSON attributes #{format_kv(actual)} not to match #{format_kv(expected)}"
  end

  def fetch_value(actual, key)
    actual[key.to_s] || actual[key]
  end

  def format_kv(obj)
    obj.inspect
  end
end

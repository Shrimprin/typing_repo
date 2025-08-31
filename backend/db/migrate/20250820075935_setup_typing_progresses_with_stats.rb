class SetupTypingProgressesWithStats < ActiveRecord::Migration[8.0]
  def change
    rename_column :typing_progresses, :time, :elapsed_seconds
    change_column :typing_progresses, :elapsed_seconds, :integer, null: false, default: 0

    add_column :typing_progresses, :total_correct_type_count, :integer, null: false, default: 0

    add_check_constraint :typing_progresses, "elapsed_seconds >= 0", name: "typing_progresses_elapsed_seconds_nonneg"
    add_check_constraint :typing_progresses, "total_typo_count >= 0", name: "typing_progresses_total_typo_count_nonneg"
    add_check_constraint :typing_progresses, "total_correct_type_count >= 0", name: "typing_progresses_total_correct_type_count_nonneg"
    add_check_constraint :typing_progresses, "row >= 0", name: "typing_progresses_row_nonneg"
    add_check_constraint :typing_progresses, "\"column\" >= 0", name: "typing_progresses_column_nonneg"
  end
end

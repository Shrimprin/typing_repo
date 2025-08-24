class SetupTypingProgressesWithStats < ActiveRecord::Migration[8.0]
  def up
    rename_column :typing_progresses, :time, :elapsed_seconds
    change_column :typing_progresses, :elapsed_seconds, :integer, null: false, default: 0

    add_column :typing_progresses, :total_correct_type_count, :integer, null: false, default: 0
  end

  def down
    remove_column :typing_progresses, :total_correct_type_count

    change_column :typing_progresses, :elapsed_seconds, :decimal, precision: 8, scale: 1, null: false, default: 0.0
    rename_column :typing_progresses, :elapsed_seconds, :time
  end
end

class CreateTypingProgresses < ActiveRecord::Migration[8.0]
  def change
    create_table :typing_progresses do |t|
      t.references :file_item, null: false, foreign_key: true
      t.decimal :time, precision: 8, scale: 1, null: false
      t.integer :row, null: false
      t.integer :column, null: false
      t.integer :total_typo_count, null: false, default: 0

      t.timestamps
    end
  end
end

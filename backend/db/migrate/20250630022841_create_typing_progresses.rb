class CreateTypingProgresses < ActiveRecord::Migration[8.0]
  def change
    create_table :typing_progresses do |t|
      t.references :file_item, null: false, foreign_key: true
      t.time :time, null: false
      t.integer :typo, null: false
      t.integer :line, null: false
      t.integer :character, null: false

      t.timestamps
    end
  end
end

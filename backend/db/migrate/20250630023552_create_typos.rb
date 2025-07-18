class CreateTypos < ActiveRecord::Migration[8.0]
  def change
    create_table :typos do |t|
      t.references :typing_progress, null: false, foreign_key: true
      t.integer :row, null: false
      t.integer :column, null: false
      t.string :character, null: false

      t.timestamps
    end
  end
end

class CreateTypoPositions < ActiveRecord::Migration[8.0]
  def change
    create_table :typo_positions do |t|
      t.references :typing_progress, null: false, foreign_key: true
      t.integer :line, null: false
      t.integer :character, null: false

      t.timestamps
    end
  end
end

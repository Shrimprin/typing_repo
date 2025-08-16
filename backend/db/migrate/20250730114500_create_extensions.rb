# frozen_string_literal: true

class CreateExtensions < ActiveRecord::Migration[8.0]
  def change
    create_table :extensions do |t|
      t.references :repository, null: false, foreign_key: true
      t.string :name, null: false
      t.boolean :is_active, null: false, default: true

      t.timestamps
    end

    add_index :extensions, [:repository_id, :name], unique: true
  end
end

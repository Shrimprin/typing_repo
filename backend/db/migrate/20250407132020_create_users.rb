class CreateUsers < ActiveRecord::Migration[8.0]
  def change
    create_table :users do |t|
      t.string :name, null: false
      t.string :github_id, null: false
      t.boolean :is_mute, null: false, default: false

      t.timestamps
    end
    add_index :users, :github_id, unique: true
  end
end

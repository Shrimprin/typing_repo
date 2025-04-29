class CreateRepositories < ActiveRecord::Migration[8.0]
  def change
    create_table :repositories do |t|
      t.references :user, null: false, foreign_key: true
      t.string :name, null: false
      t.string :url, null: false
      t.string :commit_hash, null: false
      t.datetime :last_typed_at

      t.timestamps
    end
  end
end

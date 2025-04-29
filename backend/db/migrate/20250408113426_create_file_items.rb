class CreateFileItems < ActiveRecord::Migration[8.0]
  def change
    create_table :file_items do |t|
      t.references :repository, null: false, foreign_key: true
      t.string :name, null: false
      t.integer :type, null: false
      t.text :content
      t.integer :status, null: false
      t.integer :parent_id

      t.timestamps
    end
  end
end

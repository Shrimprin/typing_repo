class CreateFileItemHierarchies < ActiveRecord::Migration[8.0]
  def change
    create_table :file_item_hierarchies, id: false do |t|
      t.integer :ancestor_id, null: false
      t.integer :descendant_id, null: false
      t.integer :generations, null: false
    end

    add_index :file_item_hierarchies, [:ancestor_id, :descendant_id, :generations],
      unique: true,
      name: "file_item_anc_desc_idx"

    add_index :file_item_hierarchies, [:descendant_id],
      name: "file_item_desc_idx"
  end
end

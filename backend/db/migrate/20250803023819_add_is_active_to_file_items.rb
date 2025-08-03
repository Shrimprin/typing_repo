class AddIsActiveToFileItems < ActiveRecord::Migration[8.0]
  def change
    add_column :file_items, :is_active, :boolean, null: false, default: true
  end
end

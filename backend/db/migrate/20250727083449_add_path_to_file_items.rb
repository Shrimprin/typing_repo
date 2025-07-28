class AddPathToFileItems < ActiveRecord::Migration[8.0]
  def up
    add_column :file_items, :path, :text

    FileItem.reset_column_information
    update_existing_paths

    change_column_null :file_items, :path, false
  end

  def down
    remove_column :file_items, :path
  end

  private

  def update_existing_paths
    FileItem.where(parent_id: nil).find_each do |root_item|
      update_path_recursively(root_item, root_item.name)
    end
  end

  def update_path_recursively(item, current_path)
    item.update!(path: current_path)

    item.children.find_each do |child|
      child_path = "#{current_path}/#{child.name}"
      update_path_recursively(child, child_path)
    end
  end
end

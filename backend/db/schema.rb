# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.0].define(version: 2025_07_27_083449) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "pg_catalog.plpgsql"

  create_table "file_item_hierarchies", id: false, force: :cascade do |t|
    t.integer "ancestor_id", null: false
    t.integer "descendant_id", null: false
    t.integer "generations", null: false
    t.index ["ancestor_id", "descendant_id", "generations"], name: "file_item_anc_desc_idx", unique: true
    t.index ["descendant_id"], name: "file_item_desc_idx"
  end

  create_table "file_items", force: :cascade do |t|
    t.bigint "repository_id", null: false
    t.string "name", null: false
    t.integer "type", null: false
    t.text "content"
    t.integer "status", null: false
    t.integer "parent_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.text "path", null: false
    t.index ["repository_id"], name: "index_file_items_on_repository_id"
  end

  create_table "repositories", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.string "name", null: false
    t.string "url", null: false
    t.string "commit_hash", null: false
    t.datetime "last_typed_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["user_id"], name: "index_repositories_on_user_id"
  end

  create_table "typing_progresses", force: :cascade do |t|
    t.bigint "file_item_id", null: false
    t.decimal "time", precision: 8, scale: 1, null: false
    t.integer "row", null: false
    t.integer "column", null: false
    t.integer "total_typo_count", default: 0, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["file_item_id"], name: "index_typing_progresses_on_file_item_id"
  end

  create_table "typos", force: :cascade do |t|
    t.bigint "typing_progress_id", null: false
    t.integer "row", null: false
    t.integer "column", null: false
    t.string "character", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["typing_progress_id"], name: "index_typos_on_typing_progress_id"
  end

  create_table "users", force: :cascade do |t|
    t.string "name", null: false
    t.string "github_id", null: false
    t.boolean "is_mute", default: false, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["github_id"], name: "index_users_on_github_id", unique: true
  end

  add_foreign_key "file_items", "repositories"
  add_foreign_key "repositories", "users"
  add_foreign_key "typing_progresses", "file_items"
  add_foreign_key "typos", "typing_progresses"
end

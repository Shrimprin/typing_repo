# frozen_string_literal: true

class FileItem < ApplicationRecord
  self.inheritance_column = nil # typeカラムを使うため単一テーブル継承を無効

  belongs_to :repository
  has_one :typing_progress, dependent: :destroy
  has_closure_tree

  validates :name, presence: true
  validates :status, presence: true
  validates :type, presence: true

  enum :type, {
    file: 0,
    dir: 1
  }

  enum :status, {
    untyped: 0,
    typing: 1,
    typed: 2
  }

  def self.decode_file_content(file_content)
    decoded_file_content = Base64.decode64(file_content).force_encoding('UTF-8')

    # UTF-8エンコーディングの確認と修正
    unless decoded_file_content.valid_encoding?
      decoded_file_content = decoded_file_content.encode('UTF-8', invalid: :replace, undef: :replace, replace: '')
    end

    # nullバイトを削除
    decoded_file_content.delete("\0")
  end

  def github_path
    path = name
    current_parent = parent

    while current_parent
      path = "#{current_parent.name}/#{path}"
      current_parent = current_parent.parent
    end

    path
  end

  def full_path
    "#{repository.name}/#{github_path}"
  end

  def update_parent_status
    return true unless parent

    children = parent.children
    is_all_typed = children.all?(&:typed?)
    return true unless is_all_typed

    parent.update(status: :typed) && parent.update_parent_status
  end

  def update_with_parent(params)
    transaction do
      is_updated = update_with_typing_progress(params) && update_parent_status
      raise ActiveRecord::Rollback unless is_updated

      true
    end
  end

  def update_with_typing_progress(params)
    transaction do
      is_updated = update(params.except(:typing_progress)) && save_typing_progress?(params)
      raise ActiveRecord::Rollback unless is_updated

      true
    end
  end

  private

  def save_typing_progress?(params)
    typing_progress&.destroy
    new_typing_progress = build_typing_progress(params[:typing_progress])

    return true if new_typing_progress.save

    new_typing_progress.errors.each do |error|
      errors.add("typing_progress.#{error.attribute}", error.message)
    end
    false
  end
end

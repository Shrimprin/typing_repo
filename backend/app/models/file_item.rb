# frozen_string_literal: true

class FileItem < ApplicationRecord
  self.inheritance_column = nil # typeカラムを使うため単一テーブル継承を無効

  belongs_to :repository
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

  def full_path
    path = name
    current_parent = parent

    while current_parent
      path = "#{current_parent.name}/#{path}"
      current_parent = current_parent.parent
    end

    "#{repository.name}/#{path}"
  end

  def update_parent_status
    return true unless parent

    children = parent.children
    is_all_typed = children.all?(&:typed?)
    return true unless is_all_typed

    parent.update!(status: :typed) && parent.update_parent_status
  end

  def update_with_parent(params)
    transaction do
      update(params) && update_parent_status
    end
  end
end

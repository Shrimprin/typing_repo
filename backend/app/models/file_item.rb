# frozen_string_literal: true

class FileItem < ApplicationRecord
  self.inheritance_column = nil # typeカラムを使うため単一テーブル継承を無効

  validates :name, presence: true
  validates :type, presence: true
  validates :status, presence: true

  has_closure_tree

  belongs_to :repository

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
end

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
      update_with_typing_progress(params) && update_parent_status
    end
  end

  def update_with_typing_progress(params)
    transaction do
      update(params.except(:typing_progress)) && save_typing_progress(params)
    end
  end

  private

  def save_typing_progress(params)
    typing_progress&.destroy
    new_typing_progress = build_typing_progress(params[:typing_progress])

    return true if new_typing_progress.save

    new_typing_progress.errors.each do |error|
      errors.add("typing_progress.#{error.attribute}", error.message)
    end
    false
  end
end

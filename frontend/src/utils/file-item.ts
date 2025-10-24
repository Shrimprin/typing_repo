import type { FileItem } from '@/types/file-item';

export function updateFileItemInTree(fileItems: FileItem[], updatedFileItem: FileItem): FileItem[] {
  return fileItems.map((fileItem) => {
    if (fileItem.id === updatedFileItem.id) return updatedFileItem;

    return fileItem.fileItems?.length
      ? { ...fileItem, fileItems: updateFileItemInTree(fileItem.fileItems, updatedFileItem) }
      : fileItem;
  });
}

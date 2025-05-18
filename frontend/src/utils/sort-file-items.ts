import { FileItem } from '@/types';

export const sortFileItems = (fileItems: FileItem[]) =>
  fileItems.sort((a, b) => {
    if (a.type !== b.type) {
      return a.type === 'dir' ? -1 : 1;
    }
    return a.name.localeCompare(b.name);
  });

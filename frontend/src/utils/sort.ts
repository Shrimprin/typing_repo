import type { FileItem, Repository } from '@/types';

export const sortFileItems = (fileItems: FileItem[]) =>
  fileItems.sort((a, b) => {
    if (a.type !== b.type) {
      return a.type === 'dir' ? -1 : 1;
    }
    return a.name.localeCompare(b.name);
  });

export const sortRepositories = (repositories: Repository[]) =>
  // 以下の順に並び替える
  // 1. lastTypedAtが新しい順
  // 2. lastTypedAtが同じ場合は名前でABC順
  // 3. lastTypedAtがnullの場合は名前でABC順

  repositories.sort((a, b) => {
    if (a.lastTypedAt && b.lastTypedAt) {
      const dateA = new Date(a.lastTypedAt).getTime();
      const dateB = new Date(b.lastTypedAt).getTime();
      if (dateA !== dateB) {
        return dateB - dateA;
      }
    } else if (a.lastTypedAt && !b.lastTypedAt) {
      return -1;
    } else if (!a.lastTypedAt && b.lastTypedAt) {
      return 1;
    }

    return a.name.localeCompare(b.name);
  });

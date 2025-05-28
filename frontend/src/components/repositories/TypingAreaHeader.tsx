import { FileItem } from '@/types';

type TypingAreaHeaderProps = {
  fileItem: FileItem;
};

export function TypingAreaHeader({ fileItem }: TypingAreaHeaderProps) {
  return <div className="truncate border-b px-4 font-mono">{fileItem.fullPath || fileItem.name}</div>;
}

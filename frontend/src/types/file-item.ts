import { TypingProgress } from './typing-progress';

type FileItemType = 'dir' | 'file';
type FileItemStatus = 'untyped' | 'typing' | 'typed';

export type FileItem = {
  id: number;
  fileItems: FileItem[] | [];
  fullPath: string;
  name: string;
  status: FileItemStatus;
  type: FileItemType;
  content?: string;
  typingProgress?: TypingProgress;
};

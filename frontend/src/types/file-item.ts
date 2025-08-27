import type { Stats } from './stats';

type FileItemType = 'dir' | 'file';
type FileItemStatus = 'untyped' | 'typing' | 'typed';

export type Typo = {
  row: number;
  column: number;
  character: string;
};

export type TypingProgress = {
  row: number;
  column: number;
  typos?: Typo[];
} & Stats;

export type FileItem = {
  id: number;
  fileItems: FileItem[];
  name: string;
  path: string;
  status: FileItemStatus;
  type: FileItemType;
  content?: string;
  typingProgress?: TypingProgress;
};

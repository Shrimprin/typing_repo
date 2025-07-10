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
  time: number; // 秒数（decimal型）
  total_typo_count: number;
  typos?: Typo[];
};

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

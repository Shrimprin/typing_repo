export type FileItemType = 'dir' | 'file';
export type FileItemStatus = 'untyped' | 'typing' | 'typed';

export type TypoPosition = {
  line: number;
  character: number;
};

export type TypingProgress = {
  time: string;
  typo: number;
  line: number;
  character: number;
  typoPositions: TypoPosition[];
};

export type FileItem = {
  id: number;
  fileItems: FileItem[] | [];
  name: string;
  status: FileItemStatus;
  type: FileItemType;
  content?: string;
  fullPath?: string;
  typingProgress?: TypingProgress;
};

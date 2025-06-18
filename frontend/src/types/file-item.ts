export type FileItemType = 'dir' | 'file';
export type FileItemStatus = 'untyped' | 'typing' | 'typed';

export type FileItem = {
  id: number;
  content?: string;
  fileItems: FileItem[] | [];
  fullPath?: string;
  name: string;
  status: FileItemStatus;
  type: FileItemType;
};

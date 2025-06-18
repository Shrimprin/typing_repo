export type FileItemType = 'dir' | 'file';
export type FileItemStatus = 'untyped' | 'typing' | 'typed';

export type FileItem = {
  id: number;
  fileItems: FileItem[] | [];
  name: string;
  status: FileItemStatus;
  type: FileItemType;
  content?: string;
  fullPath?: string;
};

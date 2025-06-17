export type FileItem = {
  id: number;
  name: string;
  type: 'dir' | 'file';
  content?: string;
  status: 'untyped' | 'typing' | 'typed';
  fileItems: FileItem[] | [];
  fullPath?: string;
};

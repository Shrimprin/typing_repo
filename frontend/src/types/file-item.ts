export type FileItem = {
  id: string;
  name: string;
  type: 'dir' | 'file';
  content: string;
  status: 'untyped' | 'typing' | 'typed';
  fileItems: FileItem[] | [];
  fullPath: string;
};

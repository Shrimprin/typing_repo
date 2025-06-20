import { FileItem } from './file-item';

export type Repository = {
  id: string;
  commitHash: string;
  fileItems: FileItem[] | [];
  lastTypedAt?: string;
  name: string;
  url: string;
};

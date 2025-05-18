import { FileItem } from './file_item';

export type Repository = {
  id: string;
  name: string;
  url: string;
  commit_hash: string;
  last_typed_at: string | null;
  fileItems: FileItem[] | [];
};

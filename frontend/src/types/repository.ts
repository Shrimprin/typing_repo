import { FileItem } from './file-item';

export type Repository = {
  id: string;
  fileItems: FileItem[] | [];
  lastTypedAt?: string;
  name: string;
  url: string;
  progress?: number;
};

export type PaginationInfo = {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  perPage: number;
  hasNext: boolean;
  hasPrev: boolean;
  nextPage: number | null;
  prevPage: number | null;
};

export type RepositoriesResponse = {
  repositories: Repository[];
  pagination: PaginationInfo;
};

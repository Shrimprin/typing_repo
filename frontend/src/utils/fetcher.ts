import type { PaginationInfo, RepositoriesResponse } from '@/types/repository';
import type { AxiosError, AxiosResponse } from 'axios';

import { PAGINATION } from '@/constants/pagination';
import { axiosGet } from '@/utils/axios';

export const fetcher = (url: string, token: string | undefined) =>
  axiosGet(url, token)
    .then((res: AxiosResponse) => res.data)
    .catch((err: AxiosError) => {
      throw err;
    });

const extractPaginationFromHeaders = (headers: Record<string, unknown>): PaginationInfo => {
  const getHeaderNumber = (key: string, defaultValue: number) => parseInt(String(headers[key] || defaultValue));

  const currentPage = getHeaderNumber('current-page', PAGINATION.DEFAULT_PAGE);
  const totalPages = getHeaderNumber('total-pages', PAGINATION.DEFAULT_PAGE);
  const totalCount = getHeaderNumber('total-count', 0);
  const perPage = getHeaderNumber('page-items', PAGINATION.PER_PAGE);

  const hasNext = currentPage < totalPages;
  const hasPrev = currentPage > PAGINATION.MIN_PAGE;

  return {
    currentPage,
    totalPages,
    totalCount,
    perPage,
    hasNext,
    hasPrev,
    nextPage: hasNext ? currentPage + 1 : null,
    prevPage: hasPrev ? currentPage - 1 : null,
  };
};

export const repositoriesFetcher = (url: string, token: string | undefined): Promise<RepositoriesResponse> =>
  axiosGet(url, token)
    .then((res: AxiosResponse) => {
      const pagination = extractPaginationFromHeaders(res.headers);

      const result: RepositoriesResponse = {
        repositories: res.data,
        pagination,
      };

      return result;
    })
    .catch((err: AxiosError) => {
      throw err;
    });

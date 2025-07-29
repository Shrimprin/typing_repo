import { auth } from '@/auth';
import { AxiosError } from 'axios';

import Header from '@/components/common/Header';
import RepositoryFooter from '@/components/repositories/index/RepositoryFooter';
import RepositoryList from '@/components/repositories/index/RepositoryList';
import { PAGINATION } from '@/constants/pagination';
import { RepositoriesResponse } from '@/types/repository';
import { repositoriesFetcher } from '@/utils/fetcher';
import { sortRepositories } from '@/utils/sort';

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function RepositoriesPage({ searchParams }: Props) {
  const params = await searchParams;
  const page = Array.isArray(params.page) ? params.page[0] : params.page || String(PAGINATION.DEFAULT_PAGE);
  const url = `/api/repositories?page=${page}`;

  const session = await auth();
  const accessToken = session?.user?.accessToken;
  let repositoriesResponse: RepositoriesResponse = {
    repositories: [],
    pagination: {
      currentPage: PAGINATION.DEFAULT_PAGE,
      totalPages: PAGINATION.DEFAULT_PAGE,
      totalCount: 0,
      perPage: PAGINATION.PER_PAGE,
      hasNext: false,
      hasPrev: false,
      nextPage: null,
      prevPage: null,
    },
  };

  try {
    repositoriesResponse = await repositoriesFetcher(url, accessToken);
  } catch (error: AxiosError | unknown) {
    const errorMessage = error instanceof AxiosError ? error.message : 'An error occurred. Please try again.';
    return <div className="flex h-screen items-center justify-center p-8">{errorMessage}</div>;
  }

  const sortedRepositories = sortRepositories(repositoriesResponse.repositories);

  return (
    <div className="flex h-screen flex-col">
      <Header title="Repositories" />
      <div className="flex-1 overflow-hidden">
        <div className="flex min-h-full flex-col px-2">
          <RepositoryList repositories={sortedRepositories} pagination={repositoriesResponse.pagination} />
          <RepositoryFooter />
        </div>
      </div>
    </div>
  );
}

import { auth } from '@/auth';
import type { Metadata } from 'next';

import PageLayout from '@/components/common/PageLayout';
import RepositoryFooter from '@/components/repositories/list/RepositoryFooter';
import RepositoryList from '@/components/repositories/list/RepositoryList';
import { PAGINATION } from '@/constants/pagination';
import { RepositoriesResponse } from '@/types/repository';
import { extractErrorMessage } from '@/utils/error-handler';
import { repositoriesFetcher } from '@/utils/fetcher';
import { sortRepositories } from '@/utils/sort';

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export const metadata: Metadata = {
  title: 'Repositories',
  description:
    'This page lists all repositories available for typing practice and you can add any GitHub repository you want to practice with.',
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
  } catch (error) {
    const errorMessage = extractErrorMessage(error);
    return (
      <PageLayout title="Repositories">
        <div className="flex h-screen items-center justify-center p-8">{errorMessage}</div>
      </PageLayout>
    );
  }

  const sortedRepositories = sortRepositories(repositoriesResponse.repositories);

  return (
    <PageLayout title="Repositories">
      <div className="flex-1">
        <div className="flex min-h-full flex-col px-2">
          <RepositoryList repositories={sortedRepositories} pagination={repositoriesResponse.pagination} />
        </div>
      </div>
      <RepositoryFooter />
    </PageLayout>
  );
}

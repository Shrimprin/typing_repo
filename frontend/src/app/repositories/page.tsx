import { auth } from '@/auth';
import { AxiosError } from 'axios';

import Header from '@/components/common/Header';
import RepositoryFooter from '@/components/repositories/index/RepositoryFooter';
import RepositoryList from '@/components/repositories/index/RepositoryList';
import { Repository } from '@/types/repository';
import { fetcher } from '@/utils/fetcher';
import { sortRepositories } from '@/utils/sort';

export default async function RepositoriesPage() {
  const url = '/api/repositories';
  const session = await auth();
  const accessToken = session?.user?.accessToken;
  let repositories: Repository[] = [];

  try {
    repositories = await fetcher(url, accessToken);
  } catch (error: AxiosError | unknown) {
    const errorMessage = error instanceof AxiosError ? error.message : 'An error occurred. Please try again.';
    return <div className="flex h-screen items-center justify-center p-8">{errorMessage}</div>;
  }

  const sortedRepositories = sortRepositories(repositories);

  return (
    <>
      <Header title="Repositories" />
      <div className="flex min-h-screen flex-col px-2">
        <RepositoryList repositories={sortedRepositories} />
        <RepositoryFooter />
      </div>
    </>
  );
}

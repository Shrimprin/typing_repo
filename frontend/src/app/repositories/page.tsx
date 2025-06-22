import { auth } from '@/auth';
import { AxiosError } from 'axios';

import RepositoryFooter from '@/components/repositories/index/RepositoryFooter';
import RepositoryList from '@/components/repositories/index/RepositoryList';
import { Repository } from '@/types/repository';
import { fetcher } from '@/utils/fetcher';

export default async function RepositoriesPage() {
  const url = '/api/repositories';
  const session = await auth();
  const accessToken = session?.user?.accessToken;
  let repositories: Repository[] = [];

  try {
    repositories = await fetcher(url, accessToken);
  } catch (error: AxiosError | unknown) {
    const errorMessage = error instanceof AxiosError ? error.message : 'エラーが発生しました。再度お試しください。';
    return <div className="flex h-screen items-center justify-center p-8">{errorMessage}</div>;
  }

  return (
    <div className="flex min-h-screen flex-col px-2">
      <RepositoryList repositories={repositories} />
      <RepositoryFooter />
    </div>
  );
}

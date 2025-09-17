import { AxiosError } from 'axios';

import { auth } from '@/auth';
import Header from '@/components/common/Header';
import DeleteRepositoryDialog from '@/components/repositories/DeleteRepositoryDialog';
import RepositoryDetail from '@/components/repositories/RepositoryDetail';
import { FileItem, Repository } from '@/types';
import { fetcher } from '@/utils/fetcher';
import { sortFileItems } from '@/utils/sort';

type RepositoryDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function RepositoryDetailPage({ params }: RepositoryDetailPageProps) {
  const { id } = await params;
  const url = `/api/repositories/${id}`;
  const session = await auth();
  const accessToken = session?.user?.accessToken;
  let repository: Repository;

  try {
    repository = await fetcher(url, accessToken);
  } catch (error: AxiosError | unknown) {
    const errorMessage = error instanceof AxiosError ? error.message : 'An error occurred. Please try again.';
    return <div className="flex h-screen items-center justify-center p-8">{errorMessage}</div>;
  }

  const fileItems: FileItem[] | [] = repository.fileItems;
  const sortedFileItems = sortFileItems(fileItems);
  const moreComponent = <DeleteRepositoryDialog repository={repository} />;

  return (
    <div className="flex h-screen flex-col">
      <Header title={repository.name} moreComponent={moreComponent} />
      <div className="flex-1 overflow-hidden">
        <RepositoryDetail initialFileItems={sortedFileItems} />
      </div>
    </div>
  );
}

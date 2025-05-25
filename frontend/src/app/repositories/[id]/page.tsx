import { AxiosError } from 'axios';

import { auth } from '@/auth';
import { RepositoryDetail } from '@/components/repositories/RepositoryDetail';
import { FileItem, Repository } from '@/types';
import { fetcher } from '@/utils/fetcher';
import { sortFileItems } from '@/utils/sort-file-items';

export default async function RepositoryDetailPage({ params }: { params: { id: string } }) {
  const { id } = await params;
  const url = `/api/repositories/${id}`;
  const session = await auth();
  const accessToken = session?.user?.accessToken;
  let repository: Repository;

  try {
    repository = await fetcher(url, accessToken);
  } catch (err: AxiosError | unknown) {
    const errorMessage = err instanceof AxiosError ? err.message : 'エラーが発生しました。再度お試しください。';
    return <div className="flex h-screen items-center justify-center p-8">{errorMessage}</div>;
  }

  const fileItems: FileItem[] | [] = repository.fileItems;
  const sortedFileItems = sortFileItems(fileItems);

  return <RepositoryDetail fileItems={sortedFileItems} />;
}

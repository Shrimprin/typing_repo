import { AxiosError } from 'axios';
import { Settings, Trash2 } from 'lucide-react';

import { auth } from '@/auth';
import Header from '@/components/common/Header';
import RepositoryDetail from '@/components/repositories/RepositoryDetail';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
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

  const moreComponent = (
    <>
      <DropdownMenuItem>
        <Settings className="mr-2 h-4 w-4 font-mono" />
        Settings
      </DropdownMenuItem>
      <DropdownMenuItem className="font-mono text-red-600">
        <Trash2 className="mr-2 h-4 w-4 text-red-600" />
        Delete Repository
      </DropdownMenuItem>
    </>
  );

  return (
    <>
      <Header title={repository.name} moreComponent={moreComponent} />
      <RepositoryDetail initialFileItems={sortedFileItems} />
    </>
  );
}

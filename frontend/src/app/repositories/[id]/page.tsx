import { auth } from '@/auth';
import PageLayout from '@/components/common/PageLayout';
import DeleteRepositoryDialog from '@/components/repositories/DeleteRepositoryDialog';
import RepositoryDetail from '@/components/repositories/RepositoryDetail';
import { FileItem, Repository } from '@/types';
import { extractErrorMessage } from '@/utils/error-handler';
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
  } catch (error) {
    const errorMessage = extractErrorMessage(error);
    return (
      <PageLayout title="Repository">
        <div className="flex h-screen items-center justify-center p-8">{errorMessage}</div>
      </PageLayout>
    );
  }

  const fileItems: FileItem[] | [] = repository.fileItems;
  const sortedFileItems = sortFileItems(fileItems);
  const moreComponent = <DeleteRepositoryDialog repository={repository} />;

  return (
    <PageLayout title={repository.name} moreComponent={moreComponent} className="flex h-screen flex-col">
      <div className="flex-1 overflow-hidden">
        <RepositoryDetail initialFileItems={sortedFileItems} />
      </div>
    </PageLayout>
  );
}

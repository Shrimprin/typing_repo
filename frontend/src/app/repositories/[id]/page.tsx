import { NextPage } from 'next';

type RepositoryPageProps = {
  params: Promise<{
    id: string;
  }>;
};

const RepositoryPage: NextPage<RepositoryPageProps> = async ({ params }) => {
  const { id } = await params;
  return <p>RepositoryPage {id}</p>;
};

export default RepositoryPage;

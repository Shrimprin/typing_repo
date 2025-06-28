import { NextPage } from 'next';

import Header from '@/components/common/Header';
import RepositoryForm from '@/components/repositories/RepositoryForm';

const NewRepositoryPage: NextPage = () => {
  return (
    <>
      <Header title="Add Repository" />
      <div className="mx-auto max-w-md p-4">
        <p className="mb-4 text-sm text-gray-500">Enter the URL of the GitHub repository you want to type.</p>
        <RepositoryForm />
      </div>
    </>
  );
};

export default NewRepositoryPage;

import { NextPage } from 'next';

import Header from '@/components/common/Header';
import RepositoryCreationWizard from '@/components/repositories/new/RepositoryCreationWizard';

const NewRepositoryPage: NextPage = () => {
  return (
    <>
      <Header title="New Repository" />
      <div className="p-4">
        <p className="mb-6 text-center">Import a GitHub repository to start typing practice.</p>
        <RepositoryCreationWizard />
      </div>
    </>
  );
};

export default NewRepositoryPage;

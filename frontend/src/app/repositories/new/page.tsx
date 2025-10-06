import { NextPage } from 'next';

import PageLayout from '@/components/common/PageLayout';
import RepositoryCreationWizard from '@/components/repositories/new/RepositoryCreationWizard';

const NewRepositoryPage: NextPage = () => {
  return (
    <PageLayout title="New Repository">
      <div className="p-4">
        <p className="mb-6 text-center">Import a GitHub repository to start typing practice.</p>
        <RepositoryCreationWizard />
      </div>
    </PageLayout>
  );
};

export default NewRepositoryPage;

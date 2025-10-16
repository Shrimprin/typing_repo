import { Metadata, NextPage } from 'next';

import PageLayout from '@/components/common/PageLayout';
import RepositoryCreationWizard from '@/components/repositories/new/RepositoryCreationWizard';

export const metadata: Metadata = {
  title: 'New Repository | Typing Repo',
  description: 'This page allows you to import a GitHub repository to start typing practice.',
};

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

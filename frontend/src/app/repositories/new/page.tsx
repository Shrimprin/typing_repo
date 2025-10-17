import type { Metadata } from 'next';

import PageLayout from '@/components/common/PageLayout';
import RepositoryCreationWizard from '@/components/repositories/new/RepositoryCreationWizard';

export const metadata: Metadata = {
  title: 'New Repository',
  description: 'This page allows you to import a GitHub repository to start typing practice.',
};

export default function NewRepositoryPage() {
  return (
    <PageLayout title="New Repository">
      <div className="p-4">
        <p className="mb-6 text-center">Import a GitHub repository to start typing practice.</p>
        <RepositoryCreationWizard />
      </div>
    </PageLayout>
  );
}

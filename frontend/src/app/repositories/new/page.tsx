import { NextPage } from 'next';

import Header from '@/components/common/Header';
import RepositoryForm from '@/components/repositories/RepositoryForm';

const NewRepositoryPage: NextPage = () => {
  return (
    <>
      <Header title="リポジトリを追加" />
      <div className="mx-auto max-w-md p-4">
        <p className="mb-4 text-sm text-gray-500">タイピングしたいGitHubリポジトリのURLを入力してください。</p>
        <RepositoryForm />
      </div>
    </>
  );
};

export default NewRepositoryPage;

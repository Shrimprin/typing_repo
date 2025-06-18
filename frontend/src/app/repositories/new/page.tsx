import { NextPage } from 'next';

import RepositoryForm from '@/components/repositories/RepositoryForm';

const NewRepositoryPage: NextPage = () => {
  return (
    <div className="mx-auto max-w-md p-4">
      <h1 className="mb-4 text-xl font-bold">リポジトリを追加</h1>
      <p className="mb-4 text-sm text-gray-500">タイピングしたいGitHubリポジトリのURLを入力してください。</p>
      <RepositoryForm />
    </div>
  );
};

export default NewRepositoryPage;

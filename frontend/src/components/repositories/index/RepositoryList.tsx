import { Repository } from '@/types/repository';
import RepositoryListItem from './RepositoryListItem';

type Props = {
  repositories: Repository[];
};

export default function RepositoryList({ repositories }: Props) {
  return (
    <div className="container mx-auto max-w-4xl flex-grow py-4">
      {repositories.map((repository) => (
        <RepositoryListItem key={repository.id} repository={repository} />
      ))}
    </div>
  );
}

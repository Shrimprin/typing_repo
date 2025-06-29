import { FolderOpen, Plus } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Repository } from '@/types/repository';
import RepositoryListItem from './RepositoryListItem';

type Props = {
  repositories: Repository[];
};

export default function RepositoryList({ repositories }: Props) {
  return (
    <div className="container mx-auto max-w-4xl flex-grow py-4">
      {repositories.length > 0 ? (
        repositories.map((repository) => <RepositoryListItem key={repository.id} repository={repository} />)
      ) : (
        <div className="py-12 text-center font-mono">
          <div className="mb-4">
            <FolderOpen className="mx-auto h-12 w-12" />
          </div>
          <h3 className="mb-2 text-lg font-medium">No repositories</h3>
          <p className="text-muted-foreground mb-6 text-sm">Add a repository to start typing.</p>
          <Button asChild>
            <Link href="/repositories/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Repository
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}

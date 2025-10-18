import { formatDistanceToNow } from 'date-fns';
import { enUS } from 'date-fns/locale';
import Link from 'next/link';

import type { Repository } from '@/types/repository';
import RepositoryProgress from './RepositoryProgress';

type Props = {
  repository: Repository;
};

export default function RepositoryListItem({ repository }: Props) {
  return (
    <div className="flex items-center justify-between border-b py-6">
      <div className="min-w-0 flex-grow">
        <Link href={`/repositories/${repository.id}`} className={`hover:underline`}>
          <h2 className="truncate text-lg font-semibold">{repository.name}</h2>
        </Link>
        <div
          className={`
            mt-1 flex flex-col space-y-2
            sm:flex-row sm:space-y-0 sm:space-x-4
          `}
        >
          <RepositoryProgress progress={repository.progress || 0} />
          {repository.lastTypedAt && (
            <p className="text-muted-foreground text-sm">
              typed{' '}
              {formatDistanceToNow(new Date(repository.lastTypedAt), {
                addSuffix: true,
                locale: enUS,
              })}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

import { formatDistanceToNow } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { MoreHorizontal } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Repository } from '@/types/repository';
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

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="settings">
            <MoreHorizontal className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>TODO: 設定メニューを開く</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

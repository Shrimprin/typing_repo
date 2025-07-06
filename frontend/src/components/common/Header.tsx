import { MoreHorizontal } from 'lucide-react';

import UserButton from '@/components/common/UserButton';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

type HeaderProps = {
  title?: string;
  moreComponent?: React.ReactNode;
};

export default function Header({ title = '', moreComponent }: HeaderProps) {
  return (
    <div className={`bg-background flex h-16 w-full flex-shrink-0 items-center justify-between border-b px-8`}>
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-bold">LOGO</h1>
        <h1 className="text-lg font-bold">{title}</h1>
        {moreComponent && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="settings">
                <MoreHorizontal className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>{moreComponent}</DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
      <div className="flex gap-3">
        <UserButton />
      </div>
    </div>
  );
}

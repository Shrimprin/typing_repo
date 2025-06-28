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
    <>
      <div className={`fixed top-0 z-50 flex h-16 w-screen items-center justify-between border-b bg-white px-8`}>
        <div className="flex items-center gap-3">
          <h1 className="font-mono text-xl font-bold">LOGO</h1>
          <h1 className="font-mono text-lg font-bold">{title}</h1>
          {moreComponent && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="リポジトリの設定メニュー">
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
      <div className="h-16"></div>
    </>
  );
}

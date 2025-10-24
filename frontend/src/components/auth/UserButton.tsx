import { auth } from '@/auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SignIn, SignOut } from './AuthButton';
import DeleteAccountDialog from './DeleteAccountDialog';

export default async function UserButton() {
  const session = await auth();
  if (!session?.user) return <SignIn provider="github" />;
  return (
    <div className="flex items-center gap-2">
      <span
        className={`
          hidden text-sm
          sm:inline-flex
        `}
      ></span>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative size-8 rounded-full">
            <Avatar className="size-8">
              {session.user.image && <AvatarImage src={session.user.image} alt={session.user.name ?? ''} />}
              <AvatarFallback>{session.user.name ?? ''}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel>
            <div className="flex flex-col space-y-1">
              <p className="text-sm leading-none font-medium">{session.user.name}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <SignOut />
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <DeleteAccountDialog />
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

import { signIn, signOut } from '@/auth';
import { Button } from '@/components/ui/button';
import { Github, LogOut } from 'lucide-react';

export function SignIn({ provider }: { provider?: string }) {
  return (
    <form
      action={async () => {
        'use server';
        await signIn(provider);
      }}
    >
      <Button type="submit" variant="outline" className="flex items-center gap-2">
        <Github />
        Sign in with GitHub
      </Button>
    </form>
  );
}

export function SignOut() {
  return (
    <form
      className="w-full"
      action={async () => {
        'use server';
        await signOut();
      }}
    >
      <button className="flex h-auto items-center gap-2">
        <LogOut />
        Sign out
      </button>
    </form>
  );
}

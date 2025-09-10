import { signIn, signOut } from '@/auth';
import { Button } from '@/components/ui/button';
import { Github, LogOut } from 'lucide-react';

export function SignIn({ provider, children }: { provider?: string; children?: React.ReactNode }) {
  return (
    <form
      action={async () => {
        'use server';
        await signIn(provider);
      }}
    >
      <Button type="submit" variant="primary" size="lg" className="flex items-center gap-2">
        <Github className="h-5 w-5 flex-shrink-0" />
        {children || 'Sign in with GitHub'}
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

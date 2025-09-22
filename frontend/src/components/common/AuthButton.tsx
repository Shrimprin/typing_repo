import { Github, LogOut } from 'lucide-react';

import { setToast } from '@/actions/toast';
import { signIn, signOut } from '@/auth';
import { Button } from '@/components/ui/button';

export function SignIn({ provider, children }: { provider?: string; children?: React.ReactNode }) {
  return (
    <form
      action={async () => {
        'use server';
        await setToast({ message: 'Signed in successfully.', type: 'success' });
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
      action={async () => {
        'use server';
        await setToast({ message: 'Signed out successfully.', type: 'success' });
        await signOut({ redirectTo: '/' });
      }}
    >
      <button
        type="submit"
        className={`
          hover:bg-accent
          flex w-full items-center gap-2 px-2 py-1.5 text-sm
        `}
      >
        <LogOut className="h-4 w-4" />
        Sign out
      </button>
    </form>
  );
}

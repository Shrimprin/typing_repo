import { signIn, signOut } from '@/auth';
import { Button } from '@/components/ui/button';

export function SignIn({ provider }: { provider?: string }) {
  return (
    <form
      action={async () => {
        'use server';
        await signIn(provider);
      }}
    >
      <Button type="submit">Signin with GitHub</Button>
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
      <Button type="submit">Sign Out</Button>
    </form>
  );
}

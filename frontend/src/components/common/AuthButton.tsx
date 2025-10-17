import { setToast } from '@/actions/toast';
import { signIn, signOut } from '@/auth';
import { SignInSubmitButton, SignOutSubmitButton } from '@/components/common/AuthClientButton';

export function SignIn({ provider, children }: { provider?: string; children?: React.ReactNode }) {
  return (
    <form
      action={async () => {
        'use server';
        await setToast({ message: 'Signed in successfully.', type: 'success' });
        await signIn(provider);
      }}
    >
      <SignInSubmitButton>{children || 'Sign in'}</SignInSubmitButton>
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
      <SignOutSubmitButton />
    </form>
  );
}

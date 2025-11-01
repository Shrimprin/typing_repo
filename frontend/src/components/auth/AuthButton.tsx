import { setToast } from '@/actions/toast';
import { signIn, signOut } from '@/auth';
import { SignInSubmitButton, SignOutSubmitButton } from './AuthClientButton';

export function SignIn({
  provider,
  children,
  large,
}: {
  provider?: string;
  children?: React.ReactNode;
  large?: boolean;
}) {
  return (
    <form
      action={async () => {
        'use server';
        await setToast({ message: 'Signed in successfully.', type: 'success' });
        await signIn(provider);
      }}
    >
      <SignInSubmitButton large={large}>{children || 'Sign in'}</SignInSubmitButton>
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

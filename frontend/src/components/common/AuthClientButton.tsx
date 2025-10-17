'use client';

import { Github, LoaderCircle, LogOut } from 'lucide-react';
import React from 'react';
import { useFormStatus } from 'react-dom';

import { Button } from '@/components/ui/button';

export function SignInSubmitButton({ children }: { children?: React.ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="primary" size="lg" className="flex items-center gap-2" disabled={pending}>
      {pending ? (
        <LoaderCircle className="h-5 w-5 flex-shrink-0 animate-spin" />
      ) : (
        <Github className="h-5 w-5 flex-shrink-0" />
      )}
      {children || 'Sign in'}
    </Button>
  );
}

export function SignOutSubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={`
        hover:bg-accent
        flex w-full items-center gap-2 px-2 py-1.5 text-sm
        disabled:cursor-not-allowed disabled:opacity-70
      `}
    >
      {pending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
      Sign out
    </button>
  );
}

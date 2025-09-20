'use client';

import { LoaderCircle, Trash } from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import { useState } from 'react';

import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { axiosDelete } from '@/utils/axios';

export default function DeleteAccountDialog() {
  const [isDeleting, setIsDeleting] = useState(false);
  const { data: session } = useSession();

  const deleteUser = async () => {
    const accessToken = session?.user?.accessToken;
    const userId = session?.user?.userId;

    if (!accessToken || !userId) return;

    await axiosDelete(`/api/users/${userId}`, accessToken);
  };

  const handleDelete = async () => {
    const confirmDelete = window.confirm(
      'Delete all data associated with your account. This action cannot be undone.\n\nAre you sure you want to delete your account?',
    );
    if (!confirmDelete) return;

    const finalConfirmation = window.confirm('Are you sure you want to delete your account?');
    if (!finalConfirmation) return;

    setIsDeleting(true);
    try {
      await deleteUser();
      await signOut({ redirectTo: '/' });
    } catch (error) {
      // TODO: toastなどで表示する
      console.error('Failed to delete account:', error);
      setIsDeleting(false);
    }
  };

  return (
    <DropdownMenuItem
      className="text-destructive"
      onSelect={() => {
        handleDelete();
      }}
      disabled={isDeleting}
    >
      {isDeleting ? (
        <LoaderCircle className="text-destructive mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Trash className="text-destructive mr-2 h-4 w-4" />
      )}
      Delete Account
    </DropdownMenuItem>
  );
}

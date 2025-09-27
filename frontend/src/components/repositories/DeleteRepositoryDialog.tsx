'use client';

import { LoaderCircle, Trash } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { setToast } from '@/actions/toast';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import type { Repository } from '@/types/repository';
import { axiosDelete } from '@/utils/axios';

type Props = {
  repository: Repository;
};

export default function DeleteRepositoryDialog({ repository }: Props) {
  const [isDeleting, setIsDeleting] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();

  const handleDelete = async () => {
    const accessToken = session?.user?.accessToken;
    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${repository.name}"? This action cannot be undone. All files and typing history associated with this repository will be deleted.`,
    );
    if (!confirmDelete) return;

    setIsDeleting(true);
    try {
      await axiosDelete(`/api/repositories/${repository.id}`, accessToken);
      await setToast({ message: 'Repository deleted.', type: 'success' });
      router.push('/repositories');
    } catch {
      await setToast({ message: 'Failed to delete repository.', type: 'error' });
    } finally {
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
      Delete Repository
    </DropdownMenuItem>
  );
}

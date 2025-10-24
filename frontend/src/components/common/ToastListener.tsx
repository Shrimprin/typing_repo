'use client';

import type { Toast } from '@/types/toast';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

import { deleteToast, getToast } from '@/actions/toast';
import { toast } from 'sonner';

export default function ToastListener() {
  const pathname = usePathname();
  useEffect(() => {
    (async () => {
      const toastValue: Toast | null = await getToast();
      if (!toastValue) {
        return;
      }
      toast[toastValue.type](toastValue.message);
      await deleteToast();
    })();
  }, [pathname]);

  return null;
}

'use server';

import { cookies } from 'next/headers';

import type { Toast } from '@/types/toast';

export const setToast = async (value: Toast) => {
  (await cookies()).set('toast', JSON.stringify(value));
};

export const getToast = async () => {
  const cookie = (await cookies()).get('toast');
  if (!cookie) {
    return null;
  }
  return JSON.parse(cookie.value) as Toast;
};

export const deleteToast = async () => {
  (await cookies()).delete('toast');
};

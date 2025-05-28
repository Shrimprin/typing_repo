import { axiosGet } from '@/utils/axios';
import type { AxiosError, AxiosResponse } from 'axios';

export const fetcher = (url: string, token: string | undefined) =>
  axiosGet(url, token)
    .then((res: AxiosResponse) => res.data)
    .catch((err: AxiosError) => {
      throw err;
    });

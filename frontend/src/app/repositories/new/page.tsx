'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import { useState } from 'react';
import type { SubmitHandler } from 'react-hook-form';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { axiosPost } from '@/utils/axios';

type FormValues = {
  url: string;
};

const schema = z.object({
  url: z
    .string()
    .url('有効なURLを入力してください')
    .nonempty('URLは必須です')
    .regex(/^https:\/\/github\.com\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/, 'GitHubのリポジトリURLを入力してください'),
});

export default function NewRepositoryPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });
  const [error, setError] = useState<string | null>(null);
  // const router = useRouter(); // TODO: リダイレクト実装時に使う
  // const { data: session } = useSession(); TODO: ログイン実装時に使う

  const onSubmit: SubmitHandler<FormValues> = async (data: FormValues) => {
    // const accessToken = session?.user?.accessToken; // TODO: ログイン実装時に使う
    const accessToken = process.env.NEXT_PUBLIC_ACCESS_TOKEN; // TODO: ログイン実装までは仮実装
    const url = '/api/repositories';
    const postData = {
      repository: { url: data.url },
    };
    try {
      const res = await axiosPost(url, accessToken, postData);
      // router.push(`/repositories/${res.data.id}`); // TODO: リダイレクト実装時に使う
      console.log(res.data); // TODO: 仮
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        setError(error.response.data.error);
      } else {
        setError('サーバーエラーが発生しました。');
      }
    }
  };

  return (
    <div>
      <h1>リポジトリを追加</h1>
      <p>タイピングしたいGitHubリポジトリのURLを入力してください。</p>
      <h2>GitHubリポジトリのURL</h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        <input type="text" {...register('url')} placeholder="GitHubリポジトリのURLを入力してください。" />
        {errors.url && <span style={{ color: 'red' }}>{errors.url.message}</span>}
        <button type="submit" disabled={isSubmitting}>
          追加
        </button>
      </form>
      {error && <div style={{ color: 'red' }}>{error}</div>}
    </div>
  );
}

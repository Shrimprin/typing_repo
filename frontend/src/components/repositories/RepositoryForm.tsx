'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { SubmitHandler } from 'react-hook-form';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { axiosPost } from '@/utils/axios';

type FormValues = {
  url: string;
};

const schema = z.object({
  url: z
    .string()
    .nonempty('URLは必須です')
    .url('有効なURLを入力してください')
    .regex(/^https:\/\/github\.com\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/, 'GitHubのリポジトリURLを入力してください'),
});

export default function RepositoryForm() {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      url: '',
    },
  });
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  // const { data: session } = useSession(); TODO: ログイン実装時に使う

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    // const accessToken = session?.user?.accessToken; // TODO: ログイン実装時に使う
    const accessToken = 'token_1234567890'; // TODO: 仮
    const url = '/api/repositories';
    const postData = {
      repository: { url: data.url },
    };
    try {
      const res = await axiosPost(url, accessToken, postData);
      router.push(`/repositories/${res.data.repository.id}`);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setError(error.message);
      } else {
        setError('サーバーエラーが発生しました。');
      }
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>GitHubリポジトリのURL</FormLabel>
              <FormControl>
                <Input placeholder="https://github.com/username/repository" {...field} />
              </FormControl>
              <FormMessage>{form.formState.errors.url?.message || error}</FormMessage>
            </FormItem>
          )}
        />
        <Button type="submit" disabled={form.formState.isSubmitting}>
          追加
        </Button>
      </form>
    </Form>
  );
}

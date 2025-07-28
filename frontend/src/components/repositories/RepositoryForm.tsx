'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import { LoaderCircle } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { SubmitHandler } from 'react-hook-form';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { axiosPost } from '@/utils/axios';
import { Plus } from 'lucide-react';

type FormValues = {
  url: string;
};

const schema = z.object({
  url: z
    .string()
    .nonempty('URL is required')
    .url('Enter a valid URL')
    .regex(/^https:\/\/github\.com\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/, 'Enter a valid GitHub repository URL'),
});

export default function RepositoryForm() {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      url: '',
    },
  });
  const [errorMessage, setErrorMessage] = useState<string>();
  const router = useRouter();
  const { data: session } = useSession();

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    const accessToken = session?.user?.accessToken;
    const url = '/api/repositories';
    const postData = {
      repository: { url: data.url },
    };
    try {
      const res = await axiosPost(url, accessToken, postData);
      router.push(`/repositories/${res.data.id}`);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage('An error occurred. Please try again.');
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
              <FormLabel>GitHub Repository URL</FormLabel>
              <FormControl>
                <Input placeholder="https://github.com/username/repository" {...field} />
              </FormControl>
              <FormMessage>{form.formState.errors.url?.message || errorMessage}</FormMessage>
            </FormItem>
          )}
        />
        <Button type="submit" variant="outline" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? <LoaderCircle className="animate-spin" /> : <Plus />}
          Add Repository
        </Button>
      </form>
    </Form>
  );
}

import { Card } from '@/components/ui/card';
import { useSession } from 'next-auth/react';
import { useParams } from 'next/navigation'; // Next.jsのパラメータフックをインポート
import useSWR from 'swr';

import { TypingAreaHeader } from '@/components/repositories/TypingAreaHeader';
import { FileItem } from '@/types';
import { fetcher } from '@/utils/fetcher';

type TypingAreaProps = {
  fileItem: FileItem | null;
};

export function TypingArea({ fileItem }: TypingAreaProps) {
  const params = useParams();
  const url = fileItem ? `/api/repositories/${params.id}/file_items/${fileItem.id}` : null;
  const { data: session } = useSession();
  const accessToken = session?.user?.accessToken;
  const { data, error, isLoading } = useSWR(url ? [url, accessToken] : null, ([url, accessToken]) =>
    fetcher(url, accessToken),
  );

  return (
    <div className="flex flex-col">
      <Card className="m-4 overflow-hidden">
        {!fileItem ? (
          <div className="p-6 text-center font-mono text-gray-500">タイピングするファイルを選んでください。</div>
        ) : isLoading ? (
          <div className="p-6 text-center font-mono text-gray-500">ファイルを読み込み中...</div>
        ) : error ? (
          <div className="p-6 text-center font-mono text-gray-500">エラーが発生しました。再度お試しください。</div>
        ) : (
          <>
            <TypingAreaHeader fileItem={data} />
            <div className="overflow-x-auto px-4 font-mono text-sm whitespace-pre">{data.content}</div>
          </>
        )}
      </Card>
    </div>
  );
}

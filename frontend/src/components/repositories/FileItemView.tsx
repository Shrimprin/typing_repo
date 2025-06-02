'use client';

import { Card } from '@/components/ui/card';
import { useSession } from 'next-auth/react';
import { useParams } from 'next/navigation';
import useSWR from 'swr';

import { FileItem, TypingStatus } from '@/types';
import { fetcher } from '@/utils/fetcher';
import { TypingPanel } from './TypingPanel';

type FileItemViewProps = {
  fileItem: FileItem | null;
  typingStatus: TypingStatus;
  setTypingStatus: (status: TypingStatus) => void;
};

export function FileItemView({ fileItem, typingStatus, setTypingStatus }: FileItemViewProps) {
  const params = useParams();
  const url = fileItem ? `/api/repositories/${params.id}/file_items/${fileItem.id}` : null;
  const { data: session } = useSession();
  const accessToken = session?.user?.accessToken;

  // propsで渡されたfileItemにはcontentとfull_pathが含まれていないため、APIから取得する
  const {
    data: fileItemData,
    error,
    isLoading,
  } = useSWR(url ? [url, accessToken] : null, ([url, accessToken]) => fetcher(url, accessToken));

  // console.log('--------------------------------');
  // console.log(fileItem?.id);
  // console.log(fileItemData);
  // console.log(error);
  // console.log(isLoading);
  // console.log('--------------------------------');

  return (
    <div className="flex flex-col">
      <Card className="m-4 overflow-hidden">
        {!fileItemData ? (
          <div className="p-6 text-center font-mono text-gray-500">タイピングするファイルを選んでください。</div>
        ) : isLoading ? (
          <div className="p-6 text-center font-mono text-gray-500">ファイルを読み込み中...</div>
        ) : error ? (
          <div className="p-6 text-center font-mono text-gray-500">エラーが発生しました。再度お試しください。</div>
        ) : (
          <TypingPanel
            fileItem={fileItemData as FileItem}
            typingStatus={typingStatus}
            setTypingStatus={setTypingStatus}
          />
        )}
      </Card>
    </div>
  );
}

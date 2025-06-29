'use client';

import { Card } from '@/components/ui/card';
import { useSession } from 'next-auth/react';
import { useParams } from 'next/navigation';
import useSWR from 'swr';

import { FileItem, TypingStatus } from '@/types';
import { fetcher } from '@/utils/fetcher';
import TypingPanel from './TypingPanel';

type FileItemViewProps = {
  typingStatus: TypingStatus;
  fileItem?: FileItem;
  setFileItems: (fileItems: FileItem[]) => void;
  setTypingStatus: (status: TypingStatus) => void;
};

export default function FileItemView({ typingStatus, fileItem, setFileItems, setTypingStatus }: FileItemViewProps) {
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

  return (
    <div className="flex flex-col">
      <Card className="m-4 overflow-hidden">
        {!fileItemData ? (
          <div className="p-6 text-center">Select a file to start typing.</div>
        ) : isLoading ? (
          <div className="p-6 text-center">Loading file...</div>
        ) : error ? (
          <div className="p-6 text-center">An error occurred. Please try again.</div>
        ) : (
          <TypingPanel
            fileItem={fileItemData as FileItem}
            typingStatus={typingStatus}
            setFileItems={setFileItems}
            setTypingStatus={setTypingStatus}
          />
        )}
      </Card>
    </div>
  );
}

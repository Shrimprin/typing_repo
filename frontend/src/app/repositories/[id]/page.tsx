'use client';

import camelcaseKeys from 'camelcase-keys';
import { useSession } from 'next-auth/react';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import useSWR from 'swr';

import { FileTree } from '@/components/repositories/FileTree';
import { FileItem, Repository } from '@/types';
import { fetcher } from '@/utils/fetcher';
import { sortFileItems } from '@/utils/sort-file-items';

export default function RepositoryDetailPage() {
  const { id } = useParams();
  const url = `/api/repositories/${id}`;

  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const { data: session } = useSession();
  const accessToken = session?.user?.accessToken;
  const { data, error } = useSWR(accessToken ? [url, accessToken] : null, ([url, accessToken]) =>
    fetcher(url, accessToken),
  );

  if (error)
    return (
      <div className="flex h-screen items-center justify-center p-8 text-red-500">データの取得に失敗しました。</div>
    );
  if (!data) return <div className="flex h-screen items-center justify-center p-8">読み込み中...</div>;

  const repository: Repository = camelcaseKeys(data);
  const fileItems: FileItem[] | [] = camelcaseKeys(repository.fileItems);
  const sortedFileItems = sortFileItems(fileItems);

  return (
    <div className="flex h-screen flex-col">
      <div className="flex flex-1 overflow-hidden">
        <div className="w-1/4 min-w-[250px] overflow-y-auto border-r p-2">
          <FileTree fileItems={sortedFileItems} onSelectFile={setSelectedFile} />
        </div>

        <div className="flex-1 overflow-y-auto">
          <p>タイピング画面</p>
          {selectedFile && (
            <div>
              <p>選択中のファイル: {selectedFile.name}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

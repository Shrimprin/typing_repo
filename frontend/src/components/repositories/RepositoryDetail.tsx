'use client';

import { useState } from 'react';

import { useTypingHandler } from '@/hooks/useTypingHandler';
import type { FileItem, TypingStatus } from '@/types';
import { Card } from '../ui/card';
import Loading from '../ui/loading';
import FileTree from './FileTree';
import TypingPanel from './TypingPanel';

type RepositoryDetailProps = {
  initialFileItems: FileItem[];
};

export default function RepositoryDetail({ initialFileItems }: RepositoryDetailProps) {
  const [fileItems, setFileItems] = useState<FileItem[]>(initialFileItems);
  const [selectedFileItem, setSelectedFileItem] = useState<FileItem | undefined>();
  const [typingStatus, setTypingStatus] = useState<TypingStatus>('ready');
  const [isLoading, setIsLoading] = useState(false);

  const typingHandler = useTypingHandler({
    typingStatus,
    fileItem: selectedFileItem,
    setFileItems,
    setTypingStatus,
  });

  const handleFileSelect = async (fileItem: FileItem) => {
    if (typingStatus === 'typing') {
      const confirmSwitch = window.confirm(
        'Are you sure you want to switch files? The data you are typing will be lost.',
      );
      if (!confirmSwitch) {
        return;
      }
    }

    setSelectedFileItem(fileItem);
    setIsLoading(true);

    await typingHandler.setupTypingState(fileItem.id);

    setTypingStatus(fileItem.status === 'typing' ? 'paused' : 'ready');
    setIsLoading(false);
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-1 overflow-hidden">
        <div className="w-1/4 min-w-[250px] overflow-y-auto border-r p-2">
          <FileTree fileItems={fileItems} selectedFileItem={selectedFileItem} onSelectFileItem={handleFileSelect} />
        </div>

        <div className="flex min-w-0 flex-1 flex-col">
          <Card className="mx-4 my-2 flex-1 overflow-hidden">
            {isLoading ? (
              <Loading text="Loading file..." />
            ) : typingHandler.errorMessage ? (
              <div className="p-6 text-center">{typingHandler.errorMessage}</div>
            ) : !selectedFileItem ? (
              <div className="p-6 text-center">Select a file to start typing.</div>
            ) : (
              <TypingPanel fileItem={selectedFileItem} typingHandler={typingHandler} />
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

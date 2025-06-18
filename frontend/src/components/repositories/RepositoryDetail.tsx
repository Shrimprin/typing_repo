'use client';

import { useState } from 'react';

import { FileItem, TypingStatus } from '@/types';
import FileItemView from './FileItemView';
import FileTree from './FileTree';

type RepositoryDetailProps = {
  initialFileItems: FileItem[];
};

export default function RepositoryDetail({ initialFileItems }: RepositoryDetailProps) {
  const [fileItems, setFileItems] = useState<FileItem[]>(initialFileItems);
  const [selectedFileItem, setSelectedFileItem] = useState<FileItem>();
  const [typingStatus, setTypingStatus] = useState<TypingStatus>('ready');

  const handleFileSelect = (fileItem: FileItem) => {
    if (typingStatus === 'typing' || typingStatus === 'paused') {
      const confirmSwitch = window.confirm('タイピングを中断して移動しますか？タイピング中のデータは失われます。');
      if (!confirmSwitch) {
        return;
      }
    }
    setSelectedFileItem(fileItem);
    setTypingStatus('ready');
  };

  return (
    <div className="flex h-screen flex-col">
      <div className="flex flex-1 overflow-hidden">
        <div className="w-1/4 min-w-[250px] overflow-y-auto border-r p-2">
          <FileTree fileItems={fileItems} selectedFileItem={selectedFileItem} onSelectFileItem={handleFileSelect} />
        </div>

        <div className="flex-1 overflow-y-auto">
          <FileItemView
            typingStatus={typingStatus}
            fileItem={selectedFileItem}
            setFileItems={setFileItems}
            setTypingStatus={setTypingStatus}
          />
        </div>
      </div>
    </div>
  );
}

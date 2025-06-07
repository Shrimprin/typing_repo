'use client';

import { useState } from 'react';

import { FileItem, TypingStatus } from '@/types';
import { FileItemView } from './FileItemView';
import { FileTree } from './FileTree';

export function RepositoryDetail({ fileItems }: { fileItems: FileItem[] }) {
  const [selectedFileItem, setSelectedFileItem] = useState<FileItem | null>(null);
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
          <FileItemView fileItem={selectedFileItem} typingStatus={typingStatus} setTypingStatus={setTypingStatus} />
        </div>
      </div>
    </div>
  );
}

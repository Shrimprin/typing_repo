'use client';

import { useState } from 'react';

import { FileItem } from '@/types';
import { FileTree } from './FileTree';
import { TypingArea } from './TypingArea';

export function RepositoryDetail({ fileItems }: { fileItems: FileItem[] }) {
  const [selectedFileItem, setSelectedFileItem] = useState<FileItem | null>(null);

  return (
    <div className="flex h-screen flex-col">
      <div className="flex flex-1 overflow-hidden">
        <div className="w-1/4 min-w-[250px] overflow-y-auto border-r p-2">
          <FileTree fileItems={fileItems} selectedFileItem={selectedFileItem} onSelectFileItem={setSelectedFileItem} />
        </div>

        <div className="flex-1 overflow-y-auto">
          <TypingArea fileItem={selectedFileItem} />
        </div>
      </div>
    </div>
  );
}

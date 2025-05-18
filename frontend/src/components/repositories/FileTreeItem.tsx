'use client';

import camelcaseKeys from 'camelcase-keys';
import { Check, ChevronDown, ChevronRight, File, Folder } from 'lucide-react';
import { useState } from 'react';

import { FileItem } from '@/types';

type FileTreeItemProps = {
  fileItem: FileItem;
  level: number;
  onSelectFile: (file: FileItem) => void;
};

export function FileTreeItem({ fileItem, level, onSelectFile }: FileTreeItemProps) {
  const [expanded, setExpanded] = useState(false);

  const toggleExpand = () => {
    if (fileItem.type === 'dir') {
      setExpanded(!expanded);
    }
  };

  const handleFileSelect = () => {
    if (fileItem.type === 'file') {
      onSelectFile(fileItem);
    }
  };

  const isTyped = fileItem.status === 'typed';
  const fileItems: FileItem[] = camelcaseKeys(fileItem.fileItems);

  return (
    <div style={{ marginLeft: `${level * 8}px` }}>
      <div
        className={`
          flex cursor-pointer items-center py-1
          hover:bg-gray-100
        `}
        onClick={fileItem.type === 'dir' ? toggleExpand : handleFileSelect}
      >
        {fileItem.type === 'dir' ? (
          <>
            <span className="mr-1">{expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}</span>
            <Folder size={16} className="mr-1" />
            <span>{fileItem.name}</span>
          </>
        ) : (
          <>
            <span className="mr-1 w-4"></span>
            <File size={16} className="mr-1" />
            <span>{fileItem.name}</span>
            {isTyped && <Check size={16} className="ml-2 text-green-500" />}
          </>
        )}
      </div>

      {expanded && fileItems.length > 0 && (
        <div>
          {fileItems.map((child) => (
            <FileTreeItem key={child.id} fileItem={child} level={level + 1} onSelectFile={onSelectFile} />
          ))}
        </div>
      )}
    </div>
  );
}

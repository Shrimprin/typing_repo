'use client';

import { Check, ChevronDown, ChevronRight, File, Folder } from 'lucide-react';
import { useState } from 'react';

import { FileItem } from '@/types';
import { sortFileItems } from '@/utils/sort';

type FileTreeItemProps = {
  fileItem: FileItem;
  level: number;
  selectedFileItem?: FileItem;
  onSelectFileItem: (file: FileItem) => void;
};

export default function FileTreeItem({ fileItem, level, selectedFileItem, onSelectFileItem }: FileTreeItemProps) {
  const [expanded, setExpanded] = useState(false);

  const toggleExpand = () => {
    if (fileItem.type === 'dir') {
      setExpanded(!expanded);
    }
  };

  const handleFileSelect = () => {
    if (fileItem.type === 'file') {
      onSelectFileItem(fileItem);
    }
  };

  const isSelected = selectedFileItem?.id === fileItem.id;
  const isTyped = fileItem.status === 'typed';
  const isTyping = fileItem.status === 'typing';
  const fileItems: FileItem[] = fileItem.fileItems;
  const sortedFileItems = sortFileItems(fileItems);
  const isDir = fileItem.type === 'dir';

  return (
    <div style={{ marginLeft: `${level * 4}px` }}>
      <button
        className={`
          hover:bg-accent
          flex w-full cursor-pointer items-center py-1
        `}
        onClick={isDir ? toggleExpand : handleFileSelect}
      >
        {isDir ? (
          <>
            <span className="mr-1 flex-shrink-0">
              {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </span>
            <Folder size={16} className="mr-1 flex-shrink-0" />
            <span
              className={`
                truncate
                ${isTyped ? 'text-secondary' : ''}
              `}
            >
              {fileItem.name}
            </span>
            {isTyped && <Check size={16} className="text-secondary mr-2 ml-auto flex-shrink-0" />}
          </>
        ) : (
          <>
            <div className="mr-1 w-4 flex-shrink-0"></div>
            <File size={16} className="mr-1 flex-shrink-0" />
            <span
              className={`
                truncate
                ${isSelected ? 'text-primary font-bold' : ''}
                ${isTyped ? 'text-secondary' : ''}
              `}
            >
              {fileItem.name}
            </span>
            {isTyped ? (
              <Check size={16} className="text-secondary mr-2 ml-auto flex-shrink-0" />
            ) : isTyping ? (
              <div className="mr-2 ml-auto flex h-4 w-4 flex-shrink-0 items-center justify-center">
                <div className="bg-muted-foreground h-2 w-2 rounded-full shadow-lg" />
              </div>
            ) : null}
          </>
        )}
      </button>

      {expanded && sortedFileItems.length > 0 && (
        <div>
          {sortedFileItems.map((child) => (
            <FileTreeItem
              key={child.id}
              fileItem={child}
              level={level + 1}
              selectedFileItem={selectedFileItem}
              onSelectFileItem={onSelectFileItem}
            />
          ))}
        </div>
      )}
    </div>
  );
}

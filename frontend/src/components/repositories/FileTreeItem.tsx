'use client';

import { Check, ChevronDown, ChevronRight, File, Folder } from 'lucide-react';
import { useState } from 'react';

import { FileItem } from '@/types';
import { sortFileItems } from '@/utils/sort-file-items';

type FileTreeItemProps = {
  fileItem: FileItem;
  level: number;
  selectedFileItem?: FileItem;
  onSelectFileItem: (file: FileItem) => void;
};

export function FileTreeItem({ fileItem, level, selectedFileItem, onSelectFileItem }: FileTreeItemProps) {
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
  const fileItems: FileItem[] = fileItem.fileItems;
  const sortedFileItems = sortFileItems(fileItems);
  const isDir = fileItem.type === 'dir';

  return (
    <div style={{ marginLeft: `${level * 4}px` }}>
      <button
        className={`
          flex w-full cursor-pointer py-1
          hover:bg-gray-100
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
                ${isTyped ? 'text-green-500' : ''}
              `}
            >
              {fileItem.name}
            </span>
            {isTyped && <Check size={16} className="ml-2 flex-shrink-0 text-green-500" />}
          </>
        ) : (
          <>
            <div className="mr-1 w-4 flex-shrink-0"></div>
            <File size={16} className="mr-1 flex-shrink-0" />
            <span
              className={`
                truncate
                ${isSelected ? 'font-bold' : ''}
                ${isTyped ? 'text-green-500' : ''}
              `}
            >
              {fileItem.name}
            </span>
            {isTyped && <Check size={16} className="ml-2 flex-shrink-0 text-green-500" />}
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

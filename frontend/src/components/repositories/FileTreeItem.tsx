'use client';

import camelcaseKeys from 'camelcase-keys';
import { Check, ChevronDown, ChevronRight, File, Folder } from 'lucide-react';
import { useState } from 'react';

import { FileItem } from '@/types';
import { sortFileItems } from '@/utils/sort-file-items';

type FileTreeItemProps = {
  fileItem: FileItem;
  selectedFileItem: FileItem | null;
  level: number;
  onSelectFileItem: (file: FileItem) => void;
};

export function FileTreeItem({ fileItem, selectedFileItem, level, onSelectFileItem }: FileTreeItemProps) {
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
  const fileItems: FileItem[] = camelcaseKeys(fileItem.fileItems);
  const sortedFileItems = sortFileItems(fileItems);

  return (
    <div style={{ marginLeft: `${level * 2}px` }}>
      <div
        className={`
          flex cursor-pointer items-center py-1
          hover:bg-gray-100
        `}
        onClick={fileItem.type === 'dir' ? toggleExpand : handleFileSelect}
      >
        {fileItem.type === 'dir' ? (
          <>
            <span className="mr-1 flex-shrink-0">
              {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </span>
            <Folder size={16} className="mr-1 flex-shrink-0" />
            <span className="truncate">{fileItem.name}</span>
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
      </div>

      {expanded && sortedFileItems.length > 0 && (
        <div>
          {sortedFileItems.map((child) => (
            <FileTreeItem
              key={child.id}
              fileItem={child}
              selectedFileItem={selectedFileItem}
              level={level + 1}
              onSelectFileItem={onSelectFileItem}
            />
          ))}
        </div>
      )}
    </div>
  );
}

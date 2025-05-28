import { FileItem } from '@/types';
import { FileTreeItem } from './FileTreeItem';

type FileTreeProps = {
  fileItems: FileItem[];
  selectedFileItem: FileItem | null;
  onSelectFileItem: (file: FileItem) => void;
};

export function FileTree({ fileItems, selectedFileItem, onSelectFileItem }: FileTreeProps) {
  return (
    <>
      <div className="font-mono text-sm">
        {fileItems?.map((fileItem) => (
          <FileTreeItem
            key={fileItem.id}
            fileItem={fileItem}
            selectedFileItem={selectedFileItem}
            level={0}
            onSelectFileItem={onSelectFileItem}
          />
        ))}
      </div>
    </>
  );
}

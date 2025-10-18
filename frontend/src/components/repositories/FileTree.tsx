import type { FileItem } from '@/types';
import FileTreeItem from './FileTreeItem';

type FileTreeProps = {
  fileItems: FileItem[];
  selectedFileItem?: FileItem;
  onSelectFileItem: (file: FileItem) => void;
};

export default function FileTree({ fileItems, selectedFileItem, onSelectFileItem }: FileTreeProps) {
  return (
    <nav aria-label="File tree">
      <div className="text-sm" data-testid="file-tree">
        {fileItems?.map((fileItem) => (
          <FileTreeItem
            key={fileItem.id}
            fileItem={fileItem}
            level={0}
            selectedFileItem={selectedFileItem}
            onSelectFileItem={onSelectFileItem}
          />
        ))}
      </div>
    </nav>
  );
}

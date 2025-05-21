import { FileItem } from '@/types';
import { FileTreeItem } from './FileTreeItem';

type FileTreeProps = {
  fileItems: FileItem[];
  onSelectFileItem: (file: FileItem) => void;
};

export function FileTree({ fileItems, onSelectFileItem }: FileTreeProps) {
  return (
    <>
      <div className="font-mono text-sm">
        {fileItems?.map((fileItem) => (
          <FileTreeItem key={fileItem.id} fileItem={fileItem} level={0} onSelectFileItem={onSelectFileItem} />
        ))}
      </div>
    </>
  );
}

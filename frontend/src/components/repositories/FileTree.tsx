import { FileItem } from '@/types';
import { FileTreeItem } from './FileTreeItem';

type FileTreeProps = {
  fileItems: FileItem[];
  onSelectFile: (file: FileItem) => void;
};

export function FileTree({ fileItems, onSelectFile }: FileTreeProps) {
  return (
    <>
      <div className="mb-2">
        <input
          type="search"
          placeholder="タイピングするファイルを選択してください！"
          className="w-full rounded bg-gray-200 p-2"
        />
      </div>
      <div className="font-mono text-sm">
        {fileItems?.map((fileItem) => (
          <FileTreeItem key={fileItem.id} fileItem={fileItem} level={0} onSelectFile={onSelectFile} />
        ))}
      </div>
    </>
  );
}

import { Card } from '@/components/ui/card';
import { FileItem } from '@/types';

type TypingAreaProps = {
  fileItem: FileItem;
};

export function TypingArea({ fileItem }: TypingAreaProps) {
  return <Card className="m-4 overflow-x-auto p-4 font-mono text-sm whitespace-pre">{fileItem?.content}</Card>;
}

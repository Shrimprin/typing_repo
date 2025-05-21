import { TypingAreaHeader } from '@/components/repositories/TypingAreaHeader';
import { Card } from '@/components/ui/card';
import { FileItem } from '@/types';

type TypingAreaProps = {
  fileItem: FileItem;
};

export function TypingArea({ fileItem }: TypingAreaProps) {
  return (
    <div className="flex flex-col">
      <Card className="m-4 overflow-hidden">
        <TypingAreaHeader fileItem={fileItem} />
        <div className="overflow-x-auto px-4 font-mono text-sm whitespace-pre">{fileItem?.content}</div>
      </Card>
    </div>
  );
}

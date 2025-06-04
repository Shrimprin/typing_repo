import { useTypingHandler } from '@/hooks/useTypingHandler';
import { FileItem, TypingStatus } from '@/types';
import { TypingContent } from './TypingContent';
import { TypingHeader } from './TypingHeader';

type TypingPanelProps = {
  fileItem: FileItem;
  typingStatus: TypingStatus;
  setTypingStatus: (status: TypingStatus) => void;
};

export function TypingPanel({ fileItem, typingStatus, setTypingStatus }: TypingPanelProps) {
  const targetTextLines = fileItem?.content?.split(/(?<=\n)/) || [];
  const { typedTextLines, cursorPositions, cursorLine, startTyping, resetTyping, pauseTyping, restartTyping } =
    useTypingHandler({
      targetTextLines,
      typingStatus,
      setTypingStatus,
    });
  return (
    <>
      <TypingHeader
        fileItem={fileItem}
        typingStatus={typingStatus}
        startTyping={startTyping}
        pauseTyping={pauseTyping}
        restartTyping={restartTyping}
        resetTyping={resetTyping}
      />
      <TypingContent
        content={fileItem.content || ''}
        targetTextLines={targetTextLines}
        typedTextLines={typedTextLines}
        cursorLine={cursorLine}
        cursorPositions={cursorPositions}
        typingStatus={typingStatus}
      />
    </>
  );
}

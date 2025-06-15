import { useTypingHandler } from '@/hooks/useTypingHandler';
import { FileItem, TypingStatus } from '@/types';
import { TypingContent } from './TypingContent';
import { TypingHeader } from './TypingHeader';

type TypingPanelProps = {
  fileItem: FileItem;
  setFileItems: (fileItems: FileItem[]) => void;
  typingStatus: TypingStatus;
  setTypingStatus: (status: TypingStatus) => void;
};

export function TypingPanel({ fileItem, setFileItems, typingStatus, setTypingStatus }: TypingPanelProps) {
  const targetTextLines = fileItem?.content?.split(/(?<=\n)/) || [];
  const {
    typedTextLines,
    cursorPositions,
    cursorLine,
    errorMessage,
    startTyping,
    resetTyping,
    pauseTyping,
    resumeTyping,
  } = useTypingHandler({
    targetTextLines,
    fileItemId: fileItem.id,
    setFileItems,
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
        resumeTyping={resumeTyping}
        resetTyping={resetTyping}
      />
      <TypingContent
        content={fileItem.content || ''}
        targetTextLines={targetTextLines}
        typedTextLines={typedTextLines}
        cursorLine={cursorLine}
        cursorPositions={cursorPositions}
        typingStatus={typingStatus}
        errorMessage={errorMessage}
      />
    </>
  );
}

import { useTypingHandler } from '@/hooks/useTypingHandler';
import { FileItem, TypingStatus } from '@/types';
import TypingContent from './TypingContent';
import TypingHeader from './TypingHeader';

type TypingPanelProps = {
  fileItem: FileItem;
  typingStatus: TypingStatus;
  setFileItems: (fileItems: FileItem[]) => void;
  setSelectedFileItem: (fileItem: FileItem) => void;
  setTypingStatus: (status: TypingStatus) => void;
};

export default function TypingPanel({
  fileItem,
  typingStatus,
  setFileItems,
  setSelectedFileItem,
  setTypingStatus,
}: TypingPanelProps) {
  const targetTextLines = fileItem?.content?.split(/(?<=\n)/) || [];
  const {
    cursorPositions,
    cursorLine,
    typedTextLines,
    errorMessage,
    startTyping,
    resetTyping,
    pauseTyping,
    resumeTyping,
  } = useTypingHandler({
    targetTextLines,
    typingStatus,
    fileItemId: fileItem.id,
    setFileItems,
    setSelectedFileItem,
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
        cursorLine={cursorLine}
        cursorPositions={cursorPositions}
        targetTextLines={targetTextLines}
        typedTextLines={typedTextLines}
        typingStatus={typingStatus}
        errorMessage={errorMessage}
      />
    </>
  );
}

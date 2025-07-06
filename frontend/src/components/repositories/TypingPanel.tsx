import { FileItem, TypingStatus } from '@/types';
import TypingContent from './TypingContent';
import TypingHeader from './TypingHeader';

type TypingPanelProps = {
  fileItem: FileItem;
  typingStatus: TypingStatus;
  typingHandler: {
    cursorLine: number;
    cursorPositions: number[];
    targetTextLines: string[];
    typedTextLines: string[];
    typingStatus: TypingStatus;
    startTyping: () => void;
    resumeTyping: () => void;
    pauseTyping: () => void;
    resetTyping: () => void;
  };
};

export default function TypingPanel({ fileItem, typingStatus, typingHandler }: TypingPanelProps) {
  const {
    cursorLine,
    cursorPositions,
    targetTextLines,
    typedTextLines,
    startTyping,
    resetTyping,
    pauseTyping,
    resumeTyping,
  } = typingHandler;

  return (
    <>
      <TypingHeader
        fileItemName={fileItem.fullPath}
        typingStatus={typingStatus}
        startTyping={startTyping}
        pauseTyping={pauseTyping}
        resumeTyping={resumeTyping}
        resetTyping={resetTyping}
      />
      <TypingContent
        cursorLine={cursorLine}
        cursorPositions={cursorPositions}
        targetTextLines={targetTextLines}
        typedTextLines={typedTextLines}
        typingStatus={typingStatus}
      />
    </>
  );
}

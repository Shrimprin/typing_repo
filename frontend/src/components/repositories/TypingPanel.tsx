import { FileItem, TypingStatus } from '@/types';
import TypingContent from './TypingContent';
import TypingHeader from './TypingHeader';
import TypingStats from './TypingStats';

type TypingPanelProps = {
  fileItem: FileItem;
  typingHandler: {
    cursorRow: number;
    cursorColumns: number[];
    targetTextLines: string[];
    typedTextLines: string[];
    typingStatus: TypingStatus;
    startTyping: () => void;
    resumeTyping: () => void;
    pauseTyping: () => void;
    resetTyping: () => void;
    accuracy: number;
    correctTypeCount: number;
    elapsedSeconds: number;
    typoCount: number;
    wpm: number;
  };
};

export default function TypingPanel({ fileItem, typingHandler }: TypingPanelProps) {
  const {
    cursorRow,
    cursorColumns,
    targetTextLines,
    typedTextLines,
    typingStatus,
    startTyping,
    resetTyping,
    pauseTyping,
    resumeTyping,
    accuracy,
    elapsedSeconds,
    typoCount,
    wpm,
  } = typingHandler;

  return (
    <div className="flex h-full flex-col">
      <TypingHeader
        fileItemName={fileItem.path}
        typingStatus={typingStatus}
        startTyping={startTyping}
        pauseTyping={pauseTyping}
        resumeTyping={resumeTyping}
        resetTyping={resetTyping}
      />
      <div className="relative flex-1 overflow-hidden">
        <TypingContent
          cursorRow={cursorRow}
          cursorColumns={cursorColumns}
          targetTextLines={targetTextLines}
          typedTextLines={typedTextLines}
          typingStatus={typingStatus}
        />
        {(typingStatus === 'typing' || typingStatus === 'paused') && (
          <TypingStats accuracy={accuracy} elapsedSeconds={elapsedSeconds} typoCount={typoCount} wpm={wpm} />
        )}
      </div>
    </div>
  );
}

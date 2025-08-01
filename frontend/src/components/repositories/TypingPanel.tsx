import { FileItem, TypingStatus } from '@/types';
import TypingContent from './TypingContent';
import TypingHeader from './TypingHeader';

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
      <div className="flex-1 overflow-hidden">
        <TypingContent
          cursorRow={cursorRow}
          cursorColumns={cursorColumns}
          targetTextLines={targetTextLines}
          typedTextLines={typedTextLines}
          typingStatus={typingStatus}
        />
      </div>
    </div>
  );
}

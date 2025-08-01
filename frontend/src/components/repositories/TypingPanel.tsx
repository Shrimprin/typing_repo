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
        isActive={fileItem.isActive}
      />
      <div className="flex-1 overflow-hidden">
        {!fileItem.isActive ? (
          <div className="flex h-full items-center justify-center p-6">
            <div className="text-center">
              <p className="text-foreground mb-2">This file type is not enabled for typing.</p>
              <p className="text-muted-foreground">
                If you want to type this file type, please enable it in the settings page.
              </p>
            </div>
          </div>
        ) : (
          <TypingContent
            cursorRow={cursorRow}
            cursorColumns={cursorColumns}
            targetTextLines={targetTextLines}
            typedTextLines={typedTextLines}
            typingStatus={typingStatus}
          />
        )}
      </div>
    </div>
  );
}

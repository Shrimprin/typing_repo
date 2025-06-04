import { Pause, Play, RotateCcw } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { FileItem, TypingStatus } from '@/types';

type TypingHeaderProps = {
  fileItem: FileItem;
  typingStatus: TypingStatus;
  startTyping: () => void;
  pauseTyping: () => void;
  restartTyping: () => void;
  resetTyping: () => void;
};

export function TypingHeader({
  fileItem,
  typingStatus,
  startTyping,
  pauseTyping,
  restartTyping,
  resetTyping,
}: TypingHeaderProps) {
  const handleToggleTyping = () => {
    if (typingStatus === 'ready' || typingStatus === 'completed') {
      startTyping();
    } else if (typingStatus === 'typing') {
      pauseTyping();
    } else if (typingStatus === 'paused') {
      restartTyping();
    }
  };

  return (
    <div className="flex items-center justify-between border-b px-4 pb-2">
      <div className="truncate font-mono">{fileItem.fullPath || fileItem.name}</div>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleToggleTyping}
          aria-label={typingStatus === 'typing' ? 'PAUSE' : typingStatus === 'completed' ? 'REPLAY' : 'PLAY'}
        >
          {typingStatus === 'typing' ? (
            <Pause size={16} />
          ) : typingStatus === 'completed' ? (
            <RotateCcw size={16} />
          ) : (
            <Play size={16} />
          )}
          <span className="ml-1">
            {typingStatus === 'typing' ? 'PAUSE' : typingStatus === 'completed' ? 'REPLAY' : 'PLAY'}
          </span>
        </Button>

        {(typingStatus === 'typing' || typingStatus === 'paused') && (
          <Button variant="outline" size="sm" onClick={resetTyping} aria-label="RESET">
            <RotateCcw size={16} />
            <span className="ml-1">RESET</span>
          </Button>
        )}
      </div>
    </div>
  );
}

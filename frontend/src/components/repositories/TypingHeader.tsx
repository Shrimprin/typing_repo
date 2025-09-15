import { Pause, Play, RotateCcw } from 'lucide-react';

import { Button } from '@/components/ui/button';
import type { TypingStatus } from '@/types';

type TypingHeaderProps = {
  fileItemName: string;
  typingStatus: TypingStatus;
  startTyping: () => void;
  pauseTyping: () => void;
  resumeTyping: () => void;
  resetTyping: () => void;
};

export default function TypingHeader({
  fileItemName,
  typingStatus,
  startTyping,
  pauseTyping,
  resumeTyping,
  resetTyping,
}: TypingHeaderProps) {
  const handleToggleTyping = () => {
    if (typingStatus === 'ready') {
      startTyping();
    } else if (typingStatus === 'typing') {
      pauseTyping();
    } else if (typingStatus === 'paused') {
      resumeTyping();
    } else if (typingStatus === 'completed') {
      resetTyping();
    }
  };

  const getButtonLabel = () => {
    switch (typingStatus) {
      case 'typing':
        return 'PAUSE';
      case 'paused':
        return 'RESUME';
      case 'completed':
        return 'REPLAY';
      default:
        return 'PLAY';
    }
  };

  const getButtonIcon = () => {
    switch (typingStatus) {
      case 'typing':
        return <Pause size={16} />;
      case 'completed':
        return <RotateCcw size={16} />;
      default:
        return <Play size={16} />;
    }
  };

  const buttonLabel = getButtonLabel();
  const buttonIcon = getButtonIcon();

  return (
    <div className="flex items-center justify-between border-b px-4 pb-2">
      <div className="truncate">{fileItemName}</div>
      {typingStatus !== 'unsupported' && (
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleToggleTyping} aria-label={buttonLabel}>
            {buttonIcon}
            <span className="ml-1">{buttonLabel}</span>
          </Button>

          {(typingStatus === 'typing' || typingStatus === 'paused') && (
            <Button variant="outline" size="sm" onClick={resetTyping} aria-label="RESET">
              <RotateCcw size={16} />
              <span className="ml-1">RESET</span>
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

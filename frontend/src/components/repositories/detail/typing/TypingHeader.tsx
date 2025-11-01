'use client';

import type { TypingStatus } from '@/types';

import { LoaderCircle, Pause, Play, RotateCcw } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';

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
  const [isLoading, setIsLoading] = useState(false);

  const handleToggleTyping = () => {
    if (typingStatus === 'ready') {
      startTyping();
    } else if (typingStatus === 'typing') {
      setIsLoading(true);
      Promise.resolve(pauseTyping()).finally(() => setIsLoading(false));
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

  const getButtonIcon = (isLoading: boolean) => {
    if (isLoading) {
      return <LoaderCircle size={16} className="animate-spin" />;
    }
    switch (typingStatus) {
      case 'typing':
        return <Pause size={16} />;
      case 'completed':
        return <RotateCcw size={16} />;
      default:
        return <Play size={16} />;
    }
  };

  const isBusyLoading = typingStatus === 'typing' && isLoading;
  const buttonIcon = getButtonIcon(isBusyLoading);
  const buttonLabel = getButtonLabel();
  const buttonVariant = typingStatus === 'ready' || typingStatus === 'paused' ? 'default' : 'outline';

  return (
    <header className="flex items-center justify-between border-b px-4 py-3">
      <h2 className="truncate font-medium">{fileItemName}</h2>
      {typingStatus !== 'unsupported' && (
        <div className="flex gap-2">
          <Button
            variant={buttonVariant}
            size="sm"
            onClick={handleToggleTyping}
            aria-label={buttonLabel}
            disabled={isBusyLoading}
          >
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
    </header>
  );
}

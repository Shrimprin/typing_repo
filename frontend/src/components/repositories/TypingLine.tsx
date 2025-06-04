import { IconCornerDownLeft } from '@tabler/icons-react';
import React from 'react';

type TypingLineProps = {
  typedText: string;
  targetTextLine: string;
  cursorPosition: number;
  isActive: boolean;
};

const TypingLine = React.memo(function TypingLine({
  typedText,
  targetTextLine,
  cursorPosition,
  isActive,
}: TypingLineProps) {
  const getCharClass = (index: number) => {
    if (index > typedText.length || !isActive) return 'text-muted-foreground';
    if (index === cursorPosition) return 'border-b border-foreground';
    if (typedText[index] === targetTextLine[index]) return 'bg-green-100';
    return 'bg-red-100';
  };

  return (
    <pre className="h-[1.4em] font-mono">
      {targetTextLine.split('').map((char, index) => (
        <span key={index} className={getCharClass(index)}>
          {char === '\n' ? (
            <>
              <IconCornerDownLeft stroke={1} size={8} className="inline" />
            </>
          ) : (
            char
          )}
        </span>
      ))}
    </pre>
  );
});

export { TypingLine };

import { IconCornerDownLeft } from '@tabler/icons-react';
import React from 'react';

type TypingLineProps = {
  typedText: string;
  targetTextLine: string;
  cursorPosition: number;
  isUntypedLine: boolean;
};

const TypingLine = React.memo(function TypingLine({
  typedText,
  targetTextLine,
  cursorPosition,
  isUntypedLine,
}: TypingLineProps) {
  const getCharClass = (index: number) => {
    const isUntypedText = index > typedText.length;
    const isTypingText = index === cursorPosition;
    const isCorrectTypedText = typedText[index] === targetTextLine[index];

    if (isUntypedText || isUntypedLine) return 'text-muted-foreground';
    if (isTypingText) return 'border-b border-foreground';
    if (isCorrectTypedText) return 'bg-green-100';
    return 'bg-red-100'; // タイポした文字
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

import { IconCornerDownLeft } from '@tabler/icons-react';
import React from 'react';

type TypingLineProps = {
  cursorPosition: number;
  isUntypedLine: boolean;
  targetTextLine: string;
  typedText: string;
};

const TypingLine = React.memo(function TypingLine({
  cursorPosition,
  isUntypedLine,
  targetTextLine,
  typedText,
}: TypingLineProps) {
  const getCharClass = (index: number) => {
    const isUntypedText = index > typedText.length;
    const isTypingText = index === cursorPosition;
    const isCorrectTypedText = typedText[index] === targetTextLine[index];

    if (isUntypedText || isUntypedLine) return 'text-muted-foreground';
    if (isTypingText) return 'border-b border-foreground';
    if (isCorrectTypedText) return 'bg-secondary/10 text-secondary';
    return 'bg-destructive/10 text-destructive'; // タイポした文字
  };

  return (
    <pre className="h-[1.4em] font-mono">
      {targetTextLine.split('').map((char, index) => (
        <span key={index} className={getCharClass(index)}>
          {char === '\n' ? <IconCornerDownLeft stroke={1} size={8} className="inline" /> : char}
        </span>
      ))}
    </pre>
  );
});

export default TypingLine;

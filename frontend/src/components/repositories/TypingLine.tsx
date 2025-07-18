import { IconCornerDownLeft } from '@tabler/icons-react';
import React from 'react';

type TypingLineProps = {
  cursorColumn: number;
  isUntypedLine: boolean;
  targetTextLine: string;
  typedText: string;
};

const TypingLine = React.memo(function TypingLine({
  cursorColumn,
  isUntypedLine,
  targetTextLine,
  typedText,
}: TypingLineProps) {
  const getCharClass = (column: number) => {
    const isUntypedChar = column > typedText.length;
    const isTypingChar = column === cursorColumn;
    const isCorrectTypedChar = typedText[column] === targetTextLine[column];

    if (isUntypedChar || isUntypedLine) return 'text-muted-foreground';
    if (isTypingChar) return 'border-b border-foreground';
    if (isCorrectTypedChar) return 'bg-secondary/10 text-secondary';
    return 'bg-destructive/10 text-destructive'; // タイポした文字
  };

  return (
    <pre className="h-[1.4em] font-mono">
      {targetTextLine.split('').map((char, column) => (
        <span key={column} className={getCharClass(column)}>
          {char === '\n' ? <IconCornerDownLeft stroke={1} size={8} className="inline" /> : char}
        </span>
      ))}
    </pre>
  );
});

export default TypingLine;

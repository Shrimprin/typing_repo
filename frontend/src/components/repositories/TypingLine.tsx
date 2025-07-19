import { IconCornerDownLeft } from '@tabler/icons-react';
import React, { useRef } from 'react';

type TypingLineProps = {
  cursorColumn: number;
  isCursorLine: boolean;
  isUntypedLine: boolean;
  targetTextLine: string;
  typedText: string;
};

const TypingLine = React.memo(function TypingLine({
  cursorColumn,
  isCursorLine,
  isUntypedLine,
  targetTextLine,
  typedText,
}: TypingLineProps) {
  const lastScrollTimeRef = useRef<number>(0);
  const SCROLL_COOL_TIME = 150; // タイピングが早すぎるとスクロールが重複してしまうので、150 ms間隔でスクロールを制限する
  const SCROLL_MARGIN = 0.1;

  const getCharClass = (column: number) => {
    const isUntypedChar = column > typedText.length;
    const isTypingChar = column === cursorColumn;
    const isCorrectTypedChar = typedText[column] === targetTextLine[column];

    if (isUntypedChar || isUntypedLine) return 'text-muted-foreground';
    if (isTypingChar) return 'border-b border-foreground';
    if (isCorrectTypedChar) return 'bg-secondary/10 text-secondary';
    return 'bg-destructive/10 text-destructive'; // タイポした文字
  };

  const scrollToElement = (element: HTMLSpanElement | null) => {
    if (!element) return;

    const now = Date.now();

    if (now - lastScrollTimeRef.current < SCROLL_COOL_TIME) return;

    const container = element.closest('[class*="overflow-auto"]') as HTMLElement;
    if (!container) return;

    const elementRect = element.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    const leftThreshold = containerRect.left + containerRect.width * SCROLL_MARGIN;
    const rightThreshold = containerRect.right - containerRect.width * SCROLL_MARGIN;

    if (elementRect.left < leftThreshold || elementRect.right > rightThreshold) {
      lastScrollTimeRef.current = now;

      element.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'center',
      });
    }
  };

  return (
    <pre className="h-[1.4em] font-mono">
      {targetTextLine.split('').map((char, column) => {
        const isCursorChar = column === cursorColumn;
        return (
          <span
            key={column}
            className={getCharClass(column)}
            ref={isCursorLine && isCursorChar ? scrollToElement : null}
          >
            {char === '\n' ? <IconCornerDownLeft stroke={1} size={8} className="inline" /> : char}
          </span>
        );
      })}
    </pre>
  );
});

export default TypingLine;

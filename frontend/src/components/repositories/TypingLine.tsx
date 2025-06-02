import { IconCornerDownLeft } from '@tabler/icons-react';
import React from 'react';
import styles from './TypingLine.module.css';

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
    if (index > typedText.length || !isActive) return styles.untypeText;
    if (index === cursorPosition) return styles.typingText;
    if (typedText[index] === targetTextLine[index]) return styles.correctTypedText;
    return styles.incorrectTypedText;
  };

  return (
    <div style={{ whiteSpace: 'pre' }}>
      {targetTextLine.split('').map((char, index) => (
        <span key={index} className={getCharClass(index)}>
          {char === '\n' ? (
            <>
              <IconCornerDownLeft stroke={1} size={8} style={{ display: 'inline' }} />
              <br />
            </>
          ) : (
            char
          )}
        </span>
      ))}
    </div>
  );
});

export { TypingLine };

import { TypingLine } from '@/components/repositories/TypingLine';
import { TypingStatus } from '@/types';

type TypingContentProps = {
  content: string;
  targetTextLines: string[];
  typedTextLines: string[];
  cursorLine: number;
  cursorPositions: number[];
  typingStatus: TypingStatus;
};

export function TypingContent({
  content,
  targetTextLines,
  typedTextLines,
  cursorLine,
  cursorPositions,
  typingStatus,
}: TypingContentProps) {
  return (
    <>
      {typingStatus === 'ready' ? (
        <div className="overflow-x-auto px-4 font-mono text-sm whitespace-pre">{content}</div>
      ) : typingStatus === 'typing' || typingStatus === 'paused' ? (
        <>
          {targetTextLines.map((targetTextLine, index) => (
            <TypingLine
              key={index}
              typedText={typedTextLines[index]}
              targetTextLine={targetTextLine}
              cursorPosition={cursorPositions[index]}
              isActive={cursorLine >= index}
            />
          ))}
        </>
      ) : (
        <div className="overflow-x-auto px-4 font-mono text-sm whitespace-pre">Completed!!</div>
      )}
    </>
  );
}

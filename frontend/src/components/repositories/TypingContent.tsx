import TypingLine from '@/components/repositories/TypingLine';
import { TypingStatus } from '@/types';

type TypingContentProps = {
  cursorLine: number;
  cursorPositions: number[];
  targetTextLines: string[];
  typedTextLines: string[];
  typingStatus: TypingStatus;
};

export default function TypingContent({
  cursorLine,
  cursorPositions,
  targetTextLines,
  typedTextLines,
  typingStatus,
}: TypingContentProps) {
  return (
    <div className="h-full overflow-auto px-4">
      {typingStatus === 'ready' ? (
        <pre className="font-mono">
          {targetTextLines.map((line, i) => (
            <p key={i} className="h-[1.4em] whitespace-pre">
              {line}
            </p>
          ))}
        </pre>
      ) : typingStatus === 'typing' || typingStatus === 'paused' ? (
        <div className="min-w-fit">
          {targetTextLines.map((targetTextLine, index) => (
            <TypingLine
              key={index}
              cursorPosition={cursorPositions[index]}
              isUntypedLine={index > cursorLine}
              targetTextLine={targetTextLine}
              typedText={typedTextLines[index]}
            />
          ))}
        </div>
      ) : (
        <div>Completed!!</div>
      )}
    </div>
  );
}

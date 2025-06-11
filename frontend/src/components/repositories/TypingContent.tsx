import { TypingLine } from '@/components/repositories/TypingLine';
import { TypingStatus } from '@/types';

type TypingContentProps = {
  content: string;
  targetTextLines: string[];
  typedTextLines: string[];
  cursorLine: number;
  cursorPositions: number[];
  typingStatus: TypingStatus;
  errorMessage: string | null;
};

export function TypingContent({
  content,
  targetTextLines,
  typedTextLines,
  cursorLine,
  cursorPositions,
  typingStatus,
  errorMessage,
}: TypingContentProps) {
  return (
    <div className="overflow-x-auto px-4">
      {errorMessage ? (
        <div className="p-6 text-center font-mono text-gray-500">{errorMessage}</div>
      ) : (
        <>
          {typingStatus === 'ready' ? (
            <pre className="font-mono">
              {content.split('\n').map((line, i) => (
                <p key={i} className="h-[1.4em]">
                  {line}
                </p>
              ))}
            </pre>
          ) : typingStatus === 'typing' || typingStatus === 'paused' ? (
            <div>
              {targetTextLines.map((targetTextLine, index) => (
                <TypingLine
                  key={index}
                  typedText={typedTextLines[index]}
                  targetTextLine={targetTextLine}
                  cursorPosition={cursorPositions[index]}
                  isUntypedLine={index > cursorLine}
                />
              ))}
            </div>
          ) : (
            <div className="h-[1.4em]">Completed!!</div>
          )}
        </>
      )}
    </div>
  );
}

import TypingLine from '@/components/repositories/TypingLine';
import { TypingStatus } from '@/types';

type TypingContentProps = {
  content: string;
  cursorLine: number;
  cursorPositions: number[];
  targetTextLines: string[];
  typedTextLines: string[];
  typingStatus: TypingStatus;
  errorMessage?: string;
};

export default function TypingContent({
  content,
  cursorLine,
  cursorPositions,
  targetTextLines,
  typedTextLines,
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
                  cursorPosition={cursorPositions[index]}
                  isUntypedLine={index > cursorLine}
                  targetTextLine={targetTextLine}
                  typedText={typedTextLines[index]}
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

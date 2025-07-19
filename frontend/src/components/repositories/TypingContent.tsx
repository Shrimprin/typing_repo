import TypingLine from '@/components/repositories/TypingLine';
import { TypingStatus } from '@/types';

type TypingContentProps = {
  cursorRow: number;
  cursorColumns: number[];
  targetTextLines: string[];
  typedTextLines: string[];
  typingStatus: TypingStatus;
};

export default function TypingContent({
  cursorRow,
  cursorColumns,
  targetTextLines,
  typedTextLines,
  typingStatus,
}: TypingContentProps) {
  return (
    <div className="h-full overflow-auto px-4">
      {typingStatus === 'ready' ? (
        <pre className="font-mono">
          {targetTextLines.map((textLine, row) => (
            <p key={row} className="h-[1.4em] whitespace-pre">
              {textLine}
            </p>
          ))}
        </pre>
      ) : typingStatus === 'typing' || typingStatus === 'paused' ? (
        <div className="min-w-fit">
          {targetTextLines.map((targetTextLine, row) => (
            <TypingLine
              key={row}
              cursorColumn={cursorColumns[row]}
              isCursorLine={row === cursorRow}
              isUntypedLine={row > cursorRow}
              targetTextLine={targetTextLine}
              typedText={typedTextLines[row]}
            />
          ))}
        </div>
      ) : (
        <div>Completed!!</div>
      )}
    </div>
  );
}

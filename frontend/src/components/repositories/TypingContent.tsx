import TypingLine from '@/components/repositories/TypingLine';
import TypingResult from '@/components/repositories/TypingResult';
import type { Stats, TypingStatus } from '@/types';

type TypingContentProps = {
  cursorRow: number;
  cursorColumns: number[];
  targetTextLines: string[];
  typedTextLines: string[];
  typingStatus: TypingStatus;
  stats: Stats;
};

export default function TypingContent({
  cursorRow,
  cursorColumns,
  targetTextLines,
  typedTextLines,
  typingStatus,
  stats,
}: TypingContentProps) {
  return (
    <>
      {typingStatus === 'ready' ? (
        <div className="h-full overflow-auto px-4">
          <pre className="font-mono">
            {targetTextLines.map((textLine, row) => (
              <p key={row} className="h-[1.4em] whitespace-pre">
                {textLine}
              </p>
            ))}
          </pre>
        </div>
      ) : typingStatus === 'typing' || typingStatus === 'paused' ? (
        <div className="h-full overflow-auto px-4">
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
        <TypingResult stats={stats} targetTextLines={targetTextLines} typedTextLines={typedTextLines} />
      )}
    </>
  );
}

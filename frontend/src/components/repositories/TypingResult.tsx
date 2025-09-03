import { useEffect, useMemo } from 'react';

import type { Stats } from '@/types';
import { formatTime } from '@/utils/time';
import TypingLine from './TypingLine';

type TypingResultProps = {
  stats: Stats;
  targetTextLines: string[];
  typedTextLines: string[];
};

export default function TypingResult({ stats, targetTextLines, typedTextLines }: TypingResultProps) {
  const { accuracy, elapsedSeconds, totalTypoCount, wpm } = stats;

  useEffect(() => {
    const container = document.querySelector('#typing-result-container');
    if (container) {
      container.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  const totalCharacters = useMemo(() => {
    return targetTextLines.reduce((total, line) => total + line.length, 0);
  }, [targetTextLines]);

  return (
    <div className="h-full overflow-y-auto" id="typing-result-container">
      <div className="flex flex-col gap-4 p-4">
        <h2 className="text-xl font-bold">Results</h2>
        <dl
          className={`
            grid grid-cols-1 gap-6
            sm:grid-cols-3
            lg:grid-cols-5
          `}
        >
          <div className="flex flex-col items-center space-y-2">
            <dt>WPM</dt>
            <dd className="text-2xl font-bold">{wpm.toFixed(1)}</dd>
          </div>
          <div className="flex flex-col items-center space-y-2">
            <dt>Accuracy</dt>
            <dd className="text-2xl font-bold">{accuracy} %</dd>
          </div>
          <div className="flex flex-col items-center space-y-2">
            <dt>Characters</dt>
            <dd className="text-2xl font-bold">{totalCharacters.toLocaleString()}</dd>
          </div>
          <div className="flex flex-col items-center space-y-2">
            <dt>Typos</dt>
            <dd className="text-2xl font-bold">{totalTypoCount}</dd>
          </div>
          <div className="flex flex-col items-center space-y-2">
            <dt>Time</dt>
            <dd className="text-2xl font-bold">{formatTime(elapsedSeconds)}</dd>
          </div>
        </dl>
        <div className="border-t" />
        <h2 className="text-xl font-bold">Typed Code</h2>
        <div className="bg-muted/20 rounded-lg border">
          <div className="overflow-x-auto p-4">
            <div className="min-w-fit">
              {targetTextLines.map((targetLine, row) => (
                <TypingLine
                  key={row}
                  cursorColumn={targetLine.length}
                  isCursorLine={false}
                  isUntypedLine={false}
                  targetTextLine={targetLine}
                  typedText={typedTextLines[row]}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

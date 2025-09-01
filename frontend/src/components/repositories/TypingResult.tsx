import { useEffect } from 'react';

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

  const getTotalCharacters = (): number => {
    return targetTextLines.reduce((total, line) => total + line.length, 0);
  };

  return (
    <div className="h-full overflow-y-auto" id="typing-result-container">
      <div className="flex flex-col gap-4 p-4">
        <h2 className="text-xl font-bold">Results</h2>
        <div
          className={`
            grid grid-cols-1 gap-6
            sm:grid-cols-3
            lg:grid-cols-5
          `}
        >
          <div className="flex flex-col items-center space-y-2">
            <span>WPM</span>
            <span className="text-2xl font-bold">{wpm.toFixed(1)}</span>
          </div>
          <div className="flex flex-col items-center space-y-2">
            <span>Accuracy</span>
            <span className="text-2xl font-bold">{accuracy} %</span>
          </div>
          <div className="flex flex-col items-center space-y-2">
            <span>Characters</span>
            <span className="text-2xl font-bold">{getTotalCharacters()}</span>
          </div>
          <div className="flex flex-col items-center space-y-2">
            <span>Typos</span>
            <span className="text-2xl font-bold">{totalTypoCount}</span>
          </div>
          <div className="flex flex-col items-center space-y-2">
            <span>Time</span>
            <span className="text-2xl font-bold">{formatTime(elapsedSeconds)}</span>
          </div>
        </div>
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

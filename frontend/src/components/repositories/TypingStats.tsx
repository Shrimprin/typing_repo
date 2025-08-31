import type { Stats } from '@/types';

type TypingStatsProps = {
  stats: Stats;
};

export default function TypingStats({ stats }: TypingStatsProps) {
  const { accuracy, elapsedSeconds, totalTypoCount, wpm } = stats;

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-background/80 absolute right-4 bottom-4 rounded-lg border px-3 py-2 text-sm backdrop-blur-sm">
      <div className="flex min-w-[140px] flex-col gap-1">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Accuracy:</span>
          <span>{accuracy?.toFixed(1) || '0.0'}%</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Typos:</span>
          <span>{totalTypoCount || 0}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">WPM:</span>
          <span>{wpm?.toFixed(1) || '0.0'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Time:</span>
          <span>{formatTime(elapsedSeconds || 0)}</span>
        </div>
      </div>
    </div>
  );
}

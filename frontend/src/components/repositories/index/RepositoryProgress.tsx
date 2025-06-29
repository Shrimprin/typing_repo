type RepositoryProgressProps = {
  progress: number;
};

export default function RepositoryProgress({ progress }: RepositoryProgressProps) {
  const colorClass = progress === 1 ? 'text-green-500' : 'text-blue-500';

  return (
    <div className="flex items-center space-x-2">
      <div className="relative h-5 w-5">
        <svg className="h-5 w-5 -rotate-90 transform" viewBox="0 0 24 24">
          <circle
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
            className={`text-muted-foreground`}
          />
          <circle
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
            className={`
              transition-all duration-300
              ${colorClass}
            `}
            strokeDasharray={`${2 * Math.PI * 10}`}
            strokeDashoffset={`${2 * Math.PI * 10 * (1 - (progress || 0))}`}
          />
        </svg>
      </div>
      <span
        className={`
          font-mono text-sm font-medium
          ${colorClass}
        `}
      >
        {((progress || 0) * 100).toFixed(1)}%
      </span>
    </div>
  );
}

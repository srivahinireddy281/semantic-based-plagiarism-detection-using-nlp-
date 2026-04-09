interface SimilarityDonutProps {
  percentage: number;
  size?: number;
}

export function SimilarityDonut({ percentage, size = 160 }: SimilarityDonutProps) {
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  const getColor = () => {
    if (percentage >= 50) return 'hsl(var(--similarity-high))';
    if (percentage >= 25) return 'hsl(var(--similarity-medium))';
    if (percentage >= 10) return 'hsl(var(--similarity-low))';
    return 'hsl(var(--similarity-none))';
  };

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--similarity-ring-bg))"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={getColor()}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-3xl font-bold text-foreground font-serif">
          {percentage}%
        </span>
        <span className="text-xs text-muted-foreground uppercase tracking-wider">
          Similar
        </span>
      </div>
    </div>
  );
}

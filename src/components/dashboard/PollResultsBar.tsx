import { POLL_OPTION_COLORS } from '../../utils/constants';

interface PollResultsBarProps {
  options: string[];
  voteCounts: number[];
  totalVotes: number;
  showResults: boolean;
}

export function PollResultsBar({
  options,
  voteCounts,
  totalVotes,
  showResults,
}: PollResultsBarProps) {
  return (
    <div className="space-y-2">
      {options.map((option, i) => {
        const count = voteCounts[i] ?? 0;
        const pct = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
        const color = POLL_OPTION_COLORS[i % POLL_OPTION_COLORS.length];

        return (
          <div key={i}>
            <div className="flex items-center justify-between text-sm mb-0.5">
              <span className="text-gray-700 truncate">{option}</span>
              {showResults && (
                <span className="text-gray-500 text-xs shrink-0 ml-2">
                  {count}票 ({pct}%)
                </span>
              )}
            </div>
            <div className="h-5 w-full rounded-full bg-gray-100 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500 ease-out"
                style={{
                  width: showResults ? `${pct}%` : '0%',
                  backgroundColor: color,
                  minWidth: showResults && count > 0 ? '8px' : '0',
                }}
              />
            </div>
          </div>
        );
      })}
      {showResults && (
        <p className="text-xs text-gray-400 text-right">合計 {totalVotes} 票</p>
      )}
    </div>
  );
}

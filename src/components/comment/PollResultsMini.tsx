import { Check } from 'lucide-react';
import { POLL_OPTION_COLORS } from '../../utils/constants';

interface PollResultsMiniProps {
  options: string[];
  voteCounts: number[];
  totalVotes: number;
  myVote: number | null;
}

export function PollResultsMini({
  options,
  voteCounts,
  totalVotes,
  myVote,
}: PollResultsMiniProps) {
  return (
    <div className="space-y-1.5">
      {options.map((option, i) => {
        const count = voteCounts[i] ?? 0;
        const pct = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
        const color = POLL_OPTION_COLORS[i % POLL_OPTION_COLORS.length];
        const isMyVote = myVote === i;

        return (
          <div key={i} className="relative">
            <div className="flex items-center gap-2 text-xs mb-0.5">
              <span className="text-gray-300 truncate flex items-center gap-1">
                {isMyVote && <Check className="h-3 w-3 text-green-400" />}
                {option}
              </span>
              <span className="text-gray-500 shrink-0 ml-auto">{pct}%</span>
            </div>
            <div className="h-3 w-full rounded-full bg-gray-700 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500 ease-out"
                style={{
                  width: `${pct}%`,
                  backgroundColor: color,
                  minWidth: count > 0 ? '6px' : '0',
                }}
              />
            </div>
          </div>
        );
      })}
      <p className="text-xs text-gray-500 text-right">{totalVotes} 票</p>
    </div>
  );
}

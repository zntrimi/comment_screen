import { useMemo } from 'react';
import { usePollVotes } from '../../hooks/usePollVotes';
import { usePolls } from '../../hooks/usePolls';
import { POLL_OPTION_COLORS } from '../../utils/constants';

interface OverlayPollProps {
  sessionId: string;
}

function PollWidget({
  sessionId,
  pollId,
  question,
  options,
  showResults,
}: {
  sessionId: string;
  pollId: string;
  question: string;
  options: string[];
  showResults: boolean;
}) {
  const { voteCounts, totalVotes } = usePollVotes(
    sessionId,
    pollId,
    options.length,
    '',
  );

  return (
    <div
      className="rounded-xl bg-black/80 backdrop-blur-sm p-4 space-y-2 pointer-events-none"
      style={{ animation: 'slide-in-right 0.4s ease-out' }}
    >
      <h3 className="text-sm font-bold text-white leading-tight">{question}</h3>

      <div className="space-y-1.5">
        {options.map((option, i) => {
          const count = voteCounts[i] ?? 0;
          const pct = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
          const color = POLL_OPTION_COLORS[i % POLL_OPTION_COLORS.length];

          return (
            <div key={i}>
              <div className="flex items-center justify-between text-xs mb-0.5">
                <span className="text-gray-300 truncate">{option}</span>
                {showResults && (
                  <span className="text-gray-400 shrink-0 ml-2">
                    {count}票 ({pct}%)
                  </span>
                )}
              </div>
              <div className="h-4 w-full rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500 ease-out"
                  style={{
                    width: showResults ? `${pct}%` : '0%',
                    backgroundColor: color,
                    minWidth: showResults && count > 0 ? '6px' : '0',
                    animation:
                      showResults && count > 0
                        ? 'results-flash 0.6s ease-out'
                        : undefined,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {showResults && (
        <p className="text-xs text-gray-400 text-right">{totalVotes} 票</p>
      )}
    </div>
  );
}

export function OverlayPoll({ sessionId }: OverlayPollProps) {
  const { polls } = usePolls(sessionId);

  const visiblePoll = useMemo(
    () => polls.find((p) => p.status === 'open' || p.status === 'closed'),
    [polls],
  );

  if (!visiblePoll) return null;

  return (
    <div
      className="fixed z-30"
      style={{ right: '20px', bottom: '20px', maxWidth: '320px', width: '100%' }}
    >
      <PollWidget
        sessionId={sessionId}
        pollId={visiblePoll.id}
        question={visiblePoll.question}
        options={visiblePoll.options}
        showResults={visiblePoll.showResults || visiblePoll.status !== 'draft'}
      />
    </div>
  );
}

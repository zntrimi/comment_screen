import { useMemo } from 'react';
import { usePollVotes } from '../../hooks/usePollVotes';
import { usePolls } from '../../hooks/usePolls';
import { castVote } from '../../services/pollService';
import { POLL_OPTION_COLORS } from '../../utils/constants';
import { PollResultsMini } from './PollResultsMini';

interface ActivePollProps {
  sessionId: string;
  userId: string;
}

function PollVoteUI({
  sessionId,
  pollId,
  question,
  options,
  userId,
}: {
  sessionId: string;
  pollId: string;
  question: string;
  options: string[];
  userId: string;
}) {
  const { voteCounts, myVote, totalVotes } = usePollVotes(
    sessionId,
    pollId,
    options.length,
    userId,
  );

  const hasVoted = myVote !== null;

  const handleVote = (index: number) => {
    if (hasVoted) return;
    castVote(sessionId, pollId, userId, index);
  };

  return (
    <div className="rounded-xl bg-gray-800 border border-gray-700 p-4 space-y-3 animate-[fadeIn_0.3s_ease-out]">
      <h3 className="text-sm font-bold text-white">{question}</h3>

      {hasVoted ? (
        <>
          <PollResultsMini
            options={options}
            voteCounts={voteCounts}
            totalVotes={totalVotes}
            myVote={myVote}
          />
          <p className="text-xs text-green-400 text-center">投票済み</p>
        </>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          {options.map((option, i) => (
            <button
              key={i}
              onClick={() => handleVote(i)}
              className="rounded-lg px-3 py-3 text-sm font-bold text-white active:animate-[vote-bounce_0.15s_ease-out] transition-opacity hover:opacity-90"
              style={{
                backgroundColor: POLL_OPTION_COLORS[i % POLL_OPTION_COLORS.length],
              }}
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function ActivePoll({ sessionId, userId }: ActivePollProps) {
  const { polls } = usePolls(sessionId);

  const activePoll = useMemo(
    () => polls.find((p) => p.status === 'open'),
    [polls],
  );

  if (!activePoll) return null;

  return (
    <PollVoteUI
      sessionId={sessionId}
      pollId={activePoll.id}
      question={activePoll.question}
      options={activePoll.options}
      userId={userId}
    />
  );
}

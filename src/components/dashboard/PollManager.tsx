import { useAuth } from '../../hooks/useAuth';
import { usePolls } from '../../hooks/usePolls';
import { PollCard } from './PollCard';
import { PollForm } from './PollForm';

interface PollManagerProps {
  sessionId: string;
}

export function PollManager({ sessionId }: PollManagerProps) {
  const { polls } = usePolls(sessionId);
  const { user } = useAuth();
  const userId = user?.uid ?? '';

  const sorted = [...polls].reverse();

  return (
    <div className="space-y-4">
      <PollForm sessionId={sessionId} />

      {sorted.length === 0 ? (
        <p className="text-center text-sm text-gray-400 py-8">
          まだ投票はありません
        </p>
      ) : (
        <div className="space-y-3">
          {sorted.map((poll) => (
            <PollCard
              key={poll.id}
              sessionId={sessionId}
              poll={poll}
              userId={userId}
            />
          ))}
        </div>
      )}
    </div>
  );
}

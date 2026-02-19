import { BarChart3, Eye, EyeOff, Play, Square, Trash2 } from 'lucide-react';
import { usePollVotes } from '../../hooks/usePollVotes';
import {
  deletePoll,
  toggleShowResults,
  updatePollStatus,
} from '../../services/pollService';
import type { Poll } from '../../types';
import { PollResultsBar } from './PollResultsBar';

interface PollCardProps {
  sessionId: string;
  poll: Poll;
  userId: string;
}

const STATUS_BADGE: Record<Poll['status'], { label: string; className: string }> = {
  draft: { label: '下書き', className: 'bg-gray-100 text-gray-600' },
  open: { label: '公開中', className: 'bg-green-100 text-green-700' },
  closed: { label: '締め切り', className: 'bg-red-100 text-red-700' },
};

export function PollCard({ sessionId, poll, userId }: PollCardProps) {
  const { voteCounts, totalVotes } = usePollVotes(
    sessionId,
    poll.id,
    poll.options.length,
    userId,
  );

  const badge = STATUS_BADGE[poll.status];

  const handleDelete = () => {
    if (confirm('この投票を削除しますか？')) {
      deletePoll(sessionId, poll.id);
    }
  };

  return (
    <div className="rounded-lg border bg-white p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <BarChart3 className="h-4 w-4 text-gray-400 shrink-0" />
          <h4 className="text-sm font-bold text-gray-900 truncate">
            {poll.question}
          </h4>
        </div>
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-medium shrink-0 ${badge.className}`}
        >
          {badge.label}
        </span>
      </div>

      <PollResultsBar
        options={poll.options}
        voteCounts={voteCounts}
        totalVotes={totalVotes}
        showResults={poll.showResults || poll.status !== 'draft'}
      />

      <div className="flex flex-wrap gap-2 border-t pt-2">
        {poll.status === 'draft' && (
          <button
            onClick={() => updatePollStatus(sessionId, poll.id, 'open')}
            className="flex items-center gap-1 rounded border border-gray-300 px-2 py-1 text-xs text-gray-700 hover:bg-gray-50"
          >
            <Play className="h-3 w-3" /> 公開
          </button>
        )}
        {poll.status === 'open' && (
          <button
            onClick={() => updatePollStatus(sessionId, poll.id, 'closed')}
            className="flex items-center gap-1 rounded border border-gray-300 px-2 py-1 text-xs text-gray-700 hover:bg-gray-50"
          >
            <Square className="h-3 w-3" /> 締め切る
          </button>
        )}
        <button
          onClick={() => toggleShowResults(sessionId, poll.id, !poll.showResults)}
          className="flex items-center gap-1 rounded border border-gray-300 px-2 py-1 text-xs text-gray-700 hover:bg-gray-50"
        >
          {poll.showResults ? (
            <>
              <EyeOff className="h-3 w-3" /> 結果を隠す
            </>
          ) : (
            <>
              <Eye className="h-3 w-3" /> 結果を表示
            </>
          )}
        </button>
        <button
          onClick={handleDelete}
          className="flex items-center gap-1 rounded border border-red-200 px-2 py-1 text-xs text-red-600 hover:bg-red-50 ml-auto"
        >
          <Trash2 className="h-3 w-3" /> 削除
        </button>
      </div>
    </div>
  );
}

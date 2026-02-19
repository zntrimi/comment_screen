import { Pause, Play, Square, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { deleteSession, updateSessionStatus } from '../../services/sessionService';
import type { Session } from '../../types';

interface SessionCardProps {
  session: Session;
}

const statusColors = {
  active: 'bg-green-100 text-green-800',
  paused: 'bg-yellow-100 text-yellow-800',
  ended: 'bg-gray-100 text-gray-800',
};

const statusLabels = {
  active: '配信中',
  paused: '一時停止',
  ended: '終了',
};

export function SessionCard({ session }: SessionCardProps) {
  const navigate = useNavigate();

  const handleStatusToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (session.status === 'active') {
      await updateSessionStatus(session.id, 'paused');
    } else if (session.status === 'paused') {
      await updateSessionStatus(session.id, 'active');
    }
  };

  const handleEnd = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await updateSessionStatus(session.id, 'ended');
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('このセッションを削除しますか？')) {
      await deleteSession(session.id);
    }
  };

  return (
    <div
      onClick={() => navigate(`/dashboard/session/${session.id}`)}
      className="cursor-pointer rounded-lg border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-gray-900 truncate">{session.name}</h3>
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[session.status]}`}
        >
          {statusLabels[session.status]}
        </span>
      </div>

      <div className="flex items-center gap-2 mt-3">
        {session.status !== 'ended' && (
          <>
            <button
              onClick={handleStatusToggle}
              className="rounded p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
              title={session.status === 'active' ? '一時停止' : '再開'}
            >
              {session.status === 'active' ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
            </button>
            <button
              onClick={handleEnd}
              className="rounded p-1.5 text-gray-500 hover:bg-gray-100 hover:text-red-600"
              title="終了"
            >
              <Square className="h-4 w-4" />
            </button>
          </>
        )}
        <button
          onClick={handleDelete}
          className="rounded p-1.5 text-gray-500 hover:bg-gray-100 hover:text-red-600 ml-auto"
          title="削除"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

import { Ban, Pin, PinOff, Trash2 } from 'lucide-react';
import { useBlockedUsers } from '../../hooks/useBlockedUsers';
import { blockUser, unblockUser } from '../../services/blockService';
import { deleteComment, togglePinComment } from '../../services/commentService';
import type { Comment } from '../../types';

interface CommentListProps {
  sessionId: string;
  comments: Comment[];
}

export function CommentList({ sessionId, comments }: CommentListProps) {
  const { blockedUserIds } = useBlockedUsers(sessionId);

  if (comments.length === 0) {
    return (
      <p className="text-center text-sm text-gray-400 py-8">
        まだコメントはありません
      </p>
    );
  }

  return (
    <div className="space-y-1 max-h-96 overflow-y-auto">
      {comments.map((c) => {
        const isBlocked = blockedUserIds.has(c.userId);
        return (
          <div
            key={c.id}
            className={`flex items-center gap-2 rounded px-2 py-1.5 text-sm ${
              isBlocked
                ? 'bg-red-50'
                : c.isPinned
                  ? 'bg-yellow-50'
                  : 'hover:bg-gray-50'
            }`}
          >
            <span
              className={`text-xs shrink-0 w-20 truncate ${
                isBlocked ? 'text-red-400 line-through' : 'text-gray-400'
              }`}
            >
              {c.userName}
            </span>
            <span
              className={`flex-1 truncate ${isBlocked ? 'opacity-50' : ''}`}
              style={{ color: c.color === '#FFFFFF' ? '#111827' : c.color }}
            >
              {c.text}
            </span>
            <div className="flex shrink-0 gap-1">
              <button
                onClick={() =>
                  isBlocked
                    ? unblockUser(sessionId, c.userId)
                    : blockUser(sessionId, c.userId)
                }
                className={`rounded p-1 ${
                  isBlocked
                    ? 'text-red-500 hover:text-red-700'
                    : 'text-gray-400 hover:text-red-500'
                }`}
                title={isBlocked ? 'ブロック解除' : 'ブロック'}
              >
                <Ban className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => togglePinComment(sessionId, c.id, !c.isPinned)}
                className="rounded p-1 text-gray-400 hover:text-yellow-500"
                title={c.isPinned ? 'ピン解除' : 'ピン留め'}
              >
                {c.isPinned ? <PinOff className="h-3.5 w-3.5" /> : <Pin className="h-3.5 w-3.5" />}
              </button>
              <button
                onClick={() => deleteComment(sessionId, c.id)}
                className="rounded p-1 text-gray-400 hover:text-red-500"
                title="削除"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

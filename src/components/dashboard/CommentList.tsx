import { Ban, Flag, Pause, Pin, PinOff, Play, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { useBlockedUsers } from '../../hooks/useBlockedUsers';
import { blockUser, unblockUser } from '../../services/blockService';
import {
  deleteComment,
  restoreComment,
  togglePinComment,
} from '../../services/commentService';
import { updateSessionSettings } from '../../services/sessionService';
import type { Comment } from '../../types';
import { classifyComments, isFlagged } from '../../utils/commentModeration';

interface CommentListProps {
  sessionId: string;
  comments: Comment[];
  ngWords: string[];
}

export function CommentList({ sessionId, comments, ngWords }: CommentListProps) {
  const { blockedUserIds } = useBlockedUsers(sessionId);
  /* 一時停止中のスナップショット（表示順の id 配列）。null = ライブ */
  const [pausedIds, setPausedIds] = useState<string[] | null>(null);
  const [filter, setFilter] = useState<'all' | 'flagged' | 'blocked'>('all');

  const flagsMap = useMemo(
    () => classifyComments(comments, ngWords),
    [comments, ngWords],
  );

  const liveById = useMemo(
    () => new Map(comments.map((c) => [c.id, c])),
    [comments],
  );

  const isPaused = pausedIds !== null;

  const flaggedCount = useMemo(
    () => comments.filter((c) => isFlagged(flagsMap.get(c.id))).length,
    [comments, flagsMap],
  );

  const blockedCount = useMemo(
    () => comments.filter((c) => blockedUserIds.has(c.userId)).length,
    [comments, blockedUserIds],
  );

  /* 表示リスト: 一時停止中はスナップショットの順を維持（削除は反映・新着は保留） */
  const baseList = useMemo(() => {
    if (pausedIds) {
      return pausedIds
        .map((id) => liveById.get(id))
        .filter((c): c is Comment => !!c);
    }
    return comments;
  }, [pausedIds, liveById, comments]);

  const newCount = useMemo(() => {
    if (!pausedIds) return 0;
    const snap = new Set(pausedIds);
    return comments.filter((c) => !snap.has(c.id)).length;
  }, [pausedIds, comments]);

  const displayed =
    filter === 'flagged'
      ? baseList.filter((c) => isFlagged(flagsMap.get(c.id)))
      : filter === 'blocked'
        ? baseList.filter((c) => blockedUserIds.has(c.userId))
        : baseList;

  const handleTogglePause = () => {
    setPausedIds(isPaused ? null : comments.map((c) => c.id));
  };

  const handleShowNew = () => {
    setPausedIds(comments.map((c) => c.id));
  };

  const handleBlock = (c: Comment) => {
    blockUser(sessionId, c.userId);
    toast.success(`${c.userName || '匿名'} をブロックしました`, {
      action: {
        label: '取り消す',
        onClick: () => unblockUser(sessionId, c.userId),
      },
    });
  };

  const handleUnblock = (c: Comment) => {
    unblockUser(sessionId, c.userId);
    toast.success(`${c.userName || '匿名'} のブロックを解除しました`, {
      action: {
        label: '取り消す',
        onClick: () => blockUser(sessionId, c.userId),
      },
    });
  };

  const handleDelete = (c: Comment) => {
    deleteComment(sessionId, c.id);
    toast.success('コメントを削除しました', {
      action: {
        label: '取り消す',
        onClick: () => restoreComment(sessionId, c),
      },
    });
  };

  /* ⑥スパム報告: コメント本文をNGワードに追加し、そのコメントを削除する */
  const handleReportSpam = async (c: Comment) => {
    const word = c.text.trim();
    const added = word.length > 0 && !ngWords.includes(word);
    if (added) {
      await updateSessionSettings(sessionId, { ngWords: [...ngWords, word] });
    }
    deleteComment(sessionId, c.id);
    toast.success(
      added
        ? 'スパム報告しNGワードに追加しました'
        : 'スパム報告しました（NGワード登録済み）',
      {
        action: {
          label: '取り消す',
          onClick: async () => {
            if (added) {
              await updateSessionSettings(sessionId, {
                ngWords: ngWords.filter((w) => w !== word),
              });
            }
            restoreComment(sessionId, c);
          },
        },
      },
    );
  };

  return (
    <div>
      {/* ツールバー: 要確認フィルタ + 一時停止 */}
      <div className="mb-2 flex items-center gap-2">
        <div className="flex overflow-hidden rounded-lg border border-gray-200 text-xs">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 font-medium ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            すべて {comments.length}
          </button>
          <button
            onClick={() => setFilter('flagged')}
            className={`border-l border-gray-200 px-3 py-1.5 font-medium ${
              filter === 'flagged'
                ? 'bg-amber-500 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            要確認 {flaggedCount}
          </button>
          <button
            onClick={() => setFilter('blocked')}
            className={`border-l border-gray-200 px-3 py-1.5 font-medium ${
              filter === 'blocked'
                ? 'bg-red-500 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            ブロック {blockedCount}
          </button>
        </div>

        <button
          onClick={handleTogglePause}
          className={`ml-auto flex items-center gap-1 rounded-lg border px-3 py-1.5 text-xs font-medium ${
            isPaused
              ? 'border-orange-300 bg-orange-50 text-orange-700'
              : 'border-gray-300 text-gray-600 hover:bg-gray-50'
          }`}
        >
          {isPaused ? (
            <>
              <Play className="h-3.5 w-3.5" /> 再開
            </>
          ) : (
            <>
              <Pause className="h-3.5 w-3.5" /> 一時停止
            </>
          )}
        </button>
      </div>

      {isPaused && newCount > 0 && (
        <button
          onClick={handleShowNew}
          className="mb-2 w-full rounded-lg bg-blue-600 py-2 text-xs font-bold text-white hover:bg-blue-500"
        >
          新着 {newCount} 件を表示
        </button>
      )}

      {displayed.length === 0 ? (
        <p className="py-8 text-center text-sm text-gray-400">
          {filter === 'flagged'
            ? '要確認のコメントはありません'
            : filter === 'blocked'
              ? 'ブロックしたコメントはありません'
              : 'まだコメントはありません'}
        </p>
      ) : (
        <div className="max-h-[600px] space-y-1 overflow-y-auto">
          {displayed.map((c) => {
            const isBlocked = blockedUserIds.has(c.userId);
            const flags = flagsMap.get(c.id);
            const flagged = !isBlocked && isFlagged(flags);
            return (
              <div
                key={c.id}
                className={`flex items-center gap-2 rounded border-l-4 px-2 py-2 text-sm ${
                  isBlocked
                    ? 'border-red-400 bg-red-50'
                    : flags?.ng
                      ? 'border-red-300 bg-red-50/60'
                      : flags?.duplicate
                        ? 'border-amber-300 bg-amber-50'
                        : c.isPinned
                          ? 'border-yellow-300 bg-yellow-50'
                          : 'border-transparent hover:bg-gray-50'
                }`}
              >
                <span
                  className={`w-20 shrink-0 truncate text-xs ${
                    isBlocked ? 'text-red-400 line-through' : 'text-gray-400'
                  }`}
                >
                  {c.userName}
                </span>
                {flagged && (
                  <span
                    className={`shrink-0 rounded px-1 py-0.5 text-[10px] font-bold ${
                      flags?.ng
                        ? 'bg-red-200 text-red-800'
                        : 'bg-amber-200 text-amber-800'
                    }`}
                  >
                    {flags?.ng ? 'NG' : '連投'}
                  </span>
                )}
                <span
                  className={`flex-1 truncate ${isBlocked ? 'opacity-50' : ''}`}
                  style={{ color: c.color === '#FFFFFF' ? '#111827' : c.color }}
                >
                  {c.text}
                </span>
                <div className="flex shrink-0 gap-1">
                  <button
                    onClick={() => (isBlocked ? handleUnblock(c) : handleBlock(c))}
                    className={`rounded p-2 ${
                      isBlocked
                        ? 'text-red-500 hover:bg-red-100'
                        : 'text-gray-400 hover:bg-red-50 hover:text-red-500'
                    }`}
                    title={isBlocked ? 'ブロック解除' : 'ブロック'}
                  >
                    <Ban className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => togglePinComment(sessionId, c.id, !c.isPinned)}
                    className="rounded p-2 text-gray-400 hover:bg-yellow-50 hover:text-yellow-500"
                    title={c.isPinned ? 'ピン解除' : 'ピン留め'}
                  >
                    {c.isPinned ? (
                      <PinOff className="h-4 w-4" />
                    ) : (
                      <Pin className="h-4 w-4" />
                    )}
                  </button>
                  <button
                    onClick={() => handleReportSpam(c)}
                    className="rounded p-2 text-gray-400 hover:bg-orange-50 hover:text-orange-500"
                    title="スパム報告（NGワードに追加して削除）"
                  >
                    <Flag className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(c)}
                    className="rounded p-2 text-gray-400 hover:bg-red-50 hover:text-red-500"
                    title="削除"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

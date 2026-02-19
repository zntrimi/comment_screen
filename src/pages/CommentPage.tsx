import { MessageCircle } from 'lucide-react';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { ActivePoll } from '../components/comment/ActivePoll';
import { CommentInput } from '../components/comment/CommentInput';
import { ReactionBar } from '../components/comment/ReactionBar';
import { RecentComments } from '../components/comment/RecentComments';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { useComments } from '../hooks/useComments';
import { useRateLimit } from '../hooks/useRateLimit';
import { useSession } from '../hooks/useSession';
import { postComment } from '../services/commentService';
import type { CommentFontSize, CommentPosition } from '../types';

const NICKNAME_KEY = 'comment_screen_nickname';
const USER_ID_KEY = 'comment_screen_user_id';

function getOrCreateUserId(): string {
  let id = localStorage.getItem(USER_ID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(USER_ID_KEY, id);
  }
  return id;
}

function NicknameScreen({ onComplete }: { onComplete: (name: string) => void }) {
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim() || '匿名';
    onComplete(trimmed);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-900 p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-2xl bg-gray-800 p-8 text-center space-y-6"
      >
        <div className="mx-auto w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center">
          <MessageCircle className="h-8 w-8 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">ニックネームを入力</h1>
          <p className="text-sm text-gray-400 mt-1">コメントに表示される名前です</p>
        </div>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="ニックネーム"
          maxLength={20}
          autoFocus
          className="w-full rounded-xl border border-gray-600 bg-gray-700 px-4 py-3 text-center text-lg font-medium text-white placeholder:text-gray-500 focus:border-blue-500 focus:outline-none"
        />
        <button
          type="submit"
          className="w-full rounded-xl bg-blue-600 px-4 py-3 text-lg font-bold text-white hover:bg-blue-500 active:scale-95 transition-all"
        >
          参加する
        </button>
        <p className="text-xs text-gray-500">空欄の場合は「匿名」になります</p>
      </form>
    </div>
  );
}

export function CommentPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const { session, loading: sessionLoading } = useSession(sessionId);
  const { comments } = useComments(sessionId);
  const [nickname, setNickname] = useState(
    () => localStorage.getItem(NICKNAME_KEY) || '',
  );
  const [nicknameSet, setNicknameSet] = useState(
    () => !!localStorage.getItem(NICKNAME_KEY),
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userId] = useState(getOrCreateUserId);

  const rateLimitSeconds = session?.settings.rateLimitSeconds ?? 3;
  const { canPost, remaining, recordPost } = useRateLimit(rateLimitSeconds);

  const handleNicknameComplete = (name: string) => {
    setNickname(name);
    localStorage.setItem(NICKNAME_KEY, name);
    setNicknameSet(true);
  };

  const handleSubmit = async (data: {
    text: string;
    color: string;
    position: CommentPosition;
    fontSize: CommentFontSize;
  }) => {
    if (!sessionId || !session) return;
    if (!canPost) {
      toast.error(`${remaining}秒後に投稿できます`);
      return;
    }

    setIsSubmitting(true);
    try {
      await postComment(sessionId, {
        ...data,
        userId,
        userName: nickname || '匿名',
        isAdmin: false,
      });
      recordPost();
    } catch {
      toast.error('コメントの投稿に失敗しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (sessionLoading) return <LoadingSpinner />;

  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-900">
        <p className="text-gray-500">セッションが見つかりません</p>
      </div>
    );
  }

  if (session.status === 'ended') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-900 p-4">
        <div className="rounded-2xl bg-gray-800 p-8 text-center">
          <p className="text-lg font-bold text-white">{session.name}</p>
          <p className="mt-2 text-sm text-gray-400">このセッションは終了しました</p>
        </div>
      </div>
    );
  }

  if (!nicknameSet) {
    return <NicknameScreen onComplete={handleNicknameComplete} />;
  }

  const isPaused = session.status === 'paused';

  return (
    <div className="flex min-h-screen flex-col bg-gray-900">
      {/* Header */}
      <header className="border-b border-gray-800 px-4 py-3">
        <h1 className="text-center text-base font-bold text-white">
          {session.name}
        </h1>
        {isPaused && (
          <p className="text-center text-xs text-yellow-500 mt-0.5">一時停止中</p>
        )}
      </header>

      {/* Active Poll */}
      <div className="px-4 pt-2">
        <ActivePoll sessionId={sessionId!} userId={userId} />
      </div>

      {/* Comments */}
      <div className="flex-1 overflow-hidden px-4 py-2">
        <RecentComments comments={comments} />
      </div>

      {/* Reaction Bar */}
      <div className="px-4 py-1">
        <ReactionBar sessionId={sessionId!} userId={userId} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-800 px-4 py-3">
        <CommentInput
          settings={session.settings}
          canPost={canPost && !isPaused && !isSubmitting}
          remaining={remaining}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
}

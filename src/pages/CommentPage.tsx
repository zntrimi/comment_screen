import { AlertTriangle, MessageCircle, ShieldAlert } from 'lucide-react';
import { useCallback, useState } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { ActiveQuestion } from '../components/comment/ActiveQuestion';
import { ActivePoll } from '../components/comment/ActivePoll';
import { CommentInput } from '../components/comment/CommentInput';
import { ReactionBar } from '../components/comment/ReactionBar';
import { RecentComments } from '../components/comment/RecentComments';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { useBlockedUsers } from '../hooks/useBlockedUsers';
import { useCommentControl } from '../hooks/useCommentControl';
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

function getAgreedKey(sessionId: string) {
  return `comment_screen_agreed_${sessionId}`;
}

/* ② 本名入力画面 */
function NicknameScreen({ onComplete }: { onComplete: (name: string) => void }) {
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
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
          <h1 className="text-xl font-bold text-white">本名を入力してください</h1>
          <p className="text-sm text-gray-400 mt-1">コメントに表示される名前です</p>
        </div>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="本名"
          maxLength={20}
          autoFocus
          className="w-full rounded-xl border border-gray-600 bg-gray-700 px-4 py-3 text-center text-lg font-medium text-white placeholder:text-gray-500 focus:border-blue-500 focus:outline-none"
        />
        <button
          type="submit"
          disabled={!name.trim()}
          className="w-full rounded-xl bg-blue-600 px-4 py-3 text-lg font-bold text-white hover:bg-blue-500 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          参加する
        </button>
      </form>
    </div>
  );
}

/* ③ 同意確認モーダル（強化版） */
function ConsentModal({
  onAgree,
  onCancel,
}: {
  onAgree: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-gray-800 p-6 space-y-4">
        <div className="flex flex-col items-center gap-2">
          <div className="w-12 h-12 rounded-full bg-red-600/20 flex items-center justify-center">
            <AlertTriangle className="h-6 w-6 text-red-500" />
          </div>
          <h2 className="text-lg font-bold text-white">注意事項</h2>
        </div>
        <ul className="space-y-2 text-sm text-gray-300">
          <li className="flex items-start gap-2">
            <span className="shrink-0 text-red-400 font-bold">1.</span>
            <span>コメントはすべて<strong className="text-white">本名と共に記録</strong>されます</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="shrink-0 text-red-400 font-bold">2.</span>
            <span>不適切なコメントは<strong className="text-white">学校に報告</strong>されます</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="shrink-0 text-red-400 font-bold">3.</span>
            <span>マナーを守って<strong className="text-white">責任ある投稿</strong>をしてください</span>
          </li>
        </ul>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 rounded-xl border border-gray-600 px-4 py-2.5 text-sm font-bold text-gray-300 hover:bg-gray-700 transition-colors"
          >
            キャンセル
          </button>
          <button
            onClick={onAgree}
            className="flex-1 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-500 transition-colors"
          >
            同意して投稿
          </button>
        </div>
      </div>
    </div>
  );
}

export function CommentPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const { session, loading: sessionLoading } = useSession(sessionId);
  const { comments } = useComments(sessionId);
  const { blockedUserIds } = useBlockedUsers(sessionId);
  const { commentingEnabled, activeQuestion } = useCommentControl(sessionId);
  const [nickname, setNickname] = useState(
    () => localStorage.getItem(NICKNAME_KEY) || '',
  );
  const [nicknameSet, setNicknameSet] = useState(
    () => !!localStorage.getItem(NICKNAME_KEY),
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userId] = useState(getOrCreateUserId);

  /* ③ 同意確認 */
  const [showConsent, setShowConsent] = useState(false);
  const [pendingData, setPendingData] = useState<{
    text: string;
    color: string;
    position: CommentPosition;
    fontSize: CommentFontSize;
  } | null>(null);

  const rateLimitSeconds = session?.settings.rateLimitSeconds ?? 3;
  const { canPost, remaining, recordPost } = useRateLimit(rateLimitSeconds);

  const isBlocked = blockedUserIds.has(userId);

  const handleNicknameComplete = (name: string) => {
    setNickname(name);
    localStorage.setItem(NICKNAME_KEY, name);
    setNicknameSet(true);
  };

  const doSubmit = useCallback(
    async (data: {
      text: string;
      color: string;
      position: CommentPosition;
      fontSize: CommentFontSize;
    }) => {
      if (!sessionId || !session) return;

      setIsSubmitting(true);
      try {
        await postComment(sessionId, {
          ...data,
          userId,
          userName: nickname,
          isAdmin: false,
        });
        recordPost();
      } catch {
        toast.error('コメントの投稿に失敗しました');
      } finally {
        setIsSubmitting(false);
      }
    },
    [sessionId, session, userId, nickname, recordPost],
  );

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

    /* ③ 初回コメント時の同意確認 */
    const agreedKey = getAgreedKey(sessionId);
    if (!sessionStorage.getItem(agreedKey)) {
      /* キーボードを閉じてからダイアログを表示（モバイルで隠れるのを防止） */
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
      setPendingData(data);
      setShowConsent(true);
      return;
    }

    await doSubmit(data);
  };

  const handleAgree = async () => {
    if (!sessionId) return;
    sessionStorage.setItem(getAgreedKey(sessionId), 'true');
    setShowConsent(false);
    if (pendingData) {
      await doSubmit(pendingData);
      setPendingData(null);
    }
  };

  const handleConsentCancel = () => {
    setShowConsent(false);
    setPendingData(null);
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

  const isQuestionActive = !!activeQuestion;
  const commentAllowed = isQuestionActive || commentingEnabled;
  const commentStopped = !commentAllowed && !isBlocked;

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-gray-900">
      {/* ③ 同意確認モーダル */}
      {showConsent && (
        <ConsentModal onAgree={handleAgree} onCancel={handleConsentCancel} />
      )}

      {/* Header - fixed top */}
      <header className="shrink-0 border-b border-gray-800 px-4 py-3">
        <h1 className="text-center text-base font-bold text-white">
          {session.name}
        </h1>
      </header>

      {/* ① ブロックバナー（強化版） */}
      {isBlocked && (
        <div className="shrink-0 flex items-center justify-center gap-2 bg-red-900/80 px-4 py-3 text-sm text-red-100">
          <ShieldAlert className="h-5 w-5 shrink-0 text-red-300" />
          <span>不適切なコメントが検出されました。コメントが制限されています。学校に報告される場合があります。</span>
        </div>
      )}

      {/* コメント停止中バナー */}
      {commentStopped && !isBlocked && (
        <div className="shrink-0 flex items-center justify-center gap-2 bg-yellow-900/50 px-4 py-2 text-sm text-yellow-200">
          <AlertTriangle className="h-4 w-4 shrink-0 text-yellow-400" />
          <span>コメントは現在停止中です</span>
        </div>
      )}

      {/* Active Question */}
      {isQuestionActive && (
        <div className="shrink-0 px-4 pt-2">
          <ActiveQuestion text={activeQuestion.text} />
        </div>
      )}

      {/* Active Poll - fixed below header */}
      <div className="shrink-0 px-4 pt-2">
        <ActivePoll sessionId={sessionId!} userId={userId} />
      </div>

      {/* Comments - scrollable */}
      <div className="min-h-0 flex-1 overflow-hidden px-4 py-2">
        <RecentComments comments={comments} />
      </div>

      {/* Reaction Bar + Input - fixed bottom */}
      <div className="shrink-0 border-t border-gray-800 px-4 py-2 space-y-2">
        <ReactionBar
          sessionId={sessionId!}
          userId={userId}
          disabled={isBlocked}
        />
        <CommentInput
          settings={session.settings}
          canPost={canPost && commentAllowed && !isSubmitting && !isBlocked}
          remaining={remaining}
          placeholder={isQuestionActive ? `回答: ${activeQuestion.text}` : undefined}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
}

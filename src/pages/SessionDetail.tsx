import {
  ArrowLeft,
  ExternalLink,
  Monitor,
  Pause,
  Play,
  QrCode,
  Square,
  Trash2,
} from 'lucide-react';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { CommentList } from '../components/dashboard/CommentList';
import { PollManager } from '../components/dashboard/PollManager';
import { QRCodeModal } from '../components/dashboard/QRCodeModal';
import { SessionSettings } from '../components/dashboard/SessionSettings';
import { useComments } from '../hooks/useComments';
import { useSession } from '../hooks/useSession';
import { deleteSession, updateSessionStatus } from '../services/sessionService';

export function SessionDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { session, loading } = useSession(id);
  const { comments } = useComments(id);
  const [showQR, setShowQR] = useState(false);
  const [activeTab, setActiveTab] = useState<'comments' | 'polls' | 'settings'>('comments');

  if (loading) return <LoadingSpinner />;
  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">セッションが見つかりません</p>
      </div>
    );
  }

  const commentUrl = `${window.location.origin}/comment/${session.id}`;
  const overlayUrl = `${window.location.origin}/overlay/${session.id}`;

  const handleDelete = async () => {
    if (confirm('このセッションを削除しますか？')) {
      await deleteSession(session.id);
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white px-4 py-3">
        <div className="mx-auto flex max-w-4xl items-center gap-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="rounded p-1.5 text-gray-500 hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="flex-1 text-lg font-bold text-gray-900 truncate">
            {session.name}
          </h1>
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-medium ${
              session.status === 'active'
                ? 'bg-green-100 text-green-800'
                : session.status === 'paused'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-gray-100 text-gray-800'
            }`}
          >
            {session.status === 'active'
              ? '配信中'
              : session.status === 'paused'
                ? '一時停止'
                : '終了'}
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-4xl p-4 space-y-4">
        {/* Action buttons */}
        <div className="flex flex-wrap gap-2">
          {session.status !== 'ended' && (
            <>
              <button
                onClick={() =>
                  updateSessionStatus(
                    session.id,
                    session.status === 'active' ? 'paused' : 'active',
                  )
                }
                className="flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50"
              >
                {session.status === 'active' ? (
                  <>
                    <Pause className="h-4 w-4" /> 一時停止
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" /> 再開
                  </>
                )}
              </button>
              <button
                onClick={() => updateSessionStatus(session.id, 'ended')}
                className="flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50"
              >
                <Square className="h-4 w-4" /> 終了
              </button>
            </>
          )}

          <button
            onClick={() => setShowQR(true)}
            className="flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50"
          >
            <QrCode className="h-4 w-4" /> QRコード
          </button>

          <a
            href={overlayUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50"
          >
            <Monitor className="h-4 w-4" /> オーバーレイ
          </a>

          <a
            href={commentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50"
          >
            <ExternalLink className="h-4 w-4" /> コメントページ
          </a>

          <button
            onClick={handleDelete}
            className="flex items-center gap-1 rounded-lg border border-red-200 px-3 py-2 text-sm text-red-600 hover:bg-red-50 ml-auto"
          >
            <Trash2 className="h-4 w-4" /> 削除
          </button>
        </div>

        {/* URL info */}
        <div className="rounded-lg border bg-white p-3 space-y-2">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-gray-500 shrink-0">オーバーレイURL:</span>
            <code
              className="flex-1 truncate text-gray-700 cursor-pointer hover:text-blue-600"
              onClick={() => {
                navigator.clipboard.writeText(overlayUrl);
                toast.success('コピーしました');
              }}
            >
              {overlayUrl}
            </code>
            <button
              className="shrink-0 rounded border border-gray-300 px-1.5 py-0.5 text-[10px] text-gray-600 hover:bg-gray-50"
              onClick={() => {
                navigator.clipboard.writeText(`${overlayUrl}?qr=1`);
                toast.success('QR付きURLをコピーしました');
              }}
            >
              QR付き
            </button>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-gray-500 shrink-0">コメントURL:</span>
            <code
              className="flex-1 truncate text-gray-700 cursor-pointer hover:text-blue-600"
              onClick={() => {
                navigator.clipboard.writeText(commentUrl);
                toast.success('コピーしました');
              }}
            >
              {commentUrl}
            </code>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('comments')}
              className={`border-b-2 pb-2 text-sm font-medium ${
                activeTab === 'comments'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              コメント ({comments.length})
            </button>
            <button
              onClick={() => setActiveTab('polls')}
              className={`border-b-2 pb-2 text-sm font-medium ${
                activeTab === 'polls'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              投票
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`border-b-2 pb-2 text-sm font-medium ${
                activeTab === 'settings'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              設定
            </button>
          </div>
        </div>

        {/* Tab content */}
        <div className="rounded-lg border bg-white p-4">
          {activeTab === 'comments' ? (
            <CommentList sessionId={session.id} comments={comments} />
          ) : activeTab === 'polls' ? (
            <PollManager sessionId={session.id} />
          ) : (
            <SessionSettings sessionId={session.id} settings={session.settings} />
          )}
        </div>
      </main>

      {showQR && (
        <QRCodeModal
          url={commentUrl}
          sessionName={session.name}
          onClose={() => setShowQR(false)}
        />
      )}
    </div>
  );
}

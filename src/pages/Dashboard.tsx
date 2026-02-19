import { LogOut } from 'lucide-react';
import { toast } from 'sonner';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { SessionCard } from '../components/dashboard/SessionCard';
import { SessionForm } from '../components/dashboard/SessionForm';
import { useAuth } from '../hooks/useAuth';
import { useSessions } from '../hooks/useSessions';
import { logout } from '../services/authService';
import { createSession } from '../services/sessionService';

export function Dashboard() {
  const { user } = useAuth();
  const { sessions, loading } = useSessions(user?.uid);

  const handleCreateSession = async (name: string) => {
    if (!user) return;
    try {
      await createSession(name, user.uid);
      toast.success('セッションを作成しました');
    } catch (err) {
      console.error('Session creation failed:', err);
      toast.error(`セッションの作成に失敗しました: ${(err as Error).message}`);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white px-4 py-3">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <h1 className="text-lg font-bold text-gray-900">コメントスクリーン</h1>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">{user?.displayName}</span>
            <button
              onClick={logout}
              className="rounded p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
              title="ログアウト"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl p-4">
        <div className="mb-6">
          <SessionForm onSubmit={handleCreateSession} />
        </div>

        {sessions.length === 0 ? (
          <p className="text-center text-sm text-gray-400 py-12">
            セッションがありません。新しいセッションを作成してください。
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {sessions.map((s) => (
              <SessionCard key={s.id} session={s} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

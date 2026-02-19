import { LogIn } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '../hooks/useAuth';
import { signInWithGoogle } from '../services/authService';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

export function Login() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [loggingIn, setLoggingIn] = useState(false);

  useEffect(() => {
    if (user && !user.isAnonymous) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  if (loading) return <LoadingSpinner />;

  const handleLogin = async () => {
    setLoggingIn(true);
    try {
      await signInWithGoogle();
    } catch (err: unknown) {
      const code = (err as { code?: string }).code ?? '';
      if (code === 'auth/popup-closed-by-user') {
        // ユーザーが自分で閉じた場合は何もしない
      } else if (code === 'auth/unauthorized-domain') {
        toast.error('このドメインはFirebaseで許可されていません。Firebase Console → Authentication → Settings → Authorized domains に localhost を追加してください。');
      } else {
        toast.error(`ログインに失敗しました: ${code || (err as Error).message}`);
      }
      console.error('Login failed:', err);
    } finally {
      setLoggingIn(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm rounded-lg bg-white p-8 shadow-md text-center">
        <h1 className="mb-2 text-2xl font-bold text-gray-900">
          コメントスクリーン
        </h1>
        <p className="mb-8 text-sm text-gray-500">
          配信用コメントシステム
        </p>

        <button
          onClick={handleLogin}
          disabled={loggingIn}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-500 px-4 py-3 text-white hover:bg-blue-600 disabled:opacity-50 transition-colors"
        >
          <LogIn className="h-5 w-5" />
          {loggingIn ? 'ログイン中...' : 'Googleでログイン'}
        </button>
      </div>
    </div>
  );
}

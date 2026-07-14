import { useCallback, useEffect, useState } from 'react';

/**
 * 連投クールダウン。
 * persistKey を渡すと最終投稿時刻を localStorage に保存し、
 * ページをリロードしてもクールダウンが継続する（①レート制限強化）。
 */
export function useRateLimit(cooldownSeconds: number, persistKey?: string) {
  // クールダウンが切れる時刻（epoch ms）。0 = クールダウンなし
  const [endsAt, setEndsAt] = useState<number>(() => {
    if (!persistKey) return 0;
    const raw = localStorage.getItem(persistKey);
    const last = raw ? Number(raw) : NaN;
    if (!Number.isFinite(last)) return 0;
    const end = last + cooldownSeconds * 1000;
    return end > Date.now() ? end : 0;
  });
  const [now, setNow] = useState<number>(() => Date.now());

  // カウントダウン中だけ tick する（0 になったら自動で止まる）
  useEffect(() => {
    if (endsAt <= Date.now()) return;
    const t = setInterval(() => {
      setNow(Date.now());
      if (Date.now() >= endsAt) clearInterval(t);
    }, 250);
    return () => clearInterval(t);
  }, [endsAt]);

  const recordPost = useCallback(() => {
    const t = Date.now();
    if (persistKey) localStorage.setItem(persistKey, String(t));
    setNow(t);
    setEndsAt(t + cooldownSeconds * 1000);
  }, [persistKey, cooldownSeconds]);

  const remaining = Math.max(0, Math.ceil((endsAt - now) / 1000));
  const canPost = remaining === 0;

  return { canPost, remaining, recordPost };
}

import { useCallback, useEffect, useRef, useState } from 'react';
import type { Comment } from '../types';

/**
 * ①投稿からオーバーレイに流れ始めるまで delaySeconds だけ遅延させるバッファ。
 * 遅延中に削除（removedIds に追加）されたコメントは画面に出さずに破棄する。
 * enabled が false の間（一時停止中・セッション非アクティブ）は流入コメントを捨てる。
 *
 * @returns ready 表示準備が整ったコメント / clearReady 消費後のクリア
 */
export function useCommentBuffer(
  newComments: Comment[],
  clearNewComments: () => void,
  removedIds: Set<string>,
  delaySeconds: number,
  enabled: boolean,
) {
  const [ready, setReady] = useState<Comment[]>([]);
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  // 新規コメントを遅延させて ready に積む（setState は必ずタイマー内で行う）
  useEffect(() => {
    if (newComments.length === 0) return;

    if (enabled) {
      const delayMs = Math.max(0, delaySeconds * 1000);
      for (const comment of newComments) {
        const timer = setTimeout(() => {
          timersRef.current.delete(comment.id);
          setReady((prev) => [...prev, comment]);
        }, delayMs);
        timersRef.current.set(comment.id, timer);
      }
    }

    clearNewComments();
  }, [newComments, enabled, delaySeconds, clearNewComments]);

  // ②削除されたコメントが遅延待ちなら、表示される前にタイマーを取り消す。
  // 既に ready に積まれたものの除外は Overlay 側で removedIds と突き合わせて行う。
  useEffect(() => {
    if (removedIds.size === 0) return;
    for (const [id, timer] of timersRef.current) {
      if (removedIds.has(id)) {
        clearTimeout(timer);
        timersRef.current.delete(id);
      }
    }
  }, [removedIds]);

  // アンマウント時に保留中タイマーを掃除
  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      for (const timer of timers.values()) clearTimeout(timer);
      timers.clear();
    };
  }, []);

  const clearReady = useCallback(() => setReady([]), []);

  return { ready, clearReady };
}

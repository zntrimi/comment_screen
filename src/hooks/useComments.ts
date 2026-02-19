import {
  limitToLast,
  onChildAdded,
  onChildChanged,
  onChildRemoved,
  onValue,
  orderByChild,
  query,
  ref,
} from 'firebase/database';
import { useCallback, useEffect, useRef, useState } from 'react';
import { rtdb } from '../config/firebase';
import type { Comment } from '../types';

function snapshotToComment(key: string, val: Record<string, unknown>): Comment {
  return {
    id: key,
    text: (val.text as string) ?? '',
    userId: (val.userId as string) ?? '',
    userName: (val.userName as string) ?? '',
    color: (val.color as string) ?? '#FFFFFF',
    position: (val.position as Comment['position']) ?? 'scroll',
    fontSize: (val.fontSize as Comment['fontSize']) ?? 'medium',
    status: 'approved',
    isPinned: (val.isPinned as boolean) ?? false,
    isAdmin: (val.isAdmin as boolean) ?? false,
    createdAt: val.createdAt as Comment['createdAt'],
  };
}

export function useComments(sessionId: string | undefined) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComments, setNewComments] = useState<Comment[]>([]);
  const initialLoadDone = useRef(false);

  useEffect(() => {
    if (!sessionId) return;

    initialLoadDone.current = false;
    const commentsRef = ref(rtdb, `comments/${sessionId}`);
    const recentQuery = query(commentsRef, orderByChild('createdAt'), limitToLast(200));

    // 初回ロード: 既存コメント一覧を取得
    const unsubValue = onValue(recentQuery, (snap) => {
      if (initialLoadDone.current) return;
      initialLoadDone.current = true;

      const list: Comment[] = [];
      snap.forEach((child) => {
        list.push(snapshotToComment(child.key!, child.val()));
      });
      setComments(list.reverse());
    }, { onlyOnce: true });

    // 新規コメント追加をリアルタイム監視
    const unsubAdded = onChildAdded(recentQuery, (snap) => {
      const comment = snapshotToComment(snap.key!, snap.val());
      setComments((prev) => {
        if (prev.some((c) => c.id === comment.id)) return prev;
        return [comment, ...prev].slice(0, 200);
      });

      if (initialLoadDone.current) {
        setNewComments((prev) => [...prev, comment]);
      }
    });

    // ピン留め等の更新を監視
    const unsubChanged = onChildChanged(commentsRef, (snap) => {
      const updated = snapshotToComment(snap.key!, snap.val());
      setComments((prev) =>
        prev.map((c) => (c.id === updated.id ? updated : c)),
      );
    });

    // 削除を監視
    const unsubRemoved = onChildRemoved(commentsRef, (snap) => {
      const id = snap.key!;
      setComments((prev) => prev.filter((c) => c.id !== id));
    });

    return () => {
      unsubValue();
      unsubAdded();
      unsubChanged();
      unsubRemoved();
    };
  }, [sessionId]);

  const clearNewComments = useCallback(() => setNewComments([]), []);

  return { comments, newComments, clearNewComments };
}

import { push, ref, remove, serverTimestamp, update } from 'firebase/database';
import { rtdb } from '../config/firebase';
import type { Comment, CommentFontSize, CommentPosition } from '../types';

export async function postComment(
  sessionId: string,
  data: {
    text: string;
    userId: string;
    userName: string;
    color: string;
    position: CommentPosition;
    fontSize: CommentFontSize;
    isAdmin: boolean;
  },
) {
  const commentsRef = ref(rtdb, `comments/${sessionId}`);
  await push(commentsRef, {
    ...data,
    isPinned: false,
    createdAt: serverTimestamp(),
  });
}

export async function deleteComment(sessionId: string, commentId: string) {
  await remove(ref(rtdb, `comments/${sessionId}/${commentId}`));
}

/** 削除の取り消し（undo）用。元の内容・投稿時刻を保って再登録する */
export async function restoreComment(sessionId: string, comment: Comment) {
  const commentsRef = ref(rtdb, `comments/${sessionId}`);
  const createdAt = comment.createdAt as unknown as number;
  await push(commentsRef, {
    text: comment.text,
    userId: comment.userId,
    userName: comment.userName,
    color: comment.color,
    position: comment.position,
    fontSize: comment.fontSize,
    isPinned: comment.isPinned,
    isAdmin: comment.isAdmin,
    createdAt:
      typeof createdAt === 'number' && Number.isFinite(createdAt)
        ? createdAt
        : serverTimestamp(),
  });
}

export async function togglePinComment(
  sessionId: string,
  commentId: string,
  isPinned: boolean,
) {
  await update(ref(rtdb, `comments/${sessionId}/${commentId}`), { isPinned });
}

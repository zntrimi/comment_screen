import { push, ref, remove, serverTimestamp, update } from 'firebase/database';
import { rtdb } from '../config/firebase';
import type { CommentFontSize, CommentPosition } from '../types';

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

export async function togglePinComment(
  sessionId: string,
  commentId: string,
  isPinned: boolean,
) {
  await update(ref(rtdb, `comments/${sessionId}/${commentId}`), { isPinned });
}

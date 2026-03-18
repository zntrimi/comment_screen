import { push, ref, remove, serverTimestamp, set, update } from 'firebase/database';
import { rtdb } from '../config/firebase';
import type { QuestionStatus } from '../types';

export async function initCommentControl(sessionId: string) {
  await set(ref(rtdb, `comment_control/${sessionId}`), {
    commentingEnabled: true,
    activeQuestion: null,
  });
}

export async function setCommentingEnabled(sessionId: string, enabled: boolean) {
  await update(ref(rtdb, `comment_control/${sessionId}`), {
    commentingEnabled: enabled,
  });
}

export async function createQuestion(sessionId: string, text: string) {
  const questionsRef = ref(rtdb, `questions/${sessionId}`);
  const newRef = push(questionsRef);
  const questionId = newRef.key!;

  await set(newRef, {
    text,
    status: 'active' as QuestionStatus,
    createdAt: serverTimestamp(),
  });

  await update(ref(rtdb, `comment_control/${sessionId}`), {
    activeQuestion: {
      id: questionId,
      text,
      status: 'active',
      createdAt: Date.now(),
    },
  });

  return questionId;
}

export async function closeActiveQuestion(sessionId: string, questionId: string) {
  await update(ref(rtdb, `questions/${sessionId}/${questionId}`), {
    status: 'closed' as QuestionStatus,
  });
  await update(ref(rtdb, `comment_control/${sessionId}`), {
    activeQuestion: null,
  });
}

export async function deleteQuestion(sessionId: string, questionId: string) {
  await remove(ref(rtdb, `questions/${sessionId}/${questionId}`));
}

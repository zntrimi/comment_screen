import { push, ref, remove, serverTimestamp, set, update } from 'firebase/database';
import { rtdb } from '../config/firebase';
import type { QuestionStatus } from '../types';

export async function setCommentingEnabled(sessionId: string, enabled: boolean) {
  await update(ref(rtdb, `comment_control/${sessionId}`), {
    commentingEnabled: enabled,
  });
}

/** ③④強制一時停止のオン/オフ */
export async function setPaused(sessionId: string, paused: boolean) {
  await update(ref(rtdb, `comment_control/${sessionId}`), {
    paused,
  });
}

/**
 * 質問を作成する。
 * @param activate true なら即出題（activeQuestion に設定）、false なら⑤下書きとして保存するだけ
 */
export async function createQuestion(
  sessionId: string,
  text: string,
  activate = true,
) {
  const questionsRef = ref(rtdb, `questions/${sessionId}`);
  const newRef = push(questionsRef);
  const questionId = newRef.key!;

  await set(newRef, {
    text,
    status: (activate ? 'active' : 'draft') as QuestionStatus,
    createdAt: serverTimestamp(),
  });

  if (activate) {
    await update(ref(rtdb, `comment_control/${sessionId}`), {
      activeQuestion: {
        id: questionId,
        text,
        status: 'active',
        createdAt: Date.now(),
      },
    });
  }

  return questionId;
}

/** ⑤下書きの質問を出題（active 化）する */
export async function activateQuestion(
  sessionId: string,
  questionId: string,
  text: string,
) {
  await update(ref(rtdb, `questions/${sessionId}/${questionId}`), {
    status: 'active' as QuestionStatus,
  });
  await update(ref(rtdb, `comment_control/${sessionId}`), {
    activeQuestion: {
      id: questionId,
      text,
      status: 'active',
      createdAt: Date.now(),
    },
  });
}

/** ⑤下書きの質問テキストを更新する */
export async function updateQuestionText(
  sessionId: string,
  questionId: string,
  text: string,
) {
  await update(ref(rtdb, `questions/${sessionId}/${questionId}`), { text });
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

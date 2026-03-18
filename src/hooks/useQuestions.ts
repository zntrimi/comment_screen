import {
  onChildAdded,
  onChildChanged,
  onChildRemoved,
  ref,
} from 'firebase/database';
import { useEffect, useState } from 'react';
import { rtdb } from '../config/firebase';
import type { Question } from '../types';

function snapshotToQuestion(key: string, val: Record<string, unknown>): Question {
  return {
    id: key,
    text: (val.text as string) ?? '',
    status: (val.status as Question['status']) ?? 'active',
    createdAt: val.createdAt as Question['createdAt'],
  };
}

export function useQuestions(sessionId: string | undefined) {
  const [questions, setQuestions] = useState<Question[]>([]);

  useEffect(() => {
    if (!sessionId) return;

    const questionsRef = ref(rtdb, `questions/${sessionId}`);

    const unsubAdded = onChildAdded(questionsRef, (snap) => {
      const question = snapshotToQuestion(snap.key!, snap.val());
      setQuestions((prev) => {
        if (prev.some((q) => q.id === question.id)) return prev;
        return [...prev, question];
      });
    });

    const unsubChanged = onChildChanged(questionsRef, (snap) => {
      const updated = snapshotToQuestion(snap.key!, snap.val());
      setQuestions((prev) => prev.map((q) => (q.id === updated.id ? updated : q)));
    });

    const unsubRemoved = onChildRemoved(questionsRef, (snap) => {
      const id = snap.key!;
      setQuestions((prev) => prev.filter((q) => q.id !== id));
    });

    return () => {
      unsubAdded();
      unsubChanged();
      unsubRemoved();
    };
  }, [sessionId]);

  return { questions };
}

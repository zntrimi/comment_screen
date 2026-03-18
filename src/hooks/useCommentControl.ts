import { onValue, ref } from 'firebase/database';
import { useEffect, useState } from 'react';
import { rtdb } from '../config/firebase';
import type { CommentControl } from '../types';

const DEFAULT_STATE: CommentControl = {
  commentingEnabled: true,
  activeQuestion: null,
};

export function useCommentControl(sessionId: string | undefined) {
  const [control, setControl] = useState<CommentControl>(DEFAULT_STATE);

  useEffect(() => {
    if (!sessionId) return;

    const controlRef = ref(rtdb, `comment_control/${sessionId}`);
    const unsub = onValue(controlRef, (snap) => {
      if (snap.exists()) {
        const val = snap.val();
        setControl({
          commentingEnabled: val.commentingEnabled ?? true,
          activeQuestion: val.activeQuestion ?? null,
        });
      } else {
        setControl(DEFAULT_STATE);
      }
    });

    return () => unsub();
  }, [sessionId]);

  return control;
}

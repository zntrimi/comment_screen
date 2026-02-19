import { limitToLast, onChildAdded, query, ref } from 'firebase/database';
import { useEffect, useRef, useState } from 'react';
import { rtdb } from '../config/firebase';
import type { Reaction } from '../types';
import { REACTION_FLOAT_DURATION_MS } from '../utils/constants';

export function useReactions(sessionId: string | undefined) {
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const initialLoadDone = useRef(false);

  useEffect(() => {
    if (!sessionId) return;

    initialLoadDone.current = false;
    const reactionsRef = ref(rtdb, `reactions/${sessionId}`);
    const recentQuery = query(reactionsRef, limitToLast(50));

    // Skip initial data load - only show new reactions
    let skipCount = 0;
    let counted = false;

    const unsub = onChildAdded(recentQuery, (snap) => {
      if (!initialLoadDone.current) {
        skipCount++;
        // onChildAdded fires synchronously for existing data,
        // use setTimeout to detect when initial load is done
        if (!counted) {
          counted = true;
          setTimeout(() => {
            initialLoadDone.current = true;
          }, 0);
        }
        return;
      }

      const reaction: Reaction = {
        id: snap.key!,
        emoji: (snap.val().emoji as string) ?? '',
        userId: (snap.val().userId as string) ?? '',
        createdAt: snap.val().createdAt,
      };

      setReactions((prev) => [...prev, reaction]);

      // Auto-remove after animation duration
      setTimeout(() => {
        setReactions((prev) => prev.filter((r) => r.id !== reaction.id));
      }, REACTION_FLOAT_DURATION_MS);
    });

    return () => {
      unsub();
      setReactions([]);
    };
  }, [sessionId]);

  return { reactions };
}

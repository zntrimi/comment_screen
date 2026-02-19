import {
  onChildAdded,
  onChildChanged,
  onChildRemoved,
  ref,
} from 'firebase/database';
import { useEffect, useState } from 'react';
import { rtdb } from '../config/firebase';
import type { Poll } from '../types';

function snapshotToPoll(key: string, val: Record<string, unknown>): Poll {
  return {
    id: key,
    question: (val.question as string) ?? '',
    options: (val.options as string[]) ?? [],
    status: (val.status as Poll['status']) ?? 'draft',
    showResults: (val.showResults as boolean) ?? false,
    createdAt: val.createdAt as Poll['createdAt'],
  };
}

export function usePolls(sessionId: string | undefined) {
  const [polls, setPolls] = useState<Poll[]>([]);

  useEffect(() => {
    if (!sessionId) return;

    const pollsRef = ref(rtdb, `polls/${sessionId}`);

    const unsubAdded = onChildAdded(pollsRef, (snap) => {
      const poll = snapshotToPoll(snap.key!, snap.val());
      setPolls((prev) => {
        if (prev.some((p) => p.id === poll.id)) return prev;
        return [...prev, poll];
      });
    });

    const unsubChanged = onChildChanged(pollsRef, (snap) => {
      const updated = snapshotToPoll(snap.key!, snap.val());
      setPolls((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    });

    const unsubRemoved = onChildRemoved(pollsRef, (snap) => {
      const id = snap.key!;
      setPolls((prev) => prev.filter((p) => p.id !== id));
    });

    return () => {
      unsubAdded();
      unsubChanged();
      unsubRemoved();
    };
  }, [sessionId]);

  return { polls };
}

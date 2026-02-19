import { doc, onSnapshot } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { db } from '../config/firebase';
import type { Session } from '../types';

export function useSession(sessionId: string | undefined) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sessionId) {
      setLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(
      doc(db, 'sessions', sessionId),
      (snap) => {
        if (snap.exists()) {
          setSession({ id: snap.id, ...snap.data() } as Session);
        } else {
          setSession(null);
        }
        setLoading(false);
      },
      () => {
        setLoading(false);
      },
    );

    return unsubscribe;
  }, [sessionId]);

  return { session, loading };
}

import {
  collection,
  onSnapshot,
  orderBy,
  query,
  where,
} from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { db } from '../config/firebase';
import type { Session } from '../types';

export function useSessions(ownerId: string | undefined) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ownerId) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'sessions'),
      where('ownerId', '==', ownerId),
      orderBy('createdAt', 'desc'),
    );

    const unsubscribe = onSnapshot(
      q,
      (snap) => {
        const data = snap.docs.map(
          (d) => ({ id: d.id, ...d.data() }) as Session,
        );
        setSessions(data);
        setLoading(false);
      },
      (err) => {
        console.error('useSessions error:', err);
        setLoading(false);
      },
    );

    return unsubscribe;
  }, [ownerId]);

  return { sessions, loading };
}

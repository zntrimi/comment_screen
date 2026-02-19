import { onValue, ref } from 'firebase/database';
import { useEffect, useState } from 'react';
import { rtdb } from '../config/firebase';

export function useBlockedUsers(sessionId: string | undefined) {
  const [blockedUserIds, setBlockedUserIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!sessionId) return;

    const blockedRef = ref(rtdb, `blocked_users/${sessionId}`);
    const unsub = onValue(blockedRef, (snapshot) => {
      const data = snapshot.val() as Record<string, boolean> | null;
      setBlockedUserIds(new Set(data ? Object.keys(data) : []));
    });

    return unsub;
  }, [sessionId]);

  return { blockedUserIds };
}

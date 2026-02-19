import { onValue, ref } from 'firebase/database';
import { useEffect, useState } from 'react';
import { rtdb } from '../config/firebase';

interface PollVotesResult {
  voteCounts: number[];
  myVote: number | null;
  totalVotes: number;
}

export function usePollVotes(
  sessionId: string | undefined,
  pollId: string | undefined,
  optionCount: number,
  userId: string,
): PollVotesResult {
  const [voteCounts, setVoteCounts] = useState<number[]>(
    () => new Array(optionCount).fill(0),
  );
  const [myVote, setMyVote] = useState<number | null>(null);
  const [totalVotes, setTotalVotes] = useState(0);

  useEffect(() => {
    if (!sessionId || !pollId) return;

    const votesRef = ref(rtdb, `poll_votes/${sessionId}/${pollId}`);

    const unsub = onValue(votesRef, (snap) => {
      const counts = new Array(optionCount).fill(0);
      let total = 0;
      let mine: number | null = null;

      snap.forEach((child) => {
        const idx = child.val() as number;
        if (idx >= 0 && idx < optionCount) {
          counts[idx]++;
          total++;
        }
        if (child.key === userId) {
          mine = idx;
        }
      });

      setVoteCounts(counts);
      setTotalVotes(total);
      setMyVote(mine);
    });

    return unsub;
  }, [sessionId, pollId, optionCount, userId]);

  return { voteCounts, myVote, totalVotes };
}

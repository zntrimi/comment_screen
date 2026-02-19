import { push, ref, remove, serverTimestamp, set, update } from 'firebase/database';
import { rtdb } from '../config/firebase';
import type { PollStatus } from '../types';

export async function createPoll(
  sessionId: string,
  data: { question: string; options: string[]; status: PollStatus },
) {
  const pollsRef = ref(rtdb, `polls/${sessionId}`);
  await push(pollsRef, {
    question: data.question,
    options: data.options,
    status: data.status,
    showResults: false,
    createdAt: serverTimestamp(),
  });
}

export async function updatePollStatus(
  sessionId: string,
  pollId: string,
  status: PollStatus,
) {
  await update(ref(rtdb, `polls/${sessionId}/${pollId}`), { status });
}

export async function toggleShowResults(
  sessionId: string,
  pollId: string,
  showResults: boolean,
) {
  await update(ref(rtdb, `polls/${sessionId}/${pollId}`), { showResults });
}

export async function deletePoll(sessionId: string, pollId: string) {
  await remove(ref(rtdb, `polls/${sessionId}/${pollId}`));
  await remove(ref(rtdb, `poll_votes/${sessionId}/${pollId}`));
}

export async function castVote(
  sessionId: string,
  pollId: string,
  userId: string,
  optionIndex: number,
) {
  await set(
    ref(rtdb, `poll_votes/${sessionId}/${pollId}/${userId}`),
    optionIndex,
  );
}

import { push, ref, serverTimestamp } from 'firebase/database';
import { rtdb } from '../config/firebase';

export async function sendReaction(
  sessionId: string,
  emoji: string,
  userId: string,
) {
  const reactionsRef = ref(rtdb, `reactions/${sessionId}`);
  await push(reactionsRef, {
    emoji,
    userId,
    createdAt: serverTimestamp(),
  });
}

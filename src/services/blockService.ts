import { ref, remove, set } from 'firebase/database';
import { rtdb } from '../config/firebase';

export async function blockUser(sessionId: string, userId: string) {
  await set(ref(rtdb, `blocked_users/${sessionId}/${userId}`), true);
}

export async function unblockUser(sessionId: string, userId: string) {
  await remove(ref(rtdb, `blocked_users/${sessionId}/${userId}`));
}

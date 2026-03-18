import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import type { Session, SessionSettings } from '../types';
import { DEFAULT_SESSION_SETTINGS } from '../types';

const sessionsRef = collection(db, 'sessions');

const ID_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';

function generateSessionId(): string {
  let id = '';
  for (let i = 0; i < 4; i++) {
    id += ID_CHARS[Math.floor(Math.random() * ID_CHARS.length)];
  }
  return id;
}

export async function createSession(
  name: string,
  ownerId: string,
): Promise<string> {
  for (let attempt = 0; attempt < 10; attempt++) {
    const id = generateSessionId();
    const docRef = doc(db, 'sessions', id);
    const snap = await getDoc(docRef);
    if (!snap.exists()) {
      await setDoc(docRef, {
        name,
        status: 'active',
        ownerId,
        createdAt: serverTimestamp(),
        settings: DEFAULT_SESSION_SETTINGS,
      });
      return id;
    }
  }
  throw new Error('Failed to generate unique session ID');
}

export async function updateSessionStatus(
  sessionId: string,
  status: Session['status'],
) {
  await updateDoc(doc(db, 'sessions', sessionId), { status });
}

export async function updateSessionSettings(
  sessionId: string,
  settings: Partial<SessionSettings>,
) {
  const updates: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(settings)) {
    updates[`settings.${key}`] = value;
  }
  await updateDoc(doc(db, 'sessions', sessionId), updates);
}

export async function deleteSession(sessionId: string) {
  await deleteDoc(doc(db, 'sessions', sessionId));
}

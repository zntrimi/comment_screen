import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import type { Session, SessionSettings } from '../types';
import { DEFAULT_SESSION_SETTINGS } from '../types';

const sessionsRef = collection(db, 'sessions');

export async function createSession(
  name: string,
  ownerId: string,
): Promise<string> {
  const docRef = await addDoc(sessionsRef, {
    name,
    status: 'active',
    ownerId,
    createdAt: serverTimestamp(),
    settings: DEFAULT_SESSION_SETTINGS,
  });
  return docRef.id;
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

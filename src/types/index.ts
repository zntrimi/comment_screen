import type { Timestamp } from 'firebase/firestore';

export interface SessionSettings {
  maxCommentLength: number;
  allowAnonymous: boolean;
  rateLimitSeconds: number;
  scrollSpeedSeconds: number;
  ngWords: string[];
  backgroundColor: string;
  defaultCommentColor: string;
}

export interface Session {
  id: string;
  name: string;
  status: 'active' | 'paused' | 'ended';
  ownerId: string;
  createdAt: Timestamp;
  settings: SessionSettings;
}

export type CommentPosition = 'scroll' | 'top' | 'bottom';
export type CommentFontSize = 'small' | 'medium' | 'large';

export interface Comment {
  id: string;
  text: string;
  userId: string;
  userName: string;
  color: string;
  position: CommentPosition;
  fontSize: CommentFontSize;
  status: 'approved' | 'rejected';
  isPinned: boolean;
  isAdmin: boolean;
  createdAt: Timestamp;
}

export type PollStatus = 'draft' | 'open' | 'closed';

export interface Poll {
  id: string;
  question: string;
  options: string[];
  status: PollStatus;
  showResults: boolean;
  createdAt: Timestamp;
}

export interface Reaction {
  id: string;
  emoji: string;
  userId: string;
  createdAt: Timestamp;
}

export const DEFAULT_SESSION_SETTINGS: SessionSettings = {
  maxCommentLength: 100,
  allowAnonymous: true,
  rateLimitSeconds: 3,
  scrollSpeedSeconds: 8,
  ngWords: [],
  backgroundColor: 'transparent',
  defaultCommentColor: '#FFFFFF',
};

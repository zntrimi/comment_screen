import type { Timestamp } from 'firebase/firestore';

export interface SessionSettings {
  maxCommentLength: number;
  allowAnonymous: boolean;
  rateLimitSeconds: number;
  scrollSpeedSeconds: number;
  /** ①投稿されてからオーバーレイに流れ始めるまでの遅延（秒）。モデレート猶予に使う */
  commentDelaySeconds: number;
  ngWords: string[];
  backgroundColor: string;
  defaultCommentColor: string;
}

export interface Session {
  id: string;
  name: string;
  status: 'active' | 'ended';
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

export type QuestionStatus = 'draft' | 'active' | 'closed';

export interface Question {
  id: string;
  text: string;
  status: QuestionStatus;
  createdAt: Timestamp;
}

export interface CommentControl {
  commentingEnabled: boolean;
  /** ③④強制一時停止。true の間はコメント投稿を全面停止し、オーバーレイは待機ロゴを表示する（質問中も有効） */
  paused: boolean;
  activeQuestion: { id: string; text: string; status: QuestionStatus; createdAt: number } | null;
}

export const DEFAULT_SESSION_SETTINGS: SessionSettings = {
  maxCommentLength: 100,
  allowAnonymous: true,
  rateLimitSeconds: 3,
  scrollSpeedSeconds: 8,
  commentDelaySeconds: 3,
  ngWords: [],
  backgroundColor: 'transparent',
  defaultCommentColor: '#FFFFFF',
};

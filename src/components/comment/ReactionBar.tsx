import { useCallback, useRef } from 'react';
import { sendReaction } from '../../services/reactionService';
import { REACTION_EMOJIS } from '../../utils/constants';

interface ReactionBarProps {
  sessionId: string;
  userId: string;
}

export function ReactionBar({ sessionId, userId }: ReactionBarProps) {
  const lastSentRef = useRef(0);

  const handleReaction = useCallback(
    (emoji: string) => {
      const now = Date.now();
      if (now - lastSentRef.current < 1000) return; // 1秒レート制限
      lastSentRef.current = now;
      sendReaction(sessionId, emoji, userId);
    },
    [sessionId, userId],
  );

  return (
    <div className="flex justify-center gap-2">
      {REACTION_EMOJIS.map((emoji) => (
        <button
          key={emoji}
          onClick={() => handleReaction(emoji)}
          className="rounded-full bg-gray-800 border border-gray-700 w-10 h-10 flex items-center justify-center text-lg hover:bg-gray-700 active:scale-90 transition-transform"
        >
          {emoji}
        </button>
      ))}
    </div>
  );
}

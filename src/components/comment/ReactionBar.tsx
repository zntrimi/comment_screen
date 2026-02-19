import { useCallback, useRef } from 'react';
import { sendReaction } from '../../services/reactionService';
import { REACTION_EMOJIS } from '../../utils/constants';

interface ReactionBarProps {
  sessionId: string;
  userId: string;
  disabled?: boolean;
}

export function ReactionBar({ sessionId, userId, disabled }: ReactionBarProps) {
  const lastSentRef = useRef(0);

  const handleReaction = useCallback(
    (emoji: string) => {
      if (disabled) return;
      const now = Date.now();
      if (now - lastSentRef.current < 1000) return; // 1秒レート制限
      lastSentRef.current = now;
      sendReaction(sessionId, emoji, userId);
    },
    [sessionId, userId, disabled],
  );

  return (
    <div className={`flex justify-center gap-2 ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
      {REACTION_EMOJIS.map((emoji) => (
        <button
          key={emoji}
          onClick={() => handleReaction(emoji)}
          disabled={disabled}
          className="rounded-full bg-gray-800 border border-gray-700 w-10 h-10 flex items-center justify-center text-lg hover:bg-gray-700 active:scale-90 transition-transform"
        >
          {emoji}
        </button>
      ))}
    </div>
  );
}

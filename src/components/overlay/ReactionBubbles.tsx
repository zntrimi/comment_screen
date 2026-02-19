import { useMemo } from 'react';
import { useReactions } from '../../hooks/useReactions';
import { REACTION_FLOAT_DURATION_MS } from '../../utils/constants';

interface ReactionBubblesProps {
  sessionId: string;
}

function Bubble({ emoji, seed }: { emoji: string; seed: string }) {
  // Derive stable random values from the reaction id
  const style = useMemo(() => {
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = (hash << 5) - hash + seed.charCodeAt(i);
      hash |= 0;
    }
    const rand = (offset: number) => (((hash + offset * 7919) & 0x7fffffff) % 100) / 100;

    return {
      left: `${5 + rand(1) * 20}%`, // 左側 5-25% の範囲
      fontSize: `${32 + rand(2) * 24}px`, // 32-56px
      animationDuration: `${REACTION_FLOAT_DURATION_MS}ms`,
      animationTimingFunction: 'ease-out',
      animationFillMode: 'forwards' as const,
      animationName: 'float-up-wobble',
    };
  }, [seed]);

  return (
    <div
      className="absolute bottom-0 pointer-events-none"
      style={style}
    >
      {emoji}
    </div>
  );
}

export function ReactionBubbles({ sessionId }: ReactionBubblesProps) {
  const { reactions } = useReactions(sessionId);

  if (reactions.length === 0) return null;

  return (
    <div className="fixed inset-0 z-20 pointer-events-none overflow-hidden">
      {reactions.map((r) => (
        <Bubble key={r.id} emoji={r.emoji} seed={r.id} />
      ))}
    </div>
  );
}

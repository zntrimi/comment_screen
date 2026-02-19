import { useEffect, useRef } from 'react';
import type { Comment } from '../../types';

interface RecentCommentsProps {
  comments: Comment[];
}

export function RecentComments({ comments }: RecentCommentsProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const isNearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
    if (isNearBottom) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [comments.length]);

  const recent = [...comments].reverse().slice(-50);

  if (recent.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-gray-600">最初のコメントを送ろう！</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="flex h-full flex-col gap-1 overflow-y-auto scrollbar-hide"
    >
      {recent.map((c) => (
        <div
          key={c.id}
          className="rounded-lg bg-gray-800 px-3 py-2 animate-[fadeIn_0.2s_ease-out]"
        >
          <span className="text-xs font-medium text-gray-500">{c.userName}</span>
          <p className="text-sm text-gray-100 break-words">{c.text}</p>
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  );
}

import { memo } from 'react';
import { FONT_SIZE_MAP } from '../../utils/constants';
import type { Comment } from '../../types';

interface ScrollingCommentProps {
  comment: Comment;
  top: number;
  duration: number;
  dataKey: string;
}

export const ScrollingComment = memo(
  function ScrollingComment({ comment, top, duration, dataKey }: ScrollingCommentProps) {
    const fontSize = FONT_SIZE_MAP[comment.fontSize];

    return (
      <div
        className="absolute whitespace-nowrap pointer-events-none"
        data-comment-key={dataKey}
        data-comment-type="scroll"
        style={{
          top: `calc(${top}px * var(--overlay-scale, 1))`,
          left: 0,
          color: comment.color,
          fontSize: `calc(${fontSize}px * var(--overlay-scale, 1))`,
          fontWeight: 'bold',
          textShadow: '1px 1px 3px rgba(0,0,0,0.8)',
          animation: `scroll-left ${duration}s linear forwards`,
          willChange: 'transform',
        }}
      >
        {comment.text}
      </div>
    );
  },
  (prev, next) =>
    prev.comment.id === next.comment.id &&
    prev.top === next.top &&
    prev.duration === next.duration,
);

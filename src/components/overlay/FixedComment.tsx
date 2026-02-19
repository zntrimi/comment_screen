import { FONT_SIZE_MAP } from '../../utils/constants';
import type { Comment } from '../../types';

interface FixedCommentProps {
  comment: Comment;
  duration: number;
  dataKey: string;
}

export function FixedComment({ comment, duration, dataKey }: FixedCommentProps) {
  const fontSize = FONT_SIZE_MAP[comment.fontSize];

  return (
    <div
      className="w-full text-center pointer-events-none"
      data-comment-key={dataKey}
      data-comment-type={comment.position}
      style={{
        color: comment.color,
        fontSize: `${fontSize}px`,
        fontWeight: 'bold',
        textShadow: '1px 1px 3px rgba(0,0,0,0.8)',
        animation: `fixed-display ${duration}s linear forwards`,
      }}
    >
      {comment.text}
    </div>
  );
}

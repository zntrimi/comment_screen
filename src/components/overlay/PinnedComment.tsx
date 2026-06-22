import type { Comment } from '../../types';

interface PinnedCommentProps {
  comment: Comment;
}

export function PinnedComment({ comment }: PinnedCommentProps) {
  return (
    <div
      className="rounded bg-black/70 px-4 py-2 text-center"
      style={{
        color: comment.color,
        fontSize: 'calc(20px * var(--overlay-scale, 1))',
        fontWeight: 'bold',
      }}
    >
      {comment.text}
    </div>
  );
}

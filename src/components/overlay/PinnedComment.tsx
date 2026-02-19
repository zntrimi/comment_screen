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
        fontSize: '20px',
        fontWeight: 'bold',
      }}
    >
      {comment.text}
    </div>
  );
}

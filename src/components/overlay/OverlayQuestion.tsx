import { useCommentControl } from '../../hooks/useCommentControl';

interface OverlayQuestionProps {
  sessionId: string;
}

export function OverlayQuestion({ sessionId }: OverlayQuestionProps) {
  const { activeQuestion } = useCommentControl(sessionId);

  if (!activeQuestion) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 24,
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'rgba(0, 0, 0, 0.75)',
        borderRadius: 12,
        padding: '12px 24px',
        zIndex: 9998,
        maxWidth: '80vw',
        textAlign: 'center',
      }}
    >
      <span
        style={{
          display: 'inline-block',
          background: '#eab308',
          color: '#000',
          fontSize: 11,
          fontWeight: 700,
          borderRadius: 4,
          padding: '2px 8px',
          marginBottom: 6,
        }}
      >
        質問
      </span>
      <p
        style={{
          color: '#fff',
          fontSize: 20,
          fontWeight: 700,
          margin: '0 0 4px',
          lineHeight: 1.4,
        }}
      >
        {activeQuestion.text}
      </p>
      <p
        style={{
          color: 'rgba(255,255,255,0.6)',
          fontSize: 13,
          margin: 0,
        }}
      >
        コメントで回答してください
      </p>
    </div>
  );
}

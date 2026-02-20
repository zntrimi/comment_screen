import { QRCodeSVG } from 'qrcode.react';
import { useCallback, useEffect, useMemo } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { CommentRenderer } from '../components/overlay/CommentRenderer';
import { OverlayPoll } from '../components/overlay/OverlayPoll';
import { ReactionBubbles } from '../components/overlay/ReactionBubbles';
import { useComments } from '../hooks/useComments';
import { useSession } from '../hooks/useSession';

export function Overlay() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [searchParams] = useSearchParams();
  const { session } = useSession(sessionId);
  const { comments, newComments, clearNewComments } = useComments(sessionId);

  const bgColor = searchParams.get('bg') || 'transparent';
  const speed = Number(
    searchParams.get('speed') || session?.settings.scrollSpeedSeconds || 8,
  );
  const showQr = searchParams.get('qr') === '1';
  const commentUrl = `${window.location.origin}/comment/${sessionId}`;

  // OBSブラウザソース対応: html/bodyを透過にする
  useEffect(() => {
    document.documentElement.style.background = 'transparent';
    document.body.style.background = 'transparent';
    return () => {
      document.documentElement.style.background = '';
      document.body.style.background = '';
    };
  }, []);

  const pinnedComments = useMemo(
    () => comments.filter((c) => c.isPinned),
    [comments],
  );

  const filteredNewComments = useMemo(() => {
    if (session?.status !== 'active') return [];
    return newComments;
  }, [newComments, session?.status]);

  const handleProcessed = useCallback(() => {
    clearNewComments();
  }, [clearNewComments]);

  return (
    <>
      <CommentRenderer
        newComments={filteredNewComments}
        pinnedComments={pinnedComments}
        scrollSpeedSeconds={speed}
        backgroundColor={bgColor}
        onNewCommentsProcessed={handleProcessed}
      />
      {sessionId && <OverlayPoll sessionId={sessionId} />}
      {sessionId && <ReactionBubbles sessionId={sessionId} />}
      {showQr && (
        <div
          style={{
            position: 'fixed',
            bottom: 16,
            left: 16,
            background: 'rgba(255, 255, 255, 0.85)',
            borderRadius: 8,
            padding: 8,
            zIndex: 9999,
          }}
        >
          <QRCodeSVG value={commentUrl} size={96} />
        </div>
      )}
    </>
  );
}

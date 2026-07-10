import { QRCodeSVG } from 'qrcode.react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { CommentRenderer } from '../components/overlay/CommentRenderer';
import { OverlayPoll } from '../components/overlay/OverlayPoll';
import { OverlayQuestion } from '../components/overlay/OverlayQuestion';
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
  const [qrEnlarged, setQrEnlarged] = useState(false);

  // 拡大時のQRサイズ（画面の短辺の60%）。オーバーレイは全画面なので一度計算すれば十分。
  const qrLargeSize = useMemo(
    () => Math.round(Math.min(window.innerWidth, window.innerHeight) * 0.6),
    [],
  );

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
      {sessionId && <OverlayQuestion sessionId={sessionId} />}
      {sessionId && <OverlayPoll sessionId={sessionId} />}
      {sessionId && <ReactionBubbles sessionId={sessionId} />}
      {showQr && (
        <div
          onClick={() => setQrEnlarged((v) => !v)}
          style={
            qrEnlarged
              ? {
                  position: 'fixed',
                  inset: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 24,
                  background: 'rgba(0, 0, 0, 0.72)',
                  cursor: 'zoom-out',
                  zIndex: 10000,
                }
              : {
                  position: 'fixed',
                  bottom: 16,
                  left: 16,
                  background: 'rgba(255, 255, 255, 0.9)',
                  borderRadius: 12,
                  padding: 12,
                  cursor: 'zoom-in',
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.25)',
                  zIndex: 9999,
                }
          }
        >
          <div style={{ background: '#fff', borderRadius: 12, padding: qrEnlarged ? 24 : 0 }}>
            <QRCodeSVG value={commentUrl} size={qrEnlarged ? qrLargeSize : 150} />
          </div>
          {qrEnlarged && (
            <div
              style={{
                color: '#fff',
                fontSize: 28,
                fontWeight: 700,
                letterSpacing: 0.5,
                textShadow: '0 2px 8px rgba(0, 0, 0, 0.6)',
              }}
            >
              {commentUrl}
            </div>
          )}
        </div>
      )}
    </>
  );
}

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Comment } from '../../types';
import { REFERENCE_HEIGHT } from '../../utils/constants';
import { LaneManager } from '../../utils/laneManager';
import { FixedComment } from './FixedComment';
import { PinnedComment } from './PinnedComment';
import { ScrollingComment } from './ScrollingComment';

interface ActiveComment {
  comment: Comment;
  lane: number;
  key: string;
}

interface CommentRendererProps {
  newComments: Comment[];
  pinnedComments: Comment[];
  scrollSpeedSeconds: number;
  backgroundColor: string;
  /** ②削除されたコメントID。流れている途中でも該当要素を除去する */
  removedIds: Set<string>;
  /** ブロックされたユーザーID。流れている途中でも該当ユーザーのコメントを除去する */
  blockedUserIds: Set<string>;
  onNewCommentsProcessed: () => void;
}

export function CommentRenderer({
  newComments,
  pinnedComments,
  scrollSpeedSeconds,
  backgroundColor,
  removedIds,
  blockedUserIds,
  onNewCommentsProcessed,
}: CommentRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const laneManagerRef = useRef<LaneManager>(new LaneManager(REFERENCE_HEIGHT));
  const [scrollingComments, setScrollingComments] = useState<ActiveComment[]>([]);
  const [topComments, setTopComments] = useState<ActiveComment[]>([]);
  const [bottomComments, setBottomComments] = useState<ActiveComment[]>([]);
  const counterRef = useRef(0);

  const removeComment = useCallback((key: string, type: string) => {
    if (type === 'scroll') {
      setScrollingComments((prev) => prev.filter((c) => c.key !== key));
    } else if (type === 'top') {
      setTopComments((prev) => prev.filter((c) => c.key !== key));
    } else {
      setBottomComments((prev) => prev.filter((c) => c.key !== key));
    }
  }, []);

  // CSS変数でアニメーション一時停止を同期的に制御（JS timerを使わない）
  useEffect(() => {
    const handler = () => {
      containerRef.current?.style.setProperty(
        '--anim-play-state',
        document.hidden ? 'paused' : 'running',
      );
    };
    document.addEventListener('visibilitychange', handler);
    return () => document.removeEventListener('visibilitychange', handler);
  }, []);

  // コンテナの高さに応じて --overlay-scale を更新し、フォント・レーン位置を
  // 基準解像度(1080p)からの比率でスケールさせる（低解像度で文字が巨大化するのを防ぐ）
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const applyScale = (height: number) => {
      el.style.setProperty('--overlay-scale', String(height / REFERENCE_HEIGHT));
    };
    applyScale(el.clientHeight);
    const obs = new ResizeObserver((entries) => {
      for (const entry of entries) {
        applyScale(entry.contentRect.height);
      }
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // 新規コメントを処理
  useEffect(() => {
    if (newComments.length === 0) return;

    for (const comment of newComments) {
      const key = `${comment.id}-${counterRef.current++}`;

      if (comment.position === 'scroll') {
        const lane = laneManagerRef.current.assignLane();
        laneManagerRef.current.occupyLane(lane, scrollSpeedSeconds * 400);
        setScrollingComments((prev) => [...prev, { comment, lane, key }]);
      } else if (comment.position === 'top') {
        setTopComments((prev) => [...prev, { comment, lane: 0, key }]);
      } else if (comment.position === 'bottom') {
        setBottomComments((prev) => [...prev, { comment, lane: 0, key }]);
      }
    }

    onNewCommentsProcessed();
  }, [newComments, scrollSpeedSeconds, onNewCommentsProcessed]);

  // ②削除されたコメントを、流れている途中でも画面から除去する
  useEffect(() => {
    if (removedIds.size === 0) return;
    const drop = (list: ActiveComment[]) =>
      list.filter((a) => !removedIds.has(a.comment.id));
    setScrollingComments(drop);
    setTopComments(drop);
    setBottomComments(drop);
  }, [removedIds]);

  // ブロックされたユーザーのコメントを、流れている途中でも画面から除去する
  useEffect(() => {
    if (blockedUserIds.size === 0) return;
    const drop = (list: ActiveComment[]) =>
      list.filter((a) => !blockedUserIds.has(a.comment.userId));
    setScrollingComments(drop);
    setTopComments(drop);
    setBottomComments(drop);
  }, [blockedUserIds]);

  // animationendイベントでコメントを自動削除（イベント委譲）
  const handleAnimationEnd = useCallback(
    (e: React.AnimationEvent<HTMLDivElement>) => {
      if (e.animationName !== 'scroll-left' && e.animationName !== 'fixed-display') return;
      const target = e.target as HTMLElement;
      const key = target.dataset.commentKey;
      const type = target.dataset.commentType;
      if (!key || !type) return;
      removeComment(key, type);
    },
    [removeComment],
  );

  const pinnedList = useMemo(
    () => pinnedComments.filter((c) => c.isPinned),
    [pinnedComments],
  );

  return (
    <div
      ref={containerRef}
      className="comment-overlay fixed inset-0 overflow-hidden"
      style={{ backgroundColor }}
      onAnimationEnd={handleAnimationEnd}
    >
      {pinnedList.length > 0 && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 z-50 space-y-1">
          {pinnedList.map((c) => (
            <PinnedComment key={c.id} comment={c} />
          ))}
        </div>
      )}

      <div className="absolute top-16 left-0 right-0 flex flex-col items-center z-40 space-y-1">
        {topComments.map(({ comment, key }) => (
          <FixedComment key={key} comment={comment} duration={scrollSpeedSeconds} dataKey={key} />
        ))}
      </div>

      {scrollingComments.map(({ comment, lane, key }) => (
        <ScrollingComment
          key={key}
          comment={comment}
          top={laneManagerRef.current.getTopPosition(lane)}
          duration={scrollSpeedSeconds}
          dataKey={key}
        />
      ))}

      <div className="absolute bottom-4 left-0 right-0 flex flex-col items-center z-40 space-y-1">
        {bottomComments.map(({ comment, key }) => (
          <FixedComment key={key} comment={comment} duration={scrollSpeedSeconds} dataKey={key} />
        ))}
      </div>
    </div>
  );
}

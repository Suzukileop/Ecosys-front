'use client';

import { useCallback, useEffect, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { LikeBurst } from '@/components/ui/LikeBurst';
import { ContentPostShareDialog } from '@/components/creator/ContentPostShareDialog';
import { pushFlashFeedback } from '@/stores/flashFeedbackStore';
import { getReactionCounts, listComments, removeReaction, setReaction } from '@/lib/marketplace-api';
import { useAuth } from '@/context/AuthContext';
import type { ReactionType } from '@/types/marketplace';

type ContentPostSocialBarProps = {
  postId: string;
  initialLikes: number;
  /**
   * Social state already present in the payload that rendered this card. When supplied, the bar
   * skips the two requests it would otherwise make per card — on a feed page that is two round
   * trips per post, which the browser pays before anything can be shown.
   */
  initialCommentCount?: number;
  initialViewerReaction?: ReactionType | null;
  createdAt: string;
  onCommentsToggle?: (open: boolean) => void;
  commentsOpen?: boolean;
  commentCount?: number;
  hideCommentsButton?: boolean;
  /** Timeline: bare icon actions (like, comment) without the date chip. Rail: vertical round buttons. */
  variant?: 'default' | 'timeline' | 'rail';
  commentsDisabled?: boolean;
  trailing?: ReactNode;
  /** Timeline: direct-message link to the author. */
  messageHref?: string;
  /** Timeline: path shared via the native sheet or copied to the clipboard. */
  shareUrl?: string;
  shareTitle?: string;
};

function formatCount(value: number) {
  return new Intl.NumberFormat('en-US').format(value);
}

export function ContentPostCommentsButton({
  commentCount = 0,
  commentsOpen = false,
  onToggle,
  className = '',
}: {
  commentCount?: number;
  commentsOpen?: boolean;
  onToggle?: (open: boolean) => void;
  className?: string;
}) {
  const active = commentsOpen;

  return (
    <button
      type="button"
      onClick={() => onToggle?.(!commentsOpen)}
      aria-expanded={commentsOpen}
      className={`inline-flex w-full items-center justify-center gap-2.5 rounded-xl border px-4 py-3 text-sm font-semibold transition ${
        active
          ? 'border-neutral-400 bg-neutral-100 text-neutral-700 dark:border-neutral-500 dark:bg-neutral-800 dark:text-neutral-200'
          : 'border-neutral-300 bg-transparent text-neutral-500 hover:border-neutral-400 hover:bg-neutral-50 hover:text-neutral-700 dark:border-neutral-600 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-200'
      } ${className}`}
    >
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
        />
      </svg>
      {active ? 'Hide comments' : 'View comments'}
      <span className="tabular-nums">({formatCount(commentCount ?? 0)})</span>
    </button>
  );
}

export function ContentPostSocialBar({
  postId,
  initialLikes,
  createdAt,
  onCommentsToggle,
  commentsOpen = false,
  commentCount: commentCountProp,
  initialCommentCount,
  initialViewerReaction,
  hideCommentsButton = false,
  variant = 'default',
  commentsDisabled = false,
  trailing,
  messageHref,
  shareUrl,
  shareTitle,
}: ContentPostSocialBarProps) {
  const { user, isLoading } = useAuth();
  const socialStateSupplied = initialCommentCount !== undefined;
  const [likes, setLikes] = useState(initialLikes);
  const [userReaction, setUserReaction] = useState<ReactionType | null>(initialViewerReaction ?? null);
  const [commentCount, setCommentCount] = useState(initialCommentCount ?? 0);
  const [busy, setBusy] = useState(false);
  const [burstKey, setBurstKey] = useState(0);
  const [shareOpen, setShareOpen] = useState(false);

  const canInteract = Boolean(user) && !isLoading;

  const [likesSource, setLikesSource] = useState({ initialLikes, postId });
  if (likesSource.initialLikes !== initialLikes || likesSource.postId !== postId) {
    setLikesSource({ initialLikes, postId });
    setLikes(initialLikes);
    if (socialStateSupplied) {
      /* Reused for another post: adopt that post's supplied state instead of keeping the old. */
      setCommentCount(initialCommentCount ?? 0);
      setUserReaction(initialViewerReaction ?? null);
    }
  }

  useEffect(() => {
    /* The payload already carried both counts — fetching them again would only confirm them. */
    if (socialStateSupplied) return;

    let cancelled = false;

    void getReactionCounts('POST', postId)
      .then((counts) => {
        if (!cancelled) {
          setLikes(counts.likes);
          setUserReaction(counts.userReaction === 'LIKE' ? 'LIKE' : null);
        }
      })
      .catch(() => {
        // keep initial values
      });

    void listComments('POST', postId, 0, 1)
      .then((page) => {
        if (!cancelled) setCommentCount(page.totalElements);
      })
      .catch(() => {
        // ignore
      });

    return () => {
      cancelled = true;
    };
  }, [postId, socialStateSupplied]);

  const toggleLike = useCallback(async () => {
    if (!canInteract || busy) return;

    const wasLiked = userReaction === 'LIKE';
    setBusy(true);
    setUserReaction(wasLiked ? null : 'LIKE');
    setLikes((c) => (wasLiked ? Math.max(0, c - 1) : c + 1));
    if (!wasLiked) setBurstKey((k) => k + 1);
    try {
      if (wasLiked) await removeReaction('POST', postId);
      else await setReaction('POST', postId, 'LIKE');
    } catch {
      setUserReaction(wasLiked ? 'LIKE' : null);
      setLikes((c) => (wasLiked ? c + 1 : Math.max(0, c - 1)));
      pushFlashFeedback({ variant: 'error', title: wasLiked ? 'Unable to remove your like' : 'Unable to like this post' });
    } finally {
      setBusy(false);
    }
  }, [busy, canInteract, postId, userReaction]);

  const displayCommentCount = commentCountProp ?? commentCount;

  if (variant === 'rail') {
    const liked = userReaction === 'LIKE';
    const circleClass =
      'relative inline-flex h-6 w-6 items-center justify-center rounded-full border-0 transition-[color,border-color,background-color,transform] duration-200 active:scale-90 sm:h-10 sm:w-10 sm:border';
    const idleCircle =
      'border-black/[0.1] text-neutral-600 group-hover/rail:border-black/25 group-hover/rail:text-[#111111] dark:border-white/[0.14] dark:text-neutral-300 dark:group-hover/rail:border-white/30 dark:group-hover/rail:text-white';
    const labelClass = 'text-[12.5px] tabular-nums text-neutral-500 dark:text-neutral-400';
    const itemClass =
      'group/rail flex items-center gap-2 disabled:cursor-not-allowed disabled:opacity-50';

    return (
      <div
        className="flex w-full items-center gap-5 sm:gap-6"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          disabled={!canInteract}
          onClick={() => void toggleLike()}
          aria-pressed={liked}
          aria-label={liked ? 'Unlike' : 'Like'}
          className={itemClass}
        >
          <span
            className={`${circleClass} ${
              liked
                ? 'border-[#FF5722]/40 text-[#FF5722] sm:bg-[#FF5722]/10'
                : `${idleCircle} group-hover/rail:!text-[#FF5722]`
            }`}
          >
            {liked && burstKey > 0 ? <LikeBurst key={burstKey} burstKey={burstKey} /> : null}
            <svg
              key={liked ? `on-${burstKey}` : 'off'}
              className={`relative h-[18px] w-[18px] ${liked && burstKey > 0 ? 'motion-safe:animate-like-pop' : ''}`}
              fill={liked ? 'currentColor' : 'none'}
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.6}
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </span>
          <span
            key={`count-${likes}`}
            className={`${labelClass} ${liked ? '!text-[#FF5722]' : ''} ${burstKey > 0 ? 'motion-safe:animate-like-count' : ''}`}
          >
            {formatCount(likes)}
          </span>
        </button>

        {!hideCommentsButton ? (
          <button
            type="button"
            disabled={commentsDisabled}
            onClick={() => onCommentsToggle?.(!commentsOpen)}
            aria-expanded={commentsOpen}
            aria-label={commentsDisabled ? 'Comments disabled' : commentsOpen ? 'Hide comments' : 'Show comments'}
            title={commentsDisabled ? 'Comments are disabled' : undefined}
            className={itemClass}
          >
            <span
              className={`${circleClass} ${
                commentsOpen
                  ? 'border-[#111111] text-[#111111] dark:border-white dark:text-white sm:bg-[#111111] sm:text-white dark:sm:bg-white dark:sm:text-[#111111]'
                  : idleCircle
              }`}
            >
              <svg
                className="h-[18px] w-[18px]"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.6}
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="M20.5 11.6c0 4.2-3.8 7.6-8.5 7.6a9.6 9.6 0 0 1-3.6-.7L3.5 20l1.4-3.6a7.1 7.1 0 0 1-1.4-4.8C3.5 7.4 7.3 4 12 4s8.5 3.4 8.5 7.6Z" />
              </svg>
            </span>
            <span className={labelClass}>{formatCount(displayCommentCount)}</span>
          </button>
        ) : null}

        {shareUrl ? (
          <button
            type="button"
            onClick={() => setShareOpen(true)}
            aria-label="Share"
            aria-haspopup="dialog"
            className={`${itemClass} ml-auto`}
          >
            <span className={`${circleClass} ${idleCircle}`}>
              <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6} aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.27 3.13a59.77 59.77 0 0118.22 8.87 59.77 59.77 0 01-18.22 8.88L6 12zm0 0h7.5" />
              </svg>
            </span>
            <span className={`${labelClass} hidden sm:inline`}>Share</span>
          </button>
        ) : null}

        {shareUrl ? (
          <ContentPostShareDialog
            open={shareOpen}
            onClose={() => setShareOpen(false)}
            postId={postId}
            shareUrl={shareUrl}
            shareTitle={shareTitle}
          />
        ) : null}
      </div>
    );
  }

  if (variant === 'timeline') {
    const liked = userReaction === 'LIKE';
    const actionClass =
      'group/action inline-flex items-center gap-2 rounded-full px-2 py-1.5 text-[15px] tabular-nums transition-colors disabled:opacity-60';
    return (
      <div
        className={`-mx-2 flex items-center ${messageHref || shareUrl ? 'justify-between' : 'gap-7'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          disabled={!canInteract}
          onClick={() => void toggleLike()}
          aria-pressed={liked}
          aria-label={liked ? 'Unlike' : 'Like'}
          className={`${actionClass} ${
            liked ? 'text-[#FF5722]' : 'text-neutral-500 hover:text-[#FF5722] dark:text-neutral-400'
          }`}
        >
          <span className="relative inline-flex h-[18px] w-[18px] items-center justify-center">
            {liked && burstKey > 0 ? <LikeBurst key={burstKey} burstKey={burstKey} /> : null}
            <svg
              key={liked ? `on-${burstKey}` : 'off'}
              className={`relative h-[18px] w-[18px] transition-transform duration-150 group-active/action:scale-90 ${
                liked && burstKey > 0 ? 'motion-safe:animate-like-pop' : ''
              }`}
              fill={liked ? 'currentColor' : 'none'}
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.6}
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </span>
          <span className="inline-flex overflow-hidden">
            {likes > 0 ? (
              <span
                key={`count-${likes}`}
                className={`inline-block ${burstKey > 0 ? 'motion-safe:animate-like-count' : ''}`}
              >
                {formatCount(likes)}&nbsp;
              </span>
            ) : null}
            {likes === 1 ? 'Like' : 'Likes'}
          </span>
        </button>
        {!hideCommentsButton ? (
          <button
            type="button"
            disabled={commentsDisabled}
            onClick={() => onCommentsToggle?.(!commentsOpen)}
            aria-expanded={commentsOpen}
            aria-label={commentsDisabled ? 'Comments disabled' : commentsOpen ? 'Hide comments' : 'Show comments'}
            title={commentsDisabled ? 'Comments are disabled' : undefined}
            className={`${actionClass} ${
              commentsOpen
                ? 'text-[#111111] dark:text-white'
                : 'text-neutral-500 hover:text-[#111111] dark:text-neutral-400 dark:hover:text-white'
            } disabled:cursor-not-allowed disabled:hover:text-neutral-500`}
          >
            <svg
              className="h-[18px] w-[18px]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.6}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z" />
            </svg>
            <span>
              {displayCommentCount > 0 ? `${formatCount(displayCommentCount)} ` : ''}
              {displayCommentCount === 1 ? 'Comment' : 'Comments'}
            </span>
          </button>
        ) : null}
        {messageHref ? (
          <Link
            href={messageHref}
            aria-label="Send a message"
            className={`${actionClass} text-neutral-500 hover:text-[#111111] dark:text-neutral-400 dark:hover:text-white`}
          >
            <svg
              className="h-[18px] w-[18px]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.6}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M20.5 11.6c0 4.2-3.8 7.6-8.5 7.6a9.6 9.6 0 0 1-3.6-.7L3.5 20l1.4-3.6a7.1 7.1 0 0 1-1.4-4.8C3.5 7.4 7.3 4 12 4s8.5 3.4 8.5 7.6Z" />
              <path d="M8.6 11.7h.01M12 11.7h.01M15.4 11.7h.01" />
            </svg>
            <span className="hidden sm:inline">Message</span>
          </Link>
        ) : null}
        {shareUrl ? (
          <button
            type="button"
            onClick={() => setShareOpen(true)}
            aria-label="Share"
            aria-haspopup="dialog"
            className={`${actionClass} text-neutral-500 hover:text-[#111111] dark:text-neutral-400 dark:hover:text-white`}
          >
            <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6} aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.27 3.13a59.77 59.77 0 0118.22 8.87 59.77 59.77 0 01-18.22 8.88L6 12zm0 0h7.5" />
            </svg>
            <span className="hidden sm:inline">Share</span>
          </button>
        ) : null}
        {trailing ? <div className="ml-auto flex items-center">{trailing}</div> : null}
        {shareUrl ? (
          <ContentPostShareDialog
            open={shareOpen}
            onClose={() => setShareOpen(false)}
            postId={postId}
            shareUrl={shareUrl}
            shareTitle={shareTitle}
          />
        ) : null}
      </div>
    );
  }

  const pillClass = (active: boolean) =>
    `inline-flex items-center gap-1.5 rounded-full bg-neutral-100 px-3 py-1.5 text-sm font-medium transition disabled:opacity-60 dark:bg-neutral-800 ${
      active
        ? 'text-orange-600 dark:text-orange-400'
        : 'text-neutral-600 hover:bg-neutral-200 dark:text-neutral-300 dark:hover:bg-neutral-700'
    }`;

  return (
    <div
      className="flex items-center justify-between gap-3 pt-1"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex flex-wrap items-center gap-2">
        {canInteract ? (
          <button
            type="button"
            disabled={busy}
            onClick={() => void toggleLike()}
            className={pillClass(userReaction === 'LIKE')}
            aria-pressed={userReaction === 'LIKE'}
            aria-label="Like"
          >
            <svg
              className="h-4 w-4"
              fill={userReaction === 'LIKE' ? 'currentColor' : 'none'}
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.75}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
            {formatCount(likes)}
          </button>
        ) : (
          <span className={pillClass(false)}>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
            {formatCount(likes)}
          </span>
        )}

        {!hideCommentsButton && (
          <button
            type="button"
            onClick={() => onCommentsToggle?.(!commentsOpen)}
            className={pillClass(commentsOpen)}
            aria-expanded={commentsOpen}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            {formatCount(displayCommentCount)}
          </button>
        )}
      </div>

      <time
        className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-neutral-100 px-3 py-1.5 text-sm font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300"
        dateTime={createdAt}
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6.75 3v2.25M17.25 3v2.25M3.75 8.25h16.5M4.5 6.75h15a1.5 1.5 0 011.5 1.5v11.25a1.5 1.5 0 01-1.5 1.5h-15a1.5 1.5 0 01-1.5-1.5V8.25a1.5 1.5 0 011.5-1.5z"
          />
        </svg>
        {new Date(createdAt).toLocaleDateString()}
      </time>
    </div>
  );
}

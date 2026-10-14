'use client';

import { localeTag } from '@/lib/i18n/active';
import { useCallback, useEffect, useId, useRef, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { LikeBurst } from '@/components/ui/LikeBurst';
import { ContentPostShareDialog } from '@/components/creator/ContentPostShareDialog';
import { pushFlashFeedback } from '@/stores/flashFeedbackStore';
import { ContentPostRepostDialog } from '@/components/creator/ContentPostRepostDialog';
import {
  addFavorite,
  getReactionCounts,
  listComments,
  removeFavorite,
  removeReaction,
  setReaction,
  undoRepostContent,
} from '@/lib/marketplace-api';
import { getApiErrorMessage } from '@/lib/api-error';
import { useAuth } from '@/context/AuthContext';
import type { PublicContentFeedItem, ReactionType } from '@/types/marketplace';
import { useT } from '@/lib/i18n/I18nProvider';

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
  /** Timeline: bare icon actions (like, comment) without the date chip. Rail: round buttons (studio).
   *  Feed: the News card's equal-width action bar, coloured from the `.news-theme` tokens. */
  variant?: 'default' | 'timeline' | 'rail' | 'feed';
  commentsDisabled?: boolean;
  trailing?: ReactNode;
  /** Timeline: direct-message link to the author. */
  messageHref?: string;
  /** Timeline: path shared via the native sheet or copied to the clipboard. */
  shareUrl?: string;
  shareTitle?: string;
  /**
   * Rail: the post the repost button acts on — the original when this card is itself a repost.
   * Leave unset to hide the button (own posts, surfaces that do not repost).
   */
  repostTarget?: PublicContentFeedItem;
  initialRepostCount?: number;
  initialViewerReposted?: boolean | null;
  /** Rail: show the save (bookmark) button. */
  saveable?: boolean;
  initialViewerSaved?: boolean | null;
  /** Offered as the "Add to collection" action of the toast shown after saving. */
  onAddToCollection?: () => void;
  onReposted?: (repost: PublicContentFeedItem) => void;
  onRepostUndone?: () => void;
};

function formatCount(value: number) {
  return new Intl.NumberFormat(localeTag()).format(value);
}

/**
 * Broadcast whenever the viewer reposts / un-reposts a post, so every card showing that post (the
 * original, the viewer's own repost of it) follows instead of keeping a stale button.
 */
/** Broadcast when a post becomes saved / unsaved outside its bookmark button (collections dialog). */
export const SAVED_POST_CHANGE_EVENT = 'news-saved-post-change';
export type SavedPostChangeDetail = { postId: string; saved: boolean };

export const REPOST_CHANGE_EVENT = 'news-repost-change';
export type RepostChangeDetail = { originalId: string; reposted: boolean; source: string };

function announceRepostChange(detail: RepostChangeDetail) {
  window.dispatchEvent(new CustomEvent<RepostChangeDetail>(REPOST_CHANGE_EVENT, { detail }));
}

/** The server no longer has that repost (already undone elsewhere) — the viewer's goal is met. */
function isRepostAlreadyGone(error: unknown): boolean {
  const data = (error as { response?: { data?: { code?: string; error?: string } } })?.response?.data;
  return data?.code === 'REPOST_NOT_FOUND' || data?.error === 'REPOST_NOT_FOUND';
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
  const t = useT();
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
      {active ? t('Hide comments') : t('View comments')}
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
  repostTarget,
  initialRepostCount = 0,
  initialViewerReposted,
  saveable = false,
  initialViewerSaved,
  onAddToCollection,
  onReposted,
  onRepostUndone,
}: ContentPostSocialBarProps) {
  const t = useT();
  const { user, isLoading, hasRole } = useAuth();
  const socialStateSupplied = initialCommentCount !== undefined;
  const [likes, setLikes] = useState(initialLikes);
  const [userReaction, setUserReaction] = useState<ReactionType | null>(initialViewerReaction ?? null);
  const [commentCount, setCommentCount] = useState(initialCommentCount ?? 0);
  const [busy, setBusy] = useState(false);
  const [burstKey, setBurstKey] = useState(0);
  const [shareOpen, setShareOpen] = useState(false);
  const [saved, setSaved] = useState(initialViewerSaved === true);
  const [savedBusy, setSavedBusy] = useState(false);
  const [reposted, setReposted] = useState(initialViewerReposted === true);
  const [repostCount, setRepostCount] = useState(initialRepostCount);
  const [repostBusy, setRepostBusy] = useState(false);
  const [repostOpen, setRepostOpen] = useState(false);
  const instanceId = useId();
  /* Mirrors `reposted` for the cross-card listener, which must not re-subscribe on every toggle. */
  const repostedRef = useRef(reposted);
  useEffect(() => {
    repostedRef.current = reposted;
  }, [reposted]);

  const canInteract = Boolean(user) && !isLoading;

  const [likesSource, setLikesSource] = useState({ initialLikes, postId });
  if (likesSource.initialLikes !== initialLikes || likesSource.postId !== postId) {
    setLikesSource({ initialLikes, postId });
    setLikes(initialLikes);
    setSaved(initialViewerSaved === true);
    setReposted(initialViewerReposted === true);
    setRepostCount(initialRepostCount);
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
          setSaved(counts.favorited);
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
      pushFlashFeedback({ variant: 'error', title: wasLiked ? t('Unable to remove your like') : t('Unable to like this post') });
    } finally {
      setBusy(false);
    }
  }, [busy, canInteract, postId, userReaction, t]);

  /* Filing a post in a collection saves it — light the bookmark of every card showing that post. */
  useEffect(() => {
    const onFiled = (event: Event) => {
      const detail = (event as CustomEvent<SavedPostChangeDetail>).detail;
      if (detail?.postId === postId) setSaved(detail.saved);
    };
    window.addEventListener(SAVED_POST_CHANGE_EVENT, onFiled);
    return () => window.removeEventListener(SAVED_POST_CHANGE_EVENT, onFiled);
  }, [postId]);

  const toggleSaved = useCallback(async () => {
    if (!canInteract || savedBusy) return;
    const wasSaved = saved;
    setSavedBusy(true);
    setSaved(!wasSaved);
    try {
      if (wasSaved) await removeFavorite('POST', postId);
      else await addFavorite('POST', postId);
      pushFlashFeedback({
        variant: 'success',
        title: wasSaved ? t('Removed from saved') : t('Post saved'),
        ...(!wasSaved && onAddToCollection
          ? { actionLabel: t('Add to collection'), onAction: onAddToCollection }
          : {}),
      });
    } catch {
      setSaved(wasSaved);
      pushFlashFeedback({ variant: 'error', title: wasSaved ? t('Unable to unsave this post') : t('Unable to save this post') });
    } finally {
      setSavedBusy(false);
    }
  }, [canInteract, onAddToCollection, postId, saved, savedBusy, t]);

  const isCreator = hasRole('ROLE_CREATOR');
  const onRepostClick = useCallback(async () => {
    if (!repostTarget || repostBusy) return;
    if (!canInteract) {
      pushFlashFeedback({ variant: 'info', title: t('Sign in to repost') });
      return;
    }
    if (!isCreator) {
      pushFlashFeedback({
        variant: 'info',
        title: t('Only creators can repost'),
        description: t('Become a creator to share other people’s work on your profile.'),
      });
      return;
    }
    if (!reposted) {
      setRepostOpen(true);
      return;
    }
    setRepostBusy(true);
    try {
      let alreadyGone = false;
      try {
        await undoRepostContent(repostTarget.id);
      } catch (e) {
        if (!isRepostAlreadyGone(e)) throw e;
        alreadyGone = true;
      }
      setReposted(false);
      if (!alreadyGone) setRepostCount((count) => Math.max(0, count - 1));
      announceRepostChange({ originalId: repostTarget.id, reposted: false, source: instanceId });
      onRepostUndone?.();
      pushFlashFeedback({ variant: 'success', title: t('Repost removed') });
    } catch (e) {
      pushFlashFeedback({ variant: 'error', title: getApiErrorMessage(e, t('Unable to remove your repost')) });
    } finally {
      setRepostBusy(false);
    }
  }, [canInteract, instanceId, isCreator, onRepostUndone, repostBusy, repostTarget, reposted, t]);

  /* Another card for the same post changed the repost: follow it. */
  const repostTargetId = repostTarget?.id;
  useEffect(() => {
    if (!repostTargetId) return undefined;
    const onChange = (event: Event) => {
      const detail = (event as CustomEvent<RepostChangeDetail>).detail;
      if (!detail || detail.source === instanceId || detail.originalId !== repostTargetId) return;
      if (repostedRef.current === detail.reposted) return;
      repostedRef.current = detail.reposted;
      setReposted(detail.reposted);
      setRepostCount((count) => Math.max(0, count + (detail.reposted ? 1 : -1)));
    };
    window.addEventListener(REPOST_CHANGE_EVENT, onChange);
    return () => window.removeEventListener(REPOST_CHANGE_EVENT, onChange);
  }, [instanceId, repostTargetId]);

  const displayCommentCount = commentCountProp ?? commentCount;

  if (variant === 'feed') {
    /*
     * News feed action bar, editorial layout: the conversation actions (like, comment, repost,
     * share) read as one cluster from the left edge, and Save stands alone on the right — a
     * bookmark is about the reader, not the conversation. Thin outline icons in secondary ink; an
     * active state fills the icon solid. Counts only appear above zero. Colours come from the
     * `.news-theme` tokens (the X black / white palette).
     */
    const liked = userReaction === 'LIKE';
    // The button fills its cell (a generous hit area) but draws nothing itself; the visible hover /
    // active shape is a 36px circle around the icon only. Painting the button instead turned the
    // feedback into a 146px-wide pill.
    const cell =
      'group/act relative flex h-10 min-w-0 items-center gap-0.5 pr-3 text-[13px] font-medium leading-4 tabular-nums transition-colors duration-150 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-40';
    const disc =
      'relative inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors duration-150 group-focus-visible/act:ring-2 group-focus-visible/act:ring-[color:var(--gn-ring)]';
    // The fill tone (#EFF3F4 / #2A2D32), the page's one "interactive" grey — the plain hover wash
    // read too faint to say "this is a button".
    const discIdle = 'group-hover/act:bg-[color:var(--gn-hover-strong,var(--gn-hover))]';
    const idle = 'text-[color:var(--gn-ink2)] hover:text-[color:var(--gn-ink)]';
    const on = 'text-[color:var(--gn-ink)]';
    const icon = 'h-5 w-5 shrink-0';

    return (
      <>
      <div
        className="flex w-full items-center gap-2 sm:gap-4"
        role="group"
        aria-label={t('Post actions')}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          disabled={!canInteract}
          onClick={() => void toggleLike()}
          aria-pressed={liked}
          aria-label={liked ? t('Unlike ({formatCount} likes)', { formatCount: formatCount(likes) }) : t('Like ({formatCount} likes)', { formatCount: formatCount(likes) })}
          className={`${cell} ${
            liked
              ? 'text-[color:var(--gn-like-ink)]'
              : 'text-[color:var(--gn-ink2)] hover:text-[color:var(--gn-like-ink)]'
          }`}
        >
          <span
            className={`${disc} ${
              liked ? 'bg-[color:var(--gn-like-tint)]' : 'group-hover/act:bg-[color:var(--gn-like-tint)]'
            }`}
          >
            {liked && burstKey > 0 ? <LikeBurst key={burstKey} burstKey={burstKey} /> : null}
            <svg
              key={liked ? `on-${burstKey}` : 'off'}
              className={`relative ${icon} ${liked ? 'text-[color:var(--gn-like)]' : ''} ${
                liked && burstKey > 0 ? 'motion-safe:animate-like-pop' : ''
              }`}
              fill={liked ? 'currentColor' : 'none'}
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.7}
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </span>
          {likes > 0 ? (
            <span key={`count-${likes}`} className={burstKey > 0 ? 'motion-safe:animate-like-count' : ''}>
              {formatCount(likes)}
            </span>
          ) : null}
        </button>

        {!hideCommentsButton ? (
          <button
            type="button"
            disabled={commentsDisabled}
            onClick={() => onCommentsToggle?.(!commentsOpen)}
            aria-expanded={commentsOpen}
            aria-label={commentsDisabled ? t('Comments disabled') : commentsOpen ? t('Hide comments') : t('Show comments')}
            title={commentsDisabled ? t('Comments are disabled') : undefined}
            className={`${cell} ${commentsOpen ? on : idle}`}
          >
            <span className={`${disc} ${commentsOpen ? 'bg-[color:var(--gn-hover)]' : discIdle}`}>
            <svg
              className={icon}
              viewBox="0 0 24 24"
              fill={commentsOpen ? 'currentColor' : 'none'}
              stroke="currentColor"
              strokeWidth={1.7}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M20.5 11.6c0 4.2-3.8 7.6-8.5 7.6a9.6 9.6 0 0 1-3.6-.7L3.5 20l1.4-3.6a7.1 7.1 0 0 1-1.4-4.8C3.5 7.4 7.3 4 12 4s8.5 3.4 8.5 7.6Z" />
            </svg>
            </span>
            {displayCommentCount > 0 ? <span>{formatCount(displayCommentCount)}</span> : null}
          </button>
        ) : null}

        {repostTarget ? (
          <button
            type="button"
            disabled={repostBusy}
            onClick={() => void onRepostClick()}
            aria-pressed={reposted}
            aria-label={reposted ? t('Undo repost') : t('Repost')}
            aria-haspopup={reposted ? undefined : 'dialog'}
            title={reposted ? t('You reposted this — click to undo') : t('Repost')}
            className={`${cell} ${reposted ? on : idle}`}
          >
            <span className={`${disc} ${reposted ? 'bg-[color:var(--gn-hover)]' : discIdle}`}>
            <svg
              className={icon}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={reposted ? 2.3 : 1.7}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="m17 2 4 4-4 4" />
              <path d="M3 11v-1a4 4 0 0 1 4-4h14" />
              <path d="m7 22-4-4 4-4" />
              <path d="M21 13v1a4 4 0 0 1-4 4H3" />
            </svg>
            </span>
            {repostCount > 0 ? <span className={reposted ? 'font-semibold' : ''}>{formatCount(repostCount)}</span> : null}
          </button>
        ) : null}

        {shareUrl ? (
          <button
            type="button"
            onClick={() => setShareOpen(true)}
            aria-label={t('Share')}
            aria-haspopup="dialog"
            className={`${cell} ${idle}`}
          >
            <span className={`${disc} ${discIdle}`}>
            <svg className={icon} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7} aria-hidden>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 12L3.27 3.13a59.77 59.77 0 0118.22 8.87 59.77 59.77 0 01-18.22 8.88L6 12zm0 0h7.5"
              />
            </svg>
            </span>
          </button>
        ) : null}
        {saveable ? (
          <button
            type="button"
            disabled={!canInteract || savedBusy}
            onClick={() => void toggleSaved()}
            aria-pressed={saved}
            aria-label={saved ? t('Remove from saved') : t('Save')}
            title={saved ? t('Saved') : t('Save')}
            className={`${cell} ml-auto !pr-0 ${saved ? on : idle}`}
          >
            <span className={`${disc} ${discIdle}`}>
            <svg
              className={icon}
              viewBox="0 0 24 24"
              fill={saved ? 'currentColor' : 'none'}
              stroke="currentColor"
              strokeWidth={1.7}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M6.5 3.5h11a1 1 0 0 1 1 1V20l-6.5-4.2L5.5 20V4.5a1 1 0 0 1 1-1Z" />
            </svg>
            </span>
          </button>
        ) : null}

      </div>

        {shareUrl ? (
          <ContentPostShareDialog
            open={shareOpen}
            onClose={() => setShareOpen(false)}
            postId={postId}
            shareUrl={shareUrl}
            shareTitle={shareTitle}
          />
        ) : null}

        {repostTarget ? (
          <ContentPostRepostDialog
            open={repostOpen}
            original={repostTarget}
            onClose={() => setRepostOpen(false)}
            onReposted={(repost) => {
              setRepostOpen(false);
              setReposted(true);
              setRepostCount((count) => count + 1);
              onReposted?.(repost);
              pushFlashFeedback({ variant: 'success', title: t('Reposted to your profile') });
            }}
          />
        ) : null}
      </>
    );
  }

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
        className="flex w-full items-center justify-between gap-2"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          disabled={!canInteract}
          onClick={() => void toggleLike()}
          aria-pressed={liked}
          aria-label={liked ? t('Unlike') : t('Like')}
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
            className={`${labelClass} ${liked ? 'gn-like !text-[#FF5722]' : ''} ${burstKey > 0 ? 'motion-safe:animate-like-count' : ''}`}
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
            aria-label={commentsDisabled ? t('Comments disabled') : commentsOpen ? t('Hide comments') : t('Show comments')}
            title={commentsDisabled ? t('Comments are disabled') : undefined}
            className={itemClass}
          >
            <span
              className={`${circleClass} ${
                commentsOpen
                  ? 'gn-disc-on border-[#111111] text-[#111111] dark:border-white dark:text-white sm:bg-[#111111] sm:text-white dark:sm:bg-white dark:sm:text-[#111111]'
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

        {repostTarget ? (
          <button
            type="button"
            disabled={repostBusy}
            onClick={() => void onRepostClick()}
            aria-pressed={reposted}
            aria-label={reposted ? t('Undo repost') : t('Repost')}
            aria-haspopup={reposted ? undefined : 'dialog'}
            title={reposted ? t('You reposted this - click to undo') : t('Repost')}
            className={itemClass}
          >
            <span
              className={`${circleClass} ${
                reposted
                  ? 'gn-disc-on border-[#111111] text-[#111111] dark:border-white dark:text-white sm:bg-[#111111] sm:text-white dark:sm:bg-white dark:sm:text-[#111111]'
                  : idleCircle
              }`}
            >
              <svg
                className="h-[18px] w-[18px]"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={reposted ? 2 : 1.6}
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="m17 2 4 4-4 4" />
                <path d="M3 11v-1a4 4 0 0 1 4-4h14" />
                <path d="m7 22-4-4 4-4" />
                <path d="M21 13v1a4 4 0 0 1-4 4H3" />
              </svg>
            </span>
            <span className={labelClass}>{formatCount(repostCount)}</span>
          </button>
        ) : null}

        {saveable || shareUrl ? (
          <div className="contents">
            {saveable ? (
              <button
                type="button"
                disabled={!canInteract || savedBusy}
                onClick={() => void toggleSaved()}
                aria-pressed={saved}
                aria-label={saved ? t('Remove from saved') : t('Save')}
                title={saved ? t('Saved') : t('Save')}
                className={itemClass}
              >
                <span
                  className={`${circleClass} ${
                    saved
                      ? 'gn-disc-soft border-[#111111]/40 text-[#111111] dark:border-white/50 dark:text-white sm:bg-black/[0.06] dark:sm:bg-white/[0.1]'
                      : idleCircle
                  }`}
                >
                  <svg
                    className="h-[18px] w-[18px]"
                    viewBox="0 0 24 24"
                    fill={saved ? 'currentColor' : 'none'}
                    stroke="currentColor"
                    strokeWidth={1.6}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden
                  >
                    <path d="M6.5 3.5h11a1 1 0 0 1 1 1V20l-6.5-4.2L5.5 20V4.5a1 1 0 0 1 1-1Z" />
                  </svg>
                </span>
              </button>
            ) : null}

            {shareUrl ? (
              <button
                type="button"
                onClick={() => setShareOpen(true)}
                aria-label={t('Share')}
                aria-haspopup="dialog"
                className={itemClass}
              >
                <span className={`${circleClass} ${idleCircle}`}>
                  <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6} aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.27 3.13a59.77 59.77 0 0118.22 8.87 59.77 59.77 0 01-18.22 8.88L6 12zm0 0h7.5" />
                  </svg>
                </span>
                <span className={`${labelClass} hidden sm:inline`}>{t('Share')}</span>
              </button>
            ) : null}
          </div>
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

        {repostTarget ? (
          <ContentPostRepostDialog
            open={repostOpen}
            original={repostTarget}
            onClose={() => setRepostOpen(false)}
            onReposted={(repost) => {
              setRepostOpen(false);
              setReposted(true);
              setRepostCount((count) => count + 1);
              announceRepostChange({ originalId: repostTarget.id, reposted: true, source: instanceId });
              onReposted?.(repost);
              pushFlashFeedback({ variant: 'success', title: t('Reposted to your profile') });
            }}
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
          aria-label={liked ? t('Unlike') : t('Like')}
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
            {likes === 1 ? t('Like') : t('Likes')}
          </span>
        </button>
        {!hideCommentsButton ? (
          <button
            type="button"
            disabled={commentsDisabled}
            onClick={() => onCommentsToggle?.(!commentsOpen)}
            aria-expanded={commentsOpen}
            aria-label={commentsDisabled ? t('Comments disabled') : commentsOpen ? t('Hide comments') : t('Show comments')}
            title={commentsDisabled ? t('Comments are disabled') : undefined}
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
              {displayCommentCount === 1 ? t('Comment') : t('Comments')}
            </span>
          </button>
        ) : null}
        {messageHref ? (
          <Link
            href={messageHref}
            aria-label={t('Send a message')}
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
            <span className="hidden sm:inline">{t('Message')}</span>
          </Link>
        ) : null}
        {shareUrl ? (
          <button
            type="button"
            onClick={() => setShareOpen(true)}
            aria-label={t('Share')}
            aria-haspopup="dialog"
            className={`${actionClass} text-neutral-500 hover:text-[#111111] dark:text-neutral-400 dark:hover:text-white`}
          >
            <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6} aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.27 3.13a59.77 59.77 0 0118.22 8.87 59.77 59.77 0 01-18.22 8.88L6 12zm0 0h7.5" />
            </svg>
            <span className="hidden sm:inline">{t('Share')}</span>
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
            aria-label={t('Like')}
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

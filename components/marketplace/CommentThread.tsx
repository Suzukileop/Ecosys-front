'use client';

import { localeTag, trPlural, tr } from '@/lib/i18n/active';
import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CommentReactionBar } from '@/components/marketplace/CommentReactionBar';
import { CommentReportModal } from '@/components/marketplace/CommentReportModal';
import { ContentPostDialogShell } from '@/components/creator/ContentPostDialogShell';
import {
  deleteComment,
  hideComment,
  listComments,
  postComment,
  unhideComment,
} from '@/lib/marketplace-api';
import { getApiErrorMessage } from '@/lib/api-error';
import { AvatarImage } from '@/components/ui/PersonAvatar';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useAuth } from '@/context/AuthContext';
import type { MarketplaceComment, ReactionType, SocialTargetType } from '@/types/marketplace';
import { useT } from '@/lib/i18n/I18nProvider';

const commentSchema = z.object({
  comment: z.string().min(1, 'Comment cannot be empty.').max(2000, 'Comment is too long.'),
});

type CommentFormValues = z.infer<typeof commentSchema>;

type CommentThreadProps = {
  targetType: SocialTargetType;
  targetId: string;
  isAuthenticated: boolean;
  loginRedirect: string;
  variant?: 'default' | 'panel';
  className?: string;
  onClose?: () => void;
  onCountChange?: (count: number) => void;
  commentsEnabled?: boolean;
  moderationMode?: boolean;
  /**
   * Inline under a post: show only this many top-level comments, then "View all N comments", which
   * opens the whole thread in a modal (scrolling list, composer pinned at the bottom) — the feed
   * never grows by dozens of comments.
   */
  previewCount?: number;
  /**
   * A comment to land on (a notification deep link): the thread unfolds whatever hides it (the
   * "Show all" preview, a folded reply chain), scrolls it to the middle of the screen and
   * highlights it for a few seconds.
   */
  focusCommentId?: string | null;
};

/** What the rows need to know about the deep-linked comment. */
const CommentFocusContext = createContext<{ focusId: string | null; openReplyIds: ReadonlySet<string> }>({
  focusId: null,
  openReplyIds: new Set(),
});

/** Ids from a top-level comment down to `targetId` (inclusive), or null when it is not in the tree. */
function findCommentPath(comments: MarketplaceComment[], targetId: string): string[] | null {
  for (const comment of comments) {
    if (comment.id === targetId) return [comment.id];
    const inner = comment.replies?.length ? findCommentPath(comment.replies, targetId) : null;
    if (inner) return [comment.id, ...inner];
  }
  return null;
}

const FOCUS_HIGHLIGHT_MS = 3800;

function countAllComments(comments: MarketplaceComment[]): number {
  return comments.reduce((total, comment) => total + 1 + countAllComments(comment.replies ?? []), 0);
}

function appendReply(
  comments: MarketplaceComment[],
  parentId: string,
  reply: MarketplaceComment
): MarketplaceComment[] {
  return comments.map((comment) => {
    if (comment.id === parentId) {
      return { ...comment, replies: [...(comment.replies ?? []), reply] };
    }
    if (comment.replies?.length) {
      return { ...comment, replies: appendReply(comment.replies, parentId, reply) };
    }
    return comment;
  });
}

function updateCommentTree(
  comments: MarketplaceComment[],
  commentId: string,
  updater: (comment: MarketplaceComment) => MarketplaceComment
): MarketplaceComment[] {
  return comments.map((comment) => {
    if (comment.id === commentId) return updater(comment);
    if (comment.replies?.length) {
      return { ...comment, replies: updateCommentTree(comment.replies, commentId, updater) };
    }
    return comment;
  });
}

function removeCommentTree(comments: MarketplaceComment[], commentId: string): MarketplaceComment[] {
  return comments
    .filter((comment) => comment.id !== commentId)
    .map((comment) => ({
      ...comment,
      replies: comment.replies?.length ? removeCommentTree(comment.replies, commentId) : comment.replies,
    }));
}

/* X palette, used by every comment surface (feed, studio, lightbox, side panel). */
const INK = 'text-[#0F1419] dark:text-[#E7E9EA]';
const INK2 = 'text-[#536471] dark:text-[#71767B]';
/** Reply / View replies / See more: a stronger secondary ink than INK2 (readable at 13px on the tinted drawer). */
const TEXT_BUTTON =
  'rounded-full px-1.5 py-1 text-[13px] font-semibold text-[#3A4550] transition-colors hover:text-[#0F1419] hover:underline dark:text-[#AAB0B5] dark:hover:text-[#E7E9EA]';

/** "now", "5m", "3h", "2d", then "Sep 29" (with the year when it is not this one) — like the posts. */
function formatCommentTime(iso: string): string {
  const date = new Date(iso);
  const seconds = Math.max(0, Math.round((Date.now() - date.getTime()) / 1000));
  if (seconds < 60) return tr('now');
  if (seconds < 3600) return tr('{count}m', { count: Math.floor(seconds / 60) });
  if (seconds < 86400) return tr('{count}h', { count: Math.floor(seconds / 3600) });
  if (seconds < 7 * 86400) return tr('{count}d', { count: Math.floor(seconds / 86400) });
  const sameYear = date.getFullYear() === new Date().getFullYear();
  return date.toLocaleDateString(localeTag(), { month: 'short', day: 'numeric', ...(sameYear ? {} : { year: 'numeric' }) });
}

const COMMENT_CLAMP_LINES = 4;

/** A comment's text, clamped to four lines with "See more" when it is longer. */
function CommentText({ text }: { text: string }) {
  const t = useT();
  const ref = useRef<HTMLParagraphElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [overflows, setOverflows] = useState(false);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || expanded) return;
    const measure = () => setOverflows(el.scrollHeight - el.clientHeight > 1);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [text, expanded]);

  return (
    <>
      <p
        ref={ref}
        className={`mt-0.5 whitespace-pre-wrap break-words text-[15px] leading-5 ${INK}`}
        style={
          expanded
            ? undefined
            : { display: '-webkit-box', WebkitBoxOrient: 'vertical', WebkitLineClamp: COMMENT_CLAMP_LINES, overflow: 'hidden' }
        }
      >
        {text}
      </p>
      {overflows && !expanded ? (
        <button type="button" onClick={() => setExpanded(true)} className={`-ml-1.5 mt-0.5 ${TEXT_BUTTON}`}>
          {t('See more')}
        </button>
      ) : null}
    </>
  );
}

function CommentActionsMenu({
  comment,
  currentUserId,
  moderationMode,
  onDelete,
  onHide,
  onUnhide,
  onReport,
}: {
  comment: MarketplaceComment;
  currentUserId?: string | null;
  moderationMode: boolean;
  onDelete: () => void;
  onHide: () => void;
  onUnhide: () => void;
  onReport: () => void;
}) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const isAuthor = Boolean(currentUserId && comment.userId === currentUserId);
  const canDelete = isAuthor || moderationMode;
  const canHide = moderationMode && !comment.hidden;
  const canUnhide = moderationMode && Boolean(comment.hidden);
  const canReport = Boolean(currentUserId && !isAuthor && !moderationMode);

  if (!canDelete && !canHide && !canUnhide && !canReport) return null;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`inline-flex h-8 w-8 items-center justify-center rounded-full ${INK2} transition-colors hover:bg-[rgba(15,20,25,0.06)] hover:text-[#0F1419] dark:hover:bg-[rgba(231,233,234,0.1)] dark:hover:text-[#E7E9EA]`}
        aria-label={t('Comment actions')}
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <circle cx="5" cy="12" r="1.6" />
          <circle cx="12" cy="12" r="1.6" />
          <circle cx="19" cy="12" r="1.6" />
        </svg>
      </button>
      {open && (
        <>
          <button type="button" className="fixed inset-0 z-10 cursor-default" aria-label={t('Close')} onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full z-20 mt-1 min-w-[10rem] overflow-hidden rounded-xl bg-white py-1 shadow-[0_0_15px_rgba(101,119,134,0.2),0_0_3px_1px_rgba(101,119,134,0.15)] dark:bg-black dark:shadow-[0_0_15px_rgba(255,255,255,0.2),0_0_3px_1px_rgba(255,255,255,0.15)]">
            {canReport && (
              <button type="button" onClick={() => { setOpen(false); onReport(); }} className="block w-full px-4 py-2.5 text-left text-[15px] font-semibold text-[#0F1419] hover:bg-[rgba(15,20,25,0.04)] dark:text-[#E7E9EA] dark:hover:bg-[rgba(231,233,234,0.06)]">
                {t('Report')}
              </button>
            )}
            {canHide && (
              <button type="button" onClick={() => { setOpen(false); onHide(); }} className="block w-full px-4 py-2.5 text-left text-[15px] font-semibold text-[#0F1419] hover:bg-[rgba(15,20,25,0.04)] dark:text-[#E7E9EA] dark:hover:bg-[rgba(231,233,234,0.06)]">
                {t('Hide')}
              </button>
            )}
            {canUnhide && (
              <button type="button" onClick={() => { setOpen(false); onUnhide(); }} className="block w-full px-4 py-2.5 text-left text-[15px] font-semibold text-[#0F1419] hover:bg-[rgba(15,20,25,0.04)] dark:text-[#E7E9EA] dark:hover:bg-[rgba(231,233,234,0.06)]">
                {t('Unhide')}
              </button>
            )}
            {canDelete && (
              <button type="button" onClick={() => { setOpen(false); onDelete(); }} className="block w-full px-4 py-2.5 text-left text-[15px] font-semibold text-[#F4212E] hover:bg-[rgba(15,20,25,0.04)] dark:hover:bg-[rgba(231,233,234,0.06)]">
                {t('Delete')}
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function CommentAvatar({ name, avatarUrl }: { name: string; avatarUrl?: string | null }) {
  return (
    <AvatarImage
      src={avatarUrl}
      className="h-8 w-8 shrink-0 rounded-full object-cover"
      fallback={
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#EFF3F4] text-xs font-semibold text-[#536471] dark:bg-[#202327] dark:text-[#71767B]">
          {name.slice(0, 2).toUpperCase()}
        </div>
      }
    />
  );
}

const REPLY_MAX_HEIGHT_PX = 160;

function ReplyForm({
  onSubmit,
  onCancel,
  submitting,
  replyToName,
}: {
  onSubmit: (text: string) => Promise<void>;
  onCancel: () => void;
  submitting: boolean;
  replyToName: string;
}) {
  const t = useT();
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<CommentFormValues>({
    resolver: zodResolver(commentSchema),
    defaultValues: { comment: '' },
  });
  const field = register('comment');
  const hasText = (watch('comment') ?? '').trim().length > 0;

  const fitHeight = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, REPLY_MAX_HEIGHT_PX)}px`;
  };

  const submit = async (data: CommentFormValues) => {
    await onSubmit(data.comment.trim());
    reset();
    requestAnimationFrame(fitHeight);
  };

  return (
    <form
      onSubmit={(e) => void handleSubmit(submit)(e)}
      className="mt-2 rounded-2xl bg-[#F7F9F9] px-4 pb-3 pt-3 dark:bg-[#16181C]"
    >
      <p className={`text-[13px] ${INK2}`}>
        {t('Replying to')} <span className={`font-semibold ${INK}`}>{replyToName}</span>
      </p>
      <textarea
        {...field}
        ref={(el) => {
          field.ref(el);
          textareaRef.current = el;
        }}
        rows={1}
        autoFocus
        autoComplete="off"
        placeholder={t('Post your reply')}
        onInput={fitHeight}
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            e.preventDefault();
            onCancel();
          } else if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (hasText && !submitting) void handleSubmit(submit)();
          }
        }}
        className="mt-1.5 block w-full resize-none bg-transparent text-[15px] leading-5 text-[#0F1419] caret-current outline-hidden placeholder:text-[#536471] dark:text-[#E7E9EA] dark:placeholder:text-[#71767B]"
      />
      {errors.comment && <p className="sr-only">{errors.comment.message}</p>}
      <div className="mt-3 flex items-center justify-end gap-1.5">
        <button
          type="button"
          onClick={onCancel}
          className={`h-8 rounded-full px-3.5 text-[14px] font-semibold ${INK2} transition-colors hover:bg-[rgba(15,20,25,0.06)] hover:text-[#0F1419] dark:hover:bg-[rgba(231,233,234,0.1)] dark:hover:text-[#E7E9EA]`}
        >
          {t('Cancel')}
        </button>
        <button
          type="submit"
          disabled={!hasText || submitting}
          className="inline-flex h-8 items-center gap-2 rounded-full bg-[#0F1419] px-4 text-[14px] font-bold text-white transition-colors hover:bg-[#272C30] disabled:cursor-not-allowed disabled:opacity-40 dark:bg-[#EFF3F4] dark:text-[#0F1419] dark:hover:bg-[#D7DBDC]"
        >
          {submitting ? <LoadingSpinner size="sm" /> : null}
          {t('Reply')}
        </button>
      </div>
    </form>
  );
}

function CommentRow({
  comment,
  depth,
  isAuthenticated,
  loginRedirect,
  replyingTo,
  submitting,
  isPanel,
  currentUserId,
  moderationMode,
  onReply,
  onCancelReply,
  onSubmitReply,
  onReactionChange,
  onDelete,
  onHide,
  onUnhide,
  onReport,
}: {
  comment: MarketplaceComment;
  depth: number;
  isAuthenticated: boolean;
  loginRedirect: string;
  replyingTo: string | null;
  submitting: boolean;
  isPanel: boolean;
  currentUserId?: string | null;
  moderationMode: boolean;
  onReply: (commentId: string) => void;
  onCancelReply: () => void;
  onSubmitReply: (parentId: string, text: string) => Promise<void>;
  onReactionChange: (
    commentId: string,
    likes: number,
    dislikes: number,
    userReaction: ReactionType | null
  ) => void;
  onDelete: (commentId: string) => void;
  onHide: (commentId: string) => void;
  onUnhide: (commentId: string) => void;
  onReport: (commentId: string) => void;
}) {
  const t = useT();
  const isReplying = replyingTo === comment.id;
  const canReply = isAuthenticated && depth === 0 && !comment.hidden;
  const replyCount = comment.replies?.length ?? 0;
  /* Replies start folded behind "View N replies"; replying (or having just replied) opens them. */
  const { focusId, openReplyIds } = useContext(CommentFocusContext);
  const [repliesOpen, setRepliesOpen] = useState(() => openReplyIds.has(comment.id));
  const showReplies = repliesOpen || isReplying;
  const isFocused = focusId === comment.id;

  /*
   * X-style comment row: 32px avatar, then name (bold) · relative time on one line, the text in
   * full ink under it (clamped at four lines), ⋯ top right on the name line, and an action row (like, Reply). Replies sit
   * in the same column, indented under the parent's text — no rail line.
   */
  return (
    <li
      id={`comment-${comment.id}`}
      className={`${comment.hidden ? 'opacity-60' : ''} rounded-xl transition-[background-color,box-shadow] duration-700 ${
        isFocused ? 'bg-[rgba(29,155,240,0.12)] shadow-[0_0_0_8px_rgba(29,155,240,0.12)]' : ''
      }`}
      aria-current={isFocused ? 'true' : undefined}
    >
      <div className="flex items-start gap-3">
        <CommentAvatar name={comment.userName} avatarUrl={comment.userAvatarUrl} />
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-baseline gap-1.5">
            <span className={`truncate text-[15px] font-bold leading-5 ${INK}`}>{comment.userName}</span>
            <span aria-hidden className={`text-[13px] ${INK2}`}>·</span>
            <time
              className={`shrink-0 text-[13px] ${INK2}`}
              dateTime={comment.createdAt}
              title={new Date(comment.createdAt).toLocaleString()}
            >
              {formatCommentTime(comment.createdAt)}
            </time>
            {comment.hidden && moderationMode ? (
              <span className={`ml-1 shrink-0 rounded-full border border-[#CFD9DE] px-2 text-[11px] font-semibold leading-4 dark:border-[#536471] ${INK2}`}>
                {t('Hidden')}
              </span>
            ) : null}
            {/* Options sit top right, on the author's line (X / Instagram), not at the end of the actions. */}
            <span className="-my-1.5 -mr-2 ml-auto self-center">
              <CommentActionsMenu
                comment={comment}
                currentUserId={currentUserId}
                moderationMode={moderationMode}
                onDelete={() => onDelete(comment.id)}
                onHide={() => onHide(comment.id)}
                onUnhide={() => onUnhide(comment.id)}
                onReport={() => onReport(comment.id)}
              />
            </span>
          </div>
          <CommentText text={comment.comment} />

          <div className="mt-0.5 flex flex-wrap items-center gap-3">
            <CommentReactionBar
              commentId={comment.id}
              initialLikes={comment.likes ?? 0}
              initialDislikes={comment.dislikes ?? 0}
              initialUserReaction={comment.userReaction ?? null}
              isAuthenticated={isAuthenticated}
              onReactionChange={(likes, dislikes, userReaction) =>
                onReactionChange(comment.id, likes, dislikes, userReaction)
              }
              compact
            />
            {canReply && (
              <button type="button" onClick={() => onReply(comment.id)} className={TEXT_BUTTON}>
                {t('Reply')}
              </button>
            )}
            {!isAuthenticated && depth === 0 && (
              <Link
                href={`/login?redirect=${encodeURIComponent(loginRedirect)}`}
                className={TEXT_BUTTON}
              >
                {t('Sign in to react')}
              </Link>
            )}
          </div>

          {isReplying && (
            <ReplyForm
              replyToName={comment.userName}
              submitting={submitting}
              onCancel={onCancelReply}
              onSubmit={async (text) => {
                await onSubmitReply(comment.id, text);
                setRepliesOpen(true);
              }}
            />
          )}

          {replyCount > 0 && !showReplies ? (
            <button
              type="button"
              onClick={() => setRepliesOpen(true)}
              className={`-ml-1.5 mt-1 inline-flex items-center gap-2 ${TEXT_BUTTON}`}
            >
              <span aria-hidden className="h-px w-6 bg-current opacity-50" />
              {t('View')} {replyCount} {trPlural(replyCount, 'reply', 'replies')}
            </button>
          ) : null}

          {replyCount > 0 && showReplies && (
            <ul className="mt-3 space-y-4">
              {(comment.replies ?? []).map((reply) => (
                <CommentRow
                  key={reply.id}
                  comment={reply}
                  depth={depth + 1}
                  isAuthenticated={isAuthenticated}
                  loginRedirect={loginRedirect}
                  replyingTo={replyingTo}
                  submitting={submitting}
                  isPanel={isPanel}
                  currentUserId={currentUserId}
                  moderationMode={moderationMode}
                  onReply={onReply}
                  onCancelReply={onCancelReply}
                  onSubmitReply={onSubmitReply}
                  onReactionChange={onReactionChange}
                  onDelete={onDelete}
                  onHide={onHide}
                  onUnhide={onUnhide}
                  onReport={onReport}
                />
              ))}
              {repliesOpen ? (
                <li>
                  <button type="button" onClick={() => setRepliesOpen(false)} className={`-ml-1.5 ${TEXT_BUTTON}`}>
                    {t('Hide replies')}
                  </button>
                </li>
              ) : null}
            </ul>
          )}
        </div>
      </div>
    </li>
  );
}

function CommentList({
  comments,
  isAuthenticated,
  loginRedirect,
  replyingTo,
  submitting,
  isPanel,
  currentUserId,
  moderationMode,
  onReply,
  onCancelReply,
  onSubmitReply,
  onReactionChange,
  onDelete,
  onHide,
  onUnhide,
  onReport,
}: {
  comments: MarketplaceComment[];
  isAuthenticated: boolean;
  loginRedirect: string;
  replyingTo: string | null;
  submitting: boolean;
  isPanel: boolean;
  currentUserId?: string | null;
  moderationMode: boolean;
  onReply: (commentId: string) => void;
  onCancelReply: () => void;
  onSubmitReply: (parentId: string, text: string) => Promise<void>;
  onReactionChange: (
    commentId: string,
    likes: number,
    dislikes: number,
    userReaction: ReactionType | null
  ) => void;
  onDelete: (commentId: string) => void;
  onHide: (commentId: string) => void;
  onUnhide: (commentId: string) => void;
  onReport: (commentId: string) => void;
}) {
  return (
    <ul className="space-y-4">
      {comments.map((comment) => (
        <CommentRow
          key={comment.id}
          comment={comment}
          depth={0}
          isAuthenticated={isAuthenticated}
          loginRedirect={loginRedirect}
          replyingTo={replyingTo}
          submitting={submitting}
          isPanel={isPanel}
          currentUserId={currentUserId}
          moderationMode={moderationMode}
          onReply={onReply}
          onCancelReply={onCancelReply}
          onSubmitReply={onSubmitReply}
          onReactionChange={onReactionChange}
          onDelete={onDelete}
          onHide={onHide}
          onUnhide={onUnhide}
          onReport={onReport}
        />
      ))}
    </ul>
  );
}

export function CommentThread({
  targetType,
  targetId,
  isAuthenticated,
  loginRedirect,
  variant = 'default',
  className = '',
  onClose,
  onCountChange,
  commentsEnabled = true,
  moderationMode = false,
  previewCount,
  focusCommentId = null,
}: CommentThreadProps) {
  const t = useT();
  const { user } = useAuth();
  const [comments, setComments] = useState<MarketplaceComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [reportCommentId, setReportCommentId] = useState<string | null>(null);
  const [showAll] = useState(Boolean(focusCommentId));
  const [allOpen, setAllOpen] = useState(false);
  const [focusActive, setFocusActive] = useState(Boolean(focusCommentId));
  const isPanel = variant === 'panel';

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CommentFormValues>({
    resolver: zodResolver(commentSchema),
    defaultValues: { comment: '' },
  });

  useEffect(() => {
    if (loading) return;
    onCountChange?.(countAllComments(comments.filter((c) => !c.hidden)));
  }, [comments, loading, onCountChange]);

  const load = useCallback(async () => {
    if (!commentsEnabled) {
      setComments([]);
      setLoading(false);
      return;
    }
    try {
      setError(null);
      setLoading(true);
      const page = await listComments(targetType, targetId, 0, 50, moderationMode);
      setComments(page.content);
    } catch (e) {
      setError(getApiErrorMessage(e, t('Unable to load comments.')));
      setComments([]);
    } finally {
      setLoading(false);
    }
  }, [commentsEnabled, moderationMode, targetId, targetType, t]);

  useEffect(() => {
    void load();
  }, [load]);

  /* Deep link: reply chains that hide the comment start unfolded, then the comment is brought into view. */
  const focusPath = useMemo(
    () => (focusCommentId && !loading ? findCommentPath(comments, focusCommentId) : null),
    [comments, focusCommentId, loading]
  );
  const focusContext = useMemo(
    () => ({
      focusId: focusActive && focusPath ? focusCommentId : null,
      openReplyIds: new Set(focusPath ? focusPath.slice(0, -1) : []),
    }),
    [focusActive, focusPath, focusCommentId]
  );
  const focusFound = focusPath !== null;
  useEffect(() => {
    if (!focusCommentId || !focusFound) return undefined;
    const scrollTimer = window.setTimeout(() => {
      document
        .getElementById(`comment-${focusCommentId}`)
        ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 250);
    const fadeTimer = window.setTimeout(() => setFocusActive(false), FOCUS_HIGHLIGHT_MS);
    return () => {
      window.clearTimeout(scrollTimer);
      window.clearTimeout(fadeTimer);
    };
  }, [focusCommentId, focusFound]);

  const onSubmit = async (data: CommentFormValues) => {
    if (!isAuthenticated) return;
    setSubmitting(true);
    setError(null);
    try {
      const created = await postComment(targetType, targetId, data.comment.trim());
      setComments((prev) => [created, ...prev]);
      reset();
    } catch (e) {
      setError(getApiErrorMessage(e, t('Unable to post the comment.')));
    } finally {
      setSubmitting(false);
    }
  };

  const onSubmitReply = async (parentId: string, text: string) => {
    if (!isAuthenticated) return;
    setSubmitting(true);
    setError(null);
    try {
      const created = await postComment(targetType, targetId, text, parentId);
      setComments((prev) => appendReply(prev, parentId, created));
      setReplyingTo(null);
    } catch (e) {
      setError(getApiErrorMessage(e, t('Unable to post the reply.')));
    } finally {
      setSubmitting(false);
    }
  };

  const onReactionChange = (
    commentId: string,
    likes: number,
    dislikes: number,
    userReaction: ReactionType | null
  ) => {
    setComments((prev) =>
      updateCommentTree(prev, commentId, (comment) => ({
        ...comment,
        likes,
        dislikes,
        userReaction,
      }))
    );
  };

  const handleDelete = async (commentId: string) => {
    if (!window.confirm('Delete this comment?')) return;
    setError(null);
    try {
      await deleteComment(commentId);
      setComments((prev) => removeCommentTree(prev, commentId));
    } catch (e) {
      setError(getApiErrorMessage(e, t('Unable to delete the comment.')));
    }
  };

  const handleHide = async (commentId: string) => {
    setError(null);
    try {
      await hideComment(commentId);
      setComments((prev) =>
        updateCommentTree(prev, commentId, (comment) => ({ ...comment, hidden: true }))
      );
    } catch (e) {
      setError(getApiErrorMessage(e, t('Unable to hide the comment.')));
    }
  };

  const handleUnhide = async (commentId: string) => {
    setError(null);
    try {
      await unhideComment(commentId);
      setComments((prev) =>
        updateCommentTree(prev, commentId, (comment) => ({ ...comment, hidden: false }))
      );
    } catch (e) {
      setError(getApiErrorMessage(e, t('Unable to unhide the comment.')));
    }
  };

  const totalCount = countAllComments(comments.filter((c) => !c.hidden));

  const commentForm = !commentsEnabled ? (
    <p className="text-sm text-gray-500 dark:text-neutral-400">
      {t('Comments are turned off for this post.')}
    </p>
  ) : !isAuthenticated ? (
    <p className="text-sm text-gray-600 dark:text-neutral-400">
      <Link
        href={`/login?redirect=${encodeURIComponent(loginRedirect)}`}
        className="font-semibold text-[#111111] underline decoration-neutral-300 underline-offset-4 hover:decoration-neutral-500 dark:text-white dark:decoration-neutral-600"
      >
        {t('Sign in')}
      </Link>{' '}
      {t('to comment and react.')}
    </p>
  ) : isPanel ? (
    <form onSubmit={(e) => void handleSubmit(onSubmit)(e)} className="flex items-center gap-2">
      <CommentAvatar name={user?.fullName ?? 'U'} avatarUrl={user?.avatarUrl} />
      <label htmlFor="comment-input" className="sr-only">
        {t('Your comment')}
      </label>
      <input
        id="comment-input"
        type="text"
        placeholder={t('Add a comment…')}
        autoComplete="off"
        className="h-10 min-w-0 flex-1 rounded-full border border-transparent bg-[#EFF3F4] px-4 text-[15px] text-[#0F1419] caret-current placeholder:text-[#536471] transition-colors focus:border-[#0F1419] focus:bg-white focus:outline-hidden dark:bg-[#202327] dark:text-[#E7E9EA] dark:placeholder:text-[#71767B] dark:focus:border-[#E7E9EA] dark:focus:bg-black"
        {...register('comment')}
      />
      <button
        type="submit"
        disabled={submitting}
        aria-label={t('Post comment')}
        className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#0F1419] text-white transition-colors hover:bg-[#272C30] disabled:opacity-40 dark:bg-[#EFF3F4] dark:text-[#0F1419] dark:hover:bg-[#D7DBDC]"
      >
        {submitting ? (
          <LoadingSpinner size="sm" />
        ) : (
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        )}
      </button>
      {errors.comment && <p className="sr-only">{errors.comment.message}</p>}
    </form>
  ) : (
    <form onSubmit={(e) => void handleSubmit(onSubmit)(e)} className="space-y-2">
      <label htmlFor="comment-input" className="sr-only">
        {t('Your comment')}
      </label>
      <textarea
        id="comment-input"
        rows={3}
        placeholder={t('Write a comment…')}
        autoComplete="off"
        className="w-full rounded-xl border border-black/[0.08] bg-transparent px-3.5 py-2.5 text-sm text-[#111111] transition-colors focus:border-black/25 focus:outline-hidden dark:border-white/[0.1] dark:text-white dark:focus:border-white/30"
        {...register('comment')}
      />
      {errors.comment && <p className="text-sm text-red-600">{errors.comment.message}</p>}
      <button
        type="submit"
        disabled={submitting}
        className="inline-flex items-center rounded-full bg-[#111111] px-5 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-85 disabled:opacity-40 dark:bg-white dark:text-[#111111]"
      >
        {submitting ? (
          <>
            <LoadingSpinner size="sm" />
            <span className="ml-2">{t('Posting…')}</span>
          </>
        ) : (
          t('Post')
        )}
      </button>
    </form>
  );

  const commentsBody = loading ? (
    <div className="flex justify-center py-6">
      <LoadingSpinner size="md" />
    </div>
  ) : comments.length === 0 ? (
    <p className={`py-2 text-[15px] ${INK2}`}>{t('No comments yet. Be the first to comment.')}</p>
  ) : (
    <CommentFocusContext.Provider value={focusContext}>
    <CommentList
      comments={previewCount && !showAll ? comments.slice(0, previewCount) : comments}
      isAuthenticated={isAuthenticated}
      loginRedirect={loginRedirect}
      replyingTo={replyingTo}
      submitting={submitting}
      isPanel={isPanel}
      currentUserId={user?.id}
      moderationMode={moderationMode}
      onReply={setReplyingTo}
      onCancelReply={() => setReplyingTo(null)}
      onSubmitReply={onSubmitReply}
      onReactionChange={onReactionChange}
      onDelete={(id) => void handleDelete(id)}
      onHide={(id) => void handleHide(id)}
      onUnhide={(id) => void handleUnhide(id)}
      onReport={setReportCommentId}
    />
    {previewCount && !showAll && comments.length > previewCount ? (
      <button
        type="button"
        onClick={() => setAllOpen(true)}
        className={`mt-1 ${TEXT_BUTTON} !px-0 !text-[15px]`}
      >
        {t('View all {totalCount} comments', { totalCount })}
      </button>
    ) : null}
    </CommentFocusContext.Provider>
  );

  const reportModal = (
    <CommentReportModal
      commentId={reportCommentId ?? ''}
      open={Boolean(reportCommentId)}
      onClose={() => setReportCommentId(null)}
    />
  );

  /* The full thread, from the inline preview: its own copy of the thread in a modal; closing it
     reloads the preview so new comments / replies show up under the post. */
  const allCommentsModal = previewCount ? (
    <ContentPostDialogShell
      open={allOpen}
      title={t('Comments · {totalCount}', { totalCount })}
      onClose={() => {
        setAllOpen(false);
        void load();
      }}
    >
      {allOpen ? (
        <CommentThread
          variant="panel"
          targetType={targetType}
          targetId={targetId}
          isAuthenticated={isAuthenticated}
          loginRedirect={loginRedirect}
          commentsEnabled={commentsEnabled}
          moderationMode={moderationMode}
          className="!h-[min(70dvh,640px)] !min-h-0 !rounded-none !bg-transparent !shadow-none [&>header]:hidden"
        />
      ) : null}
    </ContentPostDialogShell>
  ) : null;

  if (isPanel) {
    return (
      <>
        <section
          className={`flex h-full min-h-[360px] flex-col overflow-hidden rounded-2xl bg-white shadow-xs dark:bg-black ${className}`}
          aria-labelledby="comments-heading"
        >
          <header className="flex shrink-0 items-center justify-between px-4 pb-1 pt-3">
            <h2 id="comments-heading" className={`text-[15px] font-bold ${INK}`}>
              {t('Comments')} {totalCount > 0 ? <span className={`font-medium ${INK2}`}>· {totalCount}</span> : null}
            </h2>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className={`-mr-1.5 inline-flex h-8 w-8 items-center justify-center rounded-full ${INK2} transition-colors hover:bg-[rgba(15,20,25,0.06)] hover:text-[#0F1419] dark:hover:bg-[rgba(231,233,234,0.1)] dark:hover:text-[#E7E9EA]`}
              aria-label={t('Close comments')}
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </header>

        {error && (
          <div className="shrink-0 px-4 pt-3">
            <ErrorAlert message={error} onDismiss={() => setError(null)} />
          </div>
        )}

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">{commentsBody}</div>

        <footer className="shrink-0 px-4 pb-3 pt-2">{commentForm}</footer>
        </section>
        {reportModal}
        {allCommentsModal}
      </>
    );
  }

  return (
    <>
      <section
      className={`space-y-4 rounded-xl border border-gray-100 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900 ${className}`}
      aria-labelledby="comments-heading"
    >
      <h2 id="comments-heading" className="text-sm font-semibold text-gray-900 dark:text-white">
        {t('Comments ({totalCount})', { totalCount })}
      </h2>

      {error && <ErrorAlert message={error} onDismiss={() => setError(null)} />}

      {commentForm}

      {commentsBody}
    </section>
    {reportModal}
    </>
  );
}

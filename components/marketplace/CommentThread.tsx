'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CommentReactionBar } from '@/components/marketplace/CommentReactionBar';
import { CommentReportModal } from '@/components/marketplace/CommentReportModal';
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
};

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
        className="rounded-md px-1.5 py-0.5 text-xs font-semibold text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-600 dark:hover:bg-neutral-800"
        aria-label="Comment actions"
      >
        ···
      </button>
      {open && (
        <>
          <button type="button" className="fixed inset-0 z-10 cursor-default" aria-label="Close" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full z-20 mt-1 min-w-[10rem] overflow-hidden rounded-xl border border-neutral-200 bg-white py-1 shadow-lg dark:border-neutral-700 dark:bg-neutral-900">
            {canReport && (
              <button type="button" onClick={() => { setOpen(false); onReport(); }} className="block w-full px-3 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-50 dark:text-neutral-200 dark:hover:bg-neutral-800">
                Report
              </button>
            )}
            {canHide && (
              <button type="button" onClick={() => { setOpen(false); onHide(); }} className="block w-full px-3 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-50 dark:text-neutral-200 dark:hover:bg-neutral-800">
                Hide
              </button>
            )}
            {canUnhide && (
              <button type="button" onClick={() => { setOpen(false); onUnhide(); }} className="block w-full px-3 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-50 dark:text-neutral-200 dark:hover:bg-neutral-800">
                Unhide
              </button>
            )}
            {canDelete && (
              <button type="button" onClick={() => { setOpen(false); onDelete(); }} className="block w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10">
                Delete
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
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-black/[0.06] text-xs font-semibold text-neutral-600 dark:bg-white/[0.08] dark:text-neutral-300">
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
      className="mt-3 rounded-2xl border border-black/[0.08] px-4 pb-3 pt-3 transition-colors focus-within:border-black/20 dark:border-white/[0.1] dark:focus-within:border-white/25"
    >
      <p className="text-[13px] text-neutral-500 dark:text-neutral-400">
        Replying to <span className="font-medium text-[#111111] dark:text-white">{replyToName}</span>
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
        placeholder="Post your reply"
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
        className="mt-1.5 block w-full resize-none bg-transparent text-[15px] leading-[1.5] text-[#111111] outline-none placeholder:text-neutral-400 dark:text-white dark:placeholder:text-neutral-500"
      />
      {errors.comment && <p className="sr-only">{errors.comment.message}</p>}
      <div className="mt-3 flex items-center justify-end gap-1.5">
        <button
          type="button"
          onClick={onCancel}
          className="h-8 rounded-full px-3.5 text-[14px] font-medium text-neutral-500 transition-colors hover:bg-black/[0.05] hover:text-[#111111] dark:text-neutral-400 dark:hover:bg-white/[0.08] dark:hover:text-white"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!hasText || submitting}
          className="inline-flex h-8 items-center gap-2 rounded-full bg-[#111111] px-4 text-[14px] font-semibold text-white transition-opacity hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-35 dark:bg-white dark:text-[#111111]"
        >
          {submitting ? <LoadingSpinner size="sm" /> : null}
          Reply
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
  const isReplying = replyingTo === comment.id;
  const canReply = isAuthenticated && depth === 0 && !comment.hidden;

  return (
    <li className={`${depth > 0 ? 'mt-3 border-l-2 border-neutral-200 pl-3 dark:border-neutral-700' : ''} ${comment.hidden ? 'opacity-60' : ''}`}>
      <div className="flex items-start gap-3">
        <CommentAvatar name={comment.userName} avatarUrl={comment.userAvatarUrl} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-2">
            <span className="text-sm font-semibold text-gray-900 dark:text-white">{comment.userName}</span>
            {comment.hidden && moderationMode && (
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-800 dark:bg-amber-500/20 dark:text-amber-300">
                Hidden
              </span>
            )}
            <time className="text-xs text-gray-500 dark:text-neutral-400" dateTime={comment.createdAt}>
              {new Date(comment.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </time>
          </div>
          <p className="mt-1 break-words whitespace-pre-wrap text-sm text-gray-700 dark:text-neutral-300">
            {comment.comment}
          </p>

          <div className="mt-1 flex flex-wrap items-center gap-2">
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
              <button
                type="button"
                onClick={() => onReply(comment.id)}
                className="rounded-md px-1.5 py-0.5 text-xs font-semibold text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
              >
                Reply
              </button>
            )}
            {!isAuthenticated && depth === 0 && (
              <Link
                href={`/login?redirect=${encodeURIComponent(loginRedirect)}`}
                className="text-xs font-semibold text-[#111111] underline decoration-neutral-300 underline-offset-4 hover:decoration-neutral-500 dark:text-white dark:decoration-neutral-600"
              >
                Sign in to react
              </Link>
            )}
            <CommentActionsMenu
              comment={comment}
              currentUserId={currentUserId}
              moderationMode={moderationMode}
              onDelete={() => onDelete(comment.id)}
              onHide={() => onHide(comment.id)}
              onUnhide={() => onUnhide(comment.id)}
              onReport={() => onReport(comment.id)}
            />
          </div>

          {isReplying && (
            <ReplyForm
              replyToName={comment.userName}
              submitting={submitting}
              onCancel={onCancelReply}
              onSubmit={(text) => onSubmitReply(comment.id, text)}
            />
          )}

          {comment.replies && comment.replies.length > 0 && (
            <ul className="mt-3 space-y-3">
              {comment.replies.map((reply) => (
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
}: CommentThreadProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState<MarketplaceComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [reportCommentId, setReportCommentId] = useState<string | null>(null);
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
      setError(getApiErrorMessage(e, 'Unable to load comments.'));
      setComments([]);
    } finally {
      setLoading(false);
    }
  }, [commentsEnabled, moderationMode, targetId, targetType]);

  useEffect(() => {
    void load();
  }, [load]);

  const onSubmit = async (data: CommentFormValues) => {
    if (!isAuthenticated) return;
    setSubmitting(true);
    setError(null);
    try {
      const created = await postComment(targetType, targetId, data.comment.trim());
      setComments((prev) => [created, ...prev]);
      reset();
    } catch (e) {
      setError(getApiErrorMessage(e, 'Unable to post the comment.'));
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
      setError(getApiErrorMessage(e, 'Unable to post the reply.'));
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
      setError(getApiErrorMessage(e, 'Unable to delete the comment.'));
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
      setError(getApiErrorMessage(e, 'Unable to hide the comment.'));
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
      setError(getApiErrorMessage(e, 'Unable to unhide the comment.'));
    }
  };

  const totalCount = countAllComments(comments.filter((c) => !c.hidden));

  const commentForm = !commentsEnabled ? (
    <p className="text-sm text-gray-500 dark:text-neutral-400">
      Comments are turned off for this post.
    </p>
  ) : !isAuthenticated ? (
    <p className="text-sm text-gray-600 dark:text-neutral-400">
      <Link
        href={`/login?redirect=${encodeURIComponent(loginRedirect)}`}
        className="font-semibold text-[#111111] underline decoration-neutral-300 underline-offset-4 hover:decoration-neutral-500 dark:text-white dark:decoration-neutral-600"
      >
        Sign in
      </Link>{' '}
      to comment and react.
    </p>
  ) : isPanel ? (
    <form onSubmit={(e) => void handleSubmit(onSubmit)(e)} className="flex items-center gap-2">
      <CommentAvatar name={user?.fullName ?? 'U'} avatarUrl={user?.avatarUrl} />
      <label htmlFor="comment-input" className="sr-only">
        Your comment
      </label>
      <input
        id="comment-input"
        type="text"
        placeholder="Add a comment…"
        autoComplete="off"
        className="min-w-0 flex-1 rounded-full border border-black/[0.08] bg-transparent px-4 py-2 text-sm text-[#111111] placeholder:text-neutral-400 transition-colors focus:border-black/25 focus:outline-none dark:border-white/[0.1] dark:text-white dark:focus:border-white/30"
        {...register('comment')}
      />
      <button
        type="submit"
        disabled={submitting}
        aria-label="Post comment"
        className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#111111] text-white transition-opacity hover:opacity-85 disabled:opacity-40 dark:bg-white dark:text-[#111111]"
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
        Your comment
      </label>
      <textarea
        id="comment-input"
        rows={3}
        placeholder="Write a comment…"
        autoComplete="off"
        className="w-full rounded-xl border border-black/[0.08] bg-transparent px-3.5 py-2.5 text-sm text-[#111111] transition-colors focus:border-black/25 focus:outline-none dark:border-white/[0.1] dark:text-white dark:focus:border-white/30"
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
            <span className="ml-2">Posting…</span>
          </>
        ) : (
          'Post'
        )}
      </button>
    </form>
  );

  const commentsBody = loading ? (
    <div className="flex justify-center py-6">
      <LoadingSpinner size="md" />
    </div>
  ) : comments.length === 0 ? (
    <p className="text-sm text-gray-500 dark:text-neutral-400">No comments yet. Be the first to comment.</p>
  ) : (
    <CommentList
      comments={comments}
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
  );

  const reportModal = (
    <CommentReportModal
      commentId={reportCommentId ?? ''}
      open={Boolean(reportCommentId)}
      onClose={() => setReportCommentId(null)}
    />
  );

  if (isPanel) {
    return (
      <>
        <section
          className={`flex h-full min-h-[360px] flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900 ${className}`}
          aria-labelledby="comments-heading"
        >
          <header className="flex shrink-0 items-center justify-between border-b border-neutral-200 px-4 py-3 dark:border-neutral-800">
            <h2 id="comments-heading" className="text-sm font-bold text-neutral-900 dark:text-white">
              Comments {totalCount > 0 ? `· ${totalCount}` : ''}
              {moderationMode && (
                <span className="ml-2 text-[10px] font-semibold uppercase tracking-wide text-neutral-400 dark:text-neutral-500">
                  Moderation
                </span>
              )}
            </h2>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-800 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
              aria-label="Close comments"
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

        <footer className="shrink-0 border-t border-neutral-200 p-3 dark:border-neutral-800">{commentForm}</footer>
        </section>
        {reportModal}
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
        Comments ({totalCount})
      </h2>

      {error && <ErrorAlert message={error} onDismiss={() => setError(null)} />}

      {commentForm}

      {commentsBody}
    </section>
    {reportModal}
    </>
  );
}

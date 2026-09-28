'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ContentPostFeedMediaFrame } from '@/components/creator/ContentPostFeedMediaFrame';
import {
  ContentPostLightbox,
  type ContentPostLightboxPost,
} from '@/components/creator/ContentPostLightbox';
import {
  ContentPostDetailsBlock,
  toContentDetailsDraft,
  type ContentDetailsDraft,
} from '@/components/creator/ContentPostDetailsBlock';
import { ContentPostSocialBar } from '@/components/creator/ContentPostSocialBar';
import { ContentPostOverflowMenu } from '@/components/creator/studio/ContentPostOverflowMenu';
import { CommentThread } from '@/components/marketplace/CommentThread';
import { STUDIO_FLOAT_IN_STYLE } from '@/components/portfolio/PortfolioStudioKit';
import {
  archiveContent,
  moveContentToTrash,
  permanentDeleteContent,
  pinContent,
  restoreContent,
  unarchiveContent,
  unpinContent,
  updateContentCommentsEnabled,
  updateContentVisibility,
  updateCreatorContent,
} from '@/lib/creator-content-api';
import { getApiErrorMessage } from '@/lib/api-error';
import { listComments } from '@/lib/marketplace-api';
import { pushFlashFeedback } from '@/stores/flashFeedbackStore';
import { useAuth } from '@/context/AuthContext';
import { useCreatorAppRole } from '@/hooks/useCreatorAppRole';
import type {
  ContentPostBucket,
  CreatorContentCreateBody,
  CreatorContentItemDto,
} from '@/types/creator-content';

type CreatorContentPostCardProps = {
  post: CreatorContentItemDto;
  bucket: ContentPostBucket;
  creatorName: string;
  specialite?: string | null;
  specialties?: string[] | null;
  onChanged: () => void;
  onError: (message: string) => void;
  className?: string;
};

function toLightboxPost(
  post: CreatorContentItemDto,
  creator: { id: string; fullName: string; avatarUrl?: string | null }
): ContentPostLightboxPost {
  return {
    id: post.id,
    title: post.title,
    genre: post.genre,
    description: post.description,
    mediaUrl: post.mediaUrl,
    mediaType: post.mediaType ?? null,
    textColor: post.textColor,
    moodLabel: post.moodLabel,
    moodEmoji: post.moodEmoji,
    taggedUsers: post.taggedUsers,
    priceInfo: post.priceInfo,
    toolsUsed: post.toolsUsed ?? [],
    tags: post.tags ?? [],
    isPublic: post.isPublic,
    commentsEnabled: post.commentsEnabled,
    pinned: post.pinned,
    views: post.views,
    likes: post.likes,
    createdAt: post.createdAt,
    creator: {
      id: creator.id,
      fullName: creator.fullName,
      avatarUrl: creator.avatarUrl ?? null,
    },
  };
}

function formatPostTime(iso: string): string {
  const date = new Date(iso);
  const seconds = Math.max(0, Math.round((Date.now() - date.getTime()) / 1000));
  if (seconds < 60) return 'now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
  if (seconds < 7 * 86400) return `${Math.floor(seconds / 86400)}d`;
  const sameYear = date.getFullYear() === new Date().getFullYear();
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    ...(sameYear ? {} : { year: 'numeric' }),
  });
}

function normalizeList(values: string[]): string[] {
  return values.map((v) => v.trim().replace(/^#/, '')).filter(Boolean);
}

function isDetailsDraftUnchanged(post: CreatorContentItemDto, draft: ContentDetailsDraft): boolean {
  const original = toContentDetailsDraft(post);
  const sameTitle = draft.title.trim() === original.title.trim();
  const sameGenre = draft.genre.trim() === original.genre.trim();
  const sameDescription = draft.description.trim() === original.description.trim();
  const samePrice = draft.priceInfo.trim() === original.priceInfo.trim();

  const draftTags = normalizeList(draft.tags);
  const originalTags = normalizeList(original.tags);
  const draftTools = normalizeList(draft.toolsUsed);
  const originalTools = normalizeList(original.toolsUsed);

  const sameTags =
    draftTags.length === originalTags.length && draftTags.every((t, i) => t === originalTags[i]);
  const sameTools =
    draftTools.length === originalTools.length &&
    draftTools.every((t, i) => t === originalTools[i]);

  return sameTitle && sameGenre && sameDescription && samePrice && sameTags && sameTools;
}

function buildUpdateBody(
  post: CreatorContentItemDto,
  draft: ContentDetailsDraft
): CreatorContentCreateBody | null {
  const mediaUrl = post.mediaUrl?.trim();
  if (!mediaUrl) return null;

  return {
    title: draft.title.trim() || null,
    genre: draft.genre.trim() || null,
    description: draft.description.trim() || null,
    mediaUrl,
    mediaType: post.mediaType ?? 'FILE',
    textColor: post.textColor ?? null,
    moodLabel: post.moodLabel ?? null,
    moodEmoji: post.moodEmoji ?? null,
    taggedUserIds: post.taggedUsers?.map((u) => u.id) ?? [],
    priceInfo: draft.priceInfo.trim() || null,
    toolsUsed: normalizeList(draft.toolsUsed).slice(0, 10),
    tags: normalizeList(draft.tags).slice(0, 10),
    isPublic: post.isPublic,
    commentsEnabled: post.commentsEnabled ?? true,
  };
}

export function CreatorContentPostCard({
  post: postProp,
  bucket,
  creatorName,
  specialite,
  specialties,
  onChanged,
  onError,
  className = '',
}: CreatorContentPostCardProps) {
  const { user } = useAuth();
  const { appRole } = useCreatorAppRole();
  const [post, setPost] = useState(postProp);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [commentCount, setCommentCount] = useState<number | undefined>(undefined);
  const [visibilityBusy, setVisibilityBusy] = useState(false);
  const [commentsBusy, setCommentsBusy] = useState(false);
  const [isPublic, setIsPublic] = useState(postProp.isPublic);
  const [commentsEnabled, setCommentsEnabled] = useState(postProp.commentsEnabled !== false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editDraft, setEditDraft] = useState<ContentDetailsDraft | null>(null);
  const [editSaving, setEditSaving] = useState(false);
  const [descExpanded, setDescExpanded] = useState(false);

  useEffect(() => {
    setPost(postProp);
    setIsPublic(postProp.isPublic);
    setCommentsEnabled(postProp.commentsEnabled !== false);
    setEditing(false);
    setEditDraft(null);
  }, [postProp]);

  useEffect(() => {
    setCommentsOpen(false);
    setCommentCount(undefined);
    setLightboxOpen(false);
    setEditing(false);
    setEditDraft(null);
  }, [post.id]);

  useEffect(() => {
    if (bucket === 'trash' || !commentsEnabled) return;
    let cancelled = false;
    void listComments('POST', post.id, 0, 1)
      .then((page) => {
        if (!cancelled) setCommentCount(page.totalElements);
      })
      .catch(() => {
        // ignore
      });
    return () => {
      cancelled = true;
    };
  }, [post.id, bucket, commentsEnabled]);

  const startEdit = () => {
    if (bucket === 'trash' || editSaving) return;
    setLightboxOpen(false);
    setEditing(true);
    setEditDraft(toContentDetailsDraft(post));
  };

  const cancelEdit = () => {
    if (editSaving) return;
    setEditing(false);
    setEditDraft(null);
  };

  const saveEdit = async () => {
    if (!editDraft || editSaving) return;

    if (isDetailsDraftUnchanged(post, editDraft)) {
      setEditing(false);
      setEditDraft(null);
      return;
    }

    const body = buildUpdateBody(post, editDraft);
    if (!body) {
      const message = 'This content has no media and cannot be updated.';
      onError(message);
      pushFlashFeedback({
        variant: 'error',
        title: 'Update failed',
        description: message,
      });
      return;
    }

    setEditSaving(true);
    try {
      const updated = await updateCreatorContent(post.id, body);
      setPost((current) => ({ ...current, ...updated }));
      setIsPublic(updated.isPublic);
      setCommentsEnabled(updated.commentsEnabled !== false);
      setEditing(false);
      setEditDraft(null);
      pushFlashFeedback({
        variant: 'success',
        title: 'Content updated',
      });
      onChanged();
    } catch (e) {
      const message = getApiErrorMessage(e, 'Unable to save changes.');
      onError(message);
      pushFlashFeedback({
        variant: 'error',
        title: 'Update failed',
        description: message,
      });
    } finally {
      setEditSaving(false);
    }
  };

  const handleCommentsEnabled = async (next: boolean) => {
    if (commentsBusy || bucket === 'trash' || next === commentsEnabled) return;
    const previous = commentsEnabled;
    setCommentsEnabled(next);
    setCommentsBusy(true);
    try {
      await updateContentCommentsEnabled(post.id, next);
      if (!next) {
        setCommentsOpen(false);
        setCommentCount(0);
      }
    } catch (e) {
      setCommentsEnabled(previous);
      onError(getApiErrorMessage(e, 'Impossible de modifier les commentaires.'));
    } finally {
      setCommentsBusy(false);
    }
  };

  const handleVisibility = async (next: boolean) => {
    if (visibilityBusy || bucket === 'trash' || next === isPublic) return;
    const previous = isPublic;
    setIsPublic(next);
    setVisibilityBusy(true);
    try {
      await updateContentVisibility(post.id, next);
      setPost((current) => ({ ...current, isPublic: next }));
    } catch (e) {
      setIsPublic(previous);
      onError(getApiErrorMessage(e, 'Unable to update visibility.'));
    } finally {
      setVisibilityBusy(false);
    }
  };

  const confirmAndRun = async (message: string, action: () => Promise<void>) => {
    if (!window.confirm(message)) return;
    try {
      await action();
      onChanged();
    } catch (e) {
      onError(getApiErrorMessage(e, 'Action failed.'));
    }
  };

  const cardControls = (
    <div className="flex flex-row items-center">
      <ContentPostOverflowMenu
        postId={post.id}
        bucket={bucket}
        pinned={Boolean(post.pinned)}
        isPublic={isPublic}
        visibilityBusy={visibilityBusy || editing}
        onVisibilityChange={
          bucket !== 'trash' ? (v) => void handleVisibility(v) : undefined
        }
        commentsEnabled={commentsEnabled}
        commentsBusy={commentsBusy}
        onCommentsEnabledChange={
          bucket !== 'trash' ? (v) => void handleCommentsEnabled(v) : undefined
        }
        onEdit={bucket !== 'trash' ? startEdit : undefined}
        onPin={() =>
          void confirmAndRun('Pin this content to the top of your portfolio?', async () => {
            await pinContent(post.id);
          })
        }
        onUnpin={() =>
          void confirmAndRun('Remove pin from this content?', async () => {
            await unpinContent(post.id);
          })
        }
        onArchive={() =>
          void confirmAndRun(
            'Archive this content? It will be hidden from the feed.',
            async () => {
              await archiveContent(post.id);
            }
          )
        }
        onUnarchive={() =>
          void confirmAndRun('Restore this content to your published list?', async () => {
            await unarchiveContent(post.id);
          })
        }
        onMoveToTrash={() =>
          void confirmAndRun('Move this content to trash? You can restore it later.', async () => {
            await moveContentToTrash(post.id);
          })
        }
        onRestore={() =>
          void confirmAndRun('Restore this content from trash?', async () => {
            await restoreContent(post.id);
          })
        }
        onPermanentDelete={() =>
          void confirmAndRun('Delete this content permanently? This cannot be undone.', async () => {
            await permanentDeleteContent(post.id);
          })
        }
      />
    </div>
  );

  const lightboxPost = toLightboxPost(post, {
    id: user?.id ?? 'local',
    fullName: creatorName,
    avatarUrl: user?.avatarUrl ?? null,
  });

  const specialtyLine =
    specialite?.trim() || specialties?.map((s) => s.trim()).find(Boolean) || null;
  const moodLine = [
    post.moodLabel?.trim() ? `Feeling ${post.moodLabel.trim()}${post.moodEmoji ? ` ${post.moodEmoji}` : ''}` : null,
    post.taggedUsers?.length ? `with ${post.taggedUsers.map((u) => u.fullName).join(', ')}` : null,
  ]
    .filter(Boolean)
    .join(' Â· ');
  const title = post.title?.trim() || '';
  const genre = post.genre?.trim() || '';
  const description = post.description?.trim() || '';
  const descriptionLong = description.length > 280 || description.split('\n').length > 4;
  const tags = normalizeList(post.tags ?? []);
  const tools = (post.toolsUsed ?? []).map((t) => t.trim()).filter(Boolean);
  const priceLabel = post.priceInfo?.trim() || '';
  const profileHref = user?.id ? `/marketplace/${user.id}` : '/dashboard/creator?tab=profile';
  const showPinned = post.pinned && (bucket === 'active' || bucket === 'pinned');
  const canComment = bucket !== 'trash' && commentsEnabled;

  return (
    <article
      className={`overflow-hidden rounded-lg border border-black/[0.06] bg-white transition-shadow duration-300 hover:shadow-[0_12px_40px_-24px_rgba(0,0,0,0.18)] dark:border-white/[0.08] dark:bg-[#111111] ${className}`}
    >
      <header className="flex items-center gap-3.5 px-6 pt-6">
        <Link href={profileHref} className="shrink-0" aria-label={creatorName}>
          {user?.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.avatarUrl} alt="" className="h-11 w-11 rounded-full object-cover" />
          ) : (
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-neutral-200 text-sm font-semibold text-neutral-700 dark:bg-neutral-800 dark:text-neutral-200">
              {creatorName.trim().slice(0, 1).toUpperCase() || '?'}
            </span>
          )}
        </Link>
        <div className="min-w-0 flex-1">
          <Link
            href={profileHref}
            className="block truncate text-[15px] font-semibold leading-tight text-[#111111] hover:underline dark:text-white"
          >
            {creatorName}
          </Link>
          <p className="mt-1 truncate text-[13.5px] leading-tight text-neutral-500 dark:text-neutral-400">
            {moodLine || specialtyLine || 'Creator'}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          {showPinned ? (
            <span className="inline-flex items-center gap-1.5 text-[13px] text-neutral-500 dark:text-neutral-400" title="Pinned">
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 4h6l-1 6 3 3H7l3-3-1-6zM12 13v7" />
              </svg>
              Pinned
            </span>
          ) : null}
          {bucket === 'archived' || bucket === 'trash' || !isPublic ? (
            <span className="rounded-full border border-black/[0.08] px-2.5 py-0.5 text-[12.5px] text-neutral-500 dark:border-white/[0.1] dark:text-neutral-400">
              {bucket === 'archived' ? 'Archived' : bucket === 'trash' ? 'In trash' : 'Private'}
            </span>
          ) : null}
          <time
            dateTime={post.createdAt}
            title={new Date(post.createdAt).toLocaleString()}
            className="text-[13px] text-neutral-400 dark:text-neutral-500"
          >
            {formatPostTime(post.createdAt)}
          </time>
          <div className="-mr-2">{cardControls}</div>
        </div>
      </header>

      {editing && editDraft ? (
        <div className="px-6 pt-6">
          <ContentPostDetailsBlock
            post={post}
            bucket={bucket}
            variant="sidebar"
            editing
            draft={editDraft}
            onDraftChange={setEditDraft}
            disabled={editSaving}
          />
          <div className="mt-6 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={cancelEdit}
              disabled={editSaving}
              className="rounded-lg px-4 py-2 text-[15px] font-medium text-neutral-600 transition-colors hover:text-[#111111] disabled:opacity-40 dark:text-neutral-300 dark:hover:text-white"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => void saveEdit()}
              disabled={editSaving}
              className="rounded-lg bg-[#111111] px-5 py-2 text-[15px] font-medium text-white transition-opacity hover:opacity-85 disabled:opacity-40 dark:bg-white dark:text-[#111111]"
            >
              {editSaving ? 'Savingâ€¦' : 'Save'}
            </button>
          </div>
        </div>
      ) : genre || title || description || tags.length > 0 ? (
        <div className="px-6 pt-5">
          {genre ? (
            <p className="mb-2 text-[13px] font-medium text-neutral-500 dark:text-neutral-400">{genre}</p>
          ) : null}
          {title ? (
            <h3 className="text-[1.125rem] font-semibold leading-snug tracking-[-0.01em] text-[#111111] dark:text-white">
              {title}
            </h3>
          ) : null}
          {description || tags.length > 0 ? (
            <p
              className={`whitespace-pre-wrap text-[15px] leading-[1.65] text-neutral-600 dark:text-neutral-300 ${
                title ? 'mt-2' : ''
              } ${descriptionLong && !descExpanded ? 'line-clamp-4' : ''}`}
            >
              {description}
              {tags.length > 0 ? (
                <>
                  {description ? ' ' : null}
                  {tags.map((tag) => (
                    <span key={tag} className="mr-1.5 font-medium text-[#111111] dark:text-white">
                      #{tag}
                    </span>
                  ))}
                </>
              ) : null}
            </p>
          ) : null}
          {descriptionLong ? (
            <button
              type="button"
              onClick={() => setDescExpanded((v) => !v)}
              className="mt-1.5 text-[14px] font-medium text-neutral-500 transition-colors hover:text-[#111111] dark:text-neutral-400 dark:hover:text-white"
            >
              {descExpanded ? 'Show less' : 'View more'}
            </button>
          ) : null}
        </div>
      ) : null}

      <div className="px-6 pt-5">
        <div
          role="button"
          tabIndex={0}
          aria-label="Open media fullscreen"
          onClick={() => {
            if (!editing) setLightboxOpen(true);
          }}
          onKeyDown={(e) => {
            if (editing) return;
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setLightboxOpen(true);
            }
          }}
          className={`group/media overflow-hidden rounded-lg bg-neutral-100 dark:bg-neutral-900 ${
            editing ? 'cursor-default' : 'cursor-zoom-in'
          }`}
        >
          {post.mediaUrl ? (
            <div className="pointer-events-none w-full transition-transform duration-500 ease-out group-hover/media:scale-[1.015]">
              <ContentPostFeedMediaFrame mediaUrl={post.mediaUrl} mediaType={post.mediaType} layout="feed" />
            </div>
          ) : (
            <div className="flex min-h-[12rem] items-center justify-center text-[14px] text-neutral-400">No preview</div>
          )}
        </div>
      </div>

      {!editing && (priceLabel || tools.length > 0) ? (
        <dl className="flex flex-wrap gap-x-8 gap-y-2 px-6 pt-4 text-[14px]">
          {priceLabel ? (
            <div className="flex items-baseline gap-2">
              <dt className="text-neutral-500 dark:text-neutral-400">Estimated cost</dt>
              <dd className="font-medium tabular-nums text-[#111111] dark:text-white">{priceLabel}</dd>
            </div>
          ) : null}
          {tools.length > 0 ? (
            <div className="flex min-w-0 items-baseline gap-2">
              <dt className="shrink-0 text-neutral-500 dark:text-neutral-400">Made with</dt>
              <dd className="min-w-0 font-medium text-[#111111] dark:text-white">{tools.join(', ')}</dd>
            </div>
          ) : null}
        </dl>
      ) : null}

      {bucket !== 'trash' ? (
        <div className="mt-5 border-t border-black/[0.06] px-6 py-3.5 dark:border-white/[0.08]">
          <ContentPostSocialBar
            variant="timeline"
            postId={post.id}
            initialLikes={post.likes}
            createdAt={post.createdAt}
            commentsOpen={commentsOpen && canComment}
            onCommentsToggle={(open) => {
              if (canComment && !editing) setCommentsOpen(open);
            }}
            commentCount={commentCount}
            commentsDisabled={!canComment || editing}
          />
        </div>
      ) : (
        <div className="h-6" />
      )}

      {commentsOpen && canComment && !editing ? (
        <div className="border-t border-black/[0.06] px-2 pb-2 dark:border-white/[0.08]" style={STUDIO_FLOAT_IN_STYLE}>
          <CommentThread
            variant="panel"
            targetType="POST"
            targetId={post.id}
            isAuthenticated
            loginRedirect="/dashboard/creator?tab=content"
            commentsEnabled={commentsEnabled}
            moderationMode
            onClose={() => setCommentsOpen(false)}
            onCountChange={setCommentCount}
            className="!h-auto !min-h-0 !max-h-[520px] !rounded-none !border-0 !bg-transparent !shadow-none"
          />
        </div>
      ) : null}

      <ContentPostLightbox
        post={lightboxPost}
        open={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        bucket={bucket}
        moderationMode
        loginRedirect="/dashboard/creator?tab=content"
        specialite={specialite}
        specialties={specialties}
        appRole={appRole}
      />
    </article>
  );
}

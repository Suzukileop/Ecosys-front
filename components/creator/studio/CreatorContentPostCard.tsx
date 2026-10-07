'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { ContentPostFeedMediaFrame } from '@/components/creator/ContentPostFeedMediaFrame';
import { contentMediaKind } from '@/components/creator/creator-content-media';
import { ContentPostImageCollage } from '@/components/creator/ContentPostImageCollage';
import { EmbeddedOriginal, postGallery } from '@/components/home/NewsFeedPostParts';
import { MediaImage } from '@/components/ui/MediaImage';
import {
  ContentPostLightbox,
  type ContentPostLightboxPost,
} from '@/components/creator/ContentPostLightbox';
import {
  ContentPostDetailsBlock,
  toContentDetailsDraft,
  type ContentDetailsDraft,
} from '@/components/creator/ContentPostDetailsBlock';
import { ContentPostClampedTitle } from '@/components/creator/ContentPostClampedTitle';
import { ContentPostSocialBar } from '@/components/creator/ContentPostSocialBar';
import { ContentPostOverflowMenu } from '@/components/creator/studio/ContentPostOverflowMenu';
import { CommentThread } from '@/components/marketplace/CommentThread';
import {
  COMMENTS_INLINE_CLASS,
  COMMENTS_SHEET_CLASS,
  PostCommentsSurface,
} from '@/components/creator/PostCommentsSurface';
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
import { creatorPostAvatarRingClass } from '@/lib/creator-app-role';
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
  /** Post author; defaults to the signed-in user (studio). The message CTA only shows to other viewers. */
  authorId?: string | null;
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
    mediaUrls: post.mediaUrls,
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

  return sameTitle && sameDescription && samePrice && sameTags && sameTools;
}

function buildUpdateBody(
  post: CreatorContentItemDto,
  draft: ContentDetailsDraft
): CreatorContentCreateBody | null {
  const mediaUrl = post.mediaUrl?.trim() || null;
  const title = draft.title.trim() || null;
  const description = draft.description.trim() || null;
  if (!mediaUrl && !title && !description) return null;

  return {
    title,
    genre: null,
    description,
    mediaUrl,
    /* Sent back as-is so editing the text of a collage post keeps its gallery. */
    mediaUrls: post.mediaUrls && post.mediaUrls.length > 1 ? post.mediaUrls : undefined,
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
  authorId,
}: CreatorContentPostCardProps) {
  const { user } = useAuth();
  const { appRole } = useCreatorAppRole();
  const [post, setPost] = useState(postProp);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const closeComments = useCallback(() => setCommentsOpen(false), []);
  const [infoOpen, setInfoOpen] = useState(false);
  const [commentCount, setCommentCount] = useState<number | undefined>(undefined);
  const [visibilityBusy, setVisibilityBusy] = useState(false);
  const [commentsBusy, setCommentsBusy] = useState(false);
  const [isPublic, setIsPublic] = useState(postProp.isPublic);
  const [commentsEnabled, setCommentsEnabled] = useState(postProp.commentsEnabled !== false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxVideoTime, setLightboxVideoTime] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [editing, setEditing] = useState(false);
  const [editDraft, setEditDraft] = useState<ContentDetailsDraft | null>(null);
  const [editSaving, setEditSaving] = useState(false);

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
      const message = 'Write something or keep the media before saving.';
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
    .join(' · ');
  const title = post.title?.trim() || '';
  const tags = normalizeList(post.tags ?? []);
  const tools = (post.toolsUsed ?? []).map((t) => t.trim()).filter(Boolean);
  const priceLabel = post.priceInfo?.trim() || '';
  const profileHref = user?.id ? `/providers/${user.id}` : '/profile?tab=profile';
  const showPinned = post.pinned && (bucket === 'active' || bucket === 'pinned');
  const canComment = bucket !== 'trash' && commentsEnabled;
  const mediaKind = post.mediaUrl ? contentMediaKind(post.mediaUrl, null, post.mediaType) : null;
  const playableMedia = !editing && (mediaKind === 'video' || mediaKind === 'audio');
  const discussHref =
    authorId && authorId !== user?.id && bucket !== 'archived' && bucket !== 'trash'
      ? `/messages?user=${encodeURIComponent(authorId)}`
      : null;
  const messageHref = discussHref && !user ? `/login?redirect=${encodeURIComponent(discussHref)}` : discussHref;

  const statusLabel =
    bucket === 'archived' ? 'Archived' : bucket === 'trash' ? 'In trash' : !isPublic ? 'Private' : null;
  const hasInfo = !editing && Boolean(priceLabel || tools.length > 0);
  const hasTextBlock = Boolean(statusLabel || showPinned || title || tags.length > 0 || hasInfo);
  const showRail = bucket !== 'trash' && !editing;
  const mediaSpacing = editing ? 'mt-6' : hasTextBlock ? 'mt-3' : 'mt-4';

  return (
    <article
      className={`overflow-hidden !bg-[#FFFFFF] dark:!bg-[#111111] sm:rounded-xl ${className}`}
    >
      <header className="flex items-center gap-3.5 px-6 pt-6 sm:px-7 sm:pt-7">
        <Link
          href={profileHref}
          className={`inline-flex shrink-0 ${creatorPostAvatarRingClass(appRole)}`}
          aria-label={creatorName}
        >
          <MediaImage
            src={user?.avatarUrl}
            width={44}
            referrerPolicy="no-referrer"
            fallback={
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-neutral-200 text-sm font-semibold text-neutral-700 dark:bg-neutral-800 dark:text-neutral-200">
                {creatorName.trim().slice(0, 1).toUpperCase() || '?'}
              </span>
            }
            className="h-11 w-11 rounded-full bg-neutral-200 object-cover dark:bg-neutral-800"
          />
        </Link>
        <div className="min-w-0 flex-1">
          <Link
            href={profileHref}
            className="block truncate text-base font-semibold leading-tight text-[#111111] hover:underline dark:text-white"
          >
            {creatorName}
          </Link>
          <p className="mt-1.5 truncate text-[14px] leading-tight text-neutral-500 dark:text-neutral-400">
            {moodLine || specialtyLine || 'Creator'}
            <span aria-hidden className="mx-1.5 text-neutral-300 dark:text-neutral-600">·</span>
            <time dateTime={post.createdAt} title={new Date(post.createdAt).toLocaleString()}>
              {formatPostTime(post.createdAt)}
            </time>
          </p>
        </div>
        <div className="-mr-2 shrink-0">{cardControls}</div>
      </header>

      <div className="flex flex-col pb-4 pl-6 pr-6 sm:pb-6 sm:pl-7 sm:pr-7">
      <div className="min-w-0 flex-1">
      {editing && editDraft ? (
        <div className="pt-6">
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
              {editSaving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </div>
      ) : hasTextBlock ? (
        <div className="pt-4">
          {statusLabel || showPinned ? (
            <div className="mb-4 flex flex-wrap items-center gap-2">
              {showPinned ? (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-black/[0.08] px-3 py-1 text-[13px] font-medium text-neutral-600 dark:border-white/[0.1] dark:text-neutral-300">
                  <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 4h6l-1 6 3 3H7l3-3-1-6zM12 13v7" />
                  </svg>
                  Pinned
                </span>
              ) : null}
              {statusLabel ? (
                <span className="rounded-full border border-black/[0.08] px-3 py-1 text-[13px] text-neutral-500 dark:border-white/[0.1] dark:text-neutral-400">
                  {statusLabel}
                </span>
              ) : null}
            </div>
          ) : null}

          {title ? <ContentPostClampedTitle title={title} lines={post.mediaUrl ? 2 : 10} /> : null}

          {tags.length > 0 || hasInfo ? (
            <div className="mt-4 flex items-start justify-between gap-4">
              <p className="flex min-w-0 flex-wrap gap-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-black/[0.1] px-3 py-1 text-[13.5px] leading-tight text-[#111111] dark:border-white/[0.14] dark:text-neutral-200"
                  >
                    {tag}
                  </span>
                ))}
              </p>
              {hasInfo ? (
                <button
                  type="button"
                  onClick={() => setInfoOpen((open) => !open)}
                  aria-expanded={infoOpen}
                  aria-controls={`post-info-${post.id}`}
                  className="-my-1 inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-1 text-[13.5px] font-medium text-neutral-500 transition-colors hover:text-[#111111] dark:text-neutral-400 dark:hover:text-white"
                >
                  {infoOpen ? 'Less info' : 'More info'}
                  <svg
                    className={`h-3.5 w-3.5 transition-transform duration-300 ${infoOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                    aria-hidden
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="m6 9 6 6 6-6" />
                  </svg>
                </button>
              ) : null}
            </div>
          ) : null}

          {hasInfo ? (
            <div
              id={`post-info-${post.id}`}
              className={`grid transition-[grid-template-rows,opacity] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                infoOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
              }`}
            >
              <div className="overflow-hidden">
                <dl className="grid grid-cols-2 gap-6 pt-4">
                  {priceLabel ? (
                    <div className="min-w-0">
                      <dt className="text-[13.5px] text-neutral-500 dark:text-neutral-400">Estimated cost</dt>
                      <dd className="mt-1 truncate text-[1.0625rem] font-semibold tabular-nums text-[#111111] dark:text-white">
                        {priceLabel}
                      </dd>
                    </div>
                  ) : null}
                  {tools.length > 0 ? (
                    <div className="col-start-2 min-w-0 text-right">
                      <dt className="text-[13.5px] text-neutral-500 dark:text-neutral-400">Made with</dt>
                      <dd className="mt-1 text-[1.0625rem] font-semibold text-[#111111] dark:text-white">
                        {tools.join(', ')}
                      </dd>
                    </div>
                  ) : null}
                </dl>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}

      {post.repostOf ? (
        <EmbeddedOriginal
          original={post.repostOf}
          onOpen={() => {
            setLightboxIndex(0);
            setLightboxOpen(true);
          }}
          onExpandVideo={(time) => {
            setLightboxVideoTime(time);
            setLightboxOpen(true);
          }}
        />
      ) : postGallery(post) ? (
        <div className={`${mediaSpacing} -mx-6 overflow-hidden sm:mx-0 sm:rounded-xl`}>
          <ContentPostImageCollage
            urls={postGallery(post)!}
            onOpen={(index) => {
              if (editing) return;
              setLightboxIndex(index);
              setLightboxOpen(true);
            }}
          />
        </div>
      ) : post.mediaUrl && playableMedia ? (
        <div className={`${mediaSpacing} -mx-6 overflow-hidden !bg-white dark:!bg-[#111111] sm:mx-0 sm:rounded-xl`}>
          <ContentPostFeedMediaFrame
            mediaUrl={post.mediaUrl}
            mediaType={post.mediaType}
            layout="feed"
            fit="social"
            title={title || null}
            onExpand={(time) => {
              setLightboxVideoTime(time);
              setLightboxOpen(true);
            }}
          />
        </div>
      ) : post.mediaUrl ? (
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
        className={`${mediaSpacing} -mx-6 overflow-hidden !bg-white dark:!bg-[#111111] sm:mx-0 sm:rounded-xl ${
          editing ? 'cursor-default' : 'cursor-pointer'
        }`}
      >
        <div className="pointer-events-none w-full">
          <ContentPostFeedMediaFrame mediaUrl={post.mediaUrl} mediaType={post.mediaType} layout="feed" fit="social" />
        </div>
      </div>
      ) : null}

      {!editing && messageHref ? (
        <div className="pt-5">
          <Link
            href={messageHref}
            className="flex w-full items-center justify-center gap-2.5 rounded-lg border border-black/[0.1] py-3 text-[15px] font-medium text-[#111111] transition-colors hover:border-black/20 hover:bg-black/[0.02] dark:border-white/[0.14] dark:text-white dark:hover:border-white/25 dark:hover:bg-white/[0.04]"
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
            {priceLabel ? 'Ask for a quote' : `Message ${creatorName.trim().split(/\s+/)[0] || 'creator'}`}
          </Link>
        </div>
      ) : null}

      </div>

      {showRail ? (
        <aside
          className="mt-4 flex shrink-0"
          aria-label="Post actions"
        >
          <ContentPostSocialBar
            variant="rail"
            postId={post.id}
            initialLikes={post.likes}
            createdAt={post.createdAt}
            commentsOpen={commentsOpen && canComment}
            onCommentsToggle={(open) => {
              if (canComment) setCommentsOpen(open);
            }}
            commentCount={commentCount}
            commentsDisabled={!canComment}
            shareUrl={`/marketplace/content/${encodeURIComponent(post.id)}`}
            shareTitle={title || undefined}
          />
        </aside>
      ) : null}
      </div>

      <PostCommentsSurface open={commentsOpen && canComment && !editing} onClose={closeComments}>
        {(mode) => (
          <CommentThread
            variant="panel"
            targetType="POST"
            targetId={post.id}
            isAuthenticated
            loginRedirect="/profile?tab=content"
            commentsEnabled={commentsEnabled}
            moderationMode
            onClose={closeComments}
            onCountChange={setCommentCount}
            className={mode === 'sheet' ? COMMENTS_SHEET_CLASS : COMMENTS_INLINE_CLASS}
          />
        )}
      </PostCommentsSurface>

      <ContentPostLightbox
        post={post.repostOf ?? lightboxPost}
        open={lightboxOpen}
        initialVideoTime={lightboxVideoTime}
        initialIndex={lightboxIndex}
        onClose={() => {
          setLightboxOpen(false);
          setLightboxVideoTime(0);
        }}
        bucket={bucket}
        moderationMode
        loginRedirect="/profile?tab=content"
        specialite={specialite}
        specialties={specialties}
        appRole={appRole}
      />
    </article>
  );
}

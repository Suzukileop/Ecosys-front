'use client';

import { localeTag, tr } from '@/lib/i18n/active';
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { EmbeddedOriginal, PostMedia, PostTextBlock, postHasMedia } from '@/components/home/NewsFeedPostParts';
import { AvatarImage } from '@/components/ui/PersonAvatar';
import { DIALOG_PRIMARY_BUTTON, DIALOG_SECONDARY_BUTTON } from '@/components/creator/ContentPostDialogShell';
import type { PublicContentFeedItem } from '@/types/marketplace';
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
  COMMENTS_INLINE_PREVIEW,
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
import { useT } from '@/lib/i18n/I18nProvider';

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
  if (seconds < 60) return tr('now');
  if (seconds < 3600) return tr('{count}m', { count: Math.floor(seconds / 60) });
  if (seconds < 86400) return tr('{count}h', { count: Math.floor(seconds / 3600) });
  if (seconds < 7 * 86400) return tr('{count}d', { count: Math.floor(seconds / 86400) });
  const sameYear = date.getFullYear() === new Date().getFullYear();
  return date.toLocaleDateString(localeTag(), {
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

  const sameTags =
    draftTags.length === originalTags.length && draftTags.every((t, i) => t === originalTags[i]);

  return sameTitle && sameDescription && samePrice && sameTags;
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
  const t = useT();
  const { user } = useAuth();
  const { appRole } = useCreatorAppRole();
  const [post, setPost] = useState(postProp);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const closeComments = useCallback(() => setCommentsOpen(false), []);
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
      const message = t('Write something or keep the media before saving.');
      onError(message);
      pushFlashFeedback({
        variant: 'error',
        title: t('Update failed'),
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
        title: t('Content updated'),
      });
      onChanged();
    } catch (e) {
      const message = getApiErrorMessage(e, t('Unable to save changes.'));
      onError(message);
      pushFlashFeedback({
        variant: 'error',
        title: t('Update failed'),
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
      onError(getApiErrorMessage(e, t('Impossible de modifier les commentaires.')));
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
      onError(getApiErrorMessage(e, t('Unable to update visibility.')));
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
      onError(getApiErrorMessage(e, t('Action failed.')));
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
  // The News card's text / media parts read a feed item; the studio post is the same shape plus its
  // author, who is the signed-in owner.
  const feedView: PublicContentFeedItem = {
    ...post,
    creator: { id: user?.id ?? 'local', fullName: creatorName, avatarUrl: user?.avatarUrl ?? null, appRole },
  };

  const specialtyLine =
    specialite?.trim() || specialties?.map((s) => s.trim()).find(Boolean) || null;
  const moodLine = [
    post.moodLabel?.trim() ? `${t('Feeling {mood}', { mood: t(post.moodLabel.trim()) })}${post.moodEmoji ? ` ${post.moodEmoji}` : ''}` : null,
    post.taggedUsers?.length ? t('with {names}', { names: post.taggedUsers.map((u) => u.fullName).join(', ') }) : null,
  ]
    .filter(Boolean)
    .join(' · ');
  const title = post.title?.trim() || '';
  const profileHref = user?.id ? `/providers/${user.id}` : '/profile?tab=profile';
  const showPinned = post.pinned && (bucket === 'active' || bucket === 'pinned');
  const canComment = bucket !== 'trash' && commentsEnabled;
  const isRepost = Boolean(post.repostOf);
  const hasMedia = !isRepost && postHasMedia(post);
  const discussHref =
    authorId && authorId !== user?.id && bucket !== 'archived' && bucket !== 'trash'
      ? `/messages?user=${encodeURIComponent(authorId)}`
      : null;
  const messageHref = discussHref && !user ? `/login?redirect=${encodeURIComponent(discussHref)}` : discussHref;

  const statusLabel =
    bucket === 'archived' ? t('Archived') : bucket === 'trash' ? t('In trash') : !isPublic ? t('Private') : null;
  const showBar = bucket !== 'trash' && !editing;
  const openViewer = (index: number) => {
    if (editing) return;
    setLightboxIndex(index);
    setLightboxOpen(true);
  };
  const openViewerAtVideo = (time: number) => {
    if (editing) return;
    setLightboxVideoTime(time);
    setLightboxOpen(true);
  };
  const metaDot = <span aria-hidden className="mx-1.5 text-[color:var(--gn-ink3)]">·</span>;

  /* Same anatomy as the News card (NewsFeedPostCard): header, text + media, action bar. The owner's
     state (pinned, private, archived, in trash) is a quiet word in the meta line, not a chip row. */
  return (
    <article className={`gn-post overflow-hidden bg-[#FFFFFF] dark:bg-[#111111] sm:rounded-xl ${className}`}>
      <header className="flex items-center gap-3 px-4 pt-4">
        <Link
          href={profileHref}
          className={`inline-flex shrink-0 ${creatorPostAvatarRingClass(appRole)}`}
          aria-label={creatorName}
        >
          <AvatarImage
            src={user?.avatarUrl}
            className="h-10 w-10 rounded-full object-cover"
            displayWidth={40}
            fallback={
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-200 text-[14px] font-semibold text-neutral-700 dark:bg-neutral-800 dark:text-neutral-200">
                {creatorName.trim().slice(0, 1).toUpperCase() || '?'}
              </span>
            }
          />
        </Link>
        <div className="min-w-0 flex-1">
          <Link
            href={profileHref}
            className="block truncate text-[15px] font-semibold leading-5 text-[color:var(--gn-ink)] hover:underline"
          >
            {creatorName}
          </Link>
          <p className="mt-0.5 flex min-w-0 items-center text-[13px] leading-[18px] text-[color:var(--gn-ink2)]">
            {isRepost ? (
              <span className="inline-flex shrink-0 items-center gap-1 font-medium text-[color:var(--gn-ink)]">
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="m17 2 4 4-4 4" />
                  <path d="M3 11v-1a4 4 0 0 1 4-4h14" />
                  <path d="m7 22-4-4 4-4" />
                  <path d="M21 13v1a4 4 0 0 1-4 4H3" />
                </svg>
                {t('Reposted')}
              </span>
            ) : (
              <span className="truncate">{moodLine || (specialtyLine ? t(specialtyLine) : t('Creator'))}</span>
            )}
            {metaDot}
            <time dateTime={post.createdAt} title={new Date(post.createdAt).toLocaleString()} className="shrink-0">
              {formatPostTime(post.createdAt)}
            </time>
            {showPinned ? (
              <>
                {metaDot}
                <span className="inline-flex shrink-0 items-center gap-1 font-medium text-[color:var(--gn-ink)]">
                  <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 4h6l-1 6 3 3H7l3-3-1-6zM12 13v7" />
                  </svg>
                  {t('Pinned')}
                </span>
              </>
            ) : null}
            {statusLabel ? (
              <>
                {metaDot}
                <span className="shrink-0">{statusLabel}</span>
              </>
            ) : null}
          </p>
        </div>
        <div className="-mr-2 shrink-0">{cardControls}</div>
      </header>

      <div className={`flex flex-col px-4 ${showBar ? '' : 'pb-4 sm:pb-6'}`}>
        <div className="min-w-0 flex-1">
          {editing && editDraft ? (
            <div className="pt-4">
              <ContentPostDetailsBlock
                post={post}
                bucket={bucket}
                variant="sidebar"
                editing
                draft={editDraft}
                onDraftChange={setEditDraft}
                disabled={editSaving}
              />
              <div className="mt-5 flex items-center justify-end gap-2">
                <button type="button" onClick={cancelEdit} disabled={editSaving} className={DIALOG_SECONDARY_BUTTON}>
                  {t('Cancel')}
                </button>
                <button type="button" onClick={() => void saveEdit()} disabled={editSaving} className={DIALOG_PRIMARY_BUTTON}>
                  {editSaving ? t('Saving…') : t('Save')}
                </button>
              </div>
            </div>
          ) : isRepost ? (
            title ? (
              <div className="pt-3">
                <ContentPostClampedTitle title={title} lines={6} editorial />
              </div>
            ) : null
          ) : (
            <PostTextBlock
              post={feedView}
              titleLines={hasMedia ? 2 : 10}
              hidePrice={hasMedia}
              headline={hasMedia}
              editorial
            />
          )}

          {post.repostOf ? (
            <EmbeddedOriginal original={post.repostOf} onOpen={openViewer} onExpandVideo={openViewerAtVideo} />
          ) : hasMedia ? (
            <PostMedia
              post={feedView}
              priceLabel={editing ? '' : (post.priceInfo ?? '')}
              bleed
              spacing="mt-3"
              onOpen={openViewer}
              onExpandVideo={openViewerAtVideo}
            />
          ) : null}

          {!editing && messageHref ? (
            <div className="pt-4">
              <Link href={messageHref} className={`${DIALOG_SECONDARY_BUTTON} w-full`}>
                {post.priceInfo?.trim() ? t('Ask for a quote') : `Message ${creatorName.trim().split(/\s+/)[0] || 'creator'}`}
              </Link>
            </div>
          ) : null}
        </div>
      </div>

      {showBar ? (
        <footer className="px-2 pb-1.5 pt-1.5">
          <ContentPostSocialBar
            variant="feed"
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
        </footer>
      ) : null}

      <PostCommentsSurface
        open={commentsOpen && canComment && !editing}
        onClose={closeComments}
        inlineClassName="gn-comments"
      >
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
            previewCount={mode === 'inline' ? COMMENTS_INLINE_PREVIEW : undefined}
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

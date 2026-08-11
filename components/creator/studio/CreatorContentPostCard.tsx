'use client';

import { useEffect, useState } from 'react';
import { ContentVisibilityToggle } from '@/components/creator/ContentVisibilityToggle';
import { ContentPostFeedMediaFrame } from '@/components/creator/ContentPostFeedMediaFrame';
import {
  ContentPostLightbox,
  type ContentPostLightboxPost,
} from '@/components/creator/ContentPostLightbox';
import {
  toContentDetailsDraft,
  type ContentDetailsDraft,
} from '@/components/creator/ContentPostDetailsBlock';
import { ContentPostSidePanel } from '@/components/creator/ContentPostSidePanel';
import { ContentPostSocialBar } from '@/components/creator/ContentPostSocialBar';
import { ContentPostStudioHeader } from '@/components/creator/ContentPostStudioHeader';
import { ContentPostOverflowMenu } from '@/components/creator/studio/ContentPostOverflowMenu';
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
  onChanged,
  onError,
  className = '',
}: CreatorContentPostCardProps) {
  const { user } = useAuth();
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
    <div className="flex flex-row items-center gap-1.5">
      {bucket !== 'trash' && (
        <div className="opacity-50 transition-opacity duration-200 hover:opacity-100 focus-within:opacity-100">
          <ContentVisibilityToggle
            variant="icon"
            value={isPublic}
            onChange={(v) => void handleVisibility(v)}
            disabled={visibilityBusy || editing}
          />
        </div>
      )}
      <ContentPostOverflowMenu
        postId={post.id}
        bucket={bucket}
        pinned={Boolean(post.pinned)}
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

  return (
    <div
      className={`flex h-full min-h-0 flex-col gap-4 lg:flex-row lg:items-stretch lg:gap-6 ${className}`}
    >
      <article className="flex min-h-0 w-full shrink-0 flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900 lg:h-full lg:w-[calc((100%-1.5rem)/2)] lg:max-w-[calc((100%-1.5rem)/2)]">
        <div className="relative shrink-0 p-4">
          <div className="absolute right-3 top-3">{cardControls}</div>
          <div className="pr-24">
            <ContentPostStudioHeader
              creatorName={creatorName}
              avatarUrl={user?.avatarUrl}
              specialite={specialite}
              moodLabel={post.moodLabel}
              moodEmoji={post.moodEmoji}
              taggedUsers={post.taggedUsers}
              profileHref={
                user?.id ? `/marketplace/${user.id}` : '/dashboard/creator?tab=profile'
              }
            />
          </div>
        </div>

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
          className={`relative flex min-h-[min(60vw,20rem)] flex-1 items-center justify-center bg-neutral-100 dark:bg-neutral-950 lg:min-h-0 ${
            editing ? 'cursor-default' : 'cursor-pointer'
          }`}
        >
          {post.mediaUrl ? (
            <div className="pointer-events-none h-full w-full">
              <ContentPostFeedMediaFrame
                mediaUrl={post.mediaUrl}
                mediaType={post.mediaType}
                layout="fill"
              />
            </div>
          ) : (
            <div className="flex h-full min-h-[12rem] items-center justify-center bg-neutral-100 text-xs text-neutral-400 dark:bg-neutral-900">
              No preview
            </div>
          )}

          {post.pinned && (bucket === 'active' || bucket === 'pinned') && (
            <span className="pointer-events-none absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-orange-500/90 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white backdrop-blur-sm">
              <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20" aria-hidden>
                <path d="M10 2l1.5 4.5H16l-3.7 2.7 1.4 4.3L10 11.8 6.3 13.5l1.4-4.3L4 6.5h4.5L10 2z" />
              </svg>
              Pinned
            </span>
          )}
        </div>

        <div className="shrink-0 p-4">
          {bucket !== 'trash' && (
            <ContentPostSocialBar
              postId={post.id}
              initialLikes={post.likes}
              createdAt={post.createdAt}
              commentsOpen={commentsOpen}
              onCommentsToggle={setCommentsOpen}
              commentCount={commentCount}
              hideCommentsButton
            />
          )}
        </div>
      </article>

      <ContentPostSidePanel
        post={post}
        bucket={bucket}
        commentCount={commentCount}
        commentsEnabled={commentsEnabled}
        moderationMode
        onCommentsToggle={setCommentsOpen}
        onCountChange={setCommentCount}
        loginRedirect="/dashboard/creator?tab=content"
        isAuthenticated
        className="min-h-0 flex-1 lg:h-full"
        editing={editing}
        editDraft={editDraft}
        onEditDraftChange={setEditDraft}
        onSaveEdit={() => void saveEdit()}
        onCancelEdit={cancelEdit}
        editSaving={editSaving}
      />

      <ContentPostLightbox
        post={lightboxPost}
        open={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        bucket={bucket}
        moderationMode
        loginRedirect="/dashboard/creator?tab=content"
        specialite={specialite}
      />
    </div>
  );
}

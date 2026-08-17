'use client';

import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { ContentPostFeedMediaFrame } from '@/components/creator/ContentPostFeedMediaFrame';
import { contentMediaKind } from '@/components/creator/creator-content-media';
import { ContentPostSidePanel } from '@/components/creator/ContentPostSidePanel';
import { ContentPostStudioHeader } from '@/components/creator/ContentPostStudioHeader';
import { ContentPostSocialBar } from '@/components/creator/ContentPostSocialBar';
import { listComments } from '@/lib/marketplace-api';
import { useAuth } from '@/context/AuthContext';
import type { ContentPostBucket } from '@/types/creator-content';
import type { PublicContentFeedItem } from '@/types/marketplace';

export type ContentPostLightboxPost = PublicContentFeedItem;

function LightboxMediaFill({
  mediaUrl,
  mediaType,
}: {
  mediaUrl: string;
  mediaType?: 'FILE' | 'GIF' | null;
}) {
  const kind = contentMediaKind(mediaUrl, null, mediaType);

  if (kind === 'video') {
    return (
      // eslint-disable-next-line jsx-a11y/media-has-caption
      <video
        src={mediaUrl}
        controls
        playsInline
        className="absolute inset-0 h-full w-full object-cover"
      />
    );
  }

  if (kind === 'audio' || kind === 'pdf') {
    return (
      <div className="absolute inset-0">
        <ContentPostFeedMediaFrame mediaUrl={mediaUrl} mediaType={mediaType} layout="fill" />
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={mediaUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
  );
}

type ContentPostLightboxProps = {
  post: ContentPostLightboxPost | null;
  open: boolean;
  onClose: () => void;
  loginRedirect?: string;
  bucket?: ContentPostBucket;
  moderationMode?: boolean;
  headerActions?: ReactNode;
  showSocialBar?: boolean;
  specialite?: string | null;
  /** Specialty list — first item is shown under the creator name. */
  specialties?: string[] | null;
  /** Creator app role for the avatar status ring. */
  appRole?: string | null;
};

export function ContentPostLightbox({
  post,
  open,
  onClose,
  loginRedirect = '/login',
  bucket = 'active',
  moderationMode = false,
  headerActions,
  showSocialBar = true,
  specialite,
  specialties,
  appRole,
}: ContentPostLightboxProps) {
  const { isAuthenticated } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [commentCount, setCommentCount] = useState<number | undefined>(undefined);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open || !post) return;
    setCommentsOpen(false);
    setCommentCount(undefined);

    if (post.commentsEnabled === false || bucket === 'trash') return;
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
  }, [open, post, bucket]);

  const handleClose = useCallback(() => {
    setCommentsOpen(false);
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener('keydown', onKey);
    };
  }, [open, handleClose]);

  if (!mounted || !open || !post) return null;

  const profileHref = post.creator?.id
    ? `/marketplace/${post.creator.id}`
    : '/marketplace';
  const commentsEnabled = post.commentsEnabled !== false && bucket !== 'trash';

  return createPortal(
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-3 sm:p-5" role="presentation">
      <button
        type="button"
        className="absolute inset-0 h-full w-full bg-neutral-950/80 backdrop-blur-md"
        aria-label="Close"
        onClick={handleClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={post.title?.trim() || 'Publication'}
        className="relative z-[301] flex h-[min(90dvh,860px)] w-full max-w-6xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-neutral-900"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={handleClose}
          className="absolute right-3 top-3 z-[302] flex h-10 w-10 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-sm transition hover:bg-black/60 lg:right-4 lg:top-4 lg:bg-neutral-100 lg:text-neutral-700 lg:hover:bg-neutral-200 dark:lg:bg-neutral-800 dark:lg:text-neutral-200 dark:lg:hover:bg-neutral-700"
          aria-label="Close"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
          <div className="flex min-h-0 flex-1 flex-col bg-neutral-100 dark:bg-neutral-950 lg:w-1/2">
            <div className="relative shrink-0 p-4 pr-14">
              {headerActions ? (
                <div className="absolute right-14 top-4 z-10 flex items-center gap-1.5">
                  {headerActions}
                </div>
              ) : null}
              <ContentPostStudioHeader
                creatorName={post.creator?.fullName ?? 'Creator'}
                avatarUrl={post.creator?.avatarUrl}
                appRole={appRole ?? post.creator?.appRole}
                specialite={specialite}
                specialties={specialties}
                moodLabel={post.moodLabel}
                moodEmoji={post.moodEmoji}
                taggedUsers={post.taggedUsers}
                profileHref={profileHref}
              />
            </div>

            <div className="relative min-h-[220px] flex-1 overflow-hidden bg-neutral-100 dark:bg-neutral-950">
              {post.mediaUrl ? (
                <LightboxMediaFill mediaUrl={post.mediaUrl} mediaType={post.mediaType} />
              ) : (
                <div className="flex h-full min-h-[12rem] items-center justify-center text-xs text-neutral-400">
                  No preview
                </div>
              )}
              {moderationMode && post.pinned && (bucket === 'active' || bucket === 'pinned') && (
                <span className="pointer-events-none absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-orange-500/90 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white backdrop-blur-sm">
                  <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20" aria-hidden>
                    <path d="M10 2l1.5 4.5H16l-3.7 2.7 1.4 4.3L10 11.8 6.3 13.5l1.4-4.3L4 6.5h4.5L10 2z" />
                  </svg>
                  Pinned
                </span>
              )}
            </div>

            {showSocialBar && bucket !== 'trash' && (
              <div className="shrink-0 p-4">
                <ContentPostSocialBar
                  postId={post.id}
                  initialLikes={post.likes}
                  createdAt={post.createdAt}
                  commentsOpen={commentsOpen}
                  onCommentsToggle={setCommentsOpen}
                  commentCount={commentCount}
                  hideCommentsButton
                />
              </div>
            )}
          </div>

          <div className="flex min-h-0 flex-1 flex-col border-t border-neutral-100 dark:border-neutral-800 lg:w-1/2 lg:border-l lg:border-t-0">
            <ContentPostSidePanel
              post={post}
              bucket={bucket}
              commentCount={commentCount}
              commentsEnabled={commentsEnabled}
              moderationMode={moderationMode}
              onCommentsToggle={setCommentsOpen}
              onCountChange={setCommentCount}
              loginRedirect={loginRedirect}
              isAuthenticated={isAuthenticated}
              className="h-full min-h-0 flex-1 rounded-none border-0 shadow-none"
            />
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

type ContentPostGalleryThumbProps = {
  post: Pick<ContentPostLightboxPost, 'id' | 'title' | 'mediaUrl' | 'mediaType' | 'pinned'>;
  onOpen: () => void;
};

export function ContentPostGalleryThumb({ post, onOpen }: ContentPostGalleryThumbProps) {
  const title = post.title?.trim() || 'Untitled';
  const mediaUrl = post.mediaUrl?.trim() || '';
  const kind = mediaUrl ? contentMediaKind(mediaUrl, null, post.mediaType) : null;

  return (
    <button
      type="button"
      onClick={onOpen}
      className="group relative aspect-[3/4] w-full cursor-pointer overflow-hidden rounded-2xl bg-neutral-100 text-left outline-none ring-orange-400/40 transition hover:ring-2 focus-visible:ring-2 dark:bg-neutral-900"
      aria-label={`Open ${title}`}
    >
      {mediaUrl && kind === 'video' ? (
        // eslint-disable-next-line jsx-a11y/media-has-caption
        <video
          src={mediaUrl}
          muted
          playsInline
          preload="metadata"
          className="pointer-events-none h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
        />
      ) : mediaUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={mediaUrl}
          alt=""
          className="pointer-events-none h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center px-3 text-center text-xs text-neutral-400">
          No media
        </div>
      )}
      {post.pinned ? (
        <span className="absolute left-2 top-2 rounded-md bg-orange-500/90 px-1.5 py-0.5 text-[10px] font-bold uppercase text-white">
          Pin
        </span>
      ) : null}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent p-3 pt-10">
        <p className="line-clamp-2 text-sm font-semibold text-white">{title}</p>
      </div>
    </button>
  );
}

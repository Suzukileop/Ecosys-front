'use client';

import { useEffect, useState } from 'react';
import { ContentPostLightbox } from '@/components/creator/ContentPostLightbox';
import { ContentPostSidePanel } from '@/components/creator/ContentPostSidePanel';
import { ContentPostFeedMediaFrame } from '@/components/creator/ContentPostFeedMediaFrame';
import { ContentPostSocialBar } from '@/components/creator/ContentPostSocialBar';
import { ContentPostStudioHeader } from '@/components/creator/ContentPostStudioHeader';
import { listComments } from '@/lib/marketplace-api';
import { useAuth } from '@/context/AuthContext';
import type { PublicContentFeedItem } from '@/types/marketplace';

type PublicContentPostCardProps = {
  post: PublicContentFeedItem;
  className?: string;
  /**
   * `split` = media + details side panel (when discover rail is folded).
   * `stack` = centered media card with title/category (rail expanded).
   */
  layout?: 'stack' | 'split';
};

export function PublicContentPostCard({
  post,
  className = '',
  layout = 'stack',
}: PublicContentPostCardProps) {
  const { isAuthenticated } = useAuth();
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [commentCount, setCommentCount] = useState<number | undefined>(undefined);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  useEffect(() => {
    setCommentsOpen(false);
    setCommentCount(undefined);
    setLightboxOpen(false);
  }, [post.id]);

  useEffect(() => {
    if (post.commentsEnabled === false) return;
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
  }, [post.id, post.commentsEnabled]);

  const profileHref = post.creator.id
    ? `/marketplace/${post.creator.id}`
    : '/marketplace';

  const title = post.title?.trim() || 'Untitled';
  const genre = post.genre?.trim() || null;
  const openLightbox = () => setLightboxOpen(true);
  const isSplit = layout === 'split';

  const mediaBlock = (
    <div
      role="button"
      tabIndex={0}
      aria-label="Open media fullscreen"
      onClick={openLightbox}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openLightbox();
        }
      }}
      className="relative w-full cursor-pointer bg-neutral-100 dark:bg-neutral-950"
    >
      {post.mediaUrl ? (
        <div className="pointer-events-none w-full">
          <ContentPostFeedMediaFrame
            mediaUrl={post.mediaUrl}
            mediaType={post.mediaType}
            layout="feed"
          />
        </div>
      ) : (
        <div className="flex min-h-[12rem] items-center justify-center text-xs text-neutral-400">
          No preview
        </div>
      )}
    </div>
  );

  const lightbox = (
    <ContentPostLightbox
      post={post}
      open={lightboxOpen}
      onClose={() => setLightboxOpen(false)}
      loginRedirect="/login?redirect=/dashboard/home"
    />
  );

  if (isSplit) {
    return (
      <div
        className={`mx-auto flex w-full max-w-[min(100%,88rem)] flex-col gap-4 px-1 sm:px-2 lg:flex-row lg:items-stretch lg:gap-5 ${className}`}
      >
        <article className="flex w-full shrink-0 flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900 lg:w-[calc((100%-1.5rem)/2)] lg:max-w-[calc((100%-1.5rem)/2)]">
          <div className="relative shrink-0 p-4">
            <ContentPostStudioHeader
              creatorName={post.creator.fullName}
              avatarUrl={post.creator.avatarUrl}
              moodLabel={post.moodLabel}
              moodEmoji={post.moodEmoji}
              taggedUsers={post.taggedUsers}
              profileHref={profileHref}
            />
          </div>

          {mediaBlock}

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
        </article>

        <ContentPostSidePanel
          post={post}
          commentCount={commentCount}
          commentsEnabled={post.commentsEnabled !== false}
          onCommentsToggle={setCommentsOpen}
          onCountChange={setCommentCount}
          loginRedirect="/login?redirect=/dashboard/home"
          isAuthenticated={isAuthenticated}
          className="min-h-0 w-full flex-1 lg:h-auto lg:min-h-full"
        />

        {lightbox}
      </div>
    );
  }

  return (
    <div className={`flex w-full items-center justify-center ${className}`}>
      <article className="flex w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900 xl:max-w-2xl">
        <div className="relative shrink-0 space-y-3 p-4">
          <ContentPostStudioHeader
            creatorName={post.creator.fullName}
            avatarUrl={post.creator.avatarUrl}
            moodLabel={post.moodLabel}
            moodEmoji={post.moodEmoji}
            taggedUsers={post.taggedUsers}
            profileHref={profileHref}
          />
          <div>
            <h3
              className="text-lg font-bold leading-tight text-neutral-900 dark:text-white"
              style={post.textColor ? { color: post.textColor } : undefined}
            >
              {title}
            </h3>
            {genre ? (
              <p className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-neutral-400 dark:text-neutral-500">
                {genre}
              </p>
            ) : null}
          </div>
        </div>

        {mediaBlock}

        <div className="shrink-0 p-4">
          <ContentPostSocialBar
            postId={post.id}
            initialLikes={post.likes}
            createdAt={post.createdAt}
            commentsOpen={false}
            onCommentsToggle={() => openLightbox()}
            commentCount={commentCount}
          />
        </div>
      </article>

      {lightbox}
    </div>
  );
}

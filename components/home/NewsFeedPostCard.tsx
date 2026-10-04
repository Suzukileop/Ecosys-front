'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { ContentPostFeedMediaFrame } from '@/components/creator/ContentPostFeedMediaFrame';
import { contentMediaKind } from '@/components/creator/creator-content-media';
import { ContentPostClampedTitle } from '@/components/creator/ContentPostClampedTitle';
import { ContentPostLightbox } from '@/components/creator/ContentPostLightbox';
import { ContentPostSocialBar } from '@/components/creator/ContentPostSocialBar';
import { CommentThread } from '@/components/marketplace/CommentThread';
import {
  COMMENTS_INLINE_CLASS,
  COMMENTS_SHEET_CLASS,
  PostCommentsSurface,
} from '@/components/creator/PostCommentsSurface';
import { AvatarImage } from '@/components/ui/PersonAvatar';
import { listComments } from '@/lib/marketplace-api';
import { creatorPostAvatarRingClass, normalizeCreatorAppRole } from '@/lib/creator-app-role';
import { useAuth } from '@/context/AuthContext';
import type { PublicContentFeedItem } from '@/types/marketplace';

const NEWS_LOGIN_REDIRECT = '/login?redirect=/dashboard/home';

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

/** Read-only News feed card — same anatomy as the studio `CreatorContentPostCard`. */
export function NewsFeedPostCard({
  post,
  className = '',
  priority = false,
}: {
  post: PublicContentFeedItem;
  className?: string;
  /** First card of the feed: its media is the largest thing above the fold. */
  priority?: boolean;
}) {
  const { user, isAuthenticated } = useAuth();
  const [commentsOpen, setCommentsOpen] = useState(false);
  const closeComments = useCallback(() => setCommentsOpen(false), []);
  const [infoOpen, setInfoOpen] = useState(false);
  /**
   * The feed payload carries the count; `liveCommentCount` only holds a value once this card has
   * a fresher one — a legacy payload it had to fetch, or a comment the viewer just posted.
   */
  const [liveCommentCount, setCommentCount] = useState<number | undefined>(undefined);
  const commentCount = liveCommentCount ?? post.commentCount;
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxVideoTime, setLightboxVideoTime] = useState(0);

  const commentsEnabled = post.commentsEnabled !== false;
  const creator = post.creator;
  const creatorName = creator.fullName?.trim() || 'Creator';
  const isOwnPost = Boolean(user?.id && user.id === creator.id);

  useEffect(() => {
    setCommentsOpen(false);
    setInfoOpen(false);
    setCommentCount(undefined);
    setLightboxOpen(false);
  }, [post.id]);

  useEffect(() => {
    if (!commentsEnabled) return;
    /* Supplied by the feed — a request per card would only confirm what we already have. */
    if (post.commentCount !== undefined) return;
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
  }, [post.id, post.commentCount, commentsEnabled]);

  const profileHref = creator.id ? `/marketplace/${creator.id}` : '/marketplace';
  const specialtyLine =
    creator.specialite?.trim() || creator.specialties?.map((s) => s.trim()).find(Boolean) || null;
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
  const mediaKind = post.mediaUrl ? contentMediaKind(post.mediaUrl, null, post.mediaType) : null;
  const playableMedia = mediaKind === 'video' || mediaKind === 'audio';
  const hasInfo = Boolean(priceLabel || tools.length > 0);
  const hasTextBlock = Boolean(title || tags.length > 0 || hasInfo);
  const mediaSpacing = hasTextBlock ? 'mt-3' : 'mt-4';

  return (
    <article
      className={`overflow-hidden bg-[#EEF0F2] max-md:border-y max-md:border-[#DADDE1] max-md:!bg-white md:rounded-lg dark:max-md:border-white/[0.16] dark:max-md:!bg-[#111111] transition-shadow duration-300 hover:shadow-[0_16px_48px_-28px_rgba(0,0,0,0.22)] dark:bg-[#111111] ${className}`}
    >
      <header className="flex items-center gap-3.5 px-6 pt-6 sm:px-7 sm:pt-7">
        <Link
          href={profileHref}
          className={`inline-flex shrink-0 ${creatorPostAvatarRingClass(normalizeCreatorAppRole(creator.appRole))}`}
          aria-label={creatorName}
        >
          <AvatarImage
            src={creator.avatarUrl}
            className="h-11 w-11 rounded-full object-cover"
            fallback={
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-neutral-200 text-sm font-semibold text-neutral-700 dark:bg-neutral-800 dark:text-neutral-200">
                {creatorName.slice(0, 1).toUpperCase()}
              </span>
            }
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
      </header>

      <div className="flex flex-col pb-4 pl-6 pr-6 sm:pb-6 sm:pl-7 sm:pr-7">
        <div className="min-w-0 flex-1">
          {hasTextBlock ? (
            <div className="pt-4">
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
                      aria-controls={`news-post-info-${post.id}`}
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
                  id={`news-post-info-${post.id}`}
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

          {post.mediaUrl && playableMedia ? (
            <div className={`${mediaSpacing} -mx-6 overflow-hidden bg-[#EEF0F2] max-md:!bg-transparent dark:bg-[#111111] sm:mx-0 sm:rounded-xl`}>
              <ContentPostFeedMediaFrame
                mediaUrl={post.mediaUrl}
                mediaType={post.mediaType}
                layout="feed"
                fit="social"
                priority={priority}
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
              onClick={() => setLightboxOpen(true)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setLightboxOpen(true);
                }
              }}
              className={`${mediaSpacing} cursor-pointer -mx-6 overflow-hidden bg-[#EEF0F2] max-md:!bg-transparent dark:bg-[#111111] sm:mx-0 sm:rounded-xl`}
            >
              <div className="pointer-events-none w-full">
                <ContentPostFeedMediaFrame
                  mediaUrl={post.mediaUrl}
                  mediaType={post.mediaType}
                  layout="feed"
                  fit="social"
                  priority={priority}
                />
              </div>
            </div>
          ) : null}
        </div>

        <aside
          className="mt-4 flex shrink-0"
          aria-label="Post actions"
        >
          <ContentPostSocialBar
            variant="rail"
            postId={post.id}
            initialLikes={post.likes}
            initialCommentCount={post.commentCount}
            initialViewerReaction={post.viewerReaction}
            createdAt={post.createdAt}
            commentsOpen={commentsOpen && commentsEnabled}
            onCommentsToggle={(open) => {
              if (commentsEnabled) setCommentsOpen(open);
            }}
            commentCount={commentCount}
            commentsDisabled={!commentsEnabled}
            shareUrl={`/marketplace/content/${encodeURIComponent(post.id)}`}
            shareTitle={title || undefined}
          />
        </aside>
      </div>

      <PostCommentsSurface open={commentsOpen && commentsEnabled} onClose={closeComments}>
        {(mode) => (
          <CommentThread
            variant="panel"
            targetType="POST"
            targetId={post.id}
            isAuthenticated={isAuthenticated}
            loginRedirect={NEWS_LOGIN_REDIRECT}
            commentsEnabled={commentsEnabled}
            moderationMode={isOwnPost}
            onClose={closeComments}
            onCountChange={setCommentCount}
            className={mode === 'sheet' ? COMMENTS_SHEET_CLASS : COMMENTS_INLINE_CLASS}
          />
        )}
      </PostCommentsSurface>

      <ContentPostLightbox
        post={post}
        open={lightboxOpen}
        initialVideoTime={lightboxVideoTime}
        onClose={() => {
          setLightboxOpen(false);
          setLightboxVideoTime(0);
        }}
        moderationMode={isOwnPost}
        loginRedirect={NEWS_LOGIN_REDIRECT}
        specialite={creator.specialite}
        specialties={creator.specialties}
        appRole={creator.appRole}
      />
    </article>
  );
}

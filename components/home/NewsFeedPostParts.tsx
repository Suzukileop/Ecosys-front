'use client';

import Link from 'next/link';
import { ContentPostClampedTitle } from '@/components/creator/ContentPostClampedTitle';
import { ContentPostFeedMediaFrame } from '@/components/creator/ContentPostFeedMediaFrame';
import { ContentPostImageCollage } from '@/components/creator/ContentPostImageCollage';
import { contentMediaKind, isCollageImage } from '@/components/creator/creator-content-media';
import { AvatarImage } from '@/components/ui/PersonAvatar';
import { creatorPostAvatarRingClass, normalizeCreatorAppRole } from '@/lib/creator-app-role';
import type { PublicContentFeedItem } from '@/types/marketplace';

export function formatPostTime(iso: string): string {
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

/** The images of a collage post, or `null` for single-media / text posts. */
export function postGallery(post: Pick<PublicContentFeedItem, 'mediaUrls'>): string[] | null {
  const urls = post.mediaUrls;
  return urls && urls.length > 1 && urls.every((url) => isCollageImage(url)) ? urls : null;
}

export function postHasMedia(post: Pick<PublicContentFeedItem, 'mediaUrl' | 'mediaUrls'>): boolean {
  return Boolean(post.mediaUrl || (post.mediaUrls && post.mediaUrls.length > 0));
}

/**
 * Title, estimate, tag chips and the tools of a post.
 *
 * The estimate is the one number a visitor is scanning for, so it leads the chip row instead of
 * hiding behind a click. Tools used to live in a "More info" accordion; with the price out of it
 * only one short line was left inside, so the accordion is gone and the tools read as a plain
 * "Made with …" line — everything is visible, nothing to open.
 */
export function PostTextBlock({
  post,
  titleLines,
  className = 'pt-4',
  showTools = true,
}: {
  post: PublicContentFeedItem;
  /** Line clamp for the title; text-only posts show far more. */
  titleLines: number;
  className?: string;
  /** The "Made with …" line; the News feed leaves it out of its cards. */
  showTools?: boolean;
}) {
  const title = post.title?.trim() || '';
  const tags = normalizeList(post.tags ?? []);
  const tools = showTools ? (post.toolsUsed ?? []).map((t) => t.trim()).filter(Boolean) : [];
  const priceLabel = post.priceInfo?.trim() || '';

  if (!title && tags.length === 0 && !priceLabel && tools.length === 0) return null;

  return (
    <div className={className}>
      {title ? <ContentPostClampedTitle title={title} lines={titleLines} /> : null}

      {tags.length > 0 || priceLabel ? (
        <p className="mt-3 flex min-w-0 flex-wrap gap-1.5">
          {priceLabel ? (
            <span className="rounded-full bg-[#FF5722]/10 px-2.5 py-1 text-[13px] font-semibold leading-none tabular-nums text-[#FF5722]">
              {priceLabel}
            </span>
          ) : null}
          {tags.map((tag) => (
            <span
              key={tag}
              className="gn-inset rounded-full px-2.5 py-1 text-[13px] font-medium leading-none text-neutral-600 dark:text-neutral-300"
            >
              {tag}
            </span>
          ))}
        </p>
      ) : null}

      {tools.length > 0 ? (
        <p className="mt-2.5 text-[13px] leading-snug text-neutral-500 dark:text-neutral-400">
          Made with <span className="font-medium text-neutral-700 dark:text-neutral-200">{tools.join(', ')}</span>
        </p>
      ) : null}
    </div>
  );
}

/**
 * The media of a post: a collage for several images, otherwise one frame (video / audio play in
 * place, an image opens the viewer). `bleed` runs it edge to edge of the card; embedded originals
 * sit inside their own frame instead.
 */
export function PostMedia({
  post,
  bleed,
  spacing,
  priority = false,
  onOpen,
  onExpandVideo,
}: {
  post: PublicContentFeedItem;
  bleed: boolean;
  /** Top margin class, e.g. `mt-3`. */
  spacing: string;
  priority?: boolean;
  /** Opens the viewer on the given image. */
  onOpen: (index: number) => void;
  onExpandVideo: (time: number) => void;
}) {
  const gallery = postGallery(post);
  // `gn-media` lets the page's "Post layout" choice pull the media back inside the card's padding.
  const wrapper = `${spacing} ${bleed ? '-mx-4 sm:-mx-5 gn-media' : ''} overflow-hidden`;

  if (gallery) {
    return (
      <div className={wrapper}>
        <ContentPostImageCollage urls={gallery} onOpen={onOpen} priority={priority} />
      </div>
    );
  }

  const mediaUrl = post.mediaUrl ?? post.mediaUrls?.[0] ?? null;
  if (!mediaUrl) return null;

  const mediaKind = contentMediaKind(mediaUrl, null, post.mediaType);
  const surface = 'bg-[#EEF0F2] max-md:!bg-transparent dark:bg-[#111111]';

  if (mediaKind === 'video' || mediaKind === 'audio') {
    return (
      <div className={`${wrapper} ${surface}`}>
        <ContentPostFeedMediaFrame
          mediaUrl={mediaUrl}
          mediaType={post.mediaType}
          layout="feed"
          fit="social"
          priority={priority}
          title={post.title?.trim() || null}
          onExpand={onExpandVideo}
        />
      </div>
    );
  }

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label="Open media fullscreen"
      onClick={() => onOpen(0)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpen(0);
        }
      }}
      className={`${wrapper} ${surface} cursor-pointer`}
    >
      <div className="pointer-events-none w-full">
        <ContentPostFeedMediaFrame
          mediaUrl={mediaUrl}
          mediaType={post.mediaType}
          layout="feed"
          fit="social"
          priority={priority}
        />
      </div>
    </div>
  );
}

/** A post quoted inside a repost: its author, text and media in a bordered frame. */
export function EmbeddedOriginal({
  original,
  onOpen,
  onExpandVideo,
  showTools = true,
}: {
  original: PublicContentFeedItem;
  onOpen: (index: number) => void;
  onExpandVideo: (time: number) => void;
  showTools?: boolean;
}) {
  const creator = original.creator;
  const name = creator.fullName?.trim() || 'Creator';
  const href = creator.id ? `/providers/${creator.id}` : '/marketplace';
  const hasMedia = postHasMedia(original);

  return (
    <div className="gn-inset mt-4 overflow-hidden rounded-xl">
      <div className="flex items-center gap-3 px-4 pt-3.5">
        <Link
          href={href}
          className={`inline-flex shrink-0 ${creatorPostAvatarRingClass(normalizeCreatorAppRole(creator.appRole))}`}
          aria-label={name}
        >
          <AvatarImage
            src={creator.avatarUrl}
            className="h-9 w-9 rounded-full object-cover"
            displayWidth={36}
            fallback={
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-200 text-[13px] font-semibold text-neutral-700 dark:bg-neutral-800 dark:text-neutral-200">
                {name.slice(0, 1).toUpperCase()}
              </span>
            }
          />
        </Link>
        <p className="min-w-0 truncate text-[13px] leading-tight text-neutral-500 dark:text-neutral-400">
          <Link href={href} className="text-[14px] font-semibold text-[#111111] hover:underline dark:text-white">
            {name}
          </Link>
          <span aria-hidden className="mx-1.5 text-neutral-300 dark:text-neutral-600">
            ·
          </span>
          <time dateTime={original.createdAt}>{formatPostTime(original.createdAt)}</time>
        </p>
      </div>

      <PostTextBlock post={original} titleLines={hasMedia ? 3 : 8} className="px-4 pt-3" showTools={showTools} />

      {hasMedia ? (
        <PostMedia
          post={original}
          bleed={false}
          spacing="mt-3"
          onOpen={onOpen}
          onExpandVideo={onExpandVideo}
        />
      ) : (
        <div className="h-3.5" aria-hidden />
      )}
    </div>
  );
}

/** Stand-in for a repost whose original was deleted or made private. */
export function UnavailableOriginal() {
  return (
    <div className="gn-inset mt-4 rounded-xl px-4 py-6 text-center text-[14px] text-neutral-500 dark:text-neutral-400">
      This post is no longer available.
    </div>
  );
}

'use client';

import { localeTag, tr } from '@/lib/i18n/active';
import Link from 'next/link';
import { ContentPostClampedTitle } from '@/components/creator/ContentPostClampedTitle';
import { ContentPostFeedMediaFrame } from '@/components/creator/ContentPostFeedMediaFrame';
import { ContentPostImageCollage } from '@/components/creator/ContentPostImageCollage';
import { contentMediaKind, isCollageImage } from '@/components/creator/creator-content-media';
import { AvatarImage } from '@/components/ui/PersonAvatar';
import { creatorPostAvatarRingClass, normalizeCreatorAppRole } from '@/lib/creator-app-role';
import type { PublicContentFeedItem } from '@/types/marketplace';
import { useT } from '@/lib/i18n/I18nProvider';

export function formatPostTime(iso: string): string {
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

/** The images of a collage post, or `null` for single-media / text posts. */
export function postGallery(post: Pick<PublicContentFeedItem, 'mediaUrls'>): string[] | null {
  const urls = post.mediaUrls;
  return urls && urls.length > 1 && urls.every((url) => isCollageImage(url)) ? urls : null;
}

export function postHasMedia(post: Pick<PublicContentFeedItem, 'mediaUrl' | 'mediaUrls'>): boolean {
  return Boolean(post.mediaUrl || (post.mediaUrls && post.mediaUrls.length > 0));
}

/**
 * Title, estimate and tag chips of a post.
 *
 * The estimate is the one number a visitor is scanning for, so it leads the chip row instead of
 * hiding behind a click.
 */
export function PostTextBlock({
  post,
  titleLines,
  className = 'pt-3',
  hidePrice = false,
  headline = false,
  editorial = false,
}: {
  post: PublicContentFeedItem;
  /** News: first line as a bold sans headline over the body (see ContentPostClampedTitle). */
  editorial?: boolean;
  /** The text is the card's headline (posts with media); see ContentPostClampedTitle. */
  headline?: boolean;
  /** Line clamp for the title; text-only posts show far more. */
  titleLines: number;
  className?: string;
  /** The price is shown as a badge on the media instead (posts that have media). */
  hidePrice?: boolean;
}) {
  const title = post.title?.trim() || '';
  const tags = normalizeList(post.tags ?? []);
  const priceLabel = hidePrice ? '' : post.priceInfo?.trim() || '';

  if (!title && tags.length === 0 && !priceLabel) return null;

  return (
    <div className={className}>
      {title ? (
        <ContentPostClampedTitle title={title} lines={titleLines} variant={headline ? 'headline' : 'body'} editorial={editorial} />
      ) : null}

      {/* Price first, as a solid ink pill: it is the figure a visitor is scanning for, and on a
          black / white card weight + inversion carry that emphasis without a colour. Tags follow as
          filled pills (light: neutral-100 + neutral-200 border on the white card; dark: zinc-800), distinct from the card. One size for the row: 12/16,
          px-2.5 py-1. */}
      {tags.length > 0 || priceLabel ? (
        <p className={`${title ? 'mt-3' : ''} flex min-w-0 flex-wrap items-center gap-1.5`}>
          {priceLabel ? (
            <span className="inline-flex items-center rounded-full border border-[#111111] bg-[#111111] px-2.5 py-1 text-xs font-semibold tabular-nums text-white dark:border-white dark:bg-white dark:text-[#111111]">
              {priceLabel}
            </span>
          ) : null}
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center rounded-full border border-[#e5e5e5] bg-[#f5f5f5] px-2.5 py-1 text-xs font-medium text-[#404040] dark:border-[#27272a] dark:bg-[#27272a] dark:text-[#d4d4d8]"
            >
              {tag}
            </span>
          ))}
        </p>
      ) : null}

    </div>
  );
}

/**
 * The price as a badge overlapping the media. An ink pill (85% opaque, blurred behind) reads on any
 * image, light or dark. Bottom-left on images; top-left on video / audio, whose controls own the
 * bottom edge.
 */
function MediaPriceBadge({ label, placement }: { label: string; placement: 'bottom' | 'top' }) {
  return (
    <span
      className={`pointer-events-none absolute left-3 z-[2] inline-flex h-7 items-center rounded-full bg-[#0f0f0f]/85 px-3 text-[13px] font-semibold leading-4 tabular-nums text-white shadow-[0_2px_8px_rgba(0,0,0,0.25)] ring-1 ring-inset ring-white/15 backdrop-blur-xs ${
        placement === 'bottom' ? 'bottom-3' : 'top-3'
      }`}
    >
      {label}
    </span>
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
  priceLabel = '',
}: {
  post: PublicContentFeedItem;
  /** When set, shown as a badge on the media (see MediaPriceBadge). */
  priceLabel?: string;
  bleed: boolean;
  /** Top margin class, e.g. `mt-3`. */
  spacing: string;
  priority?: boolean;
  /** Opens the viewer on the given image. */
  onOpen: (index: number) => void;
  onExpandVideo: (time: number) => void;
}) {
  const t = useT();
  const gallery = postGallery(post);
  // The card's own media runs edge to edge (-mx-4 cancels the 16px text gutter); the card's hairline
  // border (.gn-post) keeps a black image's edge visible on a black page. Inside a quoted original
  // (`bleed={false}`) it sits inset in the quote box with 8px corners (box 12px, 12px inset: the
  // concentric radius), clipped by its own wrapper so no image corner pokes past the frame.
  const wrapper = `relative ${spacing} ${bleed ? '-mx-4' : 'rounded-lg'} overflow-hidden`;
  const price = priceLabel.trim();

  if (gallery) {
    return (
      <div className={wrapper}>
        <ContentPostImageCollage urls={gallery} onOpen={onOpen} priority={priority} />
        {price ? <MediaPriceBadge label={price} placement="bottom" /> : null}
      </div>
    );
  }

  const mediaUrl = post.mediaUrl ?? post.mediaUrls?.[0] ?? null;
  if (!mediaUrl) return null;

  const mediaKind = contentMediaKind(mediaUrl, null, post.mediaType);
  // Letterbox behind media that doesn't fill the frame: a faint tone, never a second card colour.
  // Inside a quoted original it is a shade deeper than the box, so the 8px rounded tile stays visible
  // even when the image is letterboxed (otherwise its square corners float inside an invisible frame).
  const surface = bleed ? 'bg-black/[0.04] dark:bg-white/[0.04]' : 'bg-black/[0.05] dark:bg-black/25';
  const letterbox = bleed ? 'card' : 'transparent';

  if (mediaKind === 'video' || mediaKind === 'audio') {
    return (
      <div className={`${wrapper} ${surface}`}>
        <ContentPostFeedMediaFrame
          mediaUrl={mediaUrl}
          mediaType={post.mediaType}
          layout="feed"
          fit="social"
          letterbox={letterbox}
          priority={priority}
          title={post.title?.trim() || null}
          onExpand={onExpandVideo}
        />
        {price ? <MediaPriceBadge label={price} placement="top" /> : null}
      </div>
    );
  }

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={t('Open media fullscreen')}
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
          letterbox={letterbox}
          priority={priority}
        />
      </div>
      {price ? <MediaPriceBadge label={price} placement="bottom" /> : null}
    </div>
  );
}

/** A post quoted inside a repost: its author, text and media in a tonal box (no outline). */
export function EmbeddedOriginal({
  original,
  onOpen,
  onExpandVideo,
}: {
  original: PublicContentFeedItem;
  onOpen: (index: number) => void;
  onExpandVideo: (time: number) => void;
}) {
  const creator = original.creator;
  const name = creator.fullName?.trim() || 'Creator';
  const href = creator.id ? `/providers/${creator.id}` : '/marketplace';
  const hasMedia = postHasMedia(original);

  return (
    <div className="gn-inset mt-3 overflow-hidden rounded-xl bg-black/[0.04] dark:bg-white/[0.06]">
      <div className="flex items-center gap-2.5 px-3.5 pt-3">
        <Link
          href={href}
          className={`inline-flex shrink-0 ${creatorPostAvatarRingClass(normalizeCreatorAppRole(creator.appRole))}`}
          aria-label={name}
        >
          <AvatarImage
            src={creator.avatarUrl}
            className="h-8 w-8 rounded-full object-cover"
            displayWidth={32}
            fallback={
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-200 text-[12px] font-semibold text-neutral-700 dark:bg-neutral-800 dark:text-neutral-200">
                {name.slice(0, 1).toUpperCase()}
              </span>
            }
          />
        </Link>
        <p className="min-w-0 truncate text-[13px] leading-[18px] text-[color:var(--gn-ink2)]">
          <Link href={href} className="text-[15px] font-semibold leading-5 text-[color:var(--gn-ink)] hover:underline">
            {name}
          </Link>
          <span aria-hidden className="mx-1.5 text-[color:var(--gn-ink3)]">
            ·
          </span>
          <time dateTime={original.createdAt}>{formatPostTime(original.createdAt)}</time>
        </p>
      </div>

      <PostTextBlock
        post={original}
        titleLines={hasMedia ? 3 : 8}
        className="px-3.5 pt-3"
        hidePrice={hasMedia}
      />

      {hasMedia ? (
        <div className="px-3 pb-3">
          <PostMedia
            post={original}
            bleed={false}
            spacing="mt-3"
            priceLabel={original.priceInfo ?? ''}
            onOpen={onOpen}
            onExpandVideo={onExpandVideo}
          />
        </div>
      ) : (
        <div className="h-3" aria-hidden />
      )}
    </div>
  );
}

/** Stand-in for a repost whose original was deleted or made private. */
export function UnavailableOriginal() {
  const t = useT();
  return (
    <div className="gn-inset mt-3 rounded-xl bg-black/[0.04] px-4 py-6 text-center text-[14px] leading-5 text-neutral-500 dark:bg-white/[0.06] dark:text-neutral-400">
      {t('This post is no longer available.')}
    </div>
  );
}

'use client';

import { localeTag } from '@/lib/i18n/active';
import { useRef, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { ContentPostLightbox } from '@/components/creator/ContentPostLightbox';
import { contentMediaKind } from '@/components/creator/creator-content-media';
import { Avatar } from '@/components/ui/Avatar';
import { mediaImageResponsive } from '@/lib/media-image-url';
import type { PublicContentFeedItem } from '@/types/marketplace';
import { useT } from '@/lib/i18n/I18nProvider';

/** Same grid as products: one column on phones, two from sm, three from xl (beside the rail). */
export const searchContentGridClassName =
  'grid min-w-0 grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-5';

const IMAGE_WIDTHS = [384, 640, 828] as const;
const IMAGE_SIZES = '(min-width: 1280px) 280px, (min-width: 640px) 300px, 100vw';

function HeartIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden>
      <path d="M10 17.2l-1.15-1.04C4.7 12.4 2 9.96 2 6.98 2 4.55 3.9 2.7 6.3 2.7c1.36 0 2.67.64 3.7 1.66a5.2 5.2 0 013.7-1.66C16.1 2.7 18 4.55 18 6.98c0 2.98-2.7 5.42-6.85 9.19L10 17.2z" />
    </svg>
  );
}

function PlayIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden>
      <path d="M6.5 4.6a1 1 0 011.5-.86l8 5.4a1 1 0 010 1.72l-8 5.4a1 1 0 01-1.5-.86V4.6z" />
    </svg>
  );
}

function StackIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.6} aria-hidden>
      <rect x="6.5" y="6.5" width="10" height="10" rx="2" />
      <path d="M13.5 3.5h-8a2 2 0 00-2 2v8" strokeLinecap="round" />
    </svg>
  );
}

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const sameYear = date.getFullYear() === new Date().getFullYear();
  return date.toLocaleDateString(localeTag(), {
    month: 'short',
    day: 'numeric',
    ...(sameYear ? {} : { year: 'numeric' }),
  });
}

function MediaBadge({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-black/60 px-2.5 py-1 text-[12px] font-semibold leading-4 text-white backdrop-blur-sm">
      {children}
    </span>
  );
}

/** Stand-in for posts whose media can't be shown as a picture: audio, documents, or text only. */
function MediaPlaceholder({
  kind,
  title,
  textColor,
}: {
  kind: 'audio' | 'pdf' | 'text';
  title: string;
  textColor?: string | null;
}) {
  const t = useT();
  if (kind === 'text') {
    return (
      <div className="flex h-full w-full items-end bg-[#EFF3F4] p-6 dark:bg-[#202327]">
        <p
          className="line-clamp-5 text-[1.35rem] font-bold leading-[1.15] tracking-[-0.02em] text-[#0F1419] dark:text-[#E7E9EA]"
          style={textColor ? { color: textColor } : undefined}
        >
          {title}
        </p>
      </div>
    );
  }
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-[#EFF3F4] text-[#536471] dark:bg-[#202327] dark:text-[#8B98A5]">
      {kind === 'audio' ? (
        <div className="flex h-10 items-center gap-1" aria-hidden>
          {[0.4, 0.75, 0.55, 1, 0.65, 0.9, 0.45, 0.7, 0.35].map((h, i) => (
            <span
              key={i}
              className="w-[3px] rounded-full bg-current"
              style={{ height: `${Math.round(h * 100)}%` }}
            />
          ))}
        </div>
      ) : (
        <svg viewBox="0 0 24 24" className="h-9 w-9" fill="none" stroke="currentColor" strokeWidth={1.4} aria-hidden>
          <path d="M7 3.5h7l4 4V20a.5.5 0 01-.5.5h-10A.5.5 0 017 20V3.5z" strokeLinejoin="round" />
          <path d="M14 3.5V8h4" strokeLinejoin="round" />
        </svg>
      )}
      <span className="text-[13px] font-semibold leading-[18px]">
        {kind === 'audio' ? t('Audio') : t('Document')}
      </span>
    </div>
  );
}

/**
 * One "Content" search result: a media-first card — cover on top (it zooms on hover; videos play a
 * muted preview), then title, an optional excerpt, tags and the creator. The whole card opens the
 * post in the lightbox, which already carries the comments and reactions, so the result stays a
 * compact thumbnail instead of a full feed post.
 */
export function SearchContentCard({ post }: { post: PublicContentFeedItem }) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  /* A repost carries no media of its own: show what it points at. */
  const shown = post.repostOf ?? post;
  const title = shown.title?.trim() || post.title?.trim() || '';
  const description = shown.description?.trim() ?? '';
  const creator = shown.creator;
  const profileHref = creator.id ? `/providers/${creator.id}` : null;

  const mediaUrl = shown.mediaUrl?.trim() || '';
  const kind = mediaUrl ? contentMediaKind(mediaUrl, null, shown.mediaType) : null;
  const galleryCount = shown.mediaUrls?.length ?? 0;

  const tags = [shown.genre, ...(shown.tags ?? [])]
    .map((tag) => tag?.trim())
    .filter((tag): tag is string => Boolean(tag))
    .slice(0, 3);

  const isPicture = kind === 'image' || kind === 'gif';
  const responsive = isPicture ? mediaImageResponsive(mediaUrl, IMAGE_WIDTHS) : null;

  const playPreview = () => {
    const video = videoRef.current;
    if (video) void video.play().catch(() => {});
  };
  const stopPreview = () => {
    const video = videoRef.current;
    if (!video) return;
    video.pause();
    video.currentTime = 0.1;
  };

  return (
    <article className="gn-card group/card flex min-w-0 flex-col overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        onMouseEnter={playPreview}
        onMouseLeave={stopPreview}
        aria-label={title ? t('Open “{title}”', { title }) : t('Open post')}
        className="relative block aspect-[4/3] w-full overflow-hidden bg-[#EFF3F4] text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[color:var(--gn-ring)] dark:bg-[#202327]"
      >
        <span
          className="absolute inset-0 transition-transform duration-[700ms] ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform group-hover/card:scale-[1.04]"
          data-pf-no-color-transition=""
        >
          {responsive ? (
            // eslint-disable-next-line @next/next/no-img-element -- sized through the media optimizer helper
            <img
              src={responsive.src}
              srcSet={responsive.srcSet}
              sizes={IMAGE_SIZES}
              alt=""
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover"
            />
          ) : kind === 'video' ? (
            <video
              ref={videoRef}
              src={`${mediaUrl}#t=0.1`}
              muted
              loop
              playsInline
              preload="metadata"
              className="h-full w-full object-cover"
            />
          ) : (
            <MediaPlaceholder
              kind={kind === 'audio' ? 'audio' : kind === 'pdf' ? 'pdf' : 'text'}
              title={title || description}
              textColor={post.textColor}
            />
          )}
        </span>

        <span className="pointer-events-none absolute inset-x-3 top-3 flex items-start justify-between gap-2">
          <span className="flex flex-wrap gap-1.5">
            {post.repostOf ? <MediaBadge>{t('Repost')}</MediaBadge> : null}
            {kind === 'gif' ? <MediaBadge>{t('GIF')}</MediaBadge> : null}
          </span>
          {galleryCount > 1 ? (
            <MediaBadge>
              <StackIcon className="h-3.5 w-3.5" />
              {galleryCount}
            </MediaBadge>
          ) : null}
        </span>

        {kind === 'video' ? (
          <span className="pointer-events-none absolute bottom-3 left-3 flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-sm transition-transform duration-300 group-hover/card:scale-110">
            <PlayIcon className="ml-0.5 h-4 w-4" />
          </span>
        ) : null}
      </button>

      <div className="flex flex-1 flex-col px-5 pb-4 pt-4">
        {tags.length > 0 ? (
          <p className="gn-kicker mb-1.5 flex flex-wrap gap-x-2">
            {tags.map((tag, index) => (
              <span key={`${tag}-${index}`}>
                {index > 0 ? <span aria-hidden className="mr-2 text-[color:var(--gn-ink3)]">·</span> : null}
                {tag}
              </span>
            ))}
          </p>
        ) : null}

        {title ? (
          <h3 className="text-[16px] font-bold leading-[22px] tracking-[-0.005em] text-[color:var(--gn-ink)]">
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="line-clamp-2 text-left underline-offset-2 hover:underline focus-visible:underline focus-visible:outline-none"
            >
              {title}
            </button>
          </h3>
        ) : null}

        {description && (title || kind) ? (
          <p className={`${title ? 'mt-1' : ''} line-clamp-2 text-[14px] leading-5 text-[color:var(--gn-ink2)]`}>
            {description}
          </p>
        ) : null}

        <div className="mt-auto flex items-center justify-between gap-4 pt-4">
          {profileHref ? (
            <Link href={profileHref} className="group/creator flex min-w-0 items-center gap-2.5">
              <Avatar name={creator.fullName} avatarUrl={creator.avatarUrl} size="sm" tone="muted" />
              <span className="truncate text-[14px] font-semibold leading-5 text-[color:var(--gn-ink)] underline-offset-2 group-hover/creator:underline">
                {creator.fullName}
              </span>
            </Link>
          ) : (
            <span className="flex min-w-0 items-center gap-2.5">
              <Avatar name={creator.fullName} avatarUrl={creator.avatarUrl} size="sm" tone="muted" />
              <span className="truncate text-[14px] font-semibold leading-5 text-[color:var(--gn-ink)]">
                {creator.fullName}
              </span>
            </span>
          )}

          <span className="flex shrink-0 items-center gap-3 text-[13px] leading-[18px] tabular-nums text-[color:var(--gn-ink2)]">
            {shown.likes > 0 ? (
              <span className="inline-flex items-center gap-1" aria-label={`${shown.likes} likes`}>
                <HeartIcon className="h-3.5 w-3.5 text-[color:var(--gn-ink)]" />
                {shown.likes.toLocaleString(localeTag())}
              </span>
            ) : null}
            <time dateTime={shown.createdAt}>{formatDate(shown.createdAt)}</time>
          </span>
        </div>
      </div>

      {open ? (
        <ContentPostLightbox
          post={shown}
          open
          onClose={() => setOpen(false)}
          loginRedirect="/login?redirect=/search"
          appRole={creator.appRole}
          specialite={creator.specialite}
          specialties={creator.specialties}
        />
      ) : null}
    </article>
  );
}

'use client';

import { contentMediaKind } from '@/components/creator/creator-content-media';
import { mediaImageSrc } from '@/lib/media-image-url';
import type { SavedCollectionCover } from '@/lib/marketplace-api';

/** One tile of a cover: the image, or a neutral tile with a glyph for video / audio / documents. */
function CoverTile({ cover, width }: { cover: SavedCollectionCover; width: number }) {
  const kind = contentMediaKind(cover.url, null, cover.mediaType);
  if (kind === 'image' || kind === 'gif') {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={mediaImageSrc(cover.url, width)}
        alt=""
        loading="lazy"
        decoding="async"
        referrerPolicy="no-referrer"
        className="h-full w-full object-cover"
      />
    );
  }
  return (
    <span className="flex h-full w-full items-center justify-center bg-black/[0.06] text-neutral-500 dark:bg-white/[0.08] dark:text-neutral-400">
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M8 5.5v13l10.5-6.5L8 5.5Z" />
      </svg>
    </span>
  );
}

/**
 * Cover of a collection: one image when it holds a single visual, a 2×2 mosaic from four (the most
 * recently filed first), a 1+2 split from two or three — the arrangement Instagram and Pinterest use,
 * so a collection reads as "these things" at a glance. Empty collections show a quiet bookmark.
 */
export function SavedCollectionCoverArt({
  covers,
  size,
  className = '',
}: {
  covers: SavedCollectionCover[];
  /** Rendered width in CSS px — picks the image derivative. */
  size: number;
  className?: string;
}) {
  const tiles = covers.slice(0, 4);
  const base = `grid overflow-hidden bg-black/[0.05] dark:bg-white/[0.06] ${className}`;

  if (tiles.length === 0) {
    return (
      <div className={`${base} place-items-center text-neutral-400 dark:text-neutral-500`} aria-hidden>
        <svg className="h-1/3 w-1/3 max-h-8 max-w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} aria-hidden>
          <path strokeLinejoin="round" d="M6.5 3.5h11a1 1 0 0 1 1 1V20l-6.5-4.2L5.5 20V4.5a1 1 0 0 1 1-1Z" />
        </svg>
      </div>
    );
  }
  if (tiles.length === 1) {
    return (
      <div className={base} aria-hidden>
        <CoverTile cover={tiles[0]} width={size} />
      </div>
    );
  }
  if (tiles.length < 4) {
    return (
      <div className={`${base} grid-cols-2 grid-rows-2 gap-px`} aria-hidden>
        <div className="row-span-2">
          <CoverTile cover={tiles[0]} width={size / 2} />
        </div>
        <CoverTile cover={tiles[1]} width={size / 2} />
        {tiles[2] ? <CoverTile cover={tiles[2]} width={size / 2} /> : <span className="bg-black/[0.04] dark:bg-white/[0.04]" />}
      </div>
    );
  }
  return (
    <div className={`${base} grid-cols-2 grid-rows-2 gap-px`} aria-hidden>
      {tiles.map((cover, index) => (
        <CoverTile key={`${cover.url}-${index}`} cover={cover} width={size / 2} />
      ))}
    </div>
  );
}

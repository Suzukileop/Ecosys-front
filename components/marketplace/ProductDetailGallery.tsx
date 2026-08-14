'use client';

import { useMemo, useState } from 'react';
import { isVideoThumbnailUrl } from '@/lib/product-thumbnail';
import { ProductThumbnailMedia } from '@/components/marketplace/ProductThumbnailMedia';
import { ProductImageLightbox } from '@/components/marketplace/ProductImageLightbox';

type ProductDetailGalleryProps = {
  title: string;
  thumbnailUrl: string | null;
  videoDurationSeconds?: number | null;
  videoResolution?: string | null;
  isBestseller?: boolean;
  /** Extra companion media (physical products). Thumbnail stays first in lightbox. */
  galleryImageUrls?: string[] | null;
  enableLightbox?: boolean;
};

function uniqueMediaUrls(...groups: Array<string | null | undefined | string[]>): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const group of groups) {
    const values = Array.isArray(group) ? group : [group];
    for (const raw of values) {
      const url = typeof raw === 'string' ? raw.trim() : '';
      if (!url || seen.has(url)) continue;
      seen.add(url);
      out.push(url);
    }
  }
  return out;
}

export function ProductDetailGallery({
  title,
  thumbnailUrl,
  videoDurationSeconds,
  videoResolution,
  isBestseller,
  galleryImageUrls,
  enableLightbox = false,
}: ProductDetailGalleryProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const lightboxImages = useMemo(
    () => uniqueMediaUrls(thumbnailUrl, galleryImageUrls ?? []),
    [thumbnailUrl, galleryImageUrls]
  );

  if (!thumbnailUrl) {
    return (
      <div className="flex aspect-video w-full items-center justify-center rounded-2xl bg-gray-100 text-sm text-gray-400 dark:bg-[#0F0F0F] dark:text-gray-500">
        No preview available
      </div>
    );
  }

  const isVideo = isVideoThumbnailUrl(thumbnailUrl);
  const canOpenLightbox = enableLightbox && lightboxImages.length > 0;

  const openLightbox = () => {
    if (!canOpenLightbox) return;
    setLightboxIndex(0);
    setLightboxOpen(true);
  };

  return (
    <>
      <div className="relative w-full overflow-hidden rounded-2xl bg-gray-100 dark:bg-[#0F0F0F]">
        <button
          type="button"
          disabled={!canOpenLightbox}
          onClick={openLightbox}
          className={`relative aspect-video w-full text-left ${
            canOpenLightbox ? 'cursor-zoom-in' : 'cursor-default'
          }`}
          aria-label={canOpenLightbox ? `Open ${title} media` : undefined}
        >
          <ProductThumbnailMedia
            url={thumbnailUrl}
            alt={title}
            fit="cover"
            autoPlay={isVideo}
            className="absolute inset-0 h-full w-full"
          />
          {isVideo && videoDurationSeconds != null && videoDurationSeconds > 0 && (
            <span className="absolute left-4 top-4 flex items-center gap-1 rounded-md bg-gray-900/80 px-2.5 py-1 text-xs font-medium text-white">
              {videoResolution && `${videoResolution} · `}
              {formatDuration(videoDurationSeconds)}
            </span>
          )}
          {isBestseller && (
            <span className="absolute bottom-4 left-4 rounded-md bg-emerald-500 px-2.5 py-1 text-xs font-semibold text-white">
              Bestseller
            </span>
          )}
        </button>
      </div>

      {canOpenLightbox ? (
        <ProductImageLightbox
          images={lightboxImages}
          index={lightboxIndex}
          open={lightboxOpen}
          alt={title}
          onClose={() => setLightboxOpen(false)}
          onIndexChange={setLightboxIndex}
        />
      ) : null}
    </>
  );
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

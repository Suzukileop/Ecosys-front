'use client';

import { isVideoThumbnailUrl } from '@/lib/product-thumbnail';
import { ProductThumbnailMedia } from '@/components/marketplace/ProductThumbnailMedia';

type ProductDetailGalleryProps = {
  title: string;
  thumbnailUrl: string | null;
  videoDurationSeconds?: number | null;
  videoResolution?: string | null;
  isBestseller?: boolean;
};

export function ProductDetailGallery({
  title,
  thumbnailUrl,
  videoDurationSeconds,
  videoResolution,
  isBestseller,
}: ProductDetailGalleryProps) {
  if (!thumbnailUrl) {
    return (
      <div className="flex aspect-video w-full items-center justify-center rounded-2xl border border-gray-200 bg-gray-100 text-sm text-gray-400 dark:border-neutral-700 dark:bg-neutral-950 dark:text-gray-500">
        No preview available
      </div>
    );
  }

  const isVideo = isVideoThumbnailUrl(thumbnailUrl);

  return (
    <div className="relative w-full overflow-hidden rounded-2xl border border-gray-200 bg-gray-100 dark:border-neutral-700 dark:bg-neutral-950">
      <div className="relative aspect-video w-full">
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
      </div>
    </div>
  );
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

'use client';

import {
  ContentComposeMediaPreview,
  MAX_POST_IMAGES,
  isCollageImage,
} from '@/components/creator/creator-content-media';
import { mediaImageResponsive } from '@/lib/media-image-url';

type ContentComposeMediaProps = {
  urls: string[];
  mediaType?: 'FILE' | 'GIF' | null;
  fileName?: string | null;
  uploading?: boolean;
  onRemoveAt: (index: number) => void;
  onMakeCover: (index: number) => void;
  onAddMore: () => void;
  onClear: () => void;
};

const tileButton =
  'inline-flex h-7 w-7 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur-sm transition hover:bg-black/75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white';

/**
 * Media block of the composer: one file keeps the large preview; several images become an editable
 * grid (remove, pick the cover, add more) that mirrors the collage the feed will show.
 */
export function ContentComposeMedia({
  urls,
  mediaType,
  fileName,
  uploading = false,
  onRemoveAt,
  onMakeCover,
  onAddMore,
  onClear,
}: ContentComposeMediaProps) {
  if (urls.length === 0) {
    return uploading ? (
      <div className="h-40 animate-pulse rounded-xl bg-black/[0.06] dark:bg-white/[0.08]" aria-label="Uploading" />
    ) : null;
  }

  const imagesOnly = urls.every((url) => isCollageImage(url));
  const canAddMore = imagesOnly && urls.length < MAX_POST_IMAGES && !uploading;

  if (urls.length === 1) {
    return (
      <div className="space-y-2.5">
        <ContentComposeMediaPreview
          locale="en"
          mediaUrl={urls[0]!}
          fileName={fileName}
          mediaType={mediaType}
          onRemove={onClear}
        />
        {canAddMore ? (
          <button
            type="button"
            onClick={onAddMore}
            className="inline-flex h-9 items-center gap-2 rounded-full border border-black/[0.14] px-4 text-[14px] font-medium text-[#111111] transition-colors hover:bg-black/[0.04] dark:border-white/[0.18] dark:text-white dark:hover:bg-white/[0.06]"
          >
            <PlusIcon className="h-4 w-4" />
            Add more photos
          </button>
        ) : null}
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {urls.map((url, index) => (
          <div
            key={url}
            className="group/tile relative aspect-square overflow-hidden rounded-xl bg-neutral-100 dark:bg-neutral-900"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              {...mediaImageResponsive(url, [256, 384])}
              sizes="(min-width: 640px) 120px, 30vw"
              alt=""
              loading="lazy"
              decoding="async"
              className="absolute inset-0 h-full w-full object-cover"
            />
            {index === 0 ? (
              <span className="absolute bottom-1.5 left-1.5 rounded-full bg-black/60 px-2 py-0.5 text-[11px] font-semibold text-white backdrop-blur-sm">
                Cover
              </span>
            ) : (
              <button
                type="button"
                onClick={() => onMakeCover(index)}
                className="absolute bottom-1.5 left-1.5 rounded-full bg-black/60 px-2 py-0.5 text-[11px] font-semibold text-white opacity-0 backdrop-blur-sm transition-opacity hover:bg-black/80 focus-visible:opacity-100 group-hover/tile:opacity-100 max-sm:opacity-100"
              >
                Make cover
              </button>
            )}
            <button
              type="button"
              onClick={() => onRemoveAt(index)}
              aria-label={`Remove photo ${index + 1}`}
              className={`${tileButton} absolute right-1.5 top-1.5`}
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2} aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}

        {uploading ? (
          <div
            className="aspect-square animate-pulse rounded-xl bg-black/[0.06] dark:bg-white/[0.08]"
            aria-label="Uploading"
          />
        ) : null}

        {canAddMore ? (
          <button
            type="button"
            onClick={onAddMore}
            aria-label="Add more photos"
            className="flex aspect-square flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-black/[0.2] text-neutral-500 transition-colors hover:border-black/40 hover:text-[#111111] dark:border-white/[0.22] dark:hover:border-white/50 dark:hover:text-white"
          >
            <PlusIcon className="h-5 w-5" />
            <span className="text-[12px] font-medium">Add</span>
          </button>
        ) : null}
      </div>
      <p className="mt-2 text-[13px] tabular-nums text-neutral-500 dark:text-neutral-400">
        {urls.length} / {MAX_POST_IMAGES} photos
      </p>
    </div>
  );
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
    </svg>
  );
}

'use client';

import { useMemo, useState } from 'react';
import { ProductImageLightbox } from '@/components/marketplace/ProductImageLightbox';
import { ProductThumbnailMedia } from '@/components/marketplace/ProductThumbnailMedia';

type CreatorPhysicalProductGalleryProps = {
  title: string;
  thumbnailUrl: string | null;
  galleryImageUrls?: string[] | null;
  isBestseller?: boolean;
};

function uniquePhotos(cover: string | null, extra: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of [cover, ...extra]) {
    const url = typeof raw === 'string' ? raw.trim() : '';
    if (!url || seen.has(url)) continue;
    seen.add(url);
    out.push(url);
  }
  return out;
}

export function CreatorPhysicalProductGallery({
  title,
  thumbnailUrl,
  galleryImageUrls,
  isBestseller,
}: CreatorPhysicalProductGalleryProps) {
  const photos = useMemo(() => uniquePhotos(thumbnailUrl, galleryImageUrls ?? []), [thumbnailUrl, galleryImageUrls]);
  const [active, setActive] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const activeIndex = Math.min(active, Math.max(photos.length - 1, 0));

  if (photos.length === 0) {
    return (
      <div className="flex aspect-[16/10] w-full flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-black/[0.12] text-center dark:border-white/[0.14]">
        <p className="text-[15px] font-medium text-[#111111] dark:text-white">No photos yet</p>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">Add photos in Edit product — listings with photos sell better.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={() => setLightboxOpen(true)}
        className="group relative block aspect-[16/10] w-full cursor-pointer overflow-hidden rounded-lg bg-black/[0.04] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5722] dark:bg-white/[0.04]"
        aria-label={`Enlarge photo ${activeIndex + 1} of ${title}`}
      >
        <ProductThumbnailMedia
          url={photos[activeIndex]}
          alt={title}
          fit="cover"
          className="absolute inset-0 h-full w-full transition-transform duration-700 ease-out group-hover:scale-[1.02]"
        />
        {isBestseller && (
          <span className="absolute left-4 top-4 rounded-md bg-white/95 px-2.5 py-1 text-[13px] font-medium text-[#111111] shadow-sm">
            Bestseller
          </span>
        )}
        {photos.length > 1 && (
          <span className="absolute bottom-4 right-4 rounded-md bg-black/65 px-2.5 py-1 text-[13px] font-medium text-white tabular-nums backdrop-blur-sm">
            {activeIndex + 1} / {photos.length}
          </span>
        )}
      </button>

      {photos.length > 1 && (
        <ul className="grid grid-cols-5 gap-2 sm:grid-cols-8" aria-label="Product photos">
          {photos.map((url, index) => (
            <li key={url}>
              <button
                type="button"
                onClick={() => setActive(index)}
                aria-label={`Show photo ${index + 1}`}
                aria-current={index === activeIndex}
                className={`relative block aspect-square w-full cursor-pointer overflow-hidden rounded-md bg-black/[0.04] transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5722] dark:bg-white/[0.04] ${
                  index === activeIndex
                    ? 'ring-2 ring-[#111111] ring-offset-2 ring-offset-white dark:ring-white dark:ring-offset-[#0a0a0a]'
                    : 'opacity-70 hover:opacity-100'
                }`}
              >
                <ProductThumbnailMedia url={url} alt="" fit="cover" className="absolute inset-0 h-full w-full" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <ProductImageLightbox
        images={photos}
        index={activeIndex}
        open={lightboxOpen}
        alt={title}
        onClose={() => setLightboxOpen(false)}
        onIndexChange={setActive}
      />
    </div>
  );
}

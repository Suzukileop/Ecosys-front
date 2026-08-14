'use client';

import { useMemo, useState } from 'react';
import { isVideoThumbnailUrl } from '@/lib/product-thumbnail';
import { ProductImageLightbox } from '@/components/marketplace/ProductImageLightbox';

type ProductPhysicalCompanionGalleryProps = {
  title: string;
  thumbnailUrl?: string | null;
  galleryImageUrls?: string[] | null;
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

export function ProductPhysicalCompanionGallery({
  title,
  thumbnailUrl,
  galleryImageUrls,
}: ProductPhysicalCompanionGalleryProps) {
  const images = useMemo(() => {
    const cover = thumbnailUrl?.trim() || null;
    const companions = uniqueMediaUrls(galleryImageUrls ?? []).filter((url) => url !== cover);
    return companions;
  }, [thumbnailUrl, galleryImageUrls]);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  if (images.length === 0) return null;

  const openAt = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  return (
    <section className="space-y-3" aria-label="Product media">
      <h3 className="text-sm font-bold uppercase tracking-wide text-neutral-900 dark:text-white">
        Media
      </h3>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {images.map((url, index) => {
          const isVideo = isVideoThumbnailUrl(url);
          return (
            <button
              key={`${url}-${index}`}
              type="button"
              onClick={() => openAt(index)}
              className="group relative aspect-[4/3] overflow-hidden rounded-2xl bg-neutral-100 text-left transition hover:ring-2 hover:ring-orange-400/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 dark:bg-[#1F1F1F]"
              aria-label={`Open media ${index + 1} of ${images.length}`}
            >
              {isVideo ? (
                <video
                  src={url}
                  muted
                  playsInline
                  preload="metadata"
                  className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={url}
                  alt={`${title} — media ${index + 1}`}
                  className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                />
              )}
              <span className="pointer-events-none absolute inset-0 bg-black/0 transition group-hover:bg-black/20" />
            </button>
          );
        })}
      </div>

      <ProductImageLightbox
        images={images}
        index={lightboxIndex}
        open={lightboxOpen}
        alt={title}
        onClose={() => setLightboxOpen(false)}
        onIndexChange={setLightboxIndex}
      />
    </section>
  );
}

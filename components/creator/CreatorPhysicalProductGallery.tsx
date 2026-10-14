'use client';

import { useMemo, useState } from 'react';
import { ProductImageLightbox } from '@/components/marketplace/ProductImageLightbox';
import { ProductThumbnailMedia } from '@/components/marketplace/ProductThumbnailMedia';
import { useT } from '@/lib/i18n/I18nProvider';

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
  const t = useT();
  const photos = useMemo(() => uniquePhotos(thumbnailUrl, galleryImageUrls ?? []), [thumbnailUrl, galleryImageUrls]);
  const [active, setActive] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const activeIndex = Math.min(active, Math.max(photos.length - 1, 0));

  if (photos.length === 0) {
    return (
      <div className="flex aspect-[16/10] w-full flex-col items-center justify-center gap-1 bg-[#F7F9F9] px-6 text-center dark:bg-[#16181C]">
        <p className="text-[15px] font-bold text-[#0F1419] dark:text-[#E7E9EA]">{t('No photos yet')}</p>
        <p className="text-[14px] text-[#536471] dark:text-[#71767B]">{t('Add photos in Edit product — listings with photos sell better.')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={() => setLightboxOpen(true)}
        className="group relative block aspect-[16/10] w-full cursor-pointer overflow-hidden bg-[#F7F9F9] focus:outline-none focus-visible:shadow-[inset_0_0_0_2px_#0F1419] dark:bg-[#16181C] dark:focus-visible:shadow-[inset_0_0_0_2px_#E7E9EA]"
        aria-label={`Enlarge photo ${activeIndex + 1} of ${title}`}
      >
        <ProductThumbnailMedia
          url={photos[activeIndex]}
          alt={title}
          fit="cover"
          className="absolute inset-0 h-full w-full transition-transform duration-700 ease-out group-hover:scale-[1.02]"
        />
        {isBestseller && (
          <span className="absolute left-4 top-4 rounded-[4px] bg-[#0F1419] px-2 py-0.5 text-[13px] font-semibold text-white">
            {t('Bestseller')}
          </span>
        )}
        {photos.length > 1 && (
          <span className="absolute bottom-4 right-4 rounded-full bg-black/65 px-2.5 py-0.5 text-[13px] font-semibold text-white tabular-nums backdrop-blur-sm">
            {activeIndex + 1} / {photos.length}
          </span>
        )}
      </button>

      {photos.length > 1 && (
        <ul className="grid grid-cols-5 gap-1.5 px-4 sm:grid-cols-8 sm:gap-2 sm:px-0" aria-label={t('Product photos')}>
          {photos.map((url, index) => (
            <li key={url}>
              <button
                type="button"
                onClick={() => setActive(index)}
                aria-label={`Show photo ${index + 1}`}
                aria-current={index === activeIndex}
                className={`relative block aspect-square w-full cursor-pointer overflow-hidden bg-[#F7F9F9] transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0F1419] dark:bg-[#16181C] dark:focus-visible:ring-[#E7E9EA] ${
                  index === activeIndex
                    ? 'ring-2 ring-[#0F1419] ring-offset-2 ring-offset-white dark:ring-[#E7E9EA] dark:ring-offset-black'
                    : 'opacity-60 hover:opacity-100'
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

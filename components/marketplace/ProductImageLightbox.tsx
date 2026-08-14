'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { isVideoThumbnailUrl } from '@/lib/product-thumbnail';

type ProductImageLightboxProps = {
  images: string[];
  index: number;
  open: boolean;
  alt?: string;
  onClose: () => void;
  onIndexChange: (index: number) => void;
};

export function ProductImageLightbox({
  images,
  index,
  open,
  alt = 'Product media',
  onClose,
  onIndexChange,
}: ProductImageLightboxProps) {
  const [mounted, setMounted] = useState(false);
  const safeIndex = images.length > 0 ? ((index % images.length) + images.length) % images.length : 0;
  const current = images[safeIndex] ?? null;
  const isVideo = current ? isVideoThumbnailUrl(current) : false;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      if (event.key === 'ArrowRight' && images.length > 1) {
        onIndexChange((safeIndex + 1) % images.length);
      }
      if (event.key === 'ArrowLeft' && images.length > 1) {
        onIndexChange((safeIndex - 1 + images.length) % images.length);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open, onClose, onIndexChange, images.length, safeIndex]);

  if (!open || !mounted || !current) return null;

  return createPortal(
    <div className="fixed inset-0 z-[220] flex items-center justify-center p-4 sm:p-8">
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 bg-black/75 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative z-10 flex max-h-[min(90vh,900px)] w-full max-w-5xl flex-col">
        <div className="mb-3 flex items-center justify-between gap-3">
          <p className="text-sm font-medium text-white/80">
            {safeIndex + 1} / {images.length}
          </p>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close lightbox"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden rounded-2xl bg-black/40">
          {isVideo ? (
            <video
              key={current}
              src={current}
              controls
              autoPlay
              playsInline
              className="max-h-[min(80vh,820px)] w-full object-contain"
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={current}
              alt={alt}
              className="max-h-[min(80vh,820px)] w-full object-contain"
            />
          )}

          {images.length > 1 ? (
            <>
              <button
                type="button"
                aria-label="Previous image"
                onClick={() => onIndexChange((safeIndex - 1 + images.length) % images.length)}
                className="absolute left-3 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white transition hover:bg-black/70"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                type="button"
                aria-label="Next image"
                onClick={() => onIndexChange((safeIndex + 1) % images.length)}
                className="absolute right-3 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white transition hover:bg-black/70"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          ) : null}
        </div>
      </div>
    </div>,
    document.body
  );
}

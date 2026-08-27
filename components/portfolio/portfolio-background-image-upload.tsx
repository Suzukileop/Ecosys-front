'use client';

import { useContentMediaUpload } from '@/components/creator/creator-content-media';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import {
  MAX_PORTFOLIO_BACKGROUND_IMAGES,
  addBackgroundImageToLibrary,
  removeBackgroundImageFromLibrary,
} from '@/components/portfolio/portfolio-global-settings';

export const PORTFOLIO_BACKGROUND_IMAGE_ACCEPT =
  'image/jpeg,image/png,image/webp,image/gif,.jpg,.jpeg,.png,.webp,.gif';

export function PortfolioBackgroundImageUpload({
  url,
  onChange,
  label = 'Background image',
  library,
  onLibraryChange,
  helperText,
}: {
  url: string;
  onChange: (url: string) => void;
  label?: string;
  /** Shared library (max 5). When provided, uploads are stored here for reuse. */
  library?: string[];
  onLibraryChange?: (urls: string[]) => void;
  helperText?: string;
}) {
  const libraryEnabled = typeof onLibraryChange === 'function';
  const images = libraryEnabled ? library ?? [] : [];
  const atCapacity = images.length >= MAX_PORTFOLIO_BACKGROUND_IMAGES;
  const activeUrl = url.trim();
  const hasImage = Boolean(activeUrl);

  const { inputRef, uploading, uploadError, pickFile, onFileChange, fileName } = useContentMediaUpload({
    locale: 'en',
    onUrlChange: (nextUrl) => {
      const clean = nextUrl.trim();
      if (!clean) {
        onChange('');
        return;
      }
      onChange(clean);
      if (libraryEnabled) {
        onLibraryChange(addBackgroundImageToLibrary(images, clean));
      }
    },
  });

  const selectFromLibrary = (nextUrl: string) => {
    onChange(nextUrl);
  };

  const removeFromLibrary = (targetUrl: string) => {
    if (!libraryEnabled) return;
    const nextLibrary = removeBackgroundImageFromLibrary(images, targetUrl);
    onLibraryChange(nextLibrary);
    if (activeUrl === targetUrl.trim()) {
      onChange(nextLibrary[0] ?? '');
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">{label}</p>
        {libraryEnabled ? (
          <p className="text-[11px] font-semibold tabular-nums text-neutral-400">
            Library {images.length}/{MAX_PORTFOLIO_BACKGROUND_IMAGES}
          </p>
        ) : null}
      </div>

      {helperText ? <p className="text-sm text-neutral-500">{helperText}</p> : null}

      {libraryEnabled && images.length > 0 ? (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
          {images.map((item) => {
            const selected = item === activeUrl;
            return (
              <div key={item} className="relative">
                <button
                  type="button"
                  onClick={() => selectFromLibrary(item)}
                  className={`block w-full overflow-hidden rounded-xl border bg-neutral-100 transition ${
                    selected
                      ? 'border-neutral-900 ring-2 ring-neutral-900/15'
                      : 'border-neutral-200 hover:border-neutral-400'
                  }`}
                  aria-pressed={selected}
                  aria-label={selected ? 'Selected background image' : 'Use this background image'}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item} alt="" className="aspect-[4/3] w-full object-cover" />
                </button>
                <button
                  type="button"
                  onClick={() => removeFromLibrary(item)}
                  className="absolute right-1 top-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/95 text-neutral-600 shadow-sm ring-1 ring-neutral-200 transition hover:text-neutral-950"
                  aria-label="Remove from library"
                >
                  <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
                    <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
                  </svg>
                </button>
              </div>
            );
          })}
        </div>
      ) : null}

      {hasImage && (!libraryEnabled || images.length === 0) ? (
        <div className="overflow-hidden rounded-xl border border-neutral-200 bg-neutral-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={url} alt="" className="max-h-40 w-full object-cover" />
        </div>
      ) : null}

      {!hasImage && (!libraryEnabled || images.length === 0) ? (
        <div className="flex min-h-[7.5rem] flex-col items-center justify-center rounded-xl border-2 border-dashed border-neutral-200 bg-white px-4 text-center">
          <p className="text-sm font-semibold text-neutral-700">No image yet</p>
          <p className="mt-1 text-xs text-neutral-500">
            JPEG, PNG, WebP or GIF — up to {MAX_PORTFOLIO_BACKGROUND_IMAGES} in library
          </p>
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-2">
        <input
          ref={inputRef}
          type="file"
          accept={PORTFOLIO_BACKGROUND_IMAGE_ACCEPT}
          className="sr-only"
          onChange={(event) => {
            void onFileChange(event);
          }}
        />
        <button
          type="button"
          onClick={() => {
            pickFile();
          }}
          disabled={uploading}
          className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm font-semibold text-neutral-800 transition hover:bg-neutral-50 disabled:opacity-60"
        >
          {uploading ? <LoadingSpinner size="sm" /> : null}
          {uploading
            ? 'Uploading…'
            : libraryEnabled
              ? atCapacity
                ? 'Upload & replace oldest'
                : 'Upload to library'
              : hasImage
                ? 'Replace image'
                : 'Upload image'}
        </button>
        {hasImage ? (
          <button
            type="button"
            onClick={() => onChange('')}
            disabled={uploading}
            className="rounded-full px-3 py-2 text-sm font-medium text-neutral-500 transition hover:text-neutral-900 disabled:opacity-60"
          >
            Clear selection
          </button>
        ) : null}
        {fileName && !uploading ? (
          <span className="max-w-[12rem] truncate text-xs text-neutral-500">{fileName}</span>
        ) : null}
      </div>
      {libraryEnabled && atCapacity ? (
        <p className="text-xs text-neutral-500">
          Library full ({MAX_PORTFOLIO_BACKGROUND_IMAGES}). New uploads replace the oldest image.
        </p>
      ) : null}
      {uploadError ? <p className="text-xs text-red-600">{uploadError}</p> : null}
    </div>
  );
}

const HERO_BANNER_MEDIA_ACCEPT =
  'image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime,.jpg,.jpeg,.png,.webp,.gif,.mp4,.webm,.mov';

function isHeroBannerVideoUrl(url: string): boolean {
  return /\.(mp4|webm|mov)(\?|$)/i.test(url.trim());
}

/** Image or video upload for hero banner frames (no shared wallpaper library). */
export function PortfolioHeroBannerMediaUpload({
  url,
  onChange,
  label = 'Media',
  helperText,
}: {
  url: string;
  onChange: (url: string) => void;
  label?: string;
  helperText?: string;
}) {
  const activeUrl = url.trim();
  const hasMedia = Boolean(activeUrl);
  const isVideo = hasMedia && isHeroBannerVideoUrl(activeUrl);

  const { inputRef, uploading, uploadError, pickFile, onFileChange, fileName } = useContentMediaUpload({
    locale: 'en',
    onUrlChange: (nextUrl) => onChange(nextUrl.trim()),
  });

  return (
    <div className="space-y-3">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">{label}</p>
      {helperText ? <p className="text-sm text-neutral-500">{helperText}</p> : null}

      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-100">
        {hasMedia ? (
          isVideo ? (
            <video
              src={activeUrl}
              className="aspect-[16/9] w-full object-cover"
              muted
              playsInline
              preload="metadata"
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={activeUrl} alt="" className="aspect-[16/9] w-full object-cover" />
          )
        ) : (
          <div className="flex aspect-[16/9] items-center justify-center text-sm text-neutral-400">
            No media selected
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <input
          ref={inputRef}
          type="file"
          accept={HERO_BANNER_MEDIA_ACCEPT}
          className="sr-only"
          onChange={(event) => {
            void onFileChange(event);
          }}
        />
        <button
          type="button"
          onClick={() => {
            pickFile();
          }}
          disabled={uploading}
          className="inline-flex min-h-10 items-center gap-2 rounded-full border border-neutral-300 bg-white px-4 text-sm font-semibold text-neutral-900 transition hover:bg-neutral-50 disabled:opacity-60"
        >
          {uploading ? <LoadingSpinner size="sm" /> : null}
          {uploading ? 'Uploading…' : hasMedia ? 'Replace photo/video' : 'Upload photo/video'}
        </button>
        {hasMedia ? (
          <button
            type="button"
            onClick={() => onChange('')}
            disabled={uploading}
            className="rounded-full px-3 py-2 text-sm font-medium text-neutral-500 transition hover:text-neutral-900 disabled:opacity-60"
          >
            Clear
          </button>
        ) : null}
        {fileName && !uploading ? (
          <span className="max-w-[12rem] truncate text-xs text-neutral-500">{fileName}</span>
        ) : null}
      </div>
      {uploadError ? <p className="text-xs text-red-600">{uploadError}</p> : null}
    </div>
  );
}

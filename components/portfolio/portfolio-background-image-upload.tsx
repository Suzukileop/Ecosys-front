'use client';

import { useContentMediaUpload } from '@/components/creator/creator-content-media';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import {
  MAX_PORTFOLIO_BACKGROUND_IMAGES,
  addBackgroundImageToLibrary,
  removeBackgroundImageFromLibrary,
} from '@/components/portfolio/portfolio-global-settings';
import { useT } from '@/lib/i18n/I18nProvider';

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
  const t = useT();
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
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[color:var(--np-muted)]">{label}</p>
        {libraryEnabled ? (
          <p className="text-[11px] font-semibold tabular-nums text-[color:var(--np-muted)]">
            {t('Library {imagesLength}/{MAXPORTFOLIOBACKGROUNDIMAGES}', { imagesLength: images.length, MAXPORTFOLIOBACKGROUNDIMAGES: MAX_PORTFOLIO_BACKGROUND_IMAGES })}
          </p>
        ) : null}
      </div>

      {helperText ? <p className="text-sm text-[color:var(--np-muted)]">{helperText}</p> : null}

      {libraryEnabled && images.length > 0 ? (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
          {images.map((item) => {
            const selected = item === activeUrl;
            return (
              <div key={item} className="relative">
                <button
                  type="button"
                  onClick={() => selectFromLibrary(item)}
                  className={`block w-full overflow-hidden rounded-xl border bg-[color:var(--np-well)] transition ${
                    selected
                      ? 'border-[color:var(--np-accent)] ring-2 ring-[color:var(--np-accent-soft)]'
                      : 'border-[color:var(--np-card-border)] hover:border-[color:var(--np-illus-strong)]'
                  }`}
                  aria-pressed={selected}
                  aria-label={selected ? t('Selected background image') : t('Use this background image')}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item} alt="" className="aspect-[4/3] w-full object-cover" />
                </button>
                <button
                  type="button"
                  onClick={() => removeFromLibrary(item)}
                  className="absolute right-1 top-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/95 text-neutral-600 shadow-xs ring-1 ring-neutral-200 transition hover:text-neutral-950"
                  aria-label={t('Remove from library')}
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
        <div className="overflow-hidden rounded-xl border border-[color:var(--np-card-border)] bg-[color:var(--np-well)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={url} alt="" className="max-h-40 w-full object-cover" />
        </div>
      ) : null}

      {!hasImage && (!libraryEnabled || images.length === 0) ? (
        <div className="flex min-h-[7.5rem] flex-col items-center justify-center rounded-xl border-2 border-dashed border-[color:var(--np-card-border)] bg-[color:var(--np-card)] px-4 text-center">
          <p className="text-sm font-semibold text-[color:var(--np-label)]">{t('No image yet — click to upload')}</p>
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
          className="inline-flex items-center gap-2 rounded-full border border-[color:var(--np-card-border)] bg-[color:var(--np-card)] px-4 py-2 text-sm font-semibold text-[color:var(--np-text)] transition hover:bg-[color:var(--np-hover)] disabled:opacity-60"
        >
          {uploading ? <LoadingSpinner size="sm" /> : null}
          {uploading
            ? t('Uploading…')
            : libraryEnabled
              ? atCapacity
                ? t('Upload & replace oldest')
                : t('Upload to library')
              : hasImage
                ? t('Replace image')
                : t('Upload image')}
        </button>
        {hasImage ? (
          <button
            type="button"
            onClick={() => onChange('')}
            disabled={uploading}
            className="rounded-full px-3 py-2 text-sm font-medium text-[color:var(--np-muted)] transition hover:text-[color:var(--np-text)] disabled:opacity-60"
          >
            {t('Clear selection')}
          </button>
        ) : null}
        {fileName && !uploading ? (
          <span className="max-w-[12rem] truncate text-xs text-[color:var(--np-muted)]">{fileName}</span>
        ) : null}
      </div>
      {libraryEnabled && atCapacity ? (
        <p className="text-xs text-[color:var(--np-muted)]">
          {t('Library full ({MAXPORTFOLIOBACKGROUNDIMAGES}). New uploads replace the oldest image.', { MAXPORTFOLIOBACKGROUNDIMAGES: MAX_PORTFOLIO_BACKGROUND_IMAGES })}
        </p>
      ) : null}
      {uploadError ? <p className="text-xs text-red-600">{uploadError}</p> : null}
    </div>
  );
}

/**
 * Global → Background's library: the saved images as one grid of 4:3 tiles, the last tile adds a new
 * one. The active image wears an ink ring and a check; the remove × only shows on hover / focus so
 * it never covers a thumbnail at rest. Palette tokens throughout, so it reads in dark and light.
 */
export function PortfolioBackgroundLibrary({
  url,
  onChange,
  library,
  onLibraryChange,
}: {
  url: string;
  onChange: (url: string) => void;
  library: string[];
  onLibraryChange: (urls: string[]) => void;
}) {
  const t = useT();
  const activeUrl = url.trim();
  const atCapacity = library.length >= MAX_PORTFOLIO_BACKGROUND_IMAGES;

  const { inputRef, uploading, uploadError, pickFile, onFileChange } = useContentMediaUpload({
    locale: 'en',
    onUrlChange: (nextUrl) => {
      const clean = nextUrl.trim();
      if (!clean) return;
      onChange(clean);
      onLibraryChange(addBackgroundImageToLibrary(library, clean));
    },
  });

  const remove = (targetUrl: string) => {
    const nextLibrary = removeBackgroundImageFromLibrary(library, targetUrl);
    onLibraryChange(nextLibrary);
    if (activeUrl === targetUrl.trim()) onChange(nextLibrary[0] ?? '');
  };

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-3 gap-2">
        {library.map((item) => {
          const selected = item === activeUrl;
          return (
            <div key={item} className="group/tile relative">
              <button
                type="button"
                onClick={() => onChange(item)}
                aria-pressed={selected}
                aria-label={selected ? t('Selected background image') : t('Use this background image')}
                className={`block w-full overflow-hidden rounded-xl bg-[color:var(--pf-surface)] transition-shadow focus-visible:outline-hidden ${
                  selected
                    ? 'shadow-[0_0_0_2px_var(--pf-palette-texte-fort)]'
                    : 'shadow-[inset_0_0_0_1px_var(--pf-palette-bordure)] hover:shadow-[0_0_0_1px_var(--pf-palette-texte-muted)] focus-visible:shadow-[0_0_0_2px_var(--pf-palette-texte-muted)]'
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item} alt="" className="aspect-[4/3] w-full object-cover" />
              </button>
              {selected ? (
                <span className="pointer-events-none absolute bottom-1.5 left-1.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-[color:var(--pf-palette-texte-fort)] text-[color:var(--pf-palette-fond)]">
                  <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="m5 12.5 4.5 4.5L19 7.5" />
                  </svg>
                </span>
              ) : null}
              <button
                type="button"
                onClick={() => remove(item)}
                aria-label={t('Remove from library')}
                title={t('Remove from library')}
                className="absolute right-1.5 top-1.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white opacity-0 backdrop-blur-xs transition-opacity hover:bg-black/80 focus-visible:opacity-100 focus-visible:outline-hidden group-hover/tile:opacity-100"
              >
                <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} aria-hidden>
                  <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>
          );
        })}

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
          onClick={() => pickFile()}
          disabled={uploading}
          title={atCapacity ? t('Library full ({MAXPORTFOLIOBACKGROUNDIMAGES}). New uploads replace the oldest image.', { MAXPORTFOLIOBACKGROUNDIMAGES: MAX_PORTFOLIO_BACKGROUND_IMAGES }) : undefined}
          className="flex aspect-[4/3] w-full flex-col items-center justify-center gap-1 rounded-xl text-[color:var(--pf-palette-texte-muted)] shadow-[inset_0_0_0_1px_var(--pf-palette-bordure)] transition-colors hover:bg-[color:var(--pf-surface)] hover:text-[color:var(--pf-palette-texte-fort)] focus-visible:outline-hidden focus-visible:shadow-[inset_0_0_0_2px_var(--pf-palette-texte-muted)] disabled:opacity-60"
        >
          {uploading ? (
            <LoadingSpinner size="sm" />
          ) : (
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" aria-hidden>
              <path d="M12 5v14M5 12h14" />
            </svg>
          )}
          <span className="px-1 text-center text-[12px] font-medium leading-4">
            {uploading ? t('Uploading…') : atCapacity ? t('Replace oldest') : t('Add image')}
          </span>
        </button>
      </div>
      {uploadError ? <p className="text-[12px] text-red-500">{uploadError}</p> : null}
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
  const t = useT();
  const activeUrl = url.trim();
  const hasMedia = Boolean(activeUrl);
  const isVideo = hasMedia && isHeroBannerVideoUrl(activeUrl);

  const { inputRef, uploading, uploadError, pickFile, onFileChange, fileName } = useContentMediaUpload({
    locale: 'en',
    onUrlChange: (nextUrl) => onChange(nextUrl.trim()),
  });

  return (
    <div className="space-y-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[color:var(--np-muted)]">{label}</p>
      {helperText ? <p className="text-sm text-[color:var(--np-muted)]">{helperText}</p> : null}

      <div className="overflow-hidden rounded-2xl border border-[color:var(--np-card-border)] bg-[color:var(--np-well)]">
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
          <div className="flex aspect-[16/9] items-center justify-center text-sm text-[color:var(--np-muted)]">
            {t('No media selected')}
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
          className="inline-flex min-h-10 items-center gap-2 rounded-full border border-[color:var(--np-well-border)] bg-[color:var(--np-card)] px-4 text-sm font-semibold text-[color:var(--np-text)] transition hover:bg-[color:var(--np-hover)] disabled:opacity-60"
        >
          {uploading ? <LoadingSpinner size="sm" /> : null}
          {uploading ? t('Uploading…') : hasMedia ? t('Replace photo/video') : t('Upload photo/video')}
        </button>
        {hasMedia ? (
          <button
            type="button"
            onClick={() => onChange('')}
            disabled={uploading}
            className="rounded-full px-3 py-2 text-sm font-medium text-[color:var(--np-muted)] transition hover:text-[color:var(--np-text)] disabled:opacity-60"
          >
            {t('Clear')}
          </button>
        ) : null}
        {fileName && !uploading ? (
          <span className="max-w-[12rem] truncate text-xs text-[color:var(--np-muted)]">{fileName}</span>
        ) : null}
      </div>
      {uploadError ? <p className="text-xs text-red-600">{uploadError}</p> : null}
    </div>
  );
}

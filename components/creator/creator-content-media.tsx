'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { getApiErrorMessage } from '@/lib/api-error';
import { uploadContentMedia } from '@/lib/marketplace-api';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export const CONTENT_MEDIA_ACCEPT =
  'image/jpeg,image/png,image/webp,video/mp4,video/webm,video/quicktime,audio/mpeg,audio/wav,audio/aac,audio/ogg,audio/mp4,application/pdf,.jpg,.jpeg,.png,.webp,.mp4,.webm,.mov,.mp3,.wav,.aac,.m4a,.ogg,.pdf';

export type ContentMediaKind = 'image' | 'video' | 'pdf' | 'gif' | 'audio' | null;

export function contentMediaKind(
  url: string,
  fileName?: string | null,
  mediaType?: 'FILE' | 'GIF' | null
): ContentMediaKind {
  if (mediaType === 'GIF') return 'gif';
  const probe = (fileName ?? url).toLowerCase();
  if (/\.gif(\?|$)/i.test(probe)) return 'gif';
  if (/\.(jpe?g|png|webp)(\?|$)/i.test(probe) || probe.includes('image/')) return 'image';
  if (/\.(mp4|webm|mov)(\?|$)/i.test(probe) || probe.includes('video/')) return 'video';
  if (/\.(mp3|wav|aac|m4a|ogg|flac)(\?|$)/i.test(probe) || probe.includes('audio/')) return 'audio';
  if (/\.pdf(\?|$)/i.test(probe) || probe.includes('application/pdf')) return 'pdf';
  if (/giphy\.com|tenor\.com/i.test(url)) return 'gif';
  if (/^https?:\/\//i.test(url)) return 'image';
  return null;
}

type UseContentMediaUploadOptions = {
  locale?: 'fr' | 'en';
  onUrlChange: (url: string) => void;
};

export function useContentMediaUpload({ locale = 'en', onUrlChange }: UseContentMediaUploadOptions) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const pickFile = () => inputRef.current?.click();

  const onFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploadError(null);
    setUploading(true);
    try {
      const url = await uploadContentMedia(file);
      onUrlChange(url);
      setFileName(file.name);
    } catch (e) {
      setUploadError(
        getApiErrorMessage(e, locale === 'fr' ? 'Échec du téléversement.' : 'Upload failed.')
      );
      onUrlChange('');
      setFileName(null);
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  return { inputRef, uploading, fileName, uploadError, pickFile, onFileChange, setFileName };
}

type ContentMediaPreviewProps = {
  locale?: 'fr' | 'en';
  mediaUrl: string;
  fileName?: string | null;
  mediaType?: 'FILE' | 'GIF' | null;
  large?: boolean;
  hideWhenEmpty?: boolean;
  compact?: boolean;
  /** Natural height — no inner scroll; image scales up to max height. */
  fluid?: boolean;
  fit?: 'contain' | 'cover';
};

/** Fixed landscape preview for create-content modal — never grows with media aspect. */
type ContentComposeMediaPreviewProps = {
  locale?: 'fr' | 'en';
  mediaUrl: string;
  fileName?: string | null;
  mediaType?: 'FILE' | 'GIF' | null;
  onRemove: () => void;
};

export function ContentComposeMediaPreview({
  locale = 'en',
  mediaUrl,
  fileName,
  mediaType,
  onRemove,
}: ContentComposeMediaPreviewProps) {
  const [zoomOpen, setZoomOpen] = useState(false);
  const kind = contentMediaKind(mediaUrl, fileName, mediaType);
  const canZoom = kind === 'image' || kind === 'gif';
  const openPdfLabel = locale === 'fr' ? 'Ouvrir le PDF' : 'Open PDF';
  const removeLabel = locale === 'fr' ? 'Retirer le média' : 'Remove media';
  const zoomLabel = locale === 'fr' ? 'Agrandir' : 'Zoom';

  useEffect(() => {
    if (!zoomOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setZoomOpen(false);
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [zoomOpen]);

  if (!mediaUrl.trim()) return null;

  return (
    <>
      <div className="relative w-full overflow-hidden rounded-xl bg-neutral-100 dark:bg-neutral-900">
        <div className="relative h-52 w-full sm:h-56">
          {kind === 'video' ? (
            <video
              src={mediaUrl}
              controls
              className="absolute inset-0 h-full w-full object-cover"
              preload="metadata"
            />
          ) : kind === 'audio' ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-neutral-100 px-4 dark:bg-neutral-900">
              <span className="text-2xl" aria-hidden>
                🎵
              </span>
              <audio src={mediaUrl} controls className="w-full max-w-md" preload="metadata">
                <track kind="captions" />
              </audio>
            </div>
          ) : kind === 'pdf' ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-neutral-50 px-4 text-center dark:bg-neutral-900">
              <span className="text-3xl" aria-hidden>
                📄
              </span>
              <p className="max-w-full truncate text-xs font-medium text-neutral-600 dark:text-neutral-300">
                {fileName ?? (locale === 'fr' ? 'Document PDF' : 'PDF document')}
              </p>
              <a
                href={mediaUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-semibold text-orange-600 hover:text-orange-700 dark:text-orange-400"
              >
                {openPdfLabel}
              </a>
            </div>
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={mediaUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
          )}
        </div>

        <div className="absolute right-2 top-2 z-10 flex items-center gap-1.5">
          {canZoom && (
            <button
              type="button"
              onClick={() => setZoomOpen(true)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition hover:bg-black/65"
              aria-label={zoomLabel}
              title={zoomLabel}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7"
                />
              </svg>
            </button>
          )}
          <button
            type="button"
            onClick={onRemove}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition hover:bg-black/65"
            aria-label={removeLabel}
            title={removeLabel}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {zoomOpen &&
        canZoom &&
        typeof document !== 'undefined' &&
        createPortal(
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
            <button
              type="button"
              className="absolute inset-0 bg-neutral-950/85 backdrop-blur-sm"
              aria-label={locale === 'fr' ? 'Fermer' : 'Close'}
              onClick={() => setZoomOpen(false)}
            />
            <div className="relative z-[301] max-h-[min(90dvh,900px)] max-w-[min(96vw,960px)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={mediaUrl}
                alt=""
                className="max-h-[min(90dvh,900px)] max-w-full rounded-lg object-contain shadow-2xl"
              />
              <button
                type="button"
                onClick={() => setZoomOpen(false)}
                className="absolute -right-2 -top-2 flex h-9 w-9 items-center justify-center rounded-full bg-white text-neutral-800 shadow-md transition hover:bg-neutral-100 dark:bg-neutral-800 dark:text-white dark:hover:bg-neutral-700"
                aria-label={locale === 'fr' ? 'Fermer' : 'Close'}
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}

export function ContentMediaPreview({
  locale = 'en',
  mediaUrl,
  fileName,
  mediaType,
  large = false,
  hideWhenEmpty = false,
  compact = false,
  fluid = false,
  fit = 'contain',
}: ContentMediaPreviewProps) {
  if (!mediaUrl && hideWhenEmpty) return null;

  const kind = contentMediaKind(mediaUrl, fileName, mediaType);
  const emptyCopy =
    locale === 'fr'
      ? {
          title: 'Aperçu du média',
          hint: 'Téléversez un fichier pour le prévisualiser ici.',
          formats: 'Image · Video · Audio · PDF',
        }
      : {
          title: 'Media preview',
          hint: 'Upload a file to preview it here.',
          formats: 'Image · Video · Audio · PDF',
        };

  const frameClass = fluid
    ? 'w-full'
    : large
      ? compact
        ? 'min-h-[min(28vh,220px)] w-full'
        : 'min-h-[min(38vh,320px)] w-full'
      : 'aspect-video w-full max-w-lg';

  const mediaMaxClass =
    fluid && fit === 'cover'
      ? 'h-full w-full object-cover'
      : fluid
        ? 'max-h-[min(72dvh,640px)] w-full object-contain'
        : '';

  if (!mediaUrl) {
    return (
      <div
        className={`flex ${frameClass} flex-col items-center justify-center rounded-2xl border-2 border-dashed border-neutral-200 bg-neutral-50/80 px-6 text-center dark:border-neutral-700 dark:bg-neutral-900/50`}
      >
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm dark:bg-neutral-800">
          <svg className="h-7 w-7 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
        <p className="mt-4 text-sm font-semibold text-neutral-700 dark:text-neutral-200">{emptyCopy.title}</p>
        <p className="mt-1 max-w-xs text-xs text-neutral-500">{emptyCopy.hint}</p>
        <p className="mt-3 text-[11px] font-medium uppercase tracking-wide text-neutral-400">{emptyCopy.formats}</p>
      </div>
    );
  }

  return (
    <div
      className={`overflow-hidden rounded-xl border border-neutral-200/80 bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-900 ${
        fluid && fit === 'cover' ? 'h-full w-full' : fluid ? 'w-full' : frameClass
      }`}
    >
      {kind === 'video' ? (
        <video
          src={mediaUrl}
          controls
          className={
            fluid
              ? mediaMaxClass
              : `h-full ${large ? (compact ? 'min-h-[min(28vh,220px)]' : 'min-h-[min(38vh,320px)]') : ''} w-full bg-neutral-100 object-contain dark:bg-neutral-950`
          }
        />
      ) : kind === 'audio' ? (
        <div
          className={`flex w-full flex-col items-center justify-center gap-3 bg-neutral-900/5 p-6 dark:bg-neutral-950/80 ${
            fluid ? 'min-h-[8rem]' : `h-full ${large ? (compact ? 'min-h-[min(28vh,220px)]' : 'min-h-[min(38vh,320px)]') : ''}`
          }`}
        >
          <span className="text-3xl" aria-hidden>
            🎵
          </span>
          <audio src={mediaUrl} controls className="w-full max-w-md" preload="metadata">
            <track kind="captions" />
          </audio>
        </div>
      ) : kind === 'pdf' ? (
        <div
          className={`flex ${fluid ? 'min-h-[12rem]' : `h-full ${large ? (compact ? 'min-h-[min(28vh,220px)]' : 'min-h-[min(38vh,320px)]') : ''}`} flex-col items-center justify-center gap-3 bg-white p-6 text-center dark:bg-neutral-950`}
        >
          <span className="text-4xl" aria-hidden>
            📄
          </span>
          <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">
            {fileName ?? (locale === 'fr' ? 'Document PDF' : 'PDF document')}
          </p>
          <a
            href={mediaUrl}
            target="_blank"
            rel="noreferrer"
            className="text-sm font-semibold text-orange-600 hover:text-orange-700 dark:text-orange-400"
          >
            {locale === 'fr' ? 'Ouvrir le PDF' : 'Open PDF'}
          </a>
        </div>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={mediaUrl}
          alt=""
          className={
            fluid
              ? mediaMaxClass
              : `h-full ${large ? (compact ? 'min-h-[min(28vh,220px)]' : 'min-h-[min(38vh,320px)]') : ''} w-full object-contain`
          }
        />
      )}
    </div>
  );
}

type ContentMediaUploadButtonProps = {
  locale?: 'fr' | 'en';
  inputRef: React.RefObject<HTMLInputElement | null>;
  uploading: boolean;
  hasMedia: boolean;
  fileName?: string | null;
  onPick: () => void;
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

export function ContentMediaUploadButton({
  locale = 'en',
  inputRef,
  uploading,
  hasMedia,
  fileName,
  onPick,
  onFileChange,
}: ContentMediaUploadButtonProps) {
  const label = hasMedia
    ? locale === 'fr'
      ? 'Remplacer'
      : 'Replace file'
    : locale === 'fr'
      ? 'Choisir un fichier'
      : 'Choose file';

  return (
    <div className="flex min-w-0 items-center gap-2">
      <input
        ref={inputRef as React.Ref<HTMLInputElement>}
        type="file"
        accept={CONTENT_MEDIA_ACCEPT}
        className="sr-only"
        onChange={(e) => void onFileChange(e)}
      />
      <button
        type="button"
        onClick={onPick}
        disabled={uploading}
        className="inline-flex shrink-0 items-center gap-2 rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50 disabled:opacity-60 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800"
      >
        {uploading ? (
          <LoadingSpinner size="sm" />
        ) : (
          <svg className="h-4 w-4 shrink-0 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
        )}
        <span>{uploading ? (locale === 'fr' ? 'Envoi…' : 'Uploading…') : label}</span>
      </button>
      {fileName && !uploading && (
        <span className="hidden max-w-[9rem] truncate text-xs text-neutral-500 sm:inline">{fileName}</span>
      )}
    </div>
  );
}

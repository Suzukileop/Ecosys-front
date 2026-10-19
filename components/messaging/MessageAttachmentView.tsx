'use client';

import { localeTag } from '@/lib/i18n/active';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { getApiErrorMessage } from '@/lib/api-error';
import { getAttachmentDownloadUrl, getAttachmentViewUrl } from '@/lib/messaging';
import {
  isAttachmentLoadFailed,
  isAttachmentNotFoundError,
  markAttachmentLoadFailed,
} from '@/lib/messaging-attachments';
import { ChatShortVideoPlayer } from '@/components/messaging/ChatShortVideoPlayer';
import { storageWidthUrl } from '@/lib/media-image-url';
import type { MessageAttachment } from '@/types/messaging';
import { useT } from '@/lib/i18n/I18nProvider';

type MessageAttachmentViewProps = {
  conversationId: string;
  attachment: MessageAttachment;
  mine?: boolean;
  embedded?: boolean;
  sentAt?: string;
  messageId?: string;
};

/** Controls visible on hover (desktop). Always visible on touch devices. */
const HOVER_CHROME =
  'opacity-100 transition-opacity duration-200 [@media(hover:hover)_and_(pointer:fine)]:opacity-0 [@media(hover:hover)_and_(pointer:fine)]:group-hover/media:opacity-100';

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function isImageType(contentType: string): boolean {
  return contentType.startsWith('image/');
}

function isVideoType(contentType: string): boolean {
  return contentType.startsWith('video/');
}

function MediaLightbox({
  src,
  fileName,
  isVideo,
  onClose,
  onDownload,
  downloading,
}: {
  src: string;
  fileName: string;
  isVideo: boolean;
  onClose: () => void;
  onDownload: () => void;
  downloading: boolean;
}) {
  const t = useT();
  const [mediaReady, setMediaReady] = useState(false);

  useEffect(() => {
    setMediaReady(false);
  }, [src]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  return createPortal(
    <div
      className="fixed inset-0 z-[220] flex items-center justify-center p-4 sm:p-8"
      role="dialog"
      aria-modal="true"
      aria-label={fileName}
    >
      <button
        type="button"
        className="msg-media-backdrop-in absolute inset-0 bg-black/40 dark:bg-black/60"
        aria-label={t('Close preview')}
        onClick={onClose}
      />

      <div className="msg-media-panel-in relative z-10 flex max-h-[min(88vh,900px)] w-full max-w-[min(92vw,880px)] flex-col overflow-hidden rounded-2xl bg-white shadow-[0_24px_80px_-24px_rgba(0,0,0,0.35)] dark:bg-black dark:shadow-[0_0_0_1px_#2F3336]">
        <div className="flex shrink-0 items-center justify-between gap-3 px-3 py-2">
          <p className="min-w-0 truncate px-1 text-[15px] font-bold text-[#0F1419] dark:text-[#E7E9EA]">
            {fileName}
          </p>
          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              onClick={onDownload}
              disabled={downloading}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full text-[#0F1419] transition-colors hover:bg-[rgba(15,20,25,0.06)] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#0F1419] disabled:opacity-50 dark:text-[#E7E9EA] dark:hover:bg-[rgba(231,233,234,0.1)] dark:focus-visible:ring-[#E7E9EA]"
              aria-label={downloading ? t('Downloading') : t('Download')}
              title={t('Download')}
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full text-[#0F1419] transition-colors hover:bg-[rgba(15,20,25,0.06)] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#0F1419] dark:text-[#E7E9EA] dark:hover:bg-[rgba(231,233,234,0.1)] dark:focus-visible:ring-[#E7E9EA]"
              aria-label={t('Close')}
              title={t('Close')}
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="relative flex min-h-0 flex-1 items-center justify-center bg-[#F7F9F9] dark:bg-[#16181C]">
          {!mediaReady ? (
            <div
              className="absolute inset-6 animate-pulse rounded-[10px] bg-neutral-200/80 dark:bg-neutral-800/80"
              aria-hidden
            />
          ) : null}
          {isVideo ? (
            <video
              src={src}
              controls
              playsInline
              className={`max-h-[min(72vh,760px)] w-full bg-black object-contain transition-opacity duration-300 ${
                mediaReady ? 'msg-media-reveal opacity-100' : 'opacity-0'
              }`}
              preload="metadata"
              onLoadedData={() => setMediaReady(true)}
            >
              <track kind="captions" />
            </video>
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              /* Attachments are read through short-lived signed URLs, so `/_next/image` is out:
                 its cache would be keyed on a URL that expires. The backend resizes instead. */
              src={storageWidthUrl(src, 1280)}
              alt={fileName}
              decoding="async"
              className={`max-h-[min(72vh,760px)] w-full object-contain transition-opacity duration-300 ${
                mediaReady ? 'msg-media-reveal opacity-100' : 'opacity-0'
              }`}
              onLoad={() => setMediaReady(true)}
            />
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}

function InlineMediaAttachment({
  conversationId,
  attachment,
  embedded = false,
  sentAt,
}: MessageAttachmentViewProps) {
  const t = useT();
  const [previewUrl, setPreviewUrl] = useState<string | null>(attachment.localPreviewUrl ?? null);
  const [loading, setLoading] = useState(!attachment.localPreviewUrl);
  const [error, setError] = useState<string | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [revealed, setRevealed] = useState(Boolean(attachment.localPreviewUrl));
  const isVideo = isVideoType(attachment.contentType);
  const isOptimistic = Boolean(attachment.localPreviewUrl) || attachment.id.startsWith('optimistic-');

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setRevealed(Boolean(attachment.localPreviewUrl));
  }, [attachment.id, attachment.localPreviewUrl]);

  useEffect(() => {
    let cancelled = false;

    if (attachment.localPreviewUrl) {
      setPreviewUrl(attachment.localPreviewUrl);
      setLoading(false);
      setError(null);
    }

    if (isOptimistic && attachment.id.startsWith('optimistic-')) {
      return () => {
        cancelled = true;
      };
    }

    if (isAttachmentLoadFailed(conversationId, attachment.id)) {
      if (!attachment.localPreviewUrl) {
        setLoading(false);
        setError(t('Preview unavailable'));
      }
      return () => {
        cancelled = true;
      };
    }

    (async () => {
      if (!attachment.localPreviewUrl) {
        setLoading(true);
        setError(null);
      }
      try {
        const access = await getAttachmentViewUrl(conversationId, attachment.id);
        if (!cancelled) {
          setPreviewUrl(access.url);
          setError(null);
        }
      } catch (e) {
        if (!cancelled) {
          if (isAttachmentNotFoundError(e)) {
            markAttachmentLoadFailed(conversationId, attachment.id);
          }
          if (!attachment.localPreviewUrl) {
            setError(getApiErrorMessage(e, t('Unable to load media.')));
          }
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [conversationId, attachment.id, attachment.localPreviewUrl, isOptimistic, t]);

  const openLightbox = () => {
    if (isOptimistic && attachment.id.startsWith('optimistic-')) return;
    setLightboxOpen(true);
  };

  const handleDownload = async () => {
    if (isOptimistic && attachment.id.startsWith('optimistic-')) return;
    if (downloading) return;
    setDownloading(true);
    try {
      const access = await getAttachmentDownloadUrl(conversationId, attachment.id);
      const link = document.createElement('a');
      link.href = access.url;
      link.download = access.fileName || attachment.fileName;
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (e) {
      setError(getApiErrorMessage(e, t('Unable to download media.')));
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div
        className={`relative overflow-hidden bg-[#F7F9F9] dark:bg-[#16181C] ${
          embedded ? 'aspect-[9/16] min-h-[200px] w-full max-w-[280px]' : 'mt-1 h-44 w-56 max-w-full rounded-2xl'
        }`}
      >
        <div className="absolute inset-0 animate-pulse bg-neutral-200/70 dark:bg-neutral-700/70" />
      </div>
    );
  }

  if (error || !previewUrl) {
    return (
      <div
        className={`bg-[#F7F9F9] px-4 py-6 text-center text-[13px] text-[#536471] dark:bg-[#16181C] dark:text-[#71767B] ${
          embedded ? 'w-full' : 'mt-1 rounded-2xl'
        }`}
      >
        {error ?? t('Preview unavailable')}
      </div>
    );
  }

  const timeLabel = sentAt
    ? new Date(sentAt).toLocaleTimeString(localeTag(), { hour: 'numeric', minute: '2-digit' })
    : null;

  return (
    <>
      <div className={`group/media relative max-w-full ${embedded ? 'w-full' : 'mt-1 max-w-[min(100%,280px)]'}`}>
        {isVideo ? (
          <div className={`relative min-h-44 ${revealed ? 'msg-media-reveal' : ''}`}>
            {!revealed ? (
              <div
                className="absolute inset-0 z-[1] animate-pulse rounded-2xl bg-neutral-200/80 dark:bg-neutral-700/70"
                aria-hidden
              />
            ) : null}
            <div className={revealed ? 'opacity-100' : 'opacity-0'}>
              <ChatShortVideoPlayer
                src={previewUrl}
                label={attachment.fileName}
                onDownload={() => void handleDownload()}
                onReady={() => setRevealed(true)}
                className={embedded ? 'w-full' : 'rounded-2xl overflow-hidden'}
              />
            </div>
            <button
              type="button"
              onClick={openLightbox}
              className={`absolute left-2 top-2 z-[2] rounded-md bg-black/55 px-2 py-1 text-[11px] font-medium text-white backdrop-blur-xs transition hover:bg-black/70 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-white/60 ${HOVER_CHROME}`}
            >
              {t('Expand')}
            </button>
          </div>
        ) : (
          <>
            <button
              type="button"
              onClick={openLightbox}
              className={`relative block w-full cursor-pointer overflow-hidden focus:outline-hidden focus-visible:ring-2 focus-visible:ring-neutral-400 ${
                embedded ? '' : 'rounded-2xl'
              } ${revealed ? '' : 'min-h-44 bg-neutral-100 dark:bg-neutral-800'}`}
            >
              {!revealed ? (
                <div
                  className="absolute inset-0 animate-pulse bg-neutral-200/80 dark:bg-neutral-700/70"
                  aria-hidden
                />
              ) : null}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={storageWidthUrl(previewUrl, 640)}
                alt={attachment.fileName}
                className={`block max-h-[min(420px,70vh)] w-full cursor-pointer object-cover transition-opacity duration-300 ${
                  revealed ? 'msg-media-reveal opacity-100' : 'opacity-0'
                }`}
                loading="lazy"
                decoding="async"
                onLoad={() => setRevealed(true)}
              />
            </button>

            {embedded && timeLabel && (
              <>
                <div
                  className={`pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/60 to-transparent ${HOVER_CHROME}`}
                  aria-hidden
                />
                <time
                  dateTime={sentAt}
                  className={`pointer-events-none absolute bottom-1.5 right-2 text-[11px] font-medium text-white drop-shadow-md ${HOVER_CHROME}`}
                >
                  {timeLabel}
                </time>
              </>
            )}
          </>
        )}
      </div>

      {mounted && lightboxOpen && previewUrl ? (
        <MediaLightbox
          src={previewUrl}
          fileName={attachment.fileName}
          isVideo={isVideo}
          onClose={() => setLightboxOpen(false)}
          onDownload={() => void handleDownload()}
          downloading={downloading}
        />
      ) : null}
    </>
  );
}

function FileAttachmentCard({ conversationId, attachment, mine = false }: MessageAttachmentViewProps) {
  const t = useT();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isOptimistic = attachment.id.startsWith('optimistic-');

  const downloadFile = async () => {
    if (isOptimistic) return;
    setLoading(true);
    setError(null);
    try {
      const access = await getAttachmentDownloadUrl(conversationId, attachment.id);
      const link = document.createElement('a');
      link.href = access.url;
      link.download = access.fileName || attachment.fileName;
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (e) {
      setError(getApiErrorMessage(e, t('Unable to download file.')));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`flex flex-wrap items-center gap-3 rounded-2xl px-3 py-2.5 text-current ${
        mine ? 'bg-white/[0.14] dark:bg-black/[0.07]' : 'bg-white dark:bg-[#202327]'
      }`}
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center" aria-hidden>
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Z" />
          <path d="M14 3v5h5" />
        </svg>
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[15px] font-bold leading-5">
          {attachment.fileName}
        </p>
        <p className="text-[13px] opacity-70">
          {isOptimistic ? t('Sending…') : formatSize(attachment.sizeBytes)}
        </p>
      </div>
      {!isOptimistic ? (
        <button
          type="button"
          onClick={() => void downloadFile()}
          disabled={loading}
          className="inline-flex h-8 shrink-0 items-center rounded-full border border-current px-3 text-[13px] font-bold transition-opacity hover:opacity-80"
        >
          {loading ? '…' : t('Download')}
        </button>
      ) : (
        <span className="shrink-0 text-[13px] opacity-70">…</span>
      )}
      {error ? <p className="w-full text-[13px] text-[#F4212E]">{error}</p> : null}
    </div>
  );
}

export function MessageAttachmentView(props: MessageAttachmentViewProps) {
  const { attachment } = props;
  if (isImageType(attachment.contentType) || isVideoType(attachment.contentType)) {
    return <InlineMediaAttachment {...props} />;
  }
  return <FileAttachmentCard {...props} />;
}

export function attachmentIsVisualMedia(attachment: MessageAttachment): boolean {
  return isImageType(attachment.contentType) || isVideoType(attachment.contentType);
}

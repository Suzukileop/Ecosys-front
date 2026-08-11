'use client';

import { useCallback, useEffect, useState } from 'react';
import { getApiErrorMessage } from '@/lib/api-error';
import { getAttachmentDownloadUrl, getAttachmentViewUrl } from '@/lib/messaging';
import {
  isAttachmentLoadFailed,
  isAttachmentNotFoundError,
  markAttachmentLoadFailed,
} from '@/lib/messaging-attachments';
import { ChatShortVideoPlayer } from '@/components/messaging/ChatShortVideoPlayer';
import type { MessageAttachment } from '@/types/messaging';

type MessageAttachmentViewProps = {
  conversationId: string;
  attachment: MessageAttachment;
  mine?: boolean;
  embedded?: boolean;
  sentAt?: string;
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

function InlineMediaAttachment({
  conversationId,
  attachment,
  embedded = false,
  sentAt,
}: MessageAttachmentViewProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const isVideo = isVideoType(attachment.contentType);

  useEffect(() => {
    let cancelled = false;
    if (isAttachmentLoadFailed(conversationId, attachment.id)) {
      setLoading(false);
      setError('Preview unavailable');
      return;
    }
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const access = await getAttachmentViewUrl(conversationId, attachment.id);
        if (!cancelled) setPreviewUrl(access.url);
      } catch (e) {
        if (!cancelled) {
          if (isAttachmentNotFoundError(e)) {
            markAttachmentLoadFailed(conversationId, attachment.id);
          }
          setError(getApiErrorMessage(e, 'Unable to load media.'));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [conversationId, attachment.id]);

  const download = useCallback(async () => {
    try {
      const access = await getAttachmentDownloadUrl(conversationId, attachment.id);
      const link = document.createElement('a');
      link.href = access.url;
      link.download = access.fileName;
      link.rel = 'noopener noreferrer';
      link.click();
    } catch (e) {
      setError(getApiErrorMessage(e, 'Unable to download.'));
    }
  }, [conversationId, attachment.id]);

  if (loading) {
    return (
      <div
        className={`flex items-center justify-center bg-neutral-900 ${
          embedded ? 'aspect-[9/16] min-h-[200px] w-full max-w-[280px]' : 'mt-1 h-44 w-56 max-w-full rounded-2xl'
        }`}
      >
        <span className="text-xs text-neutral-400">Loading…</span>
      </div>
    );
  }

  if (error || !previewUrl) {
    return (
      <div
        className={`border border-dashed border-red-300 bg-red-50 px-3 py-4 text-xs text-red-600 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400 ${
          embedded ? 'w-full' : 'mt-1 rounded-2xl'
        }`}
      >
        {error ?? 'Preview unavailable'}
      </div>
    );
  }

  const timeLabel = sentAt
    ? new Date(sentAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
    : null;

  return (
    <>
      <div className={`group/media relative max-w-full ${embedded ? 'w-full' : 'mt-1 max-w-[min(100%,280px)]'}`}>
        {isVideo ? (
          <ChatShortVideoPlayer
            src={previewUrl}
            label={attachment.fileName}
            onDownload={() => void download()}
            className={embedded ? 'w-full' : 'rounded-2xl overflow-hidden'}
          />
        ) : (
          <>
            <button
              type="button"
              onClick={() => setLightboxOpen(true)}
              className={`block w-full overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                embedded ? '' : 'rounded-2xl'
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewUrl}
                alt={attachment.fileName}
                className="block max-h-[min(420px,70vh)] w-full cursor-zoom-in object-cover"
                loading="lazy"
              />
            </button>

            {embedded && timeLabel && (
              <>
                <div className={`pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/60 to-transparent ${HOVER_CHROME}`} aria-hidden />
                <time
                  dateTime={sentAt}
                  className={`pointer-events-none absolute bottom-1.5 right-2 text-[11px] font-medium text-white drop-shadow-md ${HOVER_CHROME}`}
                >
                  {timeLabel}
                </time>
              </>
            )}

            <button
              type="button"
              onClick={() => void download()}
              title="Download"
              className={`absolute right-2 top-2 rounded-full bg-black/50 p-1.5 text-white backdrop-blur-sm ${HOVER_CHROME}`}
              aria-label="Download image"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4" />
              </svg>
            </button>
          </>
        )}
      </div>

      {lightboxOpen && !isVideo && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Image preview"
          onClick={() => setLightboxOpen(false)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') setLightboxOpen(false);
          }}
        >
          <button
            type="button"
            className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
            onClick={() => setLightboxOpen(false)}
            aria-label="Close preview"
          >
            ✕
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewUrl}
            alt={attachment.fileName}
            className="max-h-[90vh] max-w-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}

function FileAttachmentCard({ conversationId, attachment, mine = false }: MessageAttachmentViewProps) {
  const [loading, setLoading] = useState<'view' | 'download' | null>(null);
  const [error, setError] = useState<string | null>(null);

  const openView = async () => {
    setLoading('view');
    setError(null);
    try {
      const access = await getAttachmentViewUrl(conversationId, attachment.id);
      window.open(access.url, '_blank', 'noopener,noreferrer');
    } catch (e) {
      setError(getApiErrorMessage(e, 'Unable to open file.'));
    } finally {
      setLoading(null);
    }
  };

  const download = async () => {
    setLoading('download');
    setError(null);
    try {
      const access = await getAttachmentDownloadUrl(conversationId, attachment.id);
      const link = document.createElement('a');
      link.href = access.url;
      link.download = access.fileName;
      link.rel = 'noopener noreferrer';
      link.click();
    } catch (e) {
      setError(getApiErrorMessage(e, 'Unable to download file.'));
    } finally {
      setLoading(null);
    }
  };

  return (
    <div
      className={`group/file mt-2 flex items-center gap-3 rounded-xl border px-3 py-2.5 ${
        mine
          ? 'border-blue-400/30 bg-blue-500/15'
          : 'border-neutral-200 bg-neutral-50 dark:border-neutral-600 dark:bg-neutral-900/50'
      }`}
    >
      <span className="text-2xl" aria-hidden>
        📎
      </span>
      <div className="min-w-0 flex-1">
        <p className={`truncate text-sm font-medium ${mine ? 'text-white' : 'text-neutral-800 dark:text-neutral-200'}`}>
          {attachment.fileName}
        </p>
        <p className={`text-[11px] ${mine ? 'text-blue-100' : 'text-neutral-500'}`}>{formatSize(attachment.sizeBytes)}</p>
      </div>
      <div
        className={`flex shrink-0 gap-1 ${HOVER_CHROME.replace('group-hover/media:', 'group-hover/file:')}`}
      >
        <button
          type="button"
          onClick={() => void openView()}
          disabled={loading !== null}
          className={`rounded-lg px-2 py-1 text-[11px] font-semibold ${
            mine
              ? 'bg-white/20 text-white hover:bg-white/30'
              : 'bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900/40 dark:text-blue-200'
          }`}
        >
          Open
        </button>
        <button
          type="button"
          onClick={() => void download()}
          disabled={loading !== null}
          className={`rounded-lg px-2 py-1 text-[11px] font-semibold ${
            mine
              ? 'bg-white/20 text-white hover:bg-white/30'
              : 'bg-neutral-200 text-neutral-800 hover:bg-neutral-300 dark:bg-neutral-700 dark:text-neutral-200'
          }`}
        >
          ↓
        </button>
      </div>
      {error && <p className="mt-1 w-full text-[10px] text-red-500">{error}</p>}
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

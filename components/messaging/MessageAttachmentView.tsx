'use client';

import { useEffect, useState } from 'react';
import { getApiErrorMessage } from '@/lib/api-error';
import { getAttachmentViewUrl } from '@/lib/messaging';
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

  if (loading) {
    return (
      <div
        className={`flex items-center justify-center bg-transparent ${
          embedded ? 'aspect-[9/16] min-h-[200px] w-full max-w-[280px]' : 'mt-1 h-44 w-56 max-w-full rounded-2xl'
        }`}
      >
        <span className="text-xs text-[var(--cw-text-muted,#9AA1AA)]">Loading…</span>
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const openView = async () => {
    setLoading(true);
    setError(null);
    try {
      const access = await getAttachmentViewUrl(conversationId, attachment.id);
      window.open(access.url, '_blank', 'noopener,noreferrer');
    } catch (e) {
      setError(getApiErrorMessage(e, 'Unable to open file.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`mt-2 flex items-center gap-3 rounded-xl border px-3 py-2.5 ${
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
        <p className={`text-[11px] ${mine ? 'text-blue-100' : 'text-neutral-500'}`}>
          {formatSize(attachment.sizeBytes)}
        </p>
      </div>
      <button
        type="button"
        onClick={() => void openView()}
        disabled={loading}
        className={`shrink-0 rounded-lg px-2 py-1 text-[11px] font-semibold ${
          mine
            ? 'bg-white/20 text-white hover:bg-white/30'
            : 'bg-neutral-200 text-neutral-800 hover:bg-neutral-300 dark:bg-neutral-700 dark:text-neutral-200'
        }`}
      >
        {loading ? '…' : 'Open'}
      </button>
      {error ? <p className="mt-1 w-full text-[10px] text-red-500">{error}</p> : null}
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

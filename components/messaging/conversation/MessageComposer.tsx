'use client';

import { useRef, useState, type DragEvent } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowUp } from '@fortawesome/free-solid-svg-icons';

export type ComposerPendingFile = {
  id: string;
  file: File;
  previewUrl: string | null;
};

type MessageComposerProps = {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onAttach?: () => void;
  onInviteGuest?: () => void;
  onFilesDropped?: (files: FileList | File[]) => void;
  pendingFiles?: ComposerPendingFile[];
  onRemovePendingFile?: (id: string) => void;
  disabled?: boolean;
  sending?: boolean;
  uploading?: boolean;
  placeholder?: string;
  readOnlyLabel?: string | null;
};

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function MessageComposer({
  value,
  onChange,
  onSend,
  onAttach,
  onInviteGuest,
  onFilesDropped,
  pendingFiles = [],
  onRemovePendingFile,
  disabled = false,
  sending = false,
  uploading = false,
  placeholder = 'Write your message…',
  readOnlyLabel = null,
}: MessageComposerProps) {
  const [dragging, setDragging] = useState(false);
  const dragDepthRef = useRef(0);

  if (readOnlyLabel) {
    return (
      <div className="shrink-0 border-t border-[var(--cw-border)] bg-[var(--cw-surface)] px-4 py-3">
        <p className="text-[13px] text-[var(--cw-text-secondary)]">{readOnlyLabel}</p>
      </div>
    );
  }

  const canSend =
    !disabled && !sending && !uploading && (value.trim().length > 0 || pendingFiles.length > 0);

  const handleDragEnter = (e: DragEvent) => {
    if (!onFilesDropped || disabled || sending) return;
    e.preventDefault();
    dragDepthRef.current += 1;
    setDragging(true);
  };

  const handleDragLeave = (e: DragEvent) => {
    if (!onFilesDropped) return;
    e.preventDefault();
    dragDepthRef.current = Math.max(0, dragDepthRef.current - 1);
    if (dragDepthRef.current === 0) setDragging(false);
  };

  const handleDragOver = (e: DragEvent) => {
    if (!onFilesDropped) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = (e: DragEvent) => {
    if (!onFilesDropped) return;
    e.preventDefault();
    dragDepthRef.current = 0;
    setDragging(false);
    if (e.dataTransfer.files?.length) {
      onFilesDropped(e.dataTransfer.files);
    }
  };

  return (
    <div
      className="relative shrink-0 border-t border-[var(--cw-border)] bg-[var(--cw-surface)] px-3 py-3 sm:px-4"
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {dragging ? (
        <div
          className="pointer-events-none absolute inset-2 z-10 flex items-center justify-center rounded-[10px] border-2 border-dashed border-[var(--cw-accent)] bg-[var(--cw-accent-soft)]/95"
          aria-hidden
        >
          <p className="text-sm font-semibold text-[var(--cw-accent)]">Drop files to attach</p>
        </div>
      ) : null}

      <div
        className={`rounded-[8px] border bg-[var(--cw-surface)] transition ${
          dragging
            ? 'border-neutral-500 dark:border-neutral-400'
            : 'border-neutral-300 focus-within:border-neutral-500 focus-within:ring-1 focus-within:ring-neutral-400/40 dark:border-neutral-700 dark:focus-within:border-neutral-400 dark:focus-within:ring-neutral-500/40'
        }`}
      >
        {pendingFiles.length > 0 ? (
          <div className="flex flex-wrap gap-2 border-b border-[var(--cw-border)] px-3 py-2.5">
            {pendingFiles.map((item) => {
              const isImage = item.file.type.startsWith('image/');
              const isVideo = item.file.type.startsWith('video/');
              return (
                <div
                  key={item.id}
                  className="relative flex max-w-[11rem] items-center gap-2 rounded-[8px] border border-[var(--cw-border)] bg-[var(--cw-surface-soft)] p-1.5"
                >
                  {isImage && item.previewUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.previewUrl}
                      alt=""
                      className="h-12 w-12 shrink-0 rounded-[6px] object-cover"
                    />
                  ) : (
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[6px] bg-[var(--cw-border)] text-[10px] font-semibold text-[var(--cw-text-secondary)]">
                      {isVideo ? 'VID' : 'FILE'}
                    </div>
                  )}
                  <div className="min-w-0 flex-1 pr-5">
                    <p className="truncate text-[13px] font-medium text-[var(--cw-text-primary)]">
                      {item.file.name}
                    </p>
                    <p className="text-[12px] text-[var(--cw-text-secondary)]">{formatSize(item.file.size)}</p>
                  </div>
                  {onRemovePendingFile ? (
                    <button
                      type="button"
                      onClick={() => onRemovePendingFile(item.id)}
                      disabled={sending || uploading}
                      className="absolute right-1 top-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-black/55 text-[11px] text-white transition hover:bg-black/75 disabled:opacity-40"
                      aria-label={`Remove ${item.file.name}`}
                      title="Remove"
                    >
                      ✕
                    </button>
                  ) : null}
                </div>
              );
            })}
          </div>
        ) : null}

        <label htmlFor="conversation-composer-input" className="sr-only">
          Your message
        </label>
        <textarea
          id="conversation-composer-input"
          rows={3}
          value={value}
          disabled={disabled || sending || uploading}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              if (canSend) onSend();
            }
          }}
          placeholder={placeholder}
          className="min-h-[72px] w-full resize-none border-0 bg-transparent px-3 py-2.5 text-sm text-[var(--cw-text-primary)] outline-none ring-0 focus:outline-none focus:ring-0 placeholder:text-[var(--cw-text-secondary)] disabled:opacity-60"
        />

        <div className="flex items-center justify-between gap-2 px-2 pb-2">
          <div className="flex items-center gap-0.5">
            {onAttach ? (
              <button
                type="button"
                onClick={onAttach}
                disabled={sending || disabled}
                className="inline-flex h-11 w-11 items-center justify-center rounded-[8px] text-[var(--cw-text-secondary)] transition hover:bg-neutral-100 hover:text-[var(--cw-text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cw-accent)]/40 disabled:opacity-40 dark:hover:bg-neutral-800"
                title="Attach media"
                aria-label="Attach media"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                  />
                </svg>
              </button>
            ) : null}

            {onInviteGuest ? (
              <button
                type="button"
                onClick={onInviteGuest}
                disabled={disabled || sending || uploading}
                className="inline-flex h-11 w-11 items-center justify-center rounded-[8px] text-[var(--cw-text-secondary)] transition hover:bg-neutral-100 hover:text-[var(--cw-text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cw-accent)]/40 disabled:opacity-40 dark:hover:bg-neutral-800"
                title="Invite guest"
                aria-label="Invite guest"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                  />
                </svg>
              </button>
            ) : null}
          </div>

          <button
            type="button"
            onClick={onSend}
            disabled={!canSend}
            className={`inline-flex h-11 w-11 items-center justify-center rounded-full transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cw-accent)]/40 ${
              canSend
                ? 'bg-[var(--cw-accent)] text-white hover:bg-[var(--msg-brand-hover,#E06E18)] active:scale-[0.97]'
                : 'cursor-not-allowed bg-neutral-200 text-neutral-400 dark:bg-neutral-800 dark:text-neutral-500'
            }`}
            title={canSend ? 'Send' : 'Write a message to send'}
            aria-label={canSend ? 'Send' : 'Send (disabled — empty message)'}
          >
            {sending || uploading ? (
              <span className="text-xs">…</span>
            ) : (
              <FontAwesomeIcon icon={faArrowUp} className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

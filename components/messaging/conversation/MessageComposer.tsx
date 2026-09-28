'use client';

import { useRef, useState, type DragEvent, type ReactNode } from 'react';

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

/**
 * Every glyph in the composer is drawn at `stroke-width: 1` on a 24 grid and carried at 20px.
 * One weight for the whole row is what makes a set of icons read as a set; the moment one of
 * them is heavier it becomes a button and the rest become decoration.
 */
function ComposerIconButton({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
      className="inline-flex h-9 w-9 items-center justify-center text-[var(--msg-ink-faint)] transition-colors duration-300 hover:text-[var(--msg-ink)] focus-visible:text-[var(--msg-ink)] focus-visible:outline-none disabled:pointer-events-none disabled:opacity-30"
    >
      {children}
    </button>
  );
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
      <div className="shrink-0 border-t border-[var(--msg-hairline)] px-5 py-5 sm:px-6">
        <p className="msg-micro text-[var(--msg-ink-faint)]">{readOnlyLabel}</p>
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
    /*
     * No card, no field, no frame. The composer is the bottom of the conversation panel and is
     * bounded by exactly one thing: the hairline it hangs from. The white rectangle that used
     * to be here was a surface drawn on top of a surface of the same colour — it separated
     * nothing and cost the panel its bottom edge.
     *
     * While a file is over the drop zone the hairline is the thing that answers, going to coral
     * for the length of the drag. That is the one moment the composer is allowed an accent.
     */
    <div
      className={`relative shrink-0 border-t px-5 pb-4 pt-3 transition-colors duration-300 sm:px-6 ${
        dragging ? 'border-[var(--msg-coral)]' : 'border-[var(--msg-hairline)]'
      }`}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {dragging ? (
        <div
          className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-[var(--msg-panel)]/85"
          aria-hidden
        >
          <p className="msg-micro text-[var(--msg-coral)]">Drop files to attach</p>
        </div>
      ) : null}

      {pendingFiles.length > 0 ? (
        <div className="mb-3 flex flex-wrap gap-2">
          {pendingFiles.map((item) => {
            const isImage = item.file.type.startsWith('image/');
            const isVideo = item.file.type.startsWith('video/');
            return (
              <div
                key={item.id}
                className="relative flex max-w-[12rem] items-center gap-2.5 border border-[var(--msg-hairline)] p-1.5"
              >
                {isImage && item.previewUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.previewUrl} alt="" className="h-11 w-11 shrink-0 object-cover" />
                ) : (
                  <div className="msg-micro flex h-11 w-11 shrink-0 items-center justify-center border border-[var(--msg-hairline)] text-[var(--msg-ink-faint)]">
                    {isVideo ? 'VID' : 'FILE'}
                  </div>
                )}
                <div className="min-w-0 flex-1 pr-5">
                  <p className="truncate text-[13px] font-light text-[var(--msg-ink)]">
                    {item.file.name}
                  </p>
                  <p className="msg-micro mt-1 text-[var(--msg-ink-faint)]">
                    {formatSize(item.file.size)}
                  </p>
                </div>
                {onRemovePendingFile ? (
                  <button
                    type="button"
                    onClick={() => onRemovePendingFile(item.id)}
                    disabled={sending || uploading}
                    className="absolute right-1 top-1 inline-flex h-5 w-5 items-center justify-center text-[var(--msg-ink-faint)] transition-colors duration-300 hover:text-[var(--msg-ink)] disabled:opacity-30"
                    aria-label={`Remove ${item.file.name}`}
                    title="Remove"
                  >
                    <svg
                      className="h-3 w-3"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1"
                      strokeLinecap="round"
                      aria-hidden
                    >
                      <path d="M6 6l12 12M18 6L6 18" />
                    </svg>
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
        rows={2}
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
        className="msg-scroll min-h-[3.25rem] w-full resize-none border-0 bg-transparent p-0 text-[0.9375rem] font-light leading-[1.65] text-[var(--msg-ink)] outline-none ring-0 placeholder:text-[var(--msg-ink-faint)] focus:outline-none focus:ring-0 disabled:opacity-50"
      />

      <div className="mt-1 flex items-center justify-between gap-2">
        <div className="-ml-2 flex items-center gap-1">
          {onAttach ? (
            <ComposerIconButton label="Attach media" onClick={onAttach} disabled={sending || disabled}>
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="M15.2 7 8.6 13.6a2 2 0 1 0 2.8 2.8l6.4-6.6a4 4 0 1 0-5.6-5.6l-6.5 6.6a6 6 0 1 0 8.5 8.5L20.5 13" />
              </svg>
            </ComposerIconButton>
          ) : null}

          {onInviteGuest ? (
            <ComposerIconButton
              label="Invite guest"
              onClick={onInviteGuest}
              disabled={disabled || sending || uploading}
            >
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="M18 9v6M21 12h-6M13 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0ZM3 20a6 6 0 0 1 12 0v1H3v-1Z" />
              </svg>
            </ComposerIconButton>
          ) : null}
        </div>

        {/*
         * Send is a drawn arrow, not a disc. A filled circle here would be the only solid shape
         * in the whole section and would sit at the very bottom of the reading order — the last
         * place that should be shouting. Availability is carried by ink: faint when there is
         * nothing to send, full black the instant there is.
         */}
        <button
          type="button"
          onClick={onSend}
          disabled={!canSend}
          className={`-mr-1 inline-flex h-9 w-9 items-center justify-center transition-colors duration-300 focus-visible:outline-none ${
            canSend
              ? 'text-[var(--msg-ink)] hover:text-[var(--msg-coral)]'
              : 'cursor-not-allowed text-[var(--msg-ink-faint)] opacity-40'
          }`}
          title={canSend ? 'Send' : 'Write a message to send'}
          aria-label={canSend ? 'Send' : 'Send (disabled — empty message)'}
        >
          {sending || uploading ? (
            <span className="msg-micro">…</span>
          ) : (
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M12 19V5M5 12l7-7 7 7" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}

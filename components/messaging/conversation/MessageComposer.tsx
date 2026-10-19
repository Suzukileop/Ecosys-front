'use client';

import { useEffect, useLayoutEffect, useRef, useState, type DragEvent, type ReactNode } from 'react';
import { X_MENU_ITEM, X_MENU_PANEL } from '@/components/messaging/messaging-x';
import { EmojiPicker } from '@/components/ui/EmojiPicker';
import { useT } from '@/lib/i18n/I18nProvider';

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
  /** Rendered above the text field; when present the message can be sent without text. */
  attachment?: ReactNode;
};

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** Composer glyph button: 40px circle (touch target), ink glyph, hover tint. */
function ComposerIconButton({
  label,
  onClick,
  disabled,
  active = false,
  className = 'inline-flex',
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
  /** Display utility (e.g. `hidden sm:inline-flex`); defaults to always shown. */
  className?: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
      aria-expanded={active || undefined}
      className={`h-10 w-10 shrink-0 items-center justify-center rounded-full text-[var(--msg-ink)] transition-colors duration-200 hover:bg-[var(--msg-wash)] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[var(--msg-ink)] disabled:pointer-events-none disabled:opacity-30 ${className} ${
        active ? 'bg-[var(--msg-wash)]' : ''
      }`}
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
  attachment = null,
}: MessageComposerProps) {
  const t = useT();
  const [dragging, setDragging] = useState(false);
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const dragDepthRef = useRef(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const emojiRootRef = useRef<HTMLDivElement>(null);
  const toolsRootRef = useRef<HTMLDivElement>(null);
  const valueRef = useRef(value);
  valueRef.current = value;

  /* One-line field that grows with the text (up to ~6 lines), like X's DM composer. */
  useLayoutEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, [value]);

  useEffect(() => {
    if (!emojiOpen) return;
    const onPointerDown = (event: PointerEvent) => {
      if (emojiRootRef.current && !emojiRootRef.current.contains(event.target as Node)) setEmojiOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setEmojiOpen(false);
      textareaRef.current?.focus();
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [emojiOpen]);

  /* Phones' "+" tools menu: closes on an outside tap or Escape, like the emoji panel. */
  useEffect(() => {
    if (!toolsOpen) return;
    const onPointerDown = (event: PointerEvent) => {
      if (toolsRootRef.current && !toolsRootRef.current.contains(event.target as Node)) setToolsOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setToolsOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [toolsOpen]);

  const insertEmoji = (emoji: string) => {
    const current = valueRef.current;
    const field = textareaRef.current;
    const start = field?.selectionStart ?? current.length;
    const end = field?.selectionEnd ?? current.length;
    const next = current.slice(0, start) + emoji + current.slice(end);
    valueRef.current = next;
    onChange(next);
    const caret = start + emoji.length;
    requestAnimationFrame(() => {
      const el = textareaRef.current;
      if (!el) return;
      el.setSelectionRange(caret, caret);
    });
  };

  if (readOnlyLabel) {
    return (
      <div className="shrink-0 px-5 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-3 sm:px-6">
        <p className="bg-[var(--msg-surface)] px-4 py-3.5 text-center text-[14px] leading-5 text-[var(--msg-ink-faint)]">{readOnlyLabel}</p>
      </div>
    );
  }

  const canSend =
    !disabled &&
    !sending &&
    !uploading &&
    (value.trim().length > 0 || pendingFiles.length > 0 || Boolean(attachment));

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

  const glyph = (d: string) => (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d={d} />
    </svg>
  );

  return (
    /*
     * X DM composer: one rounded field (#EFF3F4 / #202327) pinned to the bottom of the thread, tools
     * inside it on the left, the ink send disc on the right. No rule above it: tone does the work.
     */
    <div
      className="relative shrink-0 bg-[var(--msg-ground)] px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-2 sm:px-5 lg:pb-4"
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {dragging ? (
        <div
          className="pointer-events-none absolute inset-2 z-10 flex items-center justify-center rounded-[24px] bg-[var(--msg-ground)]/90 ring-2 ring-[var(--msg-ink)]"
          aria-hidden
        >
          <p className="text-[15px] font-bold text-[var(--msg-ink)]">{t('Drop files to attach')}</p>
        </div>
      ) : null}

      {attachment}

      {pendingFiles.length > 0 ? (
        <div className="mb-2 flex flex-wrap gap-2">
          {pendingFiles.map((item) => {
            const isImage = item.file.type.startsWith('image/');
            const isVideo = item.file.type.startsWith('video/');
            return (
              <div
                key={item.id}
                className="relative flex max-w-[14rem] items-center gap-2.5 rounded-2xl bg-[var(--msg-surface)] p-1.5 pr-8"
              >
                {isImage && item.previewUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.previewUrl} alt="" className="h-11 w-11 shrink-0 rounded-xl object-cover" />
                ) : (
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--msg-field)] text-[11px] font-bold text-[var(--msg-ink-faint)]">
                    {isVideo ? t('Video') : t('File')}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-bold text-[var(--msg-ink)]">{item.file.name}</p>
                  <p className="msg-micro text-[var(--msg-ink-faint)]">{formatSize(item.file.size)}</p>
                </div>
                {onRemovePendingFile ? (
                  <button
                    type="button"
                    onClick={() => onRemovePendingFile(item.id)}
                    disabled={sending || uploading}
                    className="absolute right-1 top-1/2 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-[var(--msg-ink-faint)] transition-colors hover:bg-[var(--msg-wash)] hover:text-[var(--msg-ink)] disabled:opacity-30"
                    aria-label={t('Remove {name}', { name: item.file.name })}
                    title={t('Remove')}
                  >
                    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
                      <path d="M6 6l12 12M18 6L6 18" />
                    </svg>
                  </button>
                ) : null}
              </div>
            );
          })}
        </div>
      ) : null}

      <div className="flex items-end gap-0.5 rounded-[24px] bg-[var(--msg-field)] p-1 transition-shadow focus-within:shadow-[inset_0_0_0_1.5px_var(--msg-ink)]">
        {/* Phones: one "+" holds the rare tools (attach, invite a guest), so the text gets the
            width; the emoji button goes too — the phone keyboard has its own. From sm every tool
            sits in the field. */}
        {onAttach || onInviteGuest ? (
          <div ref={toolsRootRef} className="relative shrink-0 sm:hidden">
            <ComposerIconButton
              label={t('Add to message')}
              onClick={() => setToolsOpen((open) => !open)}
              disabled={disabled || sending || uploading}
              active={toolsOpen}
            >
              <svg
                className={`h-5 w-5 transition-transform duration-200 ${toolsOpen ? 'rotate-45' : ''}`}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                aria-hidden
              >
                <path d="M12 5v14M5 12h14" />
              </svg>
            </ComposerIconButton>
            {toolsOpen ? (
              <div role="menu" aria-label={t('Add to message')} className={`absolute bottom-full left-0 z-40 mb-2 min-w-[13rem] ${X_MENU_PANEL}`}>
                {onAttach ? (
                  <button
                    type="button"
                    role="menuitem"
                    className={X_MENU_ITEM}
                    onClick={() => {
                      setToolsOpen(false);
                      onAttach();
                    }}
                  >
                    {t.rich('{glyph} Photo, video or file', { glyph: glyph('M15.2 7 8.6 13.6a2 2 0 1 0 2.8 2.8l6.4-6.6a4 4 0 1 0-5.6-5.6l-6.5 6.6a6 6 0 1 0 8.5 8.5L20.5 13') })}
                  </button>
                ) : null}
                {onInviteGuest ? (
                  <button
                    type="button"
                    role="menuitem"
                    className={X_MENU_ITEM}
                    onClick={() => {
                      setToolsOpen(false);
                      onInviteGuest();
                    }}
                  >
                    {t.rich('{glyph} Invite a guest', { glyph: glyph('M18 9v6M21 12h-6M13 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0ZM3 20a6 6 0 0 1 12 0v1H3v-1Z') })}
                  </button>
                ) : null}
              </div>
            ) : null}
          </div>
        ) : null}

        {onAttach ? (
          <ComposerIconButton label={t('Attach media')} onClick={onAttach} disabled={sending || disabled} className="hidden sm:inline-flex">
            {glyph('M15.2 7 8.6 13.6a2 2 0 1 0 2.8 2.8l6.4-6.6a4 4 0 1 0-5.6-5.6l-6.5 6.6a6 6 0 1 0 8.5 8.5L20.5 13')}
          </ComposerIconButton>
        ) : null}

        {onInviteGuest ? (
          <ComposerIconButton label={t('Invite guest')} onClick={onInviteGuest} disabled={disabled || sending || uploading} className="hidden sm:inline-flex">
            {glyph('M18 9v6M21 12h-6M13 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0ZM3 20a6 6 0 0 1 12 0v1H3v-1Z')}
          </ComposerIconButton>
        ) : null}

        <div ref={emojiRootRef} className="relative hidden shrink-0 sm:block">
          <ComposerIconButton
            label={t('Emoji')}
            onClick={() => setEmojiOpen((open) => !open)}
            disabled={disabled || sending || uploading}
            active={emojiOpen}
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <circle cx="12" cy="12" r="9" />
              <path d="M8.5 14.5a4.5 4.5 0 0 0 7 0M9 9.75h.01M15 9.75h.01" />
            </svg>
          </ComposerIconButton>
          {emojiOpen ? (
            <div role="dialog" aria-label={t('Emoji')} className={`absolute bottom-full left-0 z-40 mb-2 ${X_MENU_PANEL}`}>
              <EmojiPicker onSelect={insertEmoji} />
            </div>
          ) : null}
        </div>

        <label htmlFor="conversation-composer-input" className="sr-only">
          {t('Your message')}
        </label>
        <textarea
          ref={textareaRef}
          id="conversation-composer-input"
          rows={1}
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
          className="msg-scroll max-h-40 min-h-10 min-w-0 flex-1 resize-none border-0 bg-transparent px-2 py-2 text-[16px] leading-6 text-[var(--msg-ink)] outline-hidden ring-0 placeholder:text-[var(--msg-ink-faint)] focus:outline-hidden focus:ring-0 disabled:opacity-50 lg:text-[15px]"
        />

        <button
          type="button"
          onClick={onSend}
          disabled={!canSend}
          className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--msg-primary)] text-[var(--msg-primary-ink)] transition-[background-color,opacity] duration-200 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[var(--msg-ink)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--msg-field)] ${
            canSend ? 'hover:bg-[var(--msg-primary-hover)]' : 'cursor-not-allowed opacity-30'
          }`}
          title={canSend ? t('Send') : t('Write a message to send')}
          aria-label={canSend ? t('Send') : t('Send (disabled, empty message)')}
        >
          {sending || uploading ? (
            <span className="text-[13px] font-bold">…</span>
          ) : (
            <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M12 19V5M5 12l7-7 7 7" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}

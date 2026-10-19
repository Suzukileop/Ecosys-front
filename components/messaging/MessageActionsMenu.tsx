'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { getApiErrorMessage } from '@/lib/api-error';
import { isMessagePinned, togglePinnedMessage } from '@/lib/discussion-pins';
import { getAttachmentDownloadUrl } from '@/lib/messaging';
import { pushFlashFeedback } from '@/stores/flashFeedbackStore';
import type { DirectMessage } from '@/types/messaging';
import { X_MENU_ITEM, X_MENU_ITEM_DANGER, X_MENU_PANEL } from '@/components/messaging/messaging-x';
import { useT } from '@/lib/i18n/I18nProvider';

type MessageActionsMenuProps = {
  message: DirectMessage;
  conversationId: string;
  mine: boolean;
  onTransfer?: (message: DirectMessage) => void;
  onDelete?: (message: DirectMessage) => void;
};

const MENU_ESTIMATED_HEIGHT = 200;

function MoreVerticalIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <circle cx="12" cy="5" r="1.75" />
      <circle cx="12" cy="12" r="1.75" />
      <circle cx="12" cy="19" r="1.75" />
    </svg>
  );
}

export function MessageActionsMenu({
  message,
  conversationId,
  mine,
  onTransfer,
  onDelete,
}: MessageActionsMenuProps) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const [openUpward, setOpenUpward] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const pinned = isMessagePinned(conversationId, message.id);
  const attachments = message.attachments ?? [];
  const hasAttachments = attachments.length > 0;

  useLayoutEffect(() => {
    if (!open || !buttonRef.current) return;

    const updatePlacement = () => {
      const button = buttonRef.current;
      const menu = menuRef.current;
      if (!button) return;

      const rect = button.getBoundingClientRect();
      const menuHeight = menu?.offsetHeight ?? MENU_ESTIMATED_HEIGHT;
      const spaceBelow = window.innerHeight - rect.bottom - 8;
      const spaceAbove = rect.top - 8;
      setOpenUpward(spaceBelow < menuHeight && spaceAbove > spaceBelow);
    };

    updatePlacement();
    window.addEventListener('resize', updatePlacement);
    window.addEventListener('scroll', updatePlacement, true);
    return () => {
      window.removeEventListener('resize', updatePlacement);
      window.removeEventListener('scroll', updatePlacement, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  /* 32px disc beside the bubble, with an invisible 40px hit area (`before:`) so it is a fair touch
     target without taking more of the bubble's width. */
  const triggerClass = `relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors duration-200 before:absolute before:-inset-1 before:content-[''] hover:bg-[var(--msg-wash)] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[var(--msg-ink)] ${
    open ? 'text-[var(--msg-ink)]' : 'text-[var(--msg-ink-faint)] hover:text-[var(--msg-ink)]'
  }`;

  const menuItemClass = X_MENU_ITEM;

  const handleCopy = async () => {
    const text =
      message.content?.trim() ||
      (message.attachments?.length ? (message.attachments[0]?.fileName ?? 'Attachment') : '');
    if (!text) {
      pushFlashFeedback({ variant: 'error', title: t('Nothing to copy') });
      setOpen(false);
      return;
    }
    try {
      await navigator.clipboard.writeText(text);
      pushFlashFeedback({ variant: 'success', title: t('Copied'), description: t('Message copied to clipboard.') });
    } catch {
      pushFlashFeedback({ variant: 'error', title: t('Copy failed') });
    }
    setOpen(false);
  };

  const handleTransfer = () => {
    setOpen(false);
    onTransfer?.(message);
  };

  const handlePin = () => {
    togglePinnedMessage(conversationId, message.id);
    setOpen(false);
  };

  const handleDelete = () => {
    setOpen(false);
    onDelete?.(message);
  };

  const handleDownload = async () => {
    if (!hasAttachments || downloading) return;
    setDownloading(true);
    try {
      for (const attachment of attachments) {
        const access = await getAttachmentDownloadUrl(conversationId, attachment.id);
        const link = document.createElement('a');
        link.href = access.url;
        link.download = access.fileName;
        link.rel = 'noopener noreferrer';
        link.click();
      }
      pushFlashFeedback({
        variant: 'success',
        title: t('Download started'),
        description: attachments.length > 1 ? `${attachments.length} files` : attachments[0]?.fileName,
      });
      setOpen(false);
    } catch (e) {
      pushFlashFeedback({
        variant: 'error',
        title: t('Download failed'),
        description: getApiErrorMessage(e, t('Unable to download media.')),
      });
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div ref={rootRef} className="relative shrink-0 self-start">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((value) => !value)}
        className={triggerClass}
        aria-label={t('Message options')}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <MoreVerticalIcon />
      </button>
      {open && (
        <div
          ref={menuRef}
          role="menu"
          className={`absolute z-30 min-w-[11rem] ${X_MENU_PANEL} ${
            openUpward ? 'bottom-full mb-1' : 'top-full mt-1'
          } ${mine ? 'left-0' : 'right-0'}`}
        >
          <button type="button" role="menuitem" className={menuItemClass} onClick={handleTransfer}>
            {t('Forward')}
          </button>
          <button type="button" role="menuitem" className={menuItemClass} onClick={() => void handleCopy()}>
            {t('Copy')}
          </button>
          {hasAttachments ? (
            <button
              type="button"
              role="menuitem"
              className={menuItemClass}
              disabled={downloading}
              onClick={() => void handleDownload()}
            >
              {downloading ? t('Downloading…') : attachments.length > 1 ? t('Download media') : t('Download')}
            </button>
          ) : null}
          <button type="button" role="menuitem" className={menuItemClass} onClick={handlePin}>
            {pinned ? t('Unpin') : t('Pin')}
          </button>
          {mine && onDelete ? (
            <button
              type="button"
              role="menuitem"
              className={X_MENU_ITEM_DANGER}
              onClick={handleDelete}
            >
              {t('Delete')}
            </button>
          ) : null}
        </div>
      )}
    </div>
  );
}

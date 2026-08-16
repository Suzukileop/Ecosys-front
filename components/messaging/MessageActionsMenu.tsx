'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { getApiErrorMessage } from '@/lib/api-error';
import { isMessagePinned, togglePinnedMessage } from '@/lib/discussion-pins';
import { getAttachmentDownloadUrl } from '@/lib/messaging';
import { pushFlashFeedback } from '@/stores/flashFeedbackStore';
import type { DirectMessage } from '@/types/messaging';

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
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [open]);

  const triggerClass = `flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-neutral-400 transition hover:bg-neutral-200/80 hover:text-neutral-700 dark:text-neutral-500 dark:hover:bg-neutral-800 dark:hover:text-neutral-200 ${
    open ? 'bg-neutral-200/80 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-200' : ''
  }`;

  const menuItemClass =
    'flex w-full items-center px-3 py-2 text-left text-xs font-medium text-neutral-700 transition hover:bg-neutral-100 disabled:opacity-50 dark:text-neutral-200 dark:hover:bg-neutral-800';

  const handleCopy = async () => {
    const text =
      message.content?.trim() ||
      (message.attachments?.length ? (message.attachments[0]?.fileName ?? 'Attachment') : '');
    if (!text) {
      pushFlashFeedback({ variant: 'error', title: 'Nothing to copy' });
      setOpen(false);
      return;
    }
    try {
      await navigator.clipboard.writeText(text);
      pushFlashFeedback({ variant: 'success', title: 'Copied', description: 'Message copied to clipboard.' });
    } catch {
      pushFlashFeedback({ variant: 'error', title: 'Copy failed' });
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
        title: 'Download started',
        description: attachments.length > 1 ? `${attachments.length} files` : attachments[0]?.fileName,
      });
      setOpen(false);
    } catch (e) {
      pushFlashFeedback({
        variant: 'error',
        title: 'Download failed',
        description: getApiErrorMessage(e, 'Unable to download media.'),
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
        aria-label="Message options"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <MoreVerticalIcon />
      </button>
      {open && (
        <div
          ref={menuRef}
          role="menu"
          className={`absolute z-30 min-w-[9.5rem] overflow-hidden rounded-xl border border-neutral-200 bg-white py-1 shadow-lg dark:border-neutral-600 dark:bg-neutral-900 ${
            openUpward ? 'bottom-full mb-1' : 'top-full mt-1'
          } ${mine ? 'left-0' : 'right-0'}`}
        >
          <button type="button" role="menuitem" className={menuItemClass} onClick={handleTransfer}>
            Transfer
          </button>
          <button type="button" role="menuitem" className={menuItemClass} onClick={() => void handleCopy()}>
            Copy
          </button>
          {hasAttachments ? (
            <button
              type="button"
              role="menuitem"
              className={menuItemClass}
              disabled={downloading}
              onClick={() => void handleDownload()}
            >
              {downloading ? 'Downloading…' : attachments.length > 1 ? 'Download media' : 'Download'}
            </button>
          ) : null}
          <button type="button" role="menuitem" className={menuItemClass} onClick={handlePin}>
            {pinned ? 'Unpin' : 'Pin'}
          </button>
          {mine && onDelete ? (
            <button
              type="button"
              role="menuitem"
              className={`${menuItemClass} text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40`}
              onClick={handleDelete}
            >
              Delete
            </button>
          ) : null}
        </div>
      )}
    </div>
  );
}

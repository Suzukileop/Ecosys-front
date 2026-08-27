'use client';

import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import type { ContentPostBucket } from '@/types/creator-content';

type MenuItem = {
  id: string;
  label: string;
  onClick?: () => void;
  href?: string;
  tone?: 'default' | 'danger';
  disabled?: boolean;
};

type MenuCoords = {
  top: number;
  left: number;
  openUp: boolean;
};

type ContentPostOverflowMenuProps = {
  postId: string;
  bucket: ContentPostBucket;
  pinned: boolean;
  isPublic?: boolean;
  visibilityBusy?: boolean;
  onVisibilityChange?: (isPublic: boolean) => void;
  commentsEnabled?: boolean;
  commentsBusy?: boolean;
  onCommentsEnabledChange?: (enabled: boolean) => void;
  onEdit?: () => void;
  onPin: () => void;
  onUnpin: () => void;
  onArchive: () => void;
  onUnarchive: () => void;
  onMoveToTrash: () => void;
  onRestore: () => void;
  onPermanentDelete: () => void;
};

const MENU_MIN_WIDTH = 176;
const VIEWPORT_PAD = 8;
const GAP = 6;

export function ContentPostOverflowMenu({
  postId,
  bucket,
  pinned,
  isPublic = true,
  visibilityBusy = false,
  onVisibilityChange,
  commentsEnabled = true,
  commentsBusy = false,
  onCommentsEnabledChange,
  onEdit,
  onPin,
  onUnpin,
  onArchive,
  onUnarchive,
  onMoveToTrash,
  onRestore,
  onPermanentDelete,
}: ContentPostOverflowMenuProps) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState<MenuCoords | null>(null);
  const [mounted, setMounted] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useEffect(() => {
    setMounted(true);
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    setCoords(null);
  }, []);

  const updatePosition = useCallback(() => {
    const trigger = triggerRef.current;
    const menu = menuRef.current;
    if (!trigger) return;

    const rect = trigger.getBoundingClientRect();
    const menuHeight = menu?.offsetHeight ?? 220;
    const menuWidth = Math.max(menu?.offsetWidth ?? MENU_MIN_WIDTH, MENU_MIN_WIDTH);
    const spaceBelow = window.innerHeight - rect.bottom - VIEWPORT_PAD;
    const openUp = spaceBelow < menuHeight && rect.top > spaceBelow;

    let top = openUp ? rect.top - GAP - menuHeight : rect.bottom + GAP;
    let left = rect.right - menuWidth;

    top = Math.min(
      Math.max(VIEWPORT_PAD, top),
      window.innerHeight - menuHeight - VIEWPORT_PAD
    );
    left = Math.min(
      Math.max(VIEWPORT_PAD, left),
      window.innerWidth - menuWidth - VIEWPORT_PAD
    );

    setCoords({ top, left, openUp });
  }, []);

  useLayoutEffect(() => {
    if (!open) return;
    updatePosition();
    // Second pass after paint when menu dimensions are known
    const frame = requestAnimationFrame(() => updatePosition());
    return () => cancelAnimationFrame(frame);
  }, [open, updatePosition, bucket, commentsEnabled, pinned, isPublic]);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node | null;
      if (!target) return;
      if (triggerRef.current?.contains(target)) return;
      if (menuRef.current?.contains(target)) return;
      close();
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        close();
        triggerRef.current?.focus();
      }
    };

    const onViewportChange = () => {
      // Scroll / resize often leaves fixed menus stranded — close reliably.
      close();
    };

    document.addEventListener('pointerdown', onPointerDown, true);
    document.addEventListener('keydown', onKeyDown);
    window.addEventListener('resize', onViewportChange);
    window.addEventListener('scroll', onViewportChange, true);

    return () => {
      document.removeEventListener('pointerdown', onPointerDown, true);
      document.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('resize', onViewportChange);
      window.removeEventListener('scroll', onViewportChange, true);
    };
  }, [open, close]);

  // Never leave a dangling open panel after unmount / post change.
  useEffect(() => close, [postId, bucket, close]);

  const items: MenuItem[] = [];

  if (bucket === 'trash') {
    items.push(
      { id: 'restore', label: 'Restore', onClick: onRestore },
      { id: 'permanent', label: 'Delete permanently', onClick: onPermanentDelete, tone: 'danger' }
    );
  } else {
    if (onEdit) {
      items.push({
        id: 'edit',
        label: 'Edit',
        onClick: onEdit,
      });
    } else {
      items.push({
        id: 'edit',
        label: 'Edit',
        href: `/dashboard/creator/content/${postId}/edit`,
      });
    }

    if (onVisibilityChange) {
      items.push({
        id: 'visibility',
        label: isPublic ? 'Make private' : 'Make public',
        onClick: () => onVisibilityChange(!isPublic),
        disabled: visibilityBusy,
      });
    }

    if (onCommentsEnabledChange) {
      items.push({
        id: 'comments',
        label: commentsEnabled ? 'Disable comments' : 'Enable comments',
        onClick: () => onCommentsEnabledChange(!commentsEnabled),
        disabled: commentsBusy,
      });
    }

    if (bucket === 'active' || bucket === 'pinned') {
      items.push({
        id: 'pin',
        label: pinned ? 'Unpin' : 'Pin to top',
        onClick: pinned ? onUnpin : onPin,
      });
      items.push({ id: 'archive', label: 'Archive', onClick: onArchive });
    }

    if (bucket === 'archived') {
      items.push({ id: 'unarchive', label: 'Unarchive', onClick: onUnarchive });
    }

    items.push({
      id: 'trash',
      label: 'Move to trash',
      onClick: onMoveToTrash,
      tone: 'danger',
    });
  }

  const run = (item: MenuItem) => {
    if (item.disabled) return;
    close();
    // Defer so the menu unmounts before confirm() blocks the main thread.
    window.setTimeout(() => {
      item.onClick?.();
    }, 0);
  };

  const panel =
    open && mounted
      ? createPortal(
          <div
            ref={menuRef}
            id={menuId}
            role="menu"
            aria-labelledby={`${menuId}-trigger`}
            className="fixed z-[200] min-w-[11.5rem] overflow-hidden rounded-xl border border-neutral-200/90 bg-white py-1 shadow-lg dark:border-neutral-700 dark:bg-neutral-900"
            style={{
              top: coords?.top ?? -9999,
              left: coords?.left ?? -9999,
              visibility: coords ? 'visible' : 'hidden',
              pointerEvents: coords ? 'auto' : 'none',
            }}
            onClick={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
          >
            {items.map((item) => {
              const className = `flex w-full items-center px-3 py-2.5 text-left text-sm transition hover:bg-neutral-50 dark:hover:bg-neutral-800 ${
                item.tone === 'danger'
                  ? 'text-red-600 hover:text-red-700 dark:text-red-400'
                  : 'text-neutral-700 dark:text-neutral-200'
              } ${item.disabled ? 'cursor-not-allowed opacity-50' : ''}`;

              if (item.href) {
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    onClick={() => close()}
                    className={className}
                    role="menuitem"
                  >
                    {item.label}
                  </Link>
                );
              }

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => run(item)}
                  disabled={item.disabled}
                  className={className}
                  role="menuitem"
                >
                  {item.label}
                </button>
              );
            })}
          </div>,
          document.body
        )
      : null;

  return (
    <div className="relative isolate">
      <button
        ref={triggerRef}
        id={`${menuId}-trigger`}
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen((wasOpen) => {
            if (wasOpen) {
              setCoords(null);
              return false;
            }
            return true;
          });
        }}
        className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-sm transition-colors hover:bg-black/60"
        aria-label="Content actions"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls={open ? menuId : undefined}
      >
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden>
          <path d="M10 6a2 2 0 110-4 2 2 0 010 4zm0 6a2 2 0 110-4 2 2 0 010 4zm0 6a2 2 0 110-4 2 2 0 010 4z" />
        </svg>
      </button>
      {panel}
    </div>
  );
}

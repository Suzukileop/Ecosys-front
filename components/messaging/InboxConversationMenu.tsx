'use client';

import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBoxArchive,
  faCircleUser,
  faEllipsis,
  faEnvelope,
  faTrashCan,
} from '@fortawesome/free-solid-svg-icons';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { marketplaceCreatorProfileHref } from '@/lib/marketplace-nav';

type MenuItem = {
  id: string;
  label: string;
  icon: IconDefinition;
  onClick?: () => void;
  href?: string;
  tone?: 'default' | 'danger';
};

type MenuCoords = {
  top: number;
  left: number;
  openUp: boolean;
};

type InboxConversationMenuProps = {
  conversationId: string;
  otherUserId?: string | null;
  isDirect: boolean;
  archived?: boolean;
  busy?: boolean;
  onMarkUnread: () => void;
  onArchive: () => void;
  onUnarchive: () => void;
  onDelete: () => void;
};

const MENU_MIN_WIDTH = 240;
const VIEWPORT_PAD = 8;
const GAP = 8;

export function InboxConversationMenu({
  conversationId,
  otherUserId,
  isDirect,
  archived = false,
  busy = false,
  onMarkUnread,
  onArchive,
  onUnarchive,
  onDelete,
}: InboxConversationMenuProps) {
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

    top = Math.min(Math.max(VIEWPORT_PAD, top), window.innerHeight - menuHeight - VIEWPORT_PAD);
    left = Math.min(Math.max(VIEWPORT_PAD, left), window.innerWidth - menuWidth - VIEWPORT_PAD);

    setCoords({ top, left, openUp });
  }, []);

  useLayoutEffect(() => {
    if (!open) return;
    updatePosition();
    const frame = requestAnimationFrame(() => updatePosition());
    return () => cancelAnimationFrame(frame);
  }, [open, updatePosition, archived]);

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

    const onViewportChange = () => close();

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

  useEffect(() => close, [conversationId, close]);

  const profileHref =
    isDirect && otherUserId
      ? marketplaceCreatorProfileHref(
          otherUserId,
          `/dashboard/discussions?conversation=${encodeURIComponent(conversationId)}`
        )
      : null;

  const items: MenuItem[] = [
    {
      id: 'unread',
      label: 'Mark as unread',
      icon: faEnvelope,
      onClick: onMarkUnread,
    },
    ...(profileHref
      ? [
          {
            id: 'profile',
            label: 'View profile',
            icon: faCircleUser,
            href: profileHref,
          } satisfies MenuItem,
        ]
      : []),
    {
      id: archived ? 'unarchive' : 'archive',
      label: archived ? 'Unarchive conversation' : 'Archive conversation',
      icon: faBoxArchive,
      onClick: archived ? onUnarchive : onArchive,
    },
    {
      id: 'delete',
      label: 'Delete conversation',
      icon: faTrashCan,
      onClick: onDelete,
      tone: 'danger',
    },
  ];

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        disabled={busy}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        aria-label="Conversation options"
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          setOpen((value) => !value);
        }}
        className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-[var(--msg-ink-faint)] transition-[color,opacity] duration-300 hover:text-[var(--msg-ink)] focus-visible:outline-none disabled:opacity-40 ${
          open ? 'opacity-100' : 'opacity-0 group-hover/row:opacity-100 focus-visible:opacity-100'
        }`}
      >
        <FontAwesomeIcon icon={faEllipsis} className="h-3.5 w-3.5" />
      </button>

      {mounted && open && coords
        ? createPortal(
            <div
              ref={menuRef}
              id={menuId}
              role="menu"
              aria-label="Conversation options"
              /*
               * `msg-mineral` is repeated here because this menu is portalled to <body> and so
               * escapes the scope the rest of the section lives in. Without it the charter's
               * custom properties resolve to nothing out here and the card renders unpainted.
               */
              className="msg-mineral fixed z-[230]"
              style={{ top: coords.top, left: coords.left, minWidth: MENU_MIN_WIDTH }}
            >
              <div
                className={`absolute left-1/2 h-2.5 w-2.5 -translate-x-1/2 rotate-45 border border-[var(--msg-hairline-strong)] bg-[var(--msg-panel)] ${
                  coords.openUp ? 'bottom-[-5px] border-t-0 border-l-0' : 'top-[-5px] border-b-0 border-r-0'
                }`}
                style={{ left: 'calc(100% - 22px)' }}
                aria-hidden
              />
              <div className="overflow-hidden rounded-[var(--cw-radius)] border border-[var(--msg-hairline-strong)] bg-[var(--msg-panel)] py-1.5 shadow-[0_18px_40px_-28px_rgba(0,0,0,0.45)]">
                {items.map((item, index) => {
                  const showDivider = item.id === 'archive' || item.id === 'unarchive' || item.id === 'delete';
                  const prev = items[index - 1];
                  const afterProfile =
                    showDivider && prev && (prev.id === 'profile' || prev.id === 'unread');

                  const className = `flex w-full items-center gap-3 px-3.5 py-2.5 text-left text-[13px] transition ${
                    item.tone === 'danger'
                      ? 'text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40'
                      : 'text-[var(--msg-ink-soft)] hover:bg-[var(--msg-wash)] hover:text-[var(--msg-ink)]'
                  }`;

                  const content = (
                    <>
                      <FontAwesomeIcon
                        icon={item.icon}
                        className="h-4 w-4 shrink-0 opacity-80"
                        fixedWidth
                      />
                      <span className="min-w-0 flex-1 font-medium">{item.label}</span>
                    </>
                  );

                  return (
                    <div key={item.id}>
                      {afterProfile ? (
                        <div className="my-1 border-t border-[var(--msg-hairline)]" />
                      ) : null}
                      {item.href ? (
                        <Link
                          href={item.href}
                          role="menuitem"
                          className={className}
                          onClick={(event) => {
                            event.stopPropagation();
                            close();
                          }}
                        >
                          {content}
                        </Link>
                      ) : (
                        <button
                          type="button"
                          role="menuitem"
                          className={className}
                          disabled={busy}
                          onClick={(event) => {
                            event.preventDefault();
                            event.stopPropagation();
                            close();
                            item.onClick?.();
                          }}
                        >
                          {content}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>,
            document.body
          )
        : null}
    </>
  );
}

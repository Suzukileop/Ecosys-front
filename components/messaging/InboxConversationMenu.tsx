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
import { X_MENU_ITEM, X_MENU_ITEM_DANGER, X_MENU_PANEL } from '@/components/messaging/messaging-x';
import { useT } from '@/lib/i18n/I18nProvider';

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
  const t = useT();
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
          `/messages?conversation=${encodeURIComponent(conversationId)}`
        )
      : null;

  const items: MenuItem[] = [
    {
      id: 'unread',
      label: t('Mark as unread'),
      icon: faEnvelope,
      onClick: onMarkUnread,
    },
    ...(profileHref
      ? [
          {
            id: 'profile',
            label: t('View profile'),
            icon: faCircleUser,
            href: profileHref,
          } satisfies MenuItem,
        ]
      : []),
    {
      id: archived ? 'unarchive' : 'archive',
      label: archived ? t('Unarchive conversation') : t('Archive conversation'),
      icon: faBoxArchive,
      onClick: archived ? onUnarchive : onArchive,
    },
    {
      id: 'delete',
      label: t('Delete conversation'),
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
        aria-label={t('Conversation options')}
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          setOpen((value) => !value);
        }}
        /* 40px touch target (always shown on touch screens, on hover / focus elsewhere). */
        className={`inline-flex h-10 w-10 items-center justify-center rounded-full text-[var(--msg-ink-faint)] transition-[color,opacity,background-color] duration-200 hover:bg-[var(--msg-wash)] hover:text-[var(--msg-ink)] focus-visible:opacity-100 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[var(--msg-ink)] disabled:opacity-40 ${
          open ? 'bg-[var(--msg-wash)] text-[var(--msg-ink)] opacity-100' : 'opacity-0 group-hover/row:opacity-100 [@media(hover:none)]:opacity-100'
        }`}
      >
        <FontAwesomeIcon icon={faEllipsis} className="h-4 w-4" />
      </button>

      {mounted && open && coords
        ? createPortal(
            <div
              ref={menuRef}
              id={menuId}
              role="menu"
              aria-label={t('Conversation options')}
              /*
               * `msg-mineral` is repeated here because this menu is portalled to <body> and so
               * escapes the scope the rest of the section lives in. Without it the charter's
               * custom properties resolve to nothing out here and the card renders unpainted.
               */
              className="msg-mineral fixed z-[230]"
              style={{ top: coords.top, left: coords.left, minWidth: MENU_MIN_WIDTH }}
            >
              <div className={X_MENU_PANEL}>
                {items.map((item) => {

                  const className = item.tone === 'danger' ? X_MENU_ITEM_DANGER : X_MENU_ITEM;

                  const content = (
                    <>
                      <FontAwesomeIcon
                        icon={item.icon}
                        className="h-[18px] w-[18px] shrink-0"
                        fixedWidth
                      />
                      <span className="min-w-0 flex-1">{t(item.label)}</span>
                    </>
                  );

                  return (
                    <div key={item.id}>
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

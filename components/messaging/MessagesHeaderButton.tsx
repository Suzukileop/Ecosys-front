'use client';

import { localeTag } from '@/lib/i18n/active';
import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMessagingBadge } from '@/hooks/useMessagingBadge';
import { HeaderCountBadge } from '@/components/layout/HeaderCountBadge';
import { Avatar } from '@/components/ui/Avatar';
import { listConversations } from '@/lib/messaging';
import { parseInboxPreview } from '@/lib/messaging-preview';
import { SHOW_GROUP_CHAT } from '@/lib/messaging-feature-flags';
import type { ConversationSummary } from '@/types/messaging';
import { useT } from '@/lib/i18n/I18nProvider';

const POLL_MS = 20_000;
const MESSAGES_HREF = '/messages';
/** Conversations previewed in the navbar dropdown; the rest is one click away. */
const PREVIEW_COUNT = 6;

function sumUnread(conversations: { unreadCount?: number }[]): number {
  return conversations.reduce((sum, c) => sum + (c.unreadCount ?? 0), 0);
}

function byRecent(a: ConversationSummary, b: ConversationSummary) {
  const aTime = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
  const bTime = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
  return bTime - aTime;
}

function formatShortTime(iso: string | null | undefined): string {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  const diffDays = Math.floor((Date.now() - date.getTime()) / 86_400_000);
  if (diffDays === 0) return date.toLocaleTimeString(localeTag(), { hour: 'numeric', minute: '2-digit' });
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return date.toLocaleDateString(localeTag(), { weekday: 'short' });
  return date.toLocaleDateString(localeTag(), { month: 'short', day: 'numeric' });
}

/** The bar's chat glyph — the same 24-unit box and 1.5 stroke as the magnifier and the bell. */
function ChatGlyph({ className, strokeWidth = 1.5 }: { className: string; strokeWidth?: number }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M20.5 11.6c0 4.2-3.8 7.6-8.5 7.6a9.6 9.6 0 0 1-3.6-.7L3.5 20l1.4-3.6a7.1 7.1 0 0 1-1.4-4.8C3.5 7.4 7.3 4 12 4s8.5 3.4 8.5 7.6Z" />
      <path d="M8.6 11.7h.01M12 11.7h.01M15.4 11.7h.01" />
    </svg>
  );
}

const INK = 'text-[#0F1419] dark:text-[#E7E9EA]';
const INK2 = 'text-[#536471] dark:text-[#71767B]';

export function MessagesHeaderButton({ floating = false }: { floating?: boolean } = {}) {
  const t = useT();
  const pathname = usePathname();
  const [unreadTotal, setUnreadTotal] = useState(0);
  const [recent, setRecent] = useState<ConversationSummary[] | null>(null);
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const unreadRef = useRef(0);
  const { badgeCount, dismissBadge, syncBaseline } = useMessagingBadge(unreadTotal);
  unreadRef.current = unreadTotal;
  const onMessagesPage = pathname.startsWith(MESSAGES_HREF);

  const load = useCallback(async () => {
    try {
      const conversations = await listConversations();
      const total = sumUnread(conversations);
      setUnreadTotal(total);
      syncBaseline(total);
      /* Kept for the dropdown: the same list the badge is summed from, so no extra request. */
      setRecent(
        conversations
          .filter(
            (c) => !c.guestSession && !c.temporarySession && (SHOW_GROUP_CHAT || c.type !== 'GROUP')
          )
          .sort(byRecent)
          .slice(0, PREVIEW_COUNT)
      );
    } catch {
      /* ignore — keep last known count */
    }
  }, [syncBaseline]);

  useEffect(() => {
    void load();
    const id = window.setInterval(() => void load(), POLL_MS);
    return () => window.clearInterval(id);
  }, [load]);

  useEffect(() => {
    if (!onMessagesPage) return;
    dismissBadge(unreadRef.current);
  }, [onMessagesPage, dismissBadge, unreadTotal]);

  /* Dropdown: outside click / Escape close it; a route change (a row was followed) closes it too. */
  useEffect(() => {
    if (!open) return;
    dismissBadge(unreadRef.current);
    const onPointerDown = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) setOpen(false);
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
  }, [open, dismissBadge]);

  if (floating) {
    if (onMessagesPage) return null;
    return (
      <Link
        href={MESSAGES_HREF}
        title={t('Messages')}
        aria-label={`Messages${badgeCount > 0 ? `, ${badgeCount} new` : ''}`}
        onClick={() => dismissBadge(unreadRef.current)}
        className="fixed bottom-[calc(1.25rem+env(safe-area-inset-bottom))] right-5 z-[60] inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#0F1419] text-white shadow-[0_10px_30px_-8px_rgba(0,0,0,0.45)] transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F1419] focus-visible:ring-offset-2 dark:bg-[#EFF3F4] dark:text-[#0F1419] dark:focus-visible:ring-[#EFF3F4] lg:hidden"
      >
        <ChatGlyph className="h-6 w-6" strokeWidth={1.6} />
        {badgeCount > 0 ? (
          <span className="absolute -right-0.5 -top-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[#FF5722] px-1.5 text-[11px] font-semibold tabular-nums leading-none text-white ring-2 ring-white dark:ring-black">
            {badgeCount > 99 ? '99+' : badgeCount}
          </span>
        ) : null}
      </Link>
    );
  }

  /* No filled plate at rest or on hover: this sits in a row of bare 36px controls, and a
     background here made it the only one of the four that looked pressed. */
  const iconClass = `relative inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-[color,transform] duration-[420ms] ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-105 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-400 ${
    onMessagesPage || open ? 'text-neutral-950 dark:text-white' : 'text-[#222222] dark:text-neutral-300'
  }`;

  /* On /messages the inbox is the page itself: the icon stays a plain link there. */
  if (onMessagesPage) {
    return (
      <Link
        href={MESSAGES_HREF}
        title={t('Messages')}
        aria-label={`Messages${badgeCount > 0 ? `, ${badgeCount} new` : ''}`}
        aria-current="page"
        onClick={() => dismissBadge(unreadRef.current)}
        className={iconClass}
      >
        <ChatGlyph className="h-[1.6rem] w-[1.6rem]" />
        <HeaderCountBadge count={badgeCount} />
      </Link>
    );
  }

  const conversations = recent ?? [];

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        title={t('Messages')}
        aria-label={`Messages${badgeCount > 0 ? `, ${badgeCount} new` : ''}`}
        aria-expanded={open}
        aria-haspopup="dialog"
        className={iconClass}
      >
        <ChatGlyph className="h-[1.6rem] w-[1.6rem]" />
        <HeaderCountBadge count={badgeCount} />
      </button>

      {open ? (
        /*
         * The bell's X dropdown, for messages: white / black sheet, soft shadow (dark: a #2F3336
         * edge), 16px corners. A bold 20px title with "See all"; the six latest conversations as
         * 64px rows (portrait, bold name, one-line preview, time, the ink unread pill); "Open
         * Messages" at the foot. Lives in the navbar, outside every token scope — literal colours.
         */
        <div
          className="news-mono absolute right-0 z-50 mt-3 w-[24rem] overflow-hidden rounded-2xl bg-white shadow-[0_0_0_1px_rgba(15,20,25,0.04),0_12px_40px_-8px_rgba(15,20,25,0.25)] dark:bg-black dark:shadow-[0_0_0_1px_#2F3336,0_12px_40px_-8px_rgba(0,0,0,0.7)]"
          style={{ animation: 'pf-float-in 220ms cubic-bezier(0.16, 1, 0.3, 1)' }}
          role="dialog"
          aria-label={t('Recent messages')}
        >
          <div className="flex min-h-14 items-center justify-between gap-4 px-5 pt-2">
            <span className={`text-[20px] font-extrabold leading-6 tracking-[-0.01em] ${INK}`}>{t('Messages')}</span>
            <Link
              href={MESSAGES_HREF}
              onClick={() => setOpen(false)}
              data-pf-no-color-transition
              className={`-mr-3 inline-flex min-h-9 items-center rounded-full px-3 text-[13px] font-semibold transition-colors hover:bg-[rgba(15,20,25,0.06)] hover:text-[#0F1419] dark:hover:bg-[rgba(231,233,234,0.1)] dark:hover:text-[#E7E9EA] ${INK2}`}
            >
              {t('See all')}
            </Link>
          </div>

          <div className="max-h-[min(26rem,65dvh)] overflow-y-auto overscroll-contain pb-1 [scrollbar-width:thin]">
            {recent === null ? (
              <ul aria-busy="true" aria-label={t('Loading conversations')}>
                {Array.from({ length: 3 }).map((_, index) => (
                  <li key={index} className="flex items-center gap-3 px-5 py-3">
                    <span className="h-10 w-10 shrink-0 animate-pulse rounded-full bg-[#EFF3F4] dark:bg-[#202327]" />
                    <span className="flex-1 space-y-2">
                      <span className="block h-3 w-2/5 animate-pulse rounded-full bg-[#EFF3F4] dark:bg-[#202327]" />
                      <span className="block h-3 w-4/5 animate-pulse rounded-full bg-[#EFF3F4] dark:bg-[#202327]" />
                    </span>
                  </li>
                ))}
              </ul>
            ) : conversations.length === 0 ? (
              <p className={`px-5 py-10 text-center text-[15px] leading-5 ${INK2}`}>
                {t('No conversations yet. Message a provider from their profile.')}
              </p>
            ) : (
              <ul aria-label={t('Recent conversations')}>
                {conversations.map((conversation) => {
                  const unread = (conversation.unreadCount ?? 0) > 0;
                  const name =
                    conversation.type === 'GROUP'
                      ? conversation.title ?? conversation.otherUserName ?? 'Group'
                      : conversation.otherUserName;
                  const preview = conversation.lastMessagePreview?.trim()
                    ? parseInboxPreview(conversation.lastMessagePreview.trim()).label
                    : 'No messages yet';
                  return (
                    <li key={conversation.id}>
                      <Link
                        href={`${MESSAGES_HREF}?conversation=${encodeURIComponent(conversation.id)}`}
                        onClick={() => setOpen(false)}
                        data-pf-no-color-transition
                        className="flex min-h-16 items-center gap-3 px-5 py-2.5 transition-colors hover:bg-[#F7F9F9] focus-visible:bg-[#EFF3F4] focus-visible:outline-none dark:hover:bg-[#16181C] dark:focus-visible:bg-[#202327]"
                      >
                        <Avatar
                          avatarUrl={
                            conversation.type === 'GROUP'
                              ? conversation.coverUrl ?? conversation.otherUserAvatarUrl
                              : conversation.otherUserAvatarUrl
                          }
                          name={name}
                          size="md"
                          tone="muted"
                        />
                        <span className="min-w-0 flex-1">
                          <span className="flex items-baseline justify-between gap-3">
                            <span className={`truncate text-[15px] font-bold leading-5 ${INK}`}>{name}</span>
                            <span
                              className={`shrink-0 text-[13px] tabular-nums ${unread ? `font-semibold ${INK}` : INK2}`}
                            >
                              {formatShortTime(conversation.lastMessageAt)}
                            </span>
                          </span>
                          <span className="mt-0.5 flex items-center justify-between gap-3">
                            <span className={`truncate text-[14px] leading-5 ${unread ? `font-semibold ${INK}` : INK2}`}>
                              {preview}
                            </span>
                            {unread ? (
                              <span className="inline-flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-[#0F1419] px-1.5 text-[12px] font-bold tabular-nums text-white dark:bg-[#EFF3F4] dark:text-[#0F1419]">
                                {(conversation.unreadCount ?? 0) > 99 ? '99+' : conversation.unreadCount}
                              </span>
                            ) : null}
                          </span>
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <Link
            href={MESSAGES_HREF}
            onClick={() => setOpen(false)}
            data-pf-no-color-transition
            className={`flex min-h-12 items-center justify-center gap-1.5 px-5 text-[14px] font-semibold transition-colors hover:bg-[rgba(15,20,25,0.06)] dark:hover:bg-[rgba(231,233,234,0.1)] ${INK}`}
          >
            {t('Open Messages')}
          </Link>
        </div>
      ) : null}
    </div>
  );
}

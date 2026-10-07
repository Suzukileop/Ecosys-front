'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMessagingBadge } from '@/hooks/useMessagingBadge';
import { HeaderCountBadge } from '@/components/layout/HeaderCountBadge';
import { listConversations } from '@/lib/messaging';

const POLL_MS = 20_000;
const MESSAGES_HREF = '/messages';

function sumUnread(conversations: { unreadCount?: number }[]): number {
  return conversations.reduce((sum, c) => sum + (c.unreadCount ?? 0), 0);
}

export function MessagesHeaderButton({ floating = false }: { floating?: boolean } = {}) {
  const pathname = usePathname();
  const [unreadTotal, setUnreadTotal] = useState(0);
  const unreadRef = useRef(0);
  const { badgeCount, dismissBadge } = useMessagingBadge(unreadTotal);
  unreadRef.current = unreadTotal;
  const onMessagesPage = pathname.startsWith(MESSAGES_HREF);

  const load = useCallback(async () => {
    try {
      const conversations = await listConversations();
      setUnreadTotal(sumUnread(conversations));
    } catch {
      /* ignore — keep last known count */
    }
  }, []);

  useEffect(() => {
    void load();
    const id = window.setInterval(() => void load(), POLL_MS);
    return () => window.clearInterval(id);
  }, [load]);

  useEffect(() => {
    if (!onMessagesPage) return;
    dismissBadge(unreadRef.current);
  }, [onMessagesPage, dismissBadge, unreadTotal]);

  if (floating) {
    if (onMessagesPage) return null;
    return (
      <Link
        href={MESSAGES_HREF}
        title="Messages"
        aria-label={`Messages${badgeCount > 0 ? `, ${badgeCount} new` : ''}`}
        onClick={() => dismissBadge(unreadRef.current)}
        className="fixed bottom-[calc(1.25rem+env(safe-area-inset-bottom))] right-5 z-[60] inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#111111] text-white shadow-[0_10px_30px_-8px_rgba(0,0,0,0.45)] transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5722]/50 focus-visible:ring-offset-2 dark:bg-white dark:text-[#111111] lg:hidden"
      >
        <svg
          className="h-6 w-6"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.6}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M20.5 11.6c0 4.2-3.8 7.6-8.5 7.6a9.6 9.6 0 0 1-3.6-.7L3.5 20l1.4-3.6a7.1 7.1 0 0 1-1.4-4.8C3.5 7.4 7.3 4 12 4s8.5 3.4 8.5 7.6Z" />
          <path d="M8.6 11.7h.01M12 11.7h.01M15.4 11.7h.01" />
        </svg>
        {badgeCount > 0 ? (
          <span className="absolute -right-0.5 -top-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[#FF5722] px-1.5 text-[11px] font-semibold tabular-nums leading-none text-white ring-2 ring-white dark:ring-[#0A0A0A]">
            {badgeCount > 99 ? '99+' : badgeCount}
          </span>
        ) : null}
      </Link>
    );
  }

  return (
    <Link
      href={MESSAGES_HREF}
      title="Messages"
      aria-label={`Messages${badgeCount > 0 ? `, ${badgeCount} new` : ''}`}
      aria-current={onMessagesPage ? 'page' : undefined}
      onClick={() => dismissBadge(unreadRef.current)}
      /* No filled plate at rest or on hover: this sits in a row of bare 36px controls, and a
         background here made it the only one of the four that looked pressed. */
      className={`relative inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-[color,transform] duration-[420ms] ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-105 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-400 ${
        onMessagesPage
          ? 'text-neutral-950 dark:text-white'
          : 'text-[#222222] dark:text-neutral-300'
      }`}
    >
      {/* Same 24-unit box and `stroke-width: 1.5` as the bar's magnifier and bell. The three sit
          side by side; a different weight on any one of them reads as a fault. */}
      <svg
        className="h-[1.6rem] w-[1.6rem]"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M20.5 11.6c0 4.2-3.8 7.6-8.5 7.6a9.6 9.6 0 0 1-3.6-.7L3.5 20l1.4-3.6a7.1 7.1 0 0 1-1.4-4.8C3.5 7.4 7.3 4 12 4s8.5 3.4 8.5 7.6Z" />
        <path d="M8.6 11.7h.01M12 11.7h.01M15.4 11.7h.01" />
      </svg>
      <HeaderCountBadge count={badgeCount} />
    </Link>
  );
}

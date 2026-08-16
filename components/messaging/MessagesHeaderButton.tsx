'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMessagingBadge } from '@/hooks/useMessagingBadge';
import { listConversations } from '@/lib/messaging';

const POLL_MS = 20_000;
const MESSAGES_HREF = '/dashboard/discussions';

function sumUnread(conversations: { unreadCount?: number }[]): number {
  return conversations.reduce((sum, c) => sum + (c.unreadCount ?? 0), 0);
}

export function MessagesHeaderButton() {
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

  return (
    <Link
      href={MESSAGES_HREF}
      title="Messages"
      aria-label={`Messages${badgeCount > 0 ? `, ${badgeCount} new` : ''}`}
      aria-current={onMessagesPage ? 'page' : undefined}
      onClick={() => dismissBadge(unreadRef.current)}
      className={`relative inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/40 ${
        onMessagesPage
          ? 'bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-white'
          : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-white'
      }`}
    >
      <svg
        className="h-[1.375rem] w-[1.375rem]"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
        aria-hidden
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
        />
      </svg>
      {badgeCount > 0 ? (
        <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">
          {badgeCount > 99 ? '99+' : badgeCount}
        </span>
      ) : null}
    </Link>
  );
}

'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMessagingBadge } from '@/hooks/useMessagingBadge';
import { ACCENT_ORANGE } from '@/components/landing/landingBrand';
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
      /* No filled plate at rest or on hover: this sits in a row of bare 36px controls, and a
         background here made it the only one of the four that looked pressed. */
      className={`relative inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-[color,transform] duration-[420ms] ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-105 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-400 ${
        onMessagesPage
          ? 'text-neutral-950 dark:text-white'
          : 'text-neutral-700 hover:text-neutral-950 dark:text-neutral-200 dark:hover:text-white'
      }`}
    >
      {/* Same 24-unit box and `stroke-width: 1.5` as the bar's magnifier and bell. The three sit
          side by side; a different weight on any one of them reads as a fault. */}
      <svg
        className="h-[1.3rem] w-[1.3rem]"
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
      {badgeCount > 0 ? (
        /*
         * A 5px signal, not a counted pill. The exact number was never actionable from the bar —
         * you open the panel to read it — and a filled red capsule is the loudest object in a
         * composition whose whole language is hairlines. The count still reaches assistive tech
         * through `aria-label`, so nothing is actually lost.
         */
        <span
          aria-hidden
          style={{ backgroundColor: ACCENT_ORANGE }}
          className="absolute right-2 top-1.5 block h-[5px] w-[5px] rounded-full"
        />
      ) : null}
    </Link>
  );
}

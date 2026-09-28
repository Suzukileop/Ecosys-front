'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ACCENT_ORANGE } from '@/components/landing/landingBrand';
import { useAuth } from '@/context/AuthContext';
import { getApiErrorMessage } from '@/lib/api-error';
import { dispatchAgentContentSync } from '@/lib/agent-content-sync';
import { useNotificationBadge } from '@/hooks/useNotificationBadge';
import {
  extractVisitorNameFromVisitMessage,
  fetchNotifications,
  fetchUnreadCount,
  filterNotifications,
  markAllNotificationsRead,
  markNotificationItemRead,
  resolveNotificationNavigation,
  visitorPublicProfileUnavailableMessage,
  type NotificationFilter,
} from '@/lib/notifications';
import { NotificationFilterTabs } from '@/components/notifications/NotificationFilterTabs';
import { NotificationGroupedList } from '@/components/notifications/NotificationGroupedList';
import { pushFlashFeedback } from '@/stores/flashFeedbackStore';
import { NotificationDto } from '@/types/ecosystem';

const POLL_MS = 15_000;

export function NotificationBell({ compact = false }: { compact?: boolean }) {
  const router = useRouter();
  const { hasRole } = useAuth();
  const isAgent = hasRole('ROLE_AGENT') || hasRole('ROLE_ADMIN');

  const [items, setItems] = useState<NotificationDto[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState<NotificationFilter>('all');
  const [error, setError] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const unreadRef = useRef(0);

  const { badgeCount, dismissBadge } = useNotificationBadge(unreadCount);
  unreadRef.current = unreadCount;

  const load = useCallback(async () => {
    try {
      setError(null);
      const [page, count] = await Promise.all([fetchNotifications(0, 30), fetchUnreadCount()]);
      setItems(page.content);
      setUnreadCount(count);
    } catch (e) {
      setError(getApiErrorMessage(e));
    }
  }, []);

  useEffect(() => {
    void load();
    const id = window.setInterval(() => void load(), POLL_MS);
    return () => window.clearInterval(id);
  }, [load]);

  useEffect(() => {
    if (!open) return;
    dismissBadge(unreadRef.current);
    const onDoc = (ev: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(ev.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open, dismissBadge]);

  const filteredItems = filterNotifications(items, filter);

  const handleToggle = () => {
    setOpen((v) => !v);
  };

  const handleNotificationClick = async (n: NotificationDto) => {
    try {
      const targetIds = n.aggregatedNotificationIds?.length
        ? n.aggregatedNotificationIds
        : [n.id];
      const unreadTargets = items.filter((item) => targetIds.includes(item.id) && !item.isRead);
      const idsToRead =
        unreadTargets.length > 0
          ? unreadTargets.map((item) => item.id)
          : !n.isRead
            ? targetIds.filter((id) => !id.startsWith('profile-visit-group:'))
            : [];

      if (idsToRead.length > 0) {
        const readIds = await markNotificationItemRead({
          ...n,
          aggregatedNotificationIds: idsToRead,
          isRead: false,
        });
        const readSet = new Set(readIds);
        setUnreadCount((c) => Math.max(0, c - readIds.length));
        setItems((prev) =>
          prev.map((item) => (readSet.has(item.id) ? { ...item, isRead: true } : item)),
        );
      }

      const { href, unavailableVisitor } = resolveNotificationNavigation(n, isAgent);
      setOpen(false);

      if (unavailableVisitor) {
        const fallback = visitorPublicProfileUnavailableMessage(
          n.actorFullName ?? extractVisitorNameFromVisitMessage(n.message),
        );
        pushFlashFeedback({
          variant: 'info',
          title: fallback.title,
          description: fallback.description,
          actionHref: '/dashboard/creator?tab=visitors',
          actionLabel: 'Open Visitors',
        });
        return;
      }

      if (href) {
        if (n.type === 'CONTENT_DELIVERED' && n.refId) {
          dispatchAgentContentSync(n.refId, n.refSecondaryId);
        }
        router.push(href);
      }
    } catch (e) {
      setError(getApiErrorMessage(e));
    }
  };

  const markAllRead = async () => {
    try {
      await markAllNotificationsRead();
      setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
      dismissBadge(0);
    } catch (e) {
      setError(getApiErrorMessage(e));
    }
  };

  const openAllPage = () => {
    dismissBadge(unreadRef.current);
    setOpen(false);
  };

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        onClick={handleToggle}
        /* `compact` is the bar's form: a bare 36px disc that brightens and lifts, with no plate at
           rest or on hover — it stands in a row of identical controls and a background would make
           it the only one that looked pressed. */
        className={`relative transition-[color,transform] duration-[420ms] ease-[cubic-bezier(0.16,1,0.3,1)] focus:outline-none focus-visible:ring-1 focus-visible:ring-neutral-400 ${
          compact
            ? 'flex h-9 w-9 items-center justify-center rounded-full hover:scale-105 text-[#222222] dark:text-neutral-300'
            : 'rounded-lg p-2 text-neutral-600 hover:bg-gray-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white'
        }`}
        aria-expanded={open}
        aria-haspopup="true"
        aria-label={`Notifications${badgeCount > 0 ? `, ${badgeCount} new` : ''}`}
      >
        {/* In the bar (`compact`): same 24-unit box and `stroke-width: 1.5` as the magnifier and
            the chat glyph beside it. */}
        <svg
          className={compact ? 'h-[1.6rem] w-[1.6rem]' : 'h-6 w-6'}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={compact ? 1.5 : 2}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M18.4 15.4a1.9 1.9 0 0 1-.55-1.33V10.9a5.9 5.9 0 0 0-4.1-5.6v-.4a1.75 1.75 0 1 0-3.5 0v.4a5.9 5.9 0 0 0-4.1 5.6v3.17c0 .5-.2.98-.55 1.33L4.5 16.7h15l-1.1-1.3Z" />
          <path d="M14.1 19.2a2.35 2.35 0 0 1-4.2 0" />
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
      </button>

      {open && (
        <div
          className="absolute right-0 z-50 mt-3 w-[26rem] max-w-[calc(100vw-2rem)] overflow-hidden rounded-lg border border-black/[0.06] bg-white shadow-[0_24px_60px_-24px_rgba(0,0,0,0.35)] dark:border-white/[0.08] dark:bg-[#111111]"
          style={{ animation: 'pf-float-in 220ms cubic-bezier(0.16, 1, 0.3, 1)' }}
          role="dialog"
          aria-label="Notification list"
        >
          <div className="px-5 pt-5">
            <div className="flex items-center justify-between gap-4">
              <span className="text-[17px] font-bold tracking-[-0.01em] text-[#111111] dark:text-white">
                Notifications
                {unreadCount > 0 ? (
                  <span className="text-[#FF5722]"> · {String(unreadCount).padStart(2, '0')}</span>
                ) : null}
              </span>
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={() => void markAllRead()}
                  className="text-[13.5px] font-medium text-neutral-500 transition-colors hover:text-[#FF5722] dark:text-neutral-400"
                >
                  Mark all as read
                </button>
              )}
            </div>
            <NotificationFilterTabs value={filter} onChange={setFilter} unreadCount={unreadCount} underline compact />
          </div>

          {error && <p className="px-5 pt-3 text-[13px] text-red-600">{error}</p>}

          <div className="max-h-[min(26rem,70vh)] overflow-y-auto [scrollbar-color:rgba(0,0,0,0.18)_transparent] [scrollbar-width:thin] dark:[scrollbar-color:rgba(255,255,255,0.16)_transparent]">
            <NotificationGroupedList
              items={filteredItems}
              isAgent={isAgent}
              onItemClick={(n) => void handleNotificationClick(n)}
              emptyMessage={filter === 'unread' ? 'You’re all caught up.' : 'No notifications yet.'}
              variant="panel"
            />
          </div>

          <Link
            href="/dashboard/notifications"
            className="flex items-center justify-center gap-1.5 border-t border-black/[0.06] px-5 py-3.5 text-[14px] font-medium text-neutral-600 transition-colors hover:text-[#FF5722] dark:border-white/[0.08] dark:text-neutral-300"
            onClick={openAllPage}
          >
            View all notifications <span aria-hidden>→</span>
          </Link>
        </div>
      )}
    </div>
  );
}

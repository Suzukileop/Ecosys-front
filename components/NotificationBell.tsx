'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { HeaderCountBadge } from '@/components/layout/HeaderCountBadge';
import { getApiErrorMessage } from '@/lib/api-error';
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
import { NotificationViewChips } from '@/components/notifications/NotificationFilterTabs';
import { NotificationGroupedList, NotificationListSkeleton } from '@/components/notifications/NotificationGroupedList';
import { pushFlashFeedback } from '@/stores/flashFeedbackStore';
import { NotificationDto } from '@/types/profile';
import '@/app/(app)/notifications/x-notifications.css';
import { useT } from '@/lib/i18n/I18nProvider';

const POLL_MS = 15_000;

/** The panel offers the two quick views; the type filters live on the full page. */
const PANEL_VIEWS: NotificationFilter[] = ['all', 'unread'];

export function NotificationBell({ compact = false }: { compact?: boolean }) {
  const t = useT();
  const router = useRouter();

  const [items, setItems] = useState<NotificationDto[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState<NotificationFilter>('all');
  const [error, setError] = useState<string | null>(null);
  /* False until the first fetch settles, so a quick open shows placeholders, not "No notifications". */
  const [loaded, setLoaded] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const unreadRef = useRef(0);

  const { badgeCount, dismissBadge, syncBaseline } = useNotificationBadge(unreadCount);
  unreadRef.current = unreadCount;

  const load = useCallback(async () => {
    try {
      setError(null);
      const [page, count] = await Promise.all([fetchNotifications(0, 30), fetchUnreadCount()]);
      setItems(page.content);
      setUnreadCount(count);
      syncBaseline(count);
    } catch (e) {
      setError(getApiErrorMessage(e));
    } finally {
      setLoaded(true);
    }
  }, [syncBaseline]);

  useEffect(() => {
    void load();
    /* No polling from a background tab (each poll is an authenticated round-trip); catch up as soon
       as the tab is visible again. */
    const id = window.setInterval(() => {
      if (document.visibilityState === 'visible') void load();
    }, POLL_MS);
    const onVisible = () => {
      if (document.visibilityState === 'visible') void load();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      window.clearInterval(id);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [load]);

  useEffect(() => {
    if (!open) return;
    dismissBadge(unreadRef.current);
    const onDoc = (ev: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(ev.target as Node)) {
        setOpen(false);
      }
    };
    /* Escape closes the panel and hands focus back to the bell. */
    const onKey = (ev: KeyboardEvent) => {
      if (ev.key !== 'Escape') return;
      setOpen(false);
      buttonRef.current?.focus();
    };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
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
        const remaining = Math.max(0, unreadRef.current - readIds.length);
        setUnreadCount(remaining);
        syncBaseline(remaining);
        setItems((prev) =>
          prev.map((item) => (readSet.has(item.id) ? { ...item, isRead: true } : item)),
        );
      }

      const { href, unavailableVisitor } = resolveNotificationNavigation(n);
      setOpen(false);

      if (unavailableVisitor) {
        const fallback = visitorPublicProfileUnavailableMessage(
          n.actorFullName ?? extractVisitorNameFromVisitMessage(n.message),
        );
        pushFlashFeedback({
          variant: 'info',
          title: fallback.title,
          description: fallback.description,
          actionHref: '/profile?tab=visitors',
          actionLabel: t('Open Visitors'),
        });
        return;
      }

      if (href) router.push(href);
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
        ref={buttonRef}
        type="button"
        onClick={handleToggle}
        /* `compact` is the bar's form: a bare 36px disc that brightens and lifts, with no plate at
           rest or on hover — it stands in a row of identical controls and a background would make
           it the only one that looked pressed. */
        className={`relative transition-[color,transform,translate,scale,rotate] duration-[420ms] ease-[cubic-bezier(0.16,1,0.3,1)] focus:outline-hidden focus-visible:ring-1 focus-visible:ring-neutral-400 ${
          compact
            ? 'flex h-9 w-9 items-center justify-center rounded-full hover:scale-105 text-[#222222] dark:text-neutral-300'
            : 'rounded-full p-2 text-[#536471] hover:bg-[rgba(15,20,25,0.06)] hover:text-[#0F1419] dark:text-[#8B98A5] dark:hover:bg-[rgba(231,233,234,0.1)] dark:hover:text-[#E7E9EA]'
        }`}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label={`Notifications${badgeCount > 0 ? `, ${badgeCount} new` : ''}`}
      >
        {/* In the bar (`compact`): same 24-unit box and `stroke-width: 1.5` as the magnifier and
            the chat glyph beside it. While the panel is open the bell is drawn a step heavier —
            the "selected" weight of News's rail glyphs. */}
        <svg
          className={compact ? 'h-[1.6rem] w-[1.6rem]' : 'h-6 w-6'}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={compact ? (open ? 2 : 1.5) : 2}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M18.4 15.4a1.9 1.9 0 0 1-.55-1.33V10.9a5.9 5.9 0 0 0-4.1-5.6v-.4a1.75 1.75 0 1 0-3.5 0v.4a5.9 5.9 0 0 0-4.1 5.6v3.17c0 .5-.2.98-.55 1.33L4.5 16.7h15l-1.1-1.3Z" />
          <path d="M14.1 19.2a2.35 2.35 0 0 1-4.2 0" />
        </svg>
        <HeaderCountBadge count={badgeCount} />
      </button>

      {open && (
        /* The panel, in News's skin: it carries the News token scope itself (it lives in the navbar,
           outside any page scope) and `x-notifications--panel`, which sets rows straight on the sheet.
           A white / black sheet, 16px corners and the 1px #E1E8ED edge of the navbar's other menus
           (dark: #2F3336). Title row, the All / Unread chips, the day-grouped list, then the way to
           the full page on the card tone — separated by tone, not by lines.
           Phones (the bell is only in the bar from lg, but HeaderAuth shows it everywhere): pinned
           under the header across the screen instead of hanging off the bell. */
        <div
          className="x-notifications x-notifications--panel news-theme news-feed news-mono fixed inset-x-2 top-[3.75rem] z-50 flex max-h-[calc(100dvh-4.5rem)] flex-col overflow-hidden rounded-2xl bg-white shadow-[0_0_0_1px_#E1E8ED,0_16px_40px_-16px_rgba(15,20,25,0.28)] dark:bg-black dark:shadow-[0_0_0_1px_#2F3336,0_16px_40px_-16px_rgba(0,0,0,0.8)] sm:absolute sm:inset-x-auto sm:right-0 sm:top-auto sm:mt-3 sm:max-h-none sm:w-[26rem]"
          style={{ animation: 'pf-float-in 220ms cubic-bezier(0.16, 1, 0.3, 1)' }}
          role="dialog"
          aria-label={t('Notifications')}
        >
          <div className="shrink-0 px-5 pb-1 pt-4">
            <div className="flex min-h-10 items-center justify-between gap-3">
              <span className="text-[20px] font-extrabold leading-6 tracking-[-0.01em] text-[color:var(--gn-ink)]">
                {t('Notifications')}
              </span>
              <div className="-mr-2 flex items-center gap-0.5">
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={() => void markAllRead()}
                    data-pf-no-color-transition
                    className="inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-[13px] font-semibold text-[color:var(--gn-ink)] transition-colors hover:bg-[color:var(--gn-hover-strong,var(--gn-hover))] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[color:var(--gn-ring)]"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <path d="m5 12.5 4.5 4.5L19 7.5" />
                    </svg>
                    {t('Mark all as read')}
                  </button>
                )}
              </div>
            </div>
            <NotificationViewChips
              views={PANEL_VIEWS}
              value={filter}
              onChange={(view) => setFilter(view === 'unread' ? 'unread' : 'all')}
              unreadCount={unreadCount}
              className="pb-1 pt-3"
            />
          </div>

          {error && (
            <p role="alert" className="shrink-0 px-5 pt-2 text-[13px] leading-[18px] text-[#B91C1C] dark:text-[#F4212E]">
              {error}
            </p>
          )}

          <div className="xn-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain sm:max-h-[min(28rem,65dvh)] sm:flex-none">
            {!loaded ? (
              <NotificationListSkeleton variant="panel" rows={4} />
            ) : (
              <NotificationGroupedList
                items={filteredItems}
                onItemClick={(n) => void handleNotificationClick(n)}
                empty={
                  filter === 'unread'
                    ? { title: t('You’re all caught up'), description: t('Nothing unread right now.') }
                    : { title: t('No notifications yet'), description: t('Followers, visits and new work from people you follow show up here.') }
                }
                variant="panel"
              />
            )}
          </div>

          <Link
            href="/notifications"
            data-pf-no-color-transition
            className="group flex min-h-12 shrink-0 items-center justify-center gap-1.5 bg-[color:var(--gn-surface)] px-5 text-[14px] font-semibold text-[color:var(--gn-ink)] transition-colors hover:bg-[color:var(--gn-hover-strong,var(--gn-hover))] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[color:var(--gn-ring)]"
            onClick={openAllPage}
          >
            {t('View all notifications')}
            <svg viewBox="0 0 24 24" className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="m9 6 6 6-6 6" />
            </svg>
          </Link>
        </div>
      )}
    </div>
  );
}

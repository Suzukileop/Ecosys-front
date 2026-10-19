'use client';

import { tr } from '@/lib/i18n/active';
import { msg } from '@/lib/i18n/config';
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getApiErrorMessage } from '@/lib/api-error';
import { useAuth } from '@/context/AuthContext';
import {
  dismissNotificationBadge,
  extractVisitorNameFromVisitMessage,
  fetchNotifications,
  fetchUnreadCount,
  markAllNotificationsRead,
  markNotificationItemRead,
  resolveNotificationNavigation,
  visitorPublicProfileUnavailableMessage,
} from '@/lib/notifications';
import { NotificationViewChips, NotificationViewRailBox } from '@/components/notifications/NotificationFilterTabs';
import {
  NotificationGroupedList,
  NotificationListSkeleton,
  type NotificationEmptyState,
} from '@/components/notifications/NotificationGroupedList';
import {
  VIEW_LABELS,
  availableViews,
  filterByView,
  type NotificationView,
} from '@/components/notifications/notificationViews';
import { ProfileSectionStickyAside } from '@/components/creator/studio/ProfileSectionStickyAside';
import { DashboardHomeShell } from '@/components/DashboardHomeShell';
import { BackToTopButton } from '@/components/ui/BackToTopButton';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { pushFlashFeedback } from '@/stores/flashFeedbackStore';
import { NotificationDto } from '@/types/profile';
import { SIGNED_IN_HOME } from '@/lib/routes';
import '@/app/(app)/notifications/x-notifications.css';
import { useT } from '@/lib/i18n/I18nProvider';

/** How many notifications the page loads (the API's most recent first). */
const PAGE_SIZE = 50;

/** Notification preferences live in Settings → Notifications. */
const SETTINGS_HREF = '/settings?section=notifications';

const ICON_BUTTON =
  'inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[color:var(--gn-ink)] transition-colors hover:bg-[color:var(--gn-hover-strong,var(--gn-hover))] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[color:var(--gn-ring)]';

/** Secondary action: an outlined pill (1px #CFD9DE / #536471), the fill tone on hover. */
const OUTLINED_PILL =
  'inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full px-4 text-[14px] font-semibold leading-5 text-[color:var(--gn-ink)] shadow-[inset_0_0_0_1px_#CFD9DE] transition-colors hover:bg-[color:var(--gn-hover-strong,var(--gn-hover))] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[color:var(--gn-ring)] dark:shadow-[inset_0_0_0_1px_#536471]';

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="m5 12.5 4.5 4.5L19 7.5" />
    </svg>
  );
}

function GearIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

/** Empty list copy, per view. */
function emptyStateFor(view: NotificationView, showAll: () => void): NotificationEmptyState {
  if (view === 'all') {
    return {
      title: msg('No notifications yet'),
      description: msg('New followers, profile visits and new work from people you follow show up here.'),
    };
  }
  if (view === 'unread') {
    return {
      title: msg('You’re all caught up'),
      description: msg('Nothing unread. New activity will appear here first.'),
      action: { label: msg('Show all notifications'), onClick: showAll },
    };
  }
  return {
    title: tr('No {label} yet', { label: tr(VIEW_LABELS[view].filtered).toLowerCase() }),
    action: { label: msg('Show all notifications'), onClick: showAll },
  };
}

export function NotificationsPageClient() {
  const t = useT();
  const router = useRouter();
  const { user } = useAuth();
  const userId = user?.id ?? null;

  const [items, setItems] = useState<NotificationDto[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [view, setView] = useState<NotificationView>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (clearBadge = false) => {
    try {
      setLoading(true);
      setError(null);
      const [page, count] = await Promise.all([fetchNotifications(0, PAGE_SIZE), fetchUnreadCount()]);
      setItems(page.content);
      setUnreadCount(count);
      if (clearBadge) {
        dismissNotificationBadge(count, userId);
      }
    } catch (e) {
      setError(getApiErrorMessage(e, t('Unable to load notifications.')));
    } finally {
      setLoading(false);
    }
  }, [userId, t]);

  useEffect(() => {
    void load(true);
  }, [load]);

  const filteredItems = filterByView(items, view);
  const views = availableViews(items, view);

  const openNotification = async (n: NotificationDto) => {
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

      const { href, unavailableVisitor } = resolveNotificationNavigation(n);
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

  const goBack = () => {
    if (window.history.length > 1) {
      router.back();
      return;
    }
    router.push(SIGNED_IN_HOME);
  };

  const markAll = async () => {
    try {
      await markAllNotificationsRead();
      setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
      dismissNotificationBadge(0, userId);
    } catch (e) {
      setError(getApiErrorMessage(e));
    }
  };

  const showAll = () => setView('all');

  /*
   * Layout — News's frame (HomeNewsFeed / CreatorsCatalog): the navbar's 32 / 48 / 64px gutters and
   * 1240px cap; below lg the list alone (600px), from lg the list filling its area from the
   * wordmark's edge (no centred 680px measure, as on Providers) plus a sticky 340px rail (400px from
   * xl) holding the filters as an outlined box and "Mark all as read" as the ink pill.
   * Phones: the title row (back, title, settings, an outlined "Mark all read"), the filters as chips,
   * then one square card per day, edge to edge, 20px text gutters.
   *
   * The dashboard shell adds no padding here (like /feed, see DashboardShell): the page sits on the
   * same frame as News on its own.
   */
  return (
    <DashboardHomeShell fullWidth>
      <div className="x-notifications news-theme news-feed news-mono pb-24 pt-3 sm:px-8 sm:pt-5 md:px-12 lg:px-16 lg:pt-8">
        <div className="mx-auto grid w-full max-w-[600px] items-start gap-8 lg:max-w-[1240px] lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-10 xl:grid-cols-[minmax(0,1fr)_400px] xl:gap-12">
          <div className="min-w-0">
            <div className="flex w-full min-w-0 flex-col gap-3">
              <header className="flex min-h-12 items-center justify-between gap-2 px-5 sm:px-1">
                <div className="flex min-w-0 items-center gap-1">
                  <button
                    type="button"
                    onClick={goBack}
                    aria-label={t('Go back')}
                    title={t('Go back')}
                    data-pf-no-color-transition
                    className={`-ml-2.5 ${ICON_BUTTON}`}
                  >
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <path d="M19 12H5" />
                      <path d="m11 6-6 6 6 6" />
                    </svg>
                  </button>
                  <h1 className="truncate text-[22px] font-extrabold leading-7 tracking-[-0.015em] text-[color:var(--gn-ink)] sm:text-[24px]">
                    {t('Notifications')}
                  </h1>
                </div>
                <div className="-mr-1 flex shrink-0 items-center gap-1 lg:mr-0">
                  {unreadCount > 0 ? (
                    <button
                      type="button"
                      onClick={() => void markAll()}
                      aria-label={t('Mark all as read')}
                      title={t('Mark all as read')}
                      data-pf-no-color-transition
                      className={`${OUTLINED_PILL} max-[359px]:w-10 max-[359px]:justify-center max-[359px]:px-0 lg:hidden`}
                    >
                      <CheckIcon className="h-4 w-4" />
                      {/* Room for the title first: "Read all" on phones, the full label from sm. */}
                      <span className="hidden min-[360px]:inline sm:hidden">{t('Read all')}</span>
                      <span className="hidden sm:inline">{t('Mark all as read')}</span>
                    </button>
                  ) : null}
                  <Link
                    href={SETTINGS_HREF}
                    aria-label={t('Notification settings')}
                    title={t('Notification settings')}
                    className={`-mr-1.5 ${ICON_BUTTON}`}
                  >
                    <GearIcon className="h-5 w-5" />
                  </Link>
                </div>
              </header>

              {/* Below lg (no rail): the filters as News's interest chips. */}
              <NotificationViewChips
                views={views}
                value={view}
                onChange={setView}
                unreadCount={unreadCount}
                className="scroll-px-5 px-5 sm:px-0 lg:hidden"
              />

              {/* While a filter narrows the list: News's plain sentence-case breadcrumb. */}
              {view !== 'all' ? (
                <p className="flex min-h-8 min-w-0 items-center gap-1.5 px-5 text-[14px] leading-5 text-[color:var(--gn-ink2)] sm:px-1">
                  <span className="shrink-0">{t('Filtered by:')}</span>
                  <span className="truncate font-semibold text-[color:var(--gn-ink)]">{t(VIEW_LABELS[view].filtered)}</span>
                  <span aria-hidden className="shrink-0 text-[color:var(--gn-ink3)]">·</span>
                  <button
                    type="button"
                    onClick={showAll}
                    className="inline-flex min-h-8 shrink-0 items-center font-medium text-[color:var(--gn-ink)] underline-offset-4 hover:underline focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[color:var(--gn-ring)]"
                  >
                    {t('Clear')}
                  </button>
                </p>
              ) : null}

              {error ? (
                <div className="px-5 sm:px-0">
                  <ErrorAlert message={error} onDismiss={() => setError(null)} />
                </div>
              ) : null}

              <div className="pt-3 lg:pt-1">
                {loading ? (
                  <NotificationListSkeleton />
                ) : (
                  <>
                    <NotificationGroupedList
                      items={filteredItems}
                      onItemClick={(n) => void openNotification(n)}
                      empty={emptyStateFor(view, showAll)}
                      variant="page"
                    />
                    {filteredItems.length > 0 ? (
                      <p className="gn-kicker pt-10 text-center">
                        {items.length >= PAGE_SIZE ? `Your ${PAGE_SIZE} most recent` : t('That’s everything')}
                      </p>
                    ) : null}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* The rail (from lg), sticky under the navbar like News's: the filters box, then the
              page's one action as the full-width ink pill — or a quiet "all caught up" line. */}
          <div className="hidden self-start lg:block">
            <ProfileSectionStickyAside className="w-full" surfaceClassName="flex w-full max-w-full min-w-0 flex-col gap-6">
              <NotificationViewRailBox views={views} value={view} onChange={setView} unreadCount={unreadCount} />
              {unreadCount > 0 ? (
                <button
                  type="button"
                  onClick={() => void markAll()}
                  className="gn-primary inline-flex h-12 w-full items-center justify-center gap-2 !rounded-full bg-[color:var(--gn-primary)] text-[15px] font-semibold leading-5 text-[color:var(--gn-primary-ink)] transition-colors hover:bg-[color:var(--gn-primary-hover)] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[color:var(--gn-ring)]"
                >
                  <CheckIcon className="h-[18px] w-[18px]" />
                  {t('Mark all as read')}
                </button>
              ) : !loading ? (
                <p className="gn-kicker flex items-center justify-center gap-2.5">
                  <span aria-hidden className="h-1.5 w-1.5 shrink-0 bg-[color:var(--gn-ink)]" />
                  {t('You’re all caught up')}
                </p>
              ) : null}
            </ProfileSectionStickyAside>
          </div>
        </div>
      </div>
      <BackToTopButton />
    </DashboardHomeShell>
  );
}

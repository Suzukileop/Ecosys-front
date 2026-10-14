'use client';

import { RailGlyph } from '@/components/home/NewsDiscoverRail';
import { VIEW_GLYPHS, VIEW_LABELS, type NotificationView } from '@/components/notifications/notificationViews';
import { useT } from '@/lib/i18n/I18nProvider';

/*
 * The notification filters, in News's two forms (NewsDiscoverRail / ProviderDiscoverRail):
 *  - phones, tablets and the bell's panel: a swipeable row of 36px chips — idle chips on the card
 *    tone, the selected one solid ink, no outline;
 *  - the page's rail from lg: an outlined `.gn-rail-box`, a bold 20px title over 48px rows, the 20px
 *    stroke glyphs, the fill tone only under the pointer, the selected row bold with a check.
 * The unread total rides on "Unread" in both, as a plain number — no orange pill inside the page.
 * Both read the News tokens, so they must sit inside a `news-theme news-feed news-mono` scope.
 */

export function NotificationViewChips({
  views,
  value,
  onChange,
  unreadCount = 0,
  className = '',
}: {
  views: NotificationView[];
  value: NotificationView;
  onChange: (view: NotificationView) => void;
  unreadCount?: number;
  className?: string;
}) {
  const t = useT();
  return (
    <nav
      aria-label={t('Filter notifications')}
      className={`flex gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${className}`}
    >
      {views.map((view) => {
        const active = value === view;
        const count = view === 'unread' && unreadCount > 0 ? unreadCount : null;
        return (
          <button
            key={view}
            type="button"
            aria-pressed={active}
            /* A second tap on a selected filter goes back to everything, like News's interests. */
            onClick={() => onChange(active && view !== 'all' ? 'all' : view)}
            data-pf-no-color-transition
            className={`inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full px-4 text-[14px] font-semibold leading-5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--gn-ring)] ${
              active
                ? 'bg-[color:var(--gn-ink)] text-[color:var(--gn-surface)]'
                : 'bg-[color:var(--gn-surface)] text-[color:var(--gn-ink)] hover:bg-[color:var(--gn-hover-strong,var(--gn-hover))] active:bg-[color:var(--gn-hover-strong,var(--gn-hover))]'
            }`}
          >
            {t(VIEW_LABELS[view].chip)}
            {count != null ? (
              <span className={`tabular-nums ${active ? '' : 'text-[color:var(--gn-ink2)]'}`}>
                {count > 99 ? '99+' : count}
              </span>
            ) : null}
          </button>
        );
      })}
    </nav>
  );
}

function CheckMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px] shrink-0" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="m5 12.5 4.5 4.5L19 7.5" />
    </svg>
  );
}

export function NotificationViewRailBox({
  views,
  value,
  onChange,
  unreadCount = 0,
}: {
  views: NotificationView[];
  value: NotificationView;
  onChange: (view: NotificationView) => void;
  unreadCount?: number;
}) {
  const t = useT();
  return (
    <section className="gn-rail-box flex min-h-0 flex-col px-px pb-2 pt-5" aria-labelledby="notifications-show-title">
      <h2
        id="notifications-show-title"
        className="px-6 pb-2 pt-1 text-[20px] font-extrabold leading-6 tracking-[-0.01em] text-[color:var(--gn-ink)]"
      >
        {t('Show')}
      </h2>
      <nav aria-label={t('Filter notifications')} className="flex w-full flex-col">
        {views.map((view) => {
          const active = value === view;
          return (
            <button
              key={view}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(active && view !== 'all' ? 'all' : view)}
              data-pf-no-color-transition
              className={`flex w-full items-center gap-3 px-6 py-3.5 text-left text-[15px] leading-5 text-[color:var(--gn-ink)] transition-colors duration-150 hover:bg-[color:var(--gn-hover-strong,var(--gn-hover))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[color:var(--gn-ring)] ${
                active ? 'font-bold' : 'font-normal'
              }`}
            >
              <RailGlyph active={active}>{VIEW_GLYPHS[view]}</RailGlyph>
              <span className="min-w-0 flex-1 truncate">{t(VIEW_LABELS[view].rail)}</span>
              {view === 'unread' && unreadCount > 0 ? (
                <span className="shrink-0 text-[14px] font-medium tabular-nums text-[color:var(--gn-ink2)]">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              ) : null}
              {active ? <CheckMark /> : null}
            </button>
          );
        })}
      </nav>
    </section>
  );
}

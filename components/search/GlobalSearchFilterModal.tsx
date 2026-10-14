'use client';

import { trPlural } from '@/lib/i18n/active';
import { ContentPostDialogShell } from '@/components/creator/ContentPostDialogShell';
import { GlobalSearchRefineGroups, isPeopleTab } from '@/components/search/GlobalSearchCategoryQuickFilters';
import type { GlobalSearchTab } from '@/lib/global-search';
import type { GlobalSearchFilters } from '@/lib/global-search-filters';
import { countActiveGlobalSearchFilters, createDefaultGlobalSearchFilters } from '@/lib/global-search-filters';
import { useT } from '@/lib/i18n/I18nProvider';

/*
 * Filters, below lg (no rail): the Providers bottom sheet — the shared dialog shell (a sheet with a
 * grab handle on phones, a centred card from sm), the open tab's refine groups, and a sticky footer
 * that says what the choices give ("Show 12 results") and closes the sheet.
 *
 * What changed: the old modal kept a draft and asked for "Apply filters", while the results behind it
 * could not show the effect, and its button count was the count *before* the draft. Choices now apply
 * at once, so the footer's figure is always true. It was also unreachable — nothing on the page opened
 * it; the results page now has a Filters button (with the active count) beside its section line.
 *
 * The shell is portalled to <body>, outside the page's token scope, so the content re-opens it.
 */

type GlobalSearchFilterModalProps = {
  open: boolean;
  tab: GlobalSearchTab;
  filters: GlobalSearchFilters;
  isAuthenticated: boolean;
  resultCount: number;
  /** While the results reload, the footer does not quote a stale figure. */
  loading?: boolean;
  onClose: () => void;
  onApply: (filters: GlobalSearchFilters) => void;
};

export function GlobalSearchFilterModal({
  open,
  tab,
  filters,
  isAuthenticated,
  resultCount,
  loading = false,
  onClose,
  onApply,
}: GlobalSearchFilterModalProps) {
  const t = useT();
  const activeCount = countActiveGlobalSearchFilters(filters, isAuthenticated);

  return (
    <ContentPostDialogShell open={open} title={t('Filters')} onClose={onClose}>
      <div className="x-search-sheet news-theme news-feed news-mono">
        <div className={`pb-5 ${isPeopleTab(tab) ? 'pt-0' : 'pt-2'}`}>
          <GlobalSearchRefineGroups
            tab={tab}
            filters={filters}
            onChange={onApply}
            idPrefix="search-sheet"
            inset="sheet"
          />
        </div>
        <div className="sticky bottom-0 flex items-center justify-between gap-4 bg-[color:var(--xs-ground)] px-5 pb-5 pt-3">
          {activeCount > 0 ? (
            <button
              type="button"
              onClick={() => onApply(createDefaultGlobalSearchFilters(isAuthenticated))}
              className="inline-flex h-10 items-center text-[14px] font-semibold text-[color:var(--gn-ink)] underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--gn-ring)]"
            >
              {t('Clear all')}
            </button>
          ) : (
            <span />
          )}
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-11 items-center justify-center rounded-full bg-[color:var(--gn-primary)] px-6 text-[15px] font-semibold text-[color:var(--gn-primary-ink)] transition-colors hover:bg-[color:var(--gn-primary-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--gn-ring)]"
          >
            {loading ? t('Show results') : trPlural(resultCount, 'Show {count} result', 'Show {count} results')}
          </button>
        </div>
      </div>
    </ContentPostDialogShell>
  );
}

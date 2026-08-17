'use client';

import { ServiceProviderFilterPills } from '@/components/marketplace/ServiceProviderFilterPills';
import type { GlobalSearchTab } from '@/lib/global-search';
import type {
  GlobalSearchContentMediaFilter,
  GlobalSearchFilters,
  GlobalSearchProductTypeFilter,
} from '@/lib/global-search-filters';
import {
  GLOBAL_SEARCH_CONTENT_MEDIA_OPTIONS,
  GLOBAL_SEARCH_PRODUCT_TYPE_OPTIONS,
} from '@/lib/global-search-filters';

type GlobalSearchCategoryQuickFiltersProps = {
  tab: GlobalSearchTab;
  filters: GlobalSearchFilters;
  onChange: (next: GlobalSearchFilters) => void;
};

function ChipButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-2xl border px-3.5 py-1.5 text-sm font-medium transition ${
        active
          ? 'border-neutral-900 bg-neutral-900 text-white dark:border-white dark:bg-white dark:text-neutral-900'
          : 'border-neutral-200 bg-transparent text-neutral-600 hover:border-neutral-300 dark:border-neutral-700 dark:text-neutral-300 dark:hover:border-neutral-500'
      }`}
    >
      {children}
    </button>
  );
}

/**
 * Category-specific filters shown under the search tabs (not inside the global filter modal).
 */
export function GlobalSearchCategoryQuickFilters({
  tab,
  filters,
  onChange,
}: GlobalSearchCategoryQuickFiltersProps) {
  if (tab === 'serviceProviders') {
    return (
      <ServiceProviderFilterPills
        className="pt-4"
        idPrefix="search-sp"
        minYearsExperience={filters.minYearsExperience}
        nationality={filters.nationality}
        closestFirst={filters.closestFirst}
        onYearsChange={(years) => onChange({ ...filters, minYearsExperience: years })}
        onNationalityChange={(code) => onChange({ ...filters, nationality: code })}
        onClosestFirstChange={(enabled) => onChange({ ...filters, closestFirst: enabled })}
      />
    );
  }

  if (tab === 'products') {
    return (
      <div className="flex flex-wrap items-center gap-2 pt-4" aria-label="Product format">
        {GLOBAL_SEARCH_PRODUCT_TYPE_OPTIONS.map((option) => (
          <ChipButton
            key={option.value}
            active={filters.productType === option.value}
            onClick={() =>
              onChange({
                ...filters,
                productType: option.value as GlobalSearchProductTypeFilter,
              })
            }
          >
            {option.label}
          </ChipButton>
        ))}
      </div>
    );
  }

  if (tab === 'content') {
    return (
      <div className="flex flex-wrap items-center gap-2 pt-4" aria-label="Content media">
        {GLOBAL_SEARCH_CONTENT_MEDIA_OPTIONS.map((option) => (
          <ChipButton
            key={option.value}
            active={filters.contentMedia === option.value}
            onClick={() =>
              onChange({
                ...filters,
                contentMedia: option.value as GlobalSearchContentMediaFilter,
              })
            }
          >
            {option.label}
          </ChipButton>
        ))}
      </div>
    );
  }

  return null;
}

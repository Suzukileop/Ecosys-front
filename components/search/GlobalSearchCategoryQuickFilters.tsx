'use client';

import { tr } from '@/lib/i18n/active';
import { FilterDropdown, ServiceProviderFilterPills } from '@/components/marketplace/ServiceProviderFilterPills';
import { ProviderRailSwitch } from '@/components/marketplace/ProviderDiscoverRail';
import { nationalityLabel } from '@/lib/countries';
import type { GlobalSearchTab } from '@/lib/global-search';
import type { GlobalSearchFilters } from '@/lib/global-search-filters';
import {
  createDefaultGlobalSearchFilters,
  GLOBAL_SEARCH_CATEGORY_OPTIONS,
  GLOBAL_SEARCH_CONTENT_MEDIA_OPTIONS,
  GLOBAL_SEARCH_DATE_OPTIONS,
  GLOBAL_SEARCH_PRODUCT_TYPE_OPTIONS,
  GLOBAL_SEARCH_SORT_OPTIONS,
} from '@/lib/global-search-filters';
import { useT } from '@/lib/i18n/I18nProvider';

/*
 * The search's refine controls, drawn once and shown in two places: the "Refine" rail box from lg and
 * the Filters bottom sheet below it. Only the groups that act on the open tab are offered —
 *  - Products: Format · Sort by · Date
 *  - Content: Media · Sort by · Date
 *  - All: Sort by · Date (they order and narrow the product and post previews)
 *  - Profiles / Service providers: Experience · Nationality (the Providers rail rows) · Closest first
 *
 * In the rail they are the Products / Providers Refine rows (see below). In the sheet,
 * single-choice groups are the News interest chips (card tone, the selected one solid ink) under a
 * small-caps kicker, not stacked radio rows: the rail is sticky and height-locked once pinned, and
 * eleven 48px rows would run past the fold where they cannot be reached.
 *
 * Choices apply at once (the list behind updates), as on Providers.
 */

type RefineGroupsProps = {
  tab: GlobalSearchTab;
  filters: GlobalSearchFilters;
  onChange: (next: GlobalSearchFilters) => void;
  /** Prefix for the select ids (the rail and the sheet can both be mounted). */
  idPrefix: string;
  /** `rail`: 24px insets, matching the rail box rows; `sheet`: the sheet's 20px gutter. */
  inset?: 'rail' | 'sheet';
};

function ChoiceChips<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: readonly { value: T; label: string }[];
  onChange: (next: T) => void;
}) {
  const t = useT();
  return (
    <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-2">
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(option.value)}
            data-pf-no-color-transition
            className={`inline-flex h-10 items-center rounded-full px-4 text-[14px] font-semibold leading-5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--gn-ring)] sm:h-9 ${
              active
                ? 'bg-[color:var(--gn-ink)] text-[color:var(--gn-surface)]'
                : 'bg-[color:var(--gn-surface)] text-[color:var(--gn-ink)] hover:bg-[color:var(--gn-hover-strong,var(--gn-hover))]'
            }`}
          >
            {t(option.label)}
          </button>
        );
      })}
    </div>
  );
}

function ChipGroup({ title, pad, children }: { title: string; pad: string; children: React.ReactNode }) {
  return (
    <section className={`${pad} pt-2`}>
      <p className="gn-kicker pb-2.5">{title}</p>
      {children}
    </section>
  );
}

export function isPeopleTab(tab: GlobalSearchTab) {
  return tab === 'creators' || tab === 'serviceProviders';
}

export function GlobalSearchRefineGroups({ tab, filters, onChange, idPrefix, inset = 'rail' }: RefineGroupsProps) {
  const t = useT();
  const pad = inset === 'rail' ? 'px-6' : 'px-5';

  if (isPeopleTab(tab)) {
    return (
      <div className="flex flex-col">
        <ServiceProviderFilterPills
          idPrefix={idPrefix}
          variant="rail"
          minYearsExperience={filters.minYearsExperience}
          nationality={filters.nationality}
          closestFirst={filters.closestFirst}
          onYearsChange={(years) => onChange({ ...filters, minYearsExperience: years })}
          onNationalityChange={(code) => onChange({ ...filters, nationality: code })}
          onClosestFirstChange={(enabled) => onChange({ ...filters, closestFirst: enabled })}
        />
        <ProviderRailSwitch
          label={t('Closest first')}
          checked={filters.closestFirst}
          onChange={(enabled) => onChange({ ...filters, closestFirst: enabled })}
        />
      </div>
    );
  }

  /*
   * The rail: the Products / Providers Refine rows — the label left, the choice right, a dropdown —
   * instead of stacked chip groups. Sort is not here: it sits on the results line ("Sort by ▾"), as
   * on Products. The first option of each group is its default, shown as "Any".
   */
  if (inset === 'rail') {
    const railSelect = <T extends string>(
      key: string,
      label: string,
      value: T,
      options: readonly { value: T; label: string }[],
      apply: (next: T) => void
    ) => (
      <FilterDropdown
        id={`${idPrefix}-${key}`}
        label={label}
        variant="rail"
        value={value === options[0].value ? '' : value}
        options={options.map((option, index) => ({ value: index === 0 ? '' : option.value, label: option.label }))}
        onChange={(next) => apply((next || options[0].value) as T)}
      />
    );
    return (
      <div className="flex w-full flex-col">
        {tab === 'products'
          ? railSelect('format', 'Format', filters.productType, GLOBAL_SEARCH_PRODUCT_TYPE_OPTIONS, (productType) =>
              onChange({ ...filters, productType })
            )
          : null}
        {tab === 'content'
          ? railSelect('media', 'Media', filters.contentMedia, GLOBAL_SEARCH_CONTENT_MEDIA_OPTIONS, (contentMedia) =>
              onChange({ ...filters, contentMedia })
            )
          : null}
        {railSelect('date', 'Date', filters.dateRange, GLOBAL_SEARCH_DATE_OPTIONS, (dateRange) => onChange({ ...filters, dateRange }))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {tab === 'products' ? (
        <ChipGroup title={t('Format')} pad={pad}>
          <ChoiceChips
            label={t('Product format')}
            value={filters.productType}
            options={GLOBAL_SEARCH_PRODUCT_TYPE_OPTIONS}
            onChange={(productType) => onChange({ ...filters, productType })}
          />
        </ChipGroup>
      ) : null}
      {tab === 'content' ? (
        <ChipGroup title={t('Media')} pad={pad}>
          <ChoiceChips
            label={t('Content media')}
            value={filters.contentMedia}
            options={GLOBAL_SEARCH_CONTENT_MEDIA_OPTIONS}
            onChange={(contentMedia) => onChange({ ...filters, contentMedia })}
          />
        </ChipGroup>
      ) : null}
      <ChipGroup title={t('Sort by')} pad={pad}>
        <ChoiceChips
          label={t('Sort by')}
          value={filters.sort}
          options={GLOBAL_SEARCH_SORT_OPTIONS}
          onChange={(sort) => onChange({ ...filters, sort })}
        />
      </ChipGroup>
      <ChipGroup title={t('Date')} pad={pad}>
        <ChoiceChips
          label={t('Publication date')}
          value={filters.dateRange}
          options={GLOBAL_SEARCH_DATE_OPTIONS}
          onChange={(dateRange) => onChange({ ...filters, dateRange })}
        />
      </ChipGroup>
    </div>
  );
}

/**
 * Every filter that differs from the defaults, as short labels for the "Filtered by: … · Clear" line —
 * including the ones the open tab does not show, so a filter set on another tab is never invisible.
 */
export function describeActiveGlobalSearchFilters(
  filters: GlobalSearchFilters,
  isAuthenticated: boolean
): string[] {
  const defaults = createDefaultGlobalSearchFilters(isAuthenticated);
  const labels: string[] = [];
  const allCategories =
    filters.categories.length === defaults.categories.length &&
    defaults.categories.every((category) => filters.categories.includes(category));
  if (!allCategories) {
    labels.push(
      GLOBAL_SEARCH_CATEGORY_OPTIONS.filter((option) => filters.categories.includes(option.value))
        .map((option) => tr(option.label))
        .join(' + ')
    );
  }
  const optionLabel = <T extends string>(options: readonly { value: T; label: string }[], value: T) =>
    tr(options.find((option) => option.value === value)?.label ?? value);
  if (filters.productType !== defaults.productType) labels.push(optionLabel(GLOBAL_SEARCH_PRODUCT_TYPE_OPTIONS, filters.productType));
  if (filters.contentMedia !== defaults.contentMedia) labels.push(optionLabel(GLOBAL_SEARCH_CONTENT_MEDIA_OPTIONS, filters.contentMedia));
  if (filters.minYearsExperience != null) labels.push(tr('{count}+ yrs exp.', { count: filters.minYearsExperience }));
  if (filters.nationality.trim()) labels.push(nationalityLabel(filters.nationality) || filters.nationality);
  if (filters.closestFirst) labels.push(tr('Closest first'));
  if (filters.dateRange !== defaults.dateRange) labels.push(optionLabel(GLOBAL_SEARCH_DATE_OPTIONS, filters.dateRange));
  if (filters.sort !== defaults.sort) labels.push(optionLabel(GLOBAL_SEARCH_SORT_OPTIONS, filters.sort));
  return labels.filter(Boolean);
}

'use client';

import { useEffect, useMemo, useState } from 'react';
import { listPopularProductSearches } from '@/lib/marketplace-api';
import type { MarketplaceProductFormat, MarketplaceSort } from '@/components/marketplace/useMarketplaceCatalogParams';
import type { ProductType } from '@/types/marketplace';
import { STUDIO_FLOAT_IN_STYLE } from '@/components/portfolio/PortfolioStudioKit';
import { useT } from '@/lib/i18n/I18nProvider';
import { msg } from '@/lib/i18n/config';

/*
 * The product catalogue's filter vocabulary, shared by the Products page's rail (lg+) and its
 * Filters sheet (phones / tablets): the option lists, the budget presets and the trending searches.
 */

export const PRODUCT_GENRES = ['Tech', 'Lifestyle', 'Business', 'Art', 'Sport', 'Music'] as const;

export const PRODUCT_TYPES: ProductType[] = [
  'VIDEO',
  'COURSE',
  'TEMPLATE',
  'PDF',
  'EBOOK',
  'AUDIO',
  'PRESET',
  'SOFTWARE',
  'IMAGE_PACK',
  'FONT',
  'OTHER',
];

export const PRODUCT_SORT_OPTIONS: { value: MarketplaceSort; label: string }[] = [
  { value: 'popular', label: msg('Popularity') },
  { value: 'newest', label: msg('Recent') },
  { value: 'views', label: msg('Most viewed') },
  { value: 'price_asc', label: msg('Price: low to high') },
  { value: 'price_desc', label: msg('Price: high to low') },
];

/** Material / Digital, with the rail's 24-unit stroke glyphs (a parcel, a download). */
export const PRODUCT_FORMAT_OPTIONS: { id: MarketplaceProductFormat; label: string; hint: string; icon: React.ReactNode }[] = [
  {
    id: 'physical',
    label: msg('Material'),
    hint: msg('Shipped to buyer'),
    icon: (
      <>
        <path d="M12 2.8 20 7.2v9.6l-8 4.4-8-4.4V7.2z" />
        <path d="m4 7.2 8 4.4 8-4.4" />
        <path d="M12 11.6v9.6" />
        <path d="m8 5 8 4.4" />
      </>
    ),
  },
  {
    id: 'virtual',
    label: msg('Digital'),
    hint: msg('Delivered online'),
    icon: (
      <>
        <path d="M12 4v11" />
        <path d="m7.5 10.5 4.5 4.5 4.5-4.5" />
        <path d="M4.5 15.5v3a1.5 1.5 0 0 0 1.5 1.5h12a1.5 1.5 0 0 0 1.5-1.5v-3" />
      </>
    ),
  },
];

const POPULAR_SEARCH_LIMIT = 5;

type PricePresetId = 'all' | 'free' | 'under10' | 'range10_50' | 'range50_100' | 'over100' | 'custom';

export const PRICE_PRESETS: { id: PricePresetId; label: string; min: string; max: string }[] = [
  { id: 'all', label: msg('All prices'), min: '', max: '' },
  { id: 'free', label: msg('Free'), min: '0', max: '0' },
  { id: 'under10', label: msg('Under €10'), min: '', max: '10' },
  { id: 'range10_50', label: '€10 – €50', min: '10', max: '50' },
  { id: 'range50_100', label: '€50 – €100', min: '50', max: '100' },
  { id: 'over100', label: '€100+', min: '100', max: '' },
  { id: 'custom', label: msg('Custom'), min: '', max: '' },
];

export function detectPricePreset(minPrice: string, maxPrice: string): PricePresetId {
  const match = PRICE_PRESETS.find(
    (preset) => preset.id !== 'custom' && preset.min === minPrice && preset.max === maxPrice
  );
  return match?.id ?? (minPrice || maxPrice ? 'custom' : 'all');
}

/** A set custom range as a label: "€20 – €80", "From €20", "Up to €80". */
export function customPriceLabel(minPrice: string, maxPrice: string): string {
  if (minPrice && maxPrice) return `€${minPrice} – €${maxPrice}`;
  if (minPrice) return `From €${minPrice}`;
  return `Up to €${maxPrice}`;
}

/** The sheet's chips: card tone, the selected one solid ink — the News interest chips. */
export function filterChipClass(active: boolean) {
  return `inline-flex h-9 shrink-0 items-center rounded-full px-4 text-[14px] font-semibold leading-5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--gn-ring)] ${
    active
      ? 'bg-[color:var(--gn-ink)] text-[color:var(--gn-surface)]'
      : 'bg-[color:var(--gn-surface)] text-[color:var(--gn-ink)] active:bg-[color:var(--gn-hover-strong,var(--gn-hover))]'
  }`;
}

export function TrendGlyph() {
  return (
    <>
      <path d="M3 17l6-6 4 4 8-8" />
      <path d="M15 7h6v6" />
    </>
  );
}

/** Trending searches for a format, fetched once per format (best effort: none on failure). */
export function usePopularProductSearches(format: MarketplaceProductFormat, enabled = true) {
  const [popular, setPopular] = useState<{ format: MarketplaceProductFormat; terms: string[] } | null>(null);

  useEffect(() => {
    if (!enabled || popular?.format === format) return;
    let cancelled = false;
    listPopularProductSearches(format, POPULAR_SEARCH_LIMIT)
      .then((terms) => {
        if (!cancelled) setPopular({ format, terms });
      })
      .catch(() => {
        if (!cancelled) setPopular({ format, terms: [] });
      });
    return () => {
      cancelled = true;
    };
  }, [enabled, format, popular?.format]);

  return popular?.format === format ? popular.terms.slice(0, POPULAR_SEARCH_LIMIT) : [];
}

function CustomPriceField({
  id,
  label,
  value,
  onChange,
  onApply,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  onApply: () => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-[13px] font-medium text-[color:var(--gn-ink2)]">
        {label}
      </label>
      <div className="flex h-10 w-[8rem] items-center gap-1.5 rounded-full bg-[color:var(--gn-surface)] px-4 transition focus-within:bg-[color:var(--gn-inset)] focus-within:shadow-[inset_0_0_0_2px_var(--gn-ink)]">
        <span className="shrink-0 text-[15px] text-[color:var(--gn-ink2)]">€</span>
        <input
          id={id}
          type="number"
          min={0}
          step="0.01"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onApply}
          onKeyDown={(e) => e.key === 'Enter' && onApply()}
          placeholder="0"
          className="w-full min-w-0 border-0 bg-transparent text-[15px] text-[color:var(--gn-ink)] placeholder:text-[color:var(--gn-ink3)] focus:outline-none"
        />
      </div>
    </div>
  );
}

/** Budget: the presets as chips, "Custom" opens a min – max pair (swapped when entered backwards). */
export function BudgetFilter({
  minPrice,
  maxPrice,
  onApply,
}: {
  minPrice: string;
  maxPrice: string;
  onApply: (min: string, max: string) => void;
}) {
  const t = useT();
  const detected = useMemo(() => detectPricePreset(minPrice, maxPrice), [minPrice, maxPrice]);
  const [preset, setPreset] = useState<PricePresetId>(detected);
  const [localMin, setLocalMin] = useState(minPrice);
  const [localMax, setLocalMax] = useState(maxPrice);

  /* A new range from the URL (another control, Clear) resets the local fields. */
  const [syncedRange, setSyncedRange] = useState(`${minPrice}|${maxPrice}`);
  if (`${minPrice}|${maxPrice}` !== syncedRange) {
    setSyncedRange(`${minPrice}|${maxPrice}`);
    setPreset(detected);
    setLocalMin(minPrice);
    setLocalMax(maxPrice);
  }

  const selectPreset = (id: PricePresetId) => {
    setPreset(id);
    if (id === 'custom') return;
    const found = PRICE_PRESETS.find((item) => item.id === id);
    if (!found) return;
    onApply(found.min, found.max);
  };

  const applyCustom = () => {
    let min = localMin.trim();
    let max = localMax.trim();
    const minNum = min ? Number(min) : null;
    const maxNum = max ? Number(max) : null;
    if (minNum != null && maxNum != null && minNum > maxNum) {
      min = localMax.trim();
      max = localMin.trim();
      setLocalMin(min);
      setLocalMax(max);
    }
    onApply(min, max);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {PRICE_PRESETS.map((item) => (
          <button
            key={item.id}
            type="button"
            aria-pressed={preset === item.id}
            onClick={() => selectPreset(item.id)}
            className={filterChipClass(preset === item.id)}
          >
            {t(item.label)}
          </button>
        ))}
      </div>

      {preset === 'custom' && (
        <div className="flex flex-wrap items-end gap-3" style={STUDIO_FLOAT_IN_STYLE}>
          <CustomPriceField id="budget-min" label={t('Min')} value={localMin} onChange={setLocalMin} onApply={applyCustom} />
          <span className="pb-2.5 text-[15px] text-[color:var(--gn-ink3)]" aria-hidden>
            –
          </span>
          <CustomPriceField id="budget-max" label={t('Max')} value={localMax} onChange={setLocalMax} onApply={applyCustom} />
          <button
            type="button"
            onClick={applyCustom}
            className="inline-flex h-10 items-center rounded-full bg-[color:var(--gn-primary)] px-5 text-[15px] font-semibold text-[color:var(--gn-primary-ink)] transition-colors hover:bg-[color:var(--gn-primary-hover)]"
          >
            {t('Apply')}
          </button>
        </div>
      )}
    </div>
  );
}

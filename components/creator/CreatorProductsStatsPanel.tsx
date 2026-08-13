'use client';

import { useMemo } from 'react';
import type { MarketplaceProductSummary } from '@/types/marketplace';

type CreatorProductsStatsPanelProps = {
  products: MarketplaceProductSummary[];
};

function formatCompactNumber(value: number): string {
  return new Intl.NumberFormat('en-US').format(Math.max(0, Math.round(value)));
}

export function CreatorProductsStatsPanel({ products }: CreatorProductsStatsPanelProps) {
  const views = useMemo(
    () => products.reduce((sum, product) => sum + (product.views ?? 0), 0),
    [products]
  );

  return (
    <aside
      className="rounded-2xl border border-neutral-200 bg-white px-5 py-2 dark:border-neutral-700 dark:bg-neutral-900/60"
      aria-label="Store performance"
    >
      <dl className="divide-y divide-neutral-200 dark:divide-neutral-700">
        <div className="py-6">
          <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 dark:text-neutral-500">
            Store traffic
          </dt>
          <dd className="mt-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {formatCompactNumber(views)}{' '}
            <span className="text-lg font-medium text-slate-400 dark:text-neutral-500">views</span>
          </dd>
        </div>
      </dl>
    </aside>
  );
}

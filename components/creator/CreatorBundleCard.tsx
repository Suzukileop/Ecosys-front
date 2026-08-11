'use client';

import { formatPrice } from '@/lib/marketplace-api';
import { BundlePurchaseButton } from '@/components/marketplace/BundlePurchaseButton';
import type { MarketplaceBundleSummary } from '@/types/marketplace';

type CreatorBundleCardProps = {
  bundle: MarketplaceBundleSummary;
  isAuthenticated: boolean;
  loginRedirect: string;
};

export function CreatorBundleCard({
  bundle,
  isAuthenticated,
  loginRedirect,
}: CreatorBundleCardProps) {
  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-lg dark:border-neutral-800 dark:bg-neutral-900 dark:hover:shadow-neutral-900/50">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-bold text-gray-900 dark:text-white">{bundle.title}</h3>
          {bundle.description && (
            <p className="mt-1 line-clamp-2 text-sm text-gray-600 dark:text-gray-400">
              {bundle.description}
            </p>
          )}
        </div>
        <span
          className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
            bundle.isPublished
              ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300'
              : 'bg-gray-100 text-gray-600 dark:bg-neutral-800 dark:text-gray-400'
          }`}
        >
          {bundle.isPublished ? 'Published' : 'Draft'}
        </span>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-medium text-gray-700 dark:border-neutral-700 dark:bg-neutral-800 dark:text-gray-300">
          {bundle.productCount} products
        </span>
        <p className="text-lg font-bold text-gray-900 dark:text-white">
          {formatPrice(bundle.priceCents, bundle.currency)}
        </p>
      </div>

      {bundle.isPublished && (
        <div className="mt-4 border-t border-gray-200 pt-4 dark:border-neutral-700">
          <BundlePurchaseButton
            bundleId={bundle.id}
            priceLabel={formatPrice(bundle.priceCents, bundle.currency)}
            isAuthenticated={isAuthenticated}
            loginRedirect={loginRedirect}
          />
        </div>
      )}
    </article>
  );
}

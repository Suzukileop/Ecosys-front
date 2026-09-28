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
    <article className="flex flex-col overflow-hidden rounded-lg border border-black/[0.06] bg-white p-5 transition-colors duration-300 hover:border-black/[0.12] dark:border-white/[0.08] dark:bg-[#111111] dark:hover:border-white/[0.16]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="text-[17px] font-semibold leading-snug text-[#111111] dark:text-white">{bundle.title}</h3>
          {bundle.description && (
            <p className="mt-1.5 line-clamp-2 text-[15px] text-neutral-500 dark:text-neutral-400">
              {bundle.description}
            </p>
          )}
        </div>
        <span className="inline-flex shrink-0 items-center gap-2 text-[14px] text-neutral-500 dark:text-neutral-400">
          <span
            aria-hidden
            className={`h-1.5 w-1.5 rounded-full ${bundle.isPublished ? 'bg-emerald-500' : 'bg-amber-500'}`}
          />
          {bundle.isPublished ? 'Published' : 'Draft'}
        </span>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <span className="rounded-full border border-black/[0.08] px-2.5 py-0.5 text-[13px] text-neutral-600 dark:border-white/[0.1] dark:text-neutral-300">
          {bundle.productCount} products
        </span>
        <p className="text-base font-semibold text-[#111111] dark:text-white">
          {formatPrice(bundle.priceCents, bundle.currency)}
        </p>
      </div>

      {bundle.isPublished && (
        <div className="mt-4 border-t border-black/[0.06] pt-4 dark:border-white/[0.06]">
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

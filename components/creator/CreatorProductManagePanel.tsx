'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { formatPrice, isFreeProduct } from '@/lib/marketplace-api';
import {
  creatorProductEditPath,
  type CreatorProductNavFrom,
} from '@/lib/creator-product-nav';
import { getStockStatus } from '@/lib/product-stock';
import { InfoHint } from '@/components/ui/InfoHint';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import type { MarketplaceProductDetail } from '@/types/marketplace';
import { useT } from '@/lib/i18n/I18nProvider';

type CreatorProductManagePanelProps = {
  product: MarketplaceProductDetail;
  publishing: boolean;
  onTogglePublish: () => void;
  recordingSale?: boolean;
  /** Brief cooldown after a sale so an accidental double click can't log it twice. */
  saleLocked?: boolean;
  onRecordSale?: (quantity: number) => void;
  onRemoveSale?: () => void;
  /** Keeps edit → back navigation in the same section (Profile vs My Product). */
  from?: CreatorProductNavFrom;
};

const LABEL = 'text-[13px] leading-[18px] text-[color:var(--gn-ink2)]';
const DIVIDER = 'shadow-[inset_0_1px_0_var(--gn-line)]';
const DIGITAL_MAX_SALE_BATCH = 99;
const STEPPER_BUTTON =
  'h-full w-10 text-lg text-[color:var(--gn-ink)] transition hover:bg-[color:var(--gn-hover)] disabled:opacity-30';
/* The page's pills: ink fill for the primary, a 1px ring for the secondary. */
const PRIMARY_PILL =
  'inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[color:var(--gn-primary)] px-5 text-[15px] font-bold text-[color:var(--gn-primary-ink)] transition-colors hover:bg-[color:var(--gn-primary-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--gn-ring)] disabled:opacity-60';
const OUTLINE_PILL =
  'inline-flex h-11 w-full items-center justify-center gap-2 rounded-full px-5 text-[15px] font-bold text-[color:var(--gn-ink)] shadow-[inset_0_0_0_1px_#CFD9DE] transition-colors hover:bg-[color:var(--gn-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--gn-ring)] disabled:opacity-60 dark:shadow-[inset_0_0_0_1px_#536471]';

export function CreatorProductManagePanel({
  product,
  publishing,
  onTogglePublish,
  recordingSale = false,
  saleLocked = false,
  onRecordSale,
  onRemoveSale,
  from = 'products',
}: CreatorProductManagePanelProps) {
  const t = useT();
  const [saleQuantity, setSaleQuantity] = useState(1);
  const isPhysical = product.type === 'PHYSICAL';
  const free = isFreeProduct(product.priceCents);
  const hasDiscount =
    !free && product.compareAtPriceCents != null && product.compareAtPriceCents > product.priceCents;
  const discountPercent = hasDiscount
    ? Math.round((1 - product.priceCents / product.compareAtPriceCents!) * 100)
    : null;
  const stock = getStockStatus(product);
  const sales = product.salesCount ?? 0;
  const maxSale = isPhysical ? (stock.quantity ?? 0) : DIGITAL_MAX_SALE_BATCH;
  const canRecordSale = Boolean(onRecordSale) && maxSale > 0;
  const canRemoveSale = Boolean(onRemoveSale) && sales > 0;
  const quantityToRecord = Math.min(Math.max(saleQuantity, 1), Math.max(maxSale, 1));
  const saleDisabled = recordingSale || saleLocked;
  const submitSale = () => {
    if (saleDisabled) return;
    onRecordSale?.(quantityToRecord);
    setSaleQuantity(1);
  };

  return (
    // The page's rail: an outlined box (News's `.gn-rail-box`), as on the public product page.
    <div className="gn-rail-box overflow-hidden">
      <div className="flex items-center justify-between gap-2 px-6 pt-6">
        <span className="inline-flex items-center gap-2 text-[14px] font-semibold text-[color:var(--gn-ink)]">
          <span
            className={`h-2 w-2 rounded-full ${product.isPublished ? 'bg-[#00BA7C]' : 'bg-[#FFAD1F]'}`}
            aria-hidden
          />
          {product.isPublished ? t('Live on marketplace') : t('Draft')}
        </span>
        {product.isPublished && (
          <Link
            href={`/marketplace/products/${product.id}`}
            className="group inline-flex items-center gap-1 text-[14px] font-semibold text-[color:var(--gn-ink)] underline-offset-4 hover:underline"
          >
            {t('View')}
            <span aria-hidden className="transition-transform duration-300 group-hover:-translate-y-px group-hover:translate-x-px">
              ↗
            </span>
          </Link>
        )}
      </div>

      <div className="px-6 pb-6 pt-5">
        <p className={LABEL}>{isPhysical ? t('Selling price') : t('Price')}</p>
        <div className="mt-2 flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
          <p className="text-[32px] font-extrabold leading-9 tracking-[-0.02em] text-[color:var(--gn-ink)] tabular-nums">
            {formatPrice(product.priceCents, product.currency)}
          </p>
          {hasDiscount && (
            <p className="text-[15px] text-[color:var(--gn-ink3)] line-through tabular-nums">
              {formatPrice(product.compareAtPriceCents!, product.currency)}
            </p>
          )}
        </div>
        {discountPercent != null && (
          <p className="mt-1 text-[13px] font-semibold leading-[18px] text-[color:var(--gn-ink)]">
            {t('{discountPercent}% off', { discountPercent })}
          </p>
        )}
      </div>

      {!isPhysical && (
        <div className={`${DIVIDER} flex items-center justify-between gap-3 px-6 py-4`}>
          <p className={LABEL}>{t('Availability')}</p>
          <span className="text-[15px] font-semibold text-[color:var(--gn-ink)]">{t('Unlimited · Instant delivery')}</span>
        </div>
      )}

      {(canRecordSale || canRemoveSale) && (
        <div className={`${DIVIDER} space-y-3 px-6 py-5`}>
          {canRecordSale && (
            <div className="flex items-center gap-2.5">
              {maxSale > 1 && (
                <div className="inline-flex h-12 shrink-0 items-center overflow-hidden rounded-full shadow-[inset_0_0_0_1px_#CFD9DE] dark:shadow-[inset_0_0_0_1px_#536471]">
                  <button
                    type="button"
                    aria-label={t('Decrease quantity')}
                    disabled={saleDisabled || quantityToRecord <= 1}
                    onClick={() => setSaleQuantity(quantityToRecord - 1)}
                    className={STEPPER_BUTTON}
                  >
                    −
                  </button>
                  <span className="w-8 text-center text-[15px] font-semibold text-[color:var(--gn-ink)] tabular-nums">
                    {quantityToRecord}
                  </span>
                  <button
                    type="button"
                    aria-label={t('Increase quantity')}
                    disabled={saleDisabled || quantityToRecord >= maxSale}
                    onClick={() => setSaleQuantity(quantityToRecord + 1)}
                    className={STEPPER_BUTTON}
                  >
                    +
                  </button>
                </div>
              )}
              <button
                type="button"
                disabled={saleDisabled}
                onClick={submitSale}
                className={`relative inline-flex h-12 flex-1 items-center justify-center gap-2 overflow-hidden rounded-full px-4 text-[15px] font-bold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--gn-ring)] ${
                  saleLocked && !recordingSale
                    ? 'cursor-default bg-[color:var(--gn-surface)] text-[color:var(--gn-ink)] shadow-[inset_0_0_0_1px_#CFD9DE] dark:shadow-[inset_0_0_0_1px_#536471]'
                    : 'bg-[color:var(--gn-primary)] text-[color:var(--gn-primary-ink)] hover:bg-[color:var(--gn-primary-hover)] disabled:opacity-60'
                }`}
              >
                {recordingSale && <LoadingSpinner size="sm" />}
                {recordingSale
                  ? t('Saving…')
                  : saleLocked
                    ? t('✓ Sale recorded')
                    : maxSale === 1
                      ? t('Mark as sold')
                      : `Record ${quantityToRecord === 1 ? 'sale' : `${quantityToRecord} sales`}`}
                {saleLocked && !recordingSale && (
                  <motion.span
                    aria-hidden
                    initial={{ scaleX: 1 }}
                    animate={{ scaleX: 0 }}
                    transition={{ duration: 5, ease: 'linear' }}
                    className="absolute inset-x-0 bottom-0 h-0.5 origin-left bg-[color:var(--gn-ink)]"
                  />
                )}
              </button>
              <InfoHint align="end">
                {isPhysical
                  ? t('Closed a deal in Discussions? Log it — stock and sales update instantly.')
                  : t('Sold a copy outside the marketplace? Log it — sales and revenue update instantly.')}{' '}
                {t('Made a mistake? Use “Remove a sale” below.')}
              </InfoHint>
            </div>
          )}
          {canRemoveSale && (
            <button
              type="button"
              disabled={recordingSale}
              onClick={onRemoveSale}
              className="text-[14px] font-semibold text-[color:var(--gn-ink2)] underline-offset-4 transition hover:text-[color:var(--gn-ink)] hover:underline disabled:opacity-50"
            >
              {t('Remove a sale')}
            </button>
          )}
        </div>
      )}

      <div className={`${DIVIDER} grid gap-2.5 p-6`}>
        <Link
          href={creatorProductEditPath(product.id, from)}
          className={PRIMARY_PILL}
        >
          {isPhysical && stock.tone === 'out' ? t('Restock product') : t('Edit product')}
        </Link>
        <button
          type="button"
          disabled={publishing}
          onClick={onTogglePublish}
          className={OUTLINE_PILL}
        >
          {publishing && <LoadingSpinner size="sm" />}
          {publishing ? t('Updating…') : product.isPublished ? t('Unpublish') : t('Publish')}
        </button>
      </div>

      <dl className={`${DIVIDER} grid grid-cols-3`}>
        {[
          { label: t('Views'), value: product.views ?? 0 },
          { label: t('Likes'), value: product.likes ?? 0 },
          { label: t('Sales'), value: sales },
        ].map((item) => (
          <div key={item.label} className="px-4 py-4 text-center">
            <dt className="gn-kicker">{t(item.label)}</dt>
            <dd className="mt-1 text-[20px] font-extrabold leading-6 text-[color:var(--gn-ink)] tabular-nums">
              {item.value.toLocaleString()}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

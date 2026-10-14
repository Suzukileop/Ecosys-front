'use client';

import { localeTag, trPlural } from '@/lib/i18n/active';
import type { ReactNode } from 'react';
import { CreatorProductDeleteZone } from '@/components/creator/CreatorProductDeleteZone';
import { ProductReviewsList } from '@/components/marketplace/ProductReviewsList';
import { formatPrice, isFreeProduct, productTypeName } from '@/lib/marketplace-api';
import { DEFAULT_PHYSICAL_STOCK, getStockStatus, STOCK_TONE_DOT } from '@/lib/product-stock';
import type { DeliveryMode, MarketplaceProductDetail } from '@/types/marketplace';
import { useT } from '@/lib/i18n/I18nProvider';

type CreatorProductDetailBottomProps = {
  product: MarketplaceProductDetail;
  reviewCount: number;
  loginRedirect: string;
  onDeleted: () => void;
  middle?: ReactNode;
};

type Row = { label: string; value: ReactNode };
type Tile = { label: string; value: string; hint?: string };

const DELIVERY_LABELS: Record<DeliveryMode, string> = {
  STREAM_ONLY: 'Streaming only',
  DOWNLOAD: 'Download',
  BOTH: 'Streaming & download',
};

function formatProductDate(value: string): string {
  return new Date(value).toLocaleDateString(localeTag(), { year: 'numeric', month: 'short', day: 'numeric' });
}

function countPhotos(product: MarketplaceProductDetail): number {
  const urls = new Set<string>();
  for (const raw of [product.thumbnailUrl, ...(product.galleryImageUrls ?? [])]) {
    const url = raw?.trim();
    if (url) urls.add(url);
  }
  return urls.size;
}

export function CreatorProductDetailBottom({
  product,
  reviewCount,
  loginRedirect,
  onDeleted,
  middle,
}: CreatorProductDetailBottomProps) {
  const t = useT();
  const isPhysical = product.type === 'PHYSICAL';
  const free = isFreeProduct(product.priceCents);
  const stock = getStockStatus(product);
  const sales = product.salesCount ?? 0;
  const views = product.views ?? 0;
  const revenue = free
    ? '—'
    : new Intl.NumberFormat(localeTag(), {
        style: 'currency',
        currency: product.currency || 'EUR',
        minimumFractionDigits: 2,
      }).format((product.priceCents * sales) / 100);
  const conversion = views > 0 ? `${((sales / views) * 100).toFixed(1)}%` : '—';
  const conversionHint = `${trPlural(sales, '{count} sale', '{count} sales', { count: t.number(sales) })} · ${trPlural(views, '{count} view', '{count} views', { count: t.number(views) })}`;
  const reviewsLabel = t.plural(reviewCount, '{count} review', '{count} reviews', { count: t.number(reviewCount) });
  const lastUpdated = product.updatedAt ?? product.createdAt;

  let title: string;
  let rows: Row[];
  let tiles: Tile[];

  if (isPhysical) {
    const photos = countPhotos(product);
    title = 'Inventory & sales';
    rows = [{ label: t('Type'), value: 'Material product' }];
    if (stock.quantity != null) {
      const singleUnit = stock.quantity === DEFAULT_PHYSICAL_STOCK;
      rows.push(
        {
          label: t('Availability'),
          value: (
            <span className="inline-flex items-center gap-2">
              <span className={`h-2 w-2 rounded-full ${STOCK_TONE_DOT[singleUnit ? 'ok' : stock.tone]}`} aria-hidden />
              {singleUnit ? t('In stock') : stock.label}
            </span>
          ),
        },
        { label: t('Units in stock'), value: stock.quantity.toLocaleString() },
        {
          label: t('Stock value'),
          value:
            free || stock.quantity <= 0 ? '—' : formatPrice(product.priceCents * stock.quantity, product.currency),
        }
      );
    }
    rows.push({ label: t('Photos'), value: photos === 1 ? '1 photo' : `${photos} photos` });
    tiles = [
      { label: t('Units sold'), value: sales.toLocaleString() },
      { label: t('Revenue'), value: revenue },
      { label: t('Conversion'), value: conversion, hint: conversionHint },
    ];
  } else {
    title = 'Characteristics';
    rows = [{ label: t('Type'), value: productTypeName(product.type, product.typeLabel) }];
    if (product.deliveryMode) {
      rows.push({ label: t('Delivery'), value: DELIVERY_LABELS[product.deliveryMode] ?? product.deliveryMode });
    }
    if (product.fileFormat) rows.push({ label: t('Format'), value: product.fileFormat });
    if (product.fileSizeMb != null) rows.push({ label: t('File size'), value: `${product.fileSizeMb} MB` });
    if (product.language) rows.push({ label: t('Language'), value: product.language });
    if (product.version) rows.push({ label: t('Version'), value: product.version });
    rows.push({ label: t('Availability'), value: 'Unlimited copies' });
    tiles = [
      { label: t('Sales'), value: sales.toLocaleString() },
      { label: t('Revenue'), value: revenue },
      { label: t('Conversion'), value: conversion, hint: conversionHint },
    ];
  }

  /* Facts both formats share, after their own: reviews, then the dates (the panel shows views). */
  rows.push({ label: t('Customer reviews'), value: reviewsLabel });
  rows.push({ label: t('Listed on'), value: formatProductDate(product.createdAt) });
  if (lastUpdated !== product.createdAt) rows.push({ label: t('Last update'), value: formatProductDate(lastUpdated) });

  return (
    <div className="space-y-12 md:space-y-16">
      <section>
        <h2 className="text-[20px] font-extrabold leading-6 tracking-[-0.01em] text-[color:var(--gn-ink)]">{title}</h2>
        {/* Figures first (what moved), then the facts — News blocks on the card tone, 8px apart. */}
        <dl className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
          {tiles.map((tile) => (
            <div key={tile.label} className="bg-[color:var(--gn-surface)] px-5 py-4">
              <dt className="gn-kicker">{t(tile.label)}</dt>
              <dd className="mt-1.5 text-[20px] font-extrabold leading-6 tracking-[-0.01em] text-[color:var(--gn-ink)] tabular-nums">
                {tile.value}
              </dd>
              {tile.hint ? <dd className="mt-1 text-[13px] leading-[18px] text-[color:var(--gn-ink2)]">{t(tile.hint)}</dd> : null}
            </div>
          ))}
        </dl>
        {/* The facts: the public page's Details block — two columns of rows from sm, a hairline
            under each but the last of its column. */}
        <dl className="mt-2 grid bg-[color:var(--gn-surface)] px-5 sm:grid-cols-2 sm:gap-x-10 sm:px-6">
          {rows.map((row) => (
            <div
              key={row.label}
              className="flex items-center justify-between gap-4 py-3.5 text-[15px] leading-5 shadow-[inset_0_-1px_0_var(--gn-line)] last:shadow-none sm:[&:nth-last-child(2):nth-child(odd)]:shadow-none"
            >
              <dt className="text-[color:var(--gn-ink2)]">{t(row.label)}</dt>
              <dd className="text-right font-semibold text-[color:var(--gn-ink)] tabular-nums">{row.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {middle}

      <section>
        <div className="flex flex-col gap-10 md:gap-14">
          {product.isPublished ? (
            <ProductReviewsList
              productId={product.id}
              loginRedirect={loginRedirect}
              initialReviewCount={product.reviewCount}
              initialAverageRating={product.averageRating}
            />
          ) : (
            <section>
              <h2 className="text-[20px] font-extrabold leading-6 tracking-[-0.01em] text-[color:var(--gn-ink)]">{t('Customer reviews')}</h2>
              <div className="mt-4 bg-[color:var(--gn-surface)] px-6 py-12 text-center">
                <p className="text-[17px] font-bold text-[color:var(--gn-ink)]">{t('No reviews yet')}</p>
                <p className="mt-1.5 text-[14px] text-[color:var(--gn-ink2)]">
                  {t('Customer reviews appear here once the product is published.')}
                </p>
              </div>
            </section>
          )}
          <div>
            <CreatorProductDeleteZone productId={product.id} productTitle={product.title} onDeleted={onDeleted} />
          </div>
        </div>
      </section>
    </div>
  );
}

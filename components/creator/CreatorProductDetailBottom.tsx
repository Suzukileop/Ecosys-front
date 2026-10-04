'use client';

import type { ReactNode } from 'react';
import { CreatorProductDeleteZone } from '@/components/creator/CreatorProductDeleteZone';
import { ProductReviewsList } from '@/components/marketplace/ProductReviewsList';
import { formatPrice, isFreeProduct, PRODUCT_TYPE_LABELS } from '@/lib/marketplace-api';
import { DEFAULT_PHYSICAL_STOCK, getStockStatus, STOCK_TONE_DOT } from '@/lib/product-stock';
import type { DeliveryMode, MarketplaceProductDetail } from '@/types/marketplace';

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
  return new Date(value).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
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
  const isPhysical = product.type === 'PHYSICAL';
  const free = isFreeProduct(product.priceCents);
  const stock = getStockStatus(product);
  const sales = product.salesCount ?? 0;
  const views = product.views ?? 0;
  const revenue = free
    ? '—'
    : new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: product.currency || 'EUR',
        minimumFractionDigits: 2,
      }).format((product.priceCents * sales) / 100);
  const conversion = views > 0 ? `${((sales / views) * 100).toFixed(1)}%` : '—';
  const conversionHint = `${sales.toLocaleString()} ${sales === 1 ? 'sale' : 'sales'} from ${views.toLocaleString()} ${
    views === 1 ? 'view' : 'views'
  }`;
  const reviewsLabel = reviewCount === 1 ? '1 review' : `${reviewCount.toLocaleString()} reviews`;
  const lastUpdated = product.updatedAt ?? product.createdAt;

  let title: string;
  let rows: Row[];
  let tiles: Tile[];

  if (isPhysical) {
    const photos = countPhotos(product);
    title = 'Inventory & sales';
    rows = [{ label: 'Type', value: 'Material product' }];
    if (stock.quantity != null) {
      const singleUnit = stock.quantity === DEFAULT_PHYSICAL_STOCK;
      rows.push(
        {
          label: 'Availability',
          value: (
            <span className="inline-flex items-center gap-2">
              <span className={`h-2 w-2 rounded-full ${STOCK_TONE_DOT[singleUnit ? 'ok' : stock.tone]}`} aria-hidden />
              {singleUnit ? 'In stock' : stock.label}
            </span>
          ),
        },
        { label: 'Units in stock', value: stock.quantity.toLocaleString() },
        {
          label: 'Stock value',
          value:
            free || stock.quantity <= 0 ? '—' : formatPrice(product.priceCents * stock.quantity, product.currency),
        }
      );
    }
    rows.push({ label: 'Photos', value: photos === 1 ? '1 photo' : `${photos} photos` });
    tiles = [
      { label: 'Units sold', value: sales.toLocaleString() },
      { label: 'Revenue', value: revenue },
      { label: 'Conversion', value: conversion, hint: conversionHint },
      { label: 'Customer reviews', value: reviewsLabel },
      { label: 'Listed on', value: formatProductDate(product.createdAt) },
      { label: 'Last update', value: formatProductDate(lastUpdated) },
    ];
  } else {
    title = 'Characteristics';
    rows = [{ label: 'Type', value: PRODUCT_TYPE_LABELS[product.type] ?? product.type }];
    if (product.deliveryMode) {
      rows.push({ label: 'Delivery', value: DELIVERY_LABELS[product.deliveryMode] ?? product.deliveryMode });
    }
    if (product.fileFormat) rows.push({ label: 'Format', value: product.fileFormat });
    if (product.fileSizeMb != null) rows.push({ label: 'File size', value: `${product.fileSizeMb} MB` });
    if (product.language) rows.push({ label: 'Language', value: product.language });
    if (product.version) rows.push({ label: 'Version', value: product.version });
    rows.push({ label: 'Availability', value: 'Unlimited copies' });
    tiles = [
      { label: 'Sales', value: sales.toLocaleString() },
      { label: 'Revenue', value: revenue },
      { label: 'Customer reviews', value: reviewsLabel },
      { label: 'Views', value: views.toLocaleString() },
      { label: 'Listed on', value: formatProductDate(product.createdAt) },
      { label: 'Last update', value: formatProductDate(lastUpdated) },
    ];
  }

  return (
    <div className="space-y-16 md:space-y-20">
      <section>
        <h2 className="text-xl font-semibold tracking-[-0.01em] text-[#111111] dark:text-white">{title}</h2>
        <div className="mt-5 overflow-hidden rounded-lg border border-black/[0.06] bg-white dark:border-white/[0.08] dark:bg-[#111111]">
          <div className="flex flex-col lg:flex-row">
            <dl className="w-full shrink-0 divide-y divide-black/[0.06] px-6 py-1 dark:divide-white/[0.08] lg:max-w-sm lg:border-r lg:border-black/[0.06] lg:dark:border-white/[0.08]">
              {rows.map((row) => (
                <div key={row.label} className="flex items-center justify-between gap-4 py-4 text-[15px]">
                  <dt className="text-neutral-500 dark:text-neutral-400">{row.label}</dt>
                  <dd className="text-right font-medium text-[#111111] tabular-nums dark:text-white">{row.value}</dd>
                </div>
              ))}
            </dl>

            <dl className="grid min-w-0 flex-1 grid-cols-2 gap-px border-t border-black/[0.06] bg-black/[0.06] dark:border-white/[0.08] dark:bg-white/[0.08] sm:grid-cols-3 lg:border-t-0">
              {tiles.map((tile) => (
                <div key={tile.label} className="bg-white px-6 py-5 dark:bg-[#111111]">
                  <dt className="text-sm text-neutral-500 dark:text-neutral-400">{tile.label}</dt>
                  <dd className="mt-2 text-xl font-semibold tracking-[-0.01em] text-[#111111] tabular-nums dark:text-white">
                    {tile.value}
                  </dd>
                  {tile.hint ? (
                    <dd className="mt-1 text-[13px] text-neutral-400 dark:text-neutral-500">{tile.hint}</dd>
                  ) : null}
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {middle}

      <section className="border-t border-black/[0.06] pt-16 dark:border-white/[0.08] md:pt-20">
        <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_300px] xl:grid-cols-[minmax(0,1fr)_320px]">
          {product.isPublished ? (
            <ProductReviewsList
              productId={product.id}
              loginRedirect={loginRedirect}
              initialReviewCount={product.reviewCount}
              initialAverageRating={product.averageRating}
            />
          ) : (
            <section>
              <h2 className="text-xl font-semibold tracking-[-0.01em] text-[#111111] dark:text-white">Customer reviews</h2>
              <div className="mt-5 rounded-lg border border-dashed border-black/[0.12] px-6 py-12 text-center dark:border-white/[0.14]">
                <p className="text-base font-medium text-[#111111] dark:text-white">No reviews yet</p>
                <p className="mt-2 text-[15px] text-neutral-500 dark:text-neutral-400">
                  Customer reviews appear here once the product is published.
                </p>
              </div>
            </section>
          )}
          <div className="lg:pt-12">
            <CreatorProductDeleteZone productId={product.id} productTitle={product.title} onDeleted={onDeleted} />
          </div>
        </div>
      </section>
    </div>
  );
}

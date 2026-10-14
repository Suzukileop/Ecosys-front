'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { fetchPublicProductClient, formatPrice } from '@/lib/marketplace-api';
import type { MarketplaceProductDetail } from '@/types/marketplace';
import { isVideoThumbnailUrl } from '@/lib/product-thumbnail';
import { MediaImage } from '@/components/ui/MediaImage';
import { ProductThumbnailMedia } from '@/components/marketplace/ProductThumbnailMedia';
import { useT } from '@/lib/i18n/I18nProvider';

function useProduct(productId: string) {
  const [product, setProduct] = useState<MarketplaceProductDetail | null | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    void fetchPublicProductClient(productId).then((result) => {
      if (!cancelled) setProduct(result);
    });
    return () => {
      cancelled = true;
    };
  }, [productId]);

  return product;
}

function productHref(productId: string) {
  return `/marketplace/products/${encodeURIComponent(productId)}`;
}

function ProductMedia({ src, width, className = '' }: { src: string; width: number; className?: string }) {
  if (isVideoThumbnailUrl(src)) {
    return <ProductThumbnailMedia url={src} className={`h-full w-full ${className}`} />;
  }
  return (
    <MediaImage
      src={src}
      width={width}
      className={`h-full w-full object-cover transition-transform duration-500 ${className}`}
    />
  );
}

/** Product shared in a message: large media, then title and price. */
export function MessageProductPreview({ productId }: { productId: string }) {
  const t = useT();
  const product = useProduct(productId);

  if (product === undefined) {
    return (
      <div className="w-[300px] max-w-full" aria-busy="true">
        <div className="aspect-[4/3] w-full animate-pulse bg-black/[0.06] dark:bg-white/[0.06]" />
        <div className="space-y-2 p-3.5">
          <div className="h-3.5 w-3/4 animate-pulse rounded bg-black/[0.06] dark:bg-white/[0.08]" />
          <div className="h-3 w-1/3 animate-pulse rounded bg-black/[0.06] dark:bg-white/[0.08]" />
        </div>
      </div>
    );
  }

  if (product === null) {
    return (
      <Link href={productHref(productId)} className="block w-[300px] max-w-full bg-[#F7F9F9] p-3.5 text-[15px] text-[#536471] hover:underline dark:bg-[#16181C] dark:text-[#71767B]">
        {t('View product →')}
      </Link>
    );
  }

  return (
    <Link
      href={productHref(productId)}
      className="group block w-[300px] max-w-full bg-[#F7F9F9] text-left dark:bg-[#16181C]"
    >
      <div className="aspect-[4/3] w-full overflow-hidden bg-black/[0.04] dark:bg-white/[0.05]">
        {product.thumbnailUrl ? (
          <ProductMedia src={product.thumbnailUrl} width={300} className="group-hover:scale-[1.03]" />
        ) : null}
      </div>
      <div className="flex items-end justify-between gap-3 p-3.5">
        <div className="min-w-0">
          <p className="line-clamp-2 text-[15px] font-semibold leading-snug text-[#0F1419] group-hover:underline dark:text-[#E7E9EA]">
            {product.title}
          </p>
          {product.creatorName && (
            <p className="mt-0.5 truncate text-[13px] text-[#536471] dark:text-[#71767B]">{t('by {creatorName}', { creatorName: product.creatorName })}</p>
          )}
        </div>
        <p className="shrink-0 text-[15px] font-bold tabular-nums text-[#0F1419] dark:text-[#E7E9EA]">
          {formatPrice(product.priceCents, product.currency)}
        </p>
      </div>
    </Link>
  );
}

/** Product attached to the message being written, shown above the composer. */
export function ComposerProductAttachment({ productId, onRemove }: { productId: string; onRemove: () => void }) {
  const t = useT();
  const product = useProduct(productId);

  return (
    <div className="flex items-center gap-3.5 rounded-2xl bg-[#F7F9F9] p-2.5 pr-3 dark:bg-[#16181C]">
      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-black/[0.05] dark:bg-white/[0.06]">
        {product?.thumbnailUrl ? <ProductMedia src={product.thumbnailUrl} width={64} /> : null}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[13px] leading-[18px] text-[#536471] dark:text-[#8B98A5]">{t('Product')}</p>
        {product === undefined ? (
          <div className="mt-1.5 h-3.5 w-2/3 animate-pulse rounded bg-black/[0.06] dark:bg-white/[0.08]" />
        ) : (
          <p className="mt-0.5 truncate text-[15px] font-bold text-[#0F1419] dark:text-[#E7E9EA]">
            {product?.title ?? t('Product')}
          </p>
        )}
        {product && (
          <p className="mt-0.5 text-[13px] tabular-nums text-[#536471] dark:text-[#71767B]">
            {formatPrice(product.priceCents, product.currency)}
          </p>
        )}
      </div>
      <button
        type="button"
        onClick={onRemove}
        aria-label={t('Remove product from message')}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[#536471] transition-colors hover:bg-[rgba(15,20,25,0.06)] hover:text-[#0F1419] dark:text-[#71767B] dark:hover:bg-[rgba(231,233,234,0.1)] dark:hover:text-[#E7E9EA]"
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden>
          <path d="M18 6 6 18M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

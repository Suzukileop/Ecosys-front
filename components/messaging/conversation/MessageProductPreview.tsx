'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { fetchPublicProductClient, formatPrice } from '@/lib/marketplace-api';
import type { MarketplaceProductDetail } from '@/types/marketplace';

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

function FadeInImage({ src, className = '' }: { src: string; className?: string }) {
  const [loaded, setLoaded] = useState(false);
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      ref={(el) => {
        if (el?.complete && !loaded) setLoaded(true);
      }}
      src={src}
      alt=""
      onLoad={() => setLoaded(true)}
      className={`h-full w-full object-cover transition-[opacity,transform] duration-500 ${
        loaded ? 'opacity-100' : 'opacity-0'
      } ${className}`}
    />
  );
}

/** Product shared in a message: large media, then title and price. */
export function MessageProductPreview({ productId }: { productId: string }) {
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
      <Link href={productHref(productId)} className="block w-[300px] max-w-full p-3.5 text-sm text-neutral-500 hover:underline">
        View product →
      </Link>
    );
  }

  return (
    <Link
      href={productHref(productId)}
      className="group block w-[300px] max-w-full bg-white text-left dark:bg-[#111111]"
    >
      <div className="aspect-[4/3] w-full overflow-hidden bg-black/[0.04] dark:bg-white/[0.05]">
        {product.thumbnailUrl ? (
          <FadeInImage src={product.thumbnailUrl} className="group-hover:scale-[1.03]" />
        ) : null}
      </div>
      <div className="flex items-end justify-between gap-3 p-3.5">
        <div className="min-w-0">
          <p className="line-clamp-2 text-[15px] font-semibold leading-snug text-[#111111] transition-colors group-hover:text-[#FF5722] dark:text-white">
            {product.title}
          </p>
          {product.creatorName && (
            <p className="mt-0.5 truncate text-xs text-neutral-500 dark:text-neutral-400">by {product.creatorName}</p>
          )}
        </div>
        <p className="shrink-0 text-[15px] font-semibold tabular-nums text-[#111111] dark:text-white">
          {formatPrice(product.priceCents, product.currency)}
        </p>
      </div>
    </Link>
  );
}

/** Product attached to the message being written, shown above the composer. */
export function ComposerProductAttachment({ productId, onRemove }: { productId: string; onRemove: () => void }) {
  const product = useProduct(productId);

  return (
    <div className="flex items-center gap-3.5 rounded-lg border border-black/[0.08] bg-white p-2.5 pr-3 dark:border-white/[0.1] dark:bg-[#161616]">
      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-md bg-black/[0.05] dark:bg-white/[0.06]">
        {product?.thumbnailUrl ? <FadeInImage src={product.thumbnailUrl} /> : null}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-neutral-400">Product</p>
        {product === undefined ? (
          <div className="mt-1.5 h-3.5 w-2/3 animate-pulse rounded bg-black/[0.06] dark:bg-white/[0.08]" />
        ) : (
          <p className="mt-0.5 truncate text-sm font-semibold text-[#111111] dark:text-white">
            {product?.title ?? 'Product'}
          </p>
        )}
        {product && (
          <p className="mt-0.5 text-[13px] font-medium tabular-nums text-neutral-600 dark:text-neutral-300">
            {formatPrice(product.priceCents, product.currency)}
          </p>
        )}
      </div>
      <button
        type="button"
        onClick={onRemove}
        aria-label="Remove product from message"
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-neutral-400 transition hover:bg-black/[0.05] hover:text-[#111111] dark:hover:bg-white/[0.08] dark:hover:text-white"
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden>
          <path d="M18 6 6 18M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

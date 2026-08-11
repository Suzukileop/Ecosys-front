'use client';

import Link from 'next/link';
import { isFreeProduct } from '@/lib/marketplace-api';

export const PRODUCT_PURCHASE_ANCHOR_ID = 'product-purchase';

type ProductDetailPurchaseCtaProps = {
  priceCents: number;
  priceLabel: string;
  isAuthenticated: boolean;
  loginRedirect: string;
  productTitle: string;
  className?: string;
};

function scrollToPurchasePanel() {
  document.getElementById(PRODUCT_PURCHASE_ANCHOR_ID)?.scrollIntoView({
    behavior: 'smooth',
    block: 'center',
  });
}

export function ProductDetailPurchaseCta({
  priceCents,
  priceLabel,
  isAuthenticated,
  loginRedirect,
  productTitle,
  className = '',
}: ProductDetailPurchaseCtaProps) {
  const free = isFreeProduct(priceCents);
  const signInHref = `/login?redirect=${encodeURIComponent(loginRedirect)}`;

  const headline = free ? 'Claim it for free' : 'Ready to get started?';
  const description = free
    ? `Add "${productTitle}" to your library instantly — no payment required.`
    : `Unlock "${productTitle}" and download it right after purchase.`;

  const primaryLabel = free ? `Get for free — ${priceLabel}` : `Buy now — ${priceLabel}`;
  const signInLabel = free ? `Sign in to claim — ${priceLabel}` : `Sign in to buy — ${priceLabel}`;

  const buttonClass =
    'inline-flex min-w-[200px] items-center justify-center rounded-xl bg-orange-500 px-8 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-orange-600 active:scale-[0.98]';

  return (
    <div className={`flex flex-col items-center gap-6 py-8 text-center sm:py-10 ${className}`}>
      <div className="space-y-2">
        <p className="text-lg font-semibold text-gray-900 dark:text-white">{headline}</p>
        <p className="mx-auto max-w-lg text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
          {description}
        </p>
      </div>

      <div className="flex w-full max-w-sm flex-col items-center gap-3">
        {isAuthenticated ? (
          <button type="button" onClick={scrollToPurchasePanel} className={buttonClass}>
            {primaryLabel}
          </button>
        ) : (
          <Link href={signInHref} className={buttonClass}>
            {signInLabel}
          </Link>
        )}
        <button
          type="button"
          onClick={scrollToPurchasePanel}
          className="text-sm text-neutral-500 underline-offset-2 transition hover:text-orange-600 hover:underline dark:text-neutral-400 dark:hover:text-orange-400"
        >
          View pricing &amp; access
        </button>
      </div>
    </div>
  );
}

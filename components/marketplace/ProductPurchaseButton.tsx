'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { isFreeProduct, simulateProductPurchase } from '@/lib/marketplace-api';
import { getApiErrorMessage } from '@/lib/api-error';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

type ProductPurchaseButtonProps = {
  productId: string;
  priceCents: number;
  priceLabel: string;
  isAuthenticated: boolean;
  loginRedirect: string;
  fullWidth?: boolean;
  hidePriceInLabel?: boolean;
};

export function ProductPurchaseButton({
  productId,
  priceCents,
  priceLabel,
  isAuthenticated,
  loginRedirect,
  fullWidth = false,
  hidePriceInLabel = false,
}: ProductPurchaseButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const free = isFreeProduct(priceCents);

  const widthClass = fullWidth ? 'w-full' : 'w-full sm:w-auto';

  const buyLabel = free
    ? hidePriceInLabel
      ? 'Get for free'
      : `Get for free — ${priceLabel}`
    : hidePriceInLabel
      ? 'Buy now'
      : `Buy now — ${priceLabel}`;
  const signInLabel = free
    ? hidePriceInLabel
      ? 'Sign in to get'
      : `Sign in to get — ${priceLabel}`
    : hidePriceInLabel
      ? 'Sign in to buy'
      : `Sign in to buy — ${priceLabel}`;

  if (!isAuthenticated) {
    return (
      <Link
        href={`/login?redirect=${encodeURIComponent(loginRedirect)}`}
        className={`inline-flex ${widthClass} items-center justify-center rounded-xl bg-orange-500 px-6 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-orange-600`}
      >
        {signInLabel}
      </Link>
    );
  }

  const onPurchase = async () => {
    setLoading(true);
    setError(null);
    try {
      await simulateProductPurchase(productId);
      setSuccess(true);
      router.refresh();
    } catch (e) {
      setError(getApiErrorMessage(e, free ? 'Unable to claim this product.' : 'Purchase failed. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="space-y-3">
        <p className="rounded-xl bg-green-50 px-4 py-3 text-sm text-green-800 dark:bg-green-500/10 dark:text-green-200">
          {free
            ? 'Added to your library! Open it anytime to stream or download.'
            : 'Purchase complete! Open your library to stream or download your content.'}
        </p>
        <Link
          href="/marketplace?tab=purchases"
          className={`inline-flex ${widthClass} items-center justify-center rounded-xl border border-orange-300 px-6 py-3 text-sm font-semibold text-orange-700 hover:bg-orange-50 dark:border-orange-500/40 dark:text-orange-300 dark:hover:bg-orange-500/10`}
        >
          View my library
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={() => void onPurchase()}
        disabled={loading}
        className={`inline-flex ${widthClass} items-center justify-center rounded-xl bg-orange-500 px-6 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-orange-600 disabled:opacity-60`}
      >
        {loading ? (
          <>
            <LoadingSpinner size="sm" />
            <span className="ml-2">Processing…</span>
          </>
        ) : (
          buyLabel
        )}
      </button>
      <p className="text-xs text-gray-500 dark:text-gray-400">
        {free ? 'Simulated claim — no payment required.' : 'Simulated purchase — no real payment charged.'}
      </p>
      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
}

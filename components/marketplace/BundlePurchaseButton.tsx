'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { simulateBundlePurchase } from '@/lib/marketplace-api';
import { getApiErrorMessage } from '@/lib/api-error';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

type BundlePurchaseButtonProps = {
  bundleId: string;
  priceLabel: string;
  isAuthenticated: boolean;
  loginRedirect: string;
};

export function BundlePurchaseButton({
  bundleId,
  priceLabel,
  isAuthenticated,
  loginRedirect,
}: BundlePurchaseButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isAuthenticated) {
    return (
      <Link
        href={`/login?redirect=${encodeURIComponent(loginRedirect)}`}
        className="inline-flex w-full items-center justify-center rounded-xl bg-orange-500 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-orange-600 sm:w-auto"
      >
        Sign in to buy bundle — {priceLabel}
      </Link>
    );
  }

  const onPurchase = async () => {
    setLoading(true);
    setError(null);
    try {
      await simulateBundlePurchase(bundleId);
      setSuccess(true);
      router.refresh();
    } catch (e) {
      setError(getApiErrorMessage(e, 'Bundle purchase failed. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="space-y-3">
        <p className="rounded-xl bg-green-50 px-4 py-3 text-sm text-green-800">
          Bundle purchased! All included products are now in your library.
        </p>
        <Link
          href="/marketplace?tab=purchases"
          className="inline-flex items-center justify-center rounded-xl border border-orange-300 px-6 py-3 text-sm font-semibold text-orange-700 hover:bg-orange-50"
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
        className="inline-flex w-full items-center justify-center rounded-xl bg-orange-500 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-orange-600 disabled:opacity-60 sm:w-auto"
      >
        {loading ? (
          <>
            <LoadingSpinner size="sm" />
            <span className="ml-2">Processing…</span>
          </>
        ) : (
          `Buy bundle — ${priceLabel}`
        )}
      </button>
      <p className="text-xs text-gray-500">Simulated purchase — no real payment charged.</p>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}

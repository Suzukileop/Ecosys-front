'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { simulateBundlePurchase } from '@/lib/marketplace-api';
import { getApiErrorMessage } from '@/lib/api-error';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useT } from '@/lib/i18n/I18nProvider';

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
  const t = useT();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isAuthenticated) {
    return (
      <Link
        href={`/login?redirect=${encodeURIComponent(loginRedirect)}`}
        className="inline-flex h-11 w-full items-center justify-center bg-[#0F1419] px-6 text-[15px] font-bold text-white transition-colors hover:bg-[#272C30] dark:bg-[#EFF3F4] dark:text-[#0F1419] dark:hover:bg-[#D7DBDC] sm:w-auto"
      >
        {t('Sign in to buy bundle — {priceLabel}', { priceLabel })}
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
      setError(getApiErrorMessage(e, t('Bundle purchase failed. Please try again.')));
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="space-y-3">
        <p className="bg-[#F7F9F9] px-4 py-3 text-[15px] text-[#0F1419] dark:bg-[#16181C] dark:text-[#E7E9EA]">
          {t('Bundle purchased. Open any included product to download it.')}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={() => void onPurchase()}
        disabled={loading}
        className="inline-flex h-11 w-full items-center justify-center bg-[#0F1419] px-6 text-[15px] font-bold text-white transition-colors hover:bg-[#272C30] disabled:opacity-60 dark:bg-[#EFF3F4] dark:text-[#0F1419] dark:hover:bg-[#D7DBDC] sm:w-auto"
      >
        {loading ? (
          <>
            <LoadingSpinner size="sm" />
            <span className="ml-2">{t('Processing…')}</span>
          </>
        ) : (
          `Buy bundle — ${priceLabel}`
        )}
      </button>
      <p className="text-[13px] text-[#536471] dark:text-[#71767B]">{t('Simulated purchase — no real payment charged.')}</p>
      {error && <p className="text-[13px] text-[#F4212E]">{error}</p>}
    </div>
  );
}

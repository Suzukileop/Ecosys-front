'use client';

import { useState } from 'react';
import { getPurchaseAccess } from '@/lib/marketplace-api';
import { getApiErrorMessage } from '@/lib/api-error';
import { triggerBrowserDownload } from '@/lib/download';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import type { DeliveryMode } from '@/types/marketplace';

type PurchaseAccessButtonProps = {
  purchaseId: string;
  deliveryMode: DeliveryMode;
  mode?: 'download' | 'stream';
  className?: string;
  variant?: 'primary' | 'secondary';
  fullWidth?: boolean;
  size?: 'default' | 'pill' | 'card';
};

function canDownload(deliveryMode: DeliveryMode): boolean {
  return deliveryMode === 'DOWNLOAD' || deliveryMode === 'BOTH';
}

function canStream(deliveryMode: DeliveryMode): boolean {
  return deliveryMode === 'STREAM_ONLY' || deliveryMode === 'BOTH';
}

const primaryClass =
  'inline-flex items-center justify-center gap-2 rounded-xl bg-orange-200 px-4 py-3.5 text-sm font-bold text-orange-950 transition hover:bg-orange-300 disabled:opacity-60 dark:bg-orange-500 dark:text-white dark:hover:bg-orange-600';
const secondaryClass =
  'inline-flex items-center justify-center gap-2 rounded-xl border border-stone-200 bg-white px-4 py-3.5 text-sm font-semibold text-gray-800 transition hover:border-orange-200 hover:bg-orange-50 disabled:opacity-60 dark:border-neutral-600 dark:bg-neutral-800 dark:text-gray-100 dark:hover:border-orange-500/40';

const pillClass =
  'inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:opacity-60 dark:bg-orange-500 dark:hover:bg-orange-600';
const cardActionClass =
  'inline-flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:opacity-60 dark:bg-orange-500 dark:hover:bg-orange-600';

export function PurchaseAccessButton({
  purchaseId,
  deliveryMode,
  mode = 'download',
  className = '',
  variant = 'primary',
  fullWidth = false,
  size = 'default',
}: PurchaseAccessButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const allowed = mode === 'download' ? canDownload(deliveryMode) : canStream(deliveryMode);
  if (!allowed) return null;

  const label = mode === 'download' ? 'Download' : 'Stream';
  const widthClass = fullWidth || size === 'card' ? 'w-full' : '';
  const variantClass =
    size === 'card'
      ? cardActionClass
      : size === 'pill'
        ? pillClass
        : variant === 'primary'
          ? primaryClass
          : secondaryClass;

  const onClick = async () => {
    setLoading(true);
    setError(null);
    try {
      const access = await getPurchaseAccess(purchaseId, mode);
      if (mode === 'download') {
        triggerBrowserDownload(access.url, access.filename ?? undefined);
      } else {
        window.open(access.url, '_blank', 'noopener,noreferrer');
      }
    } catch (e) {
      setError(getApiErrorMessage(e, `Unable to ${mode} this file.`));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={fullWidth || size === 'card' ? 'w-full' : undefined}>
      <button
        type="button"
        onClick={() => void onClick()}
        disabled={loading}
        className={`${variantClass} ${widthClass} ${className}`.trim()}
      >
        {loading ? (
          <>
            <LoadingSpinner size="sm" />
            <span>Preparing…</span>
          </>
        ) : (
          <>
            {mode === 'download' ? <DownloadIcon /> : <StreamIcon />}
            <span>{label}</span>
          </>
        )}
      </button>
      {error && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
}

export function PurchaseAccessActions({
  purchaseId,
  deliveryMode,
  fullWidth = true,
}: {
  purchaseId: string;
  deliveryMode: DeliveryMode;
  fullWidth?: boolean;
}) {
  const showDownload = canDownload(deliveryMode);
  const showStream = canStream(deliveryMode);

  if (!showDownload && !showStream) return null;

  return (
    <div className={`flex flex-col gap-2 ${fullWidth ? 'w-full' : ''}`}>
      {showDownload && (
        <PurchaseAccessButton
          purchaseId={purchaseId}
          deliveryMode={deliveryMode}
          mode="download"
          variant="primary"
          fullWidth={fullWidth}
        />
      )}
      {showStream && (
        <PurchaseAccessButton
          purchaseId={purchaseId}
          deliveryMode={deliveryMode}
          mode="stream"
          variant={showDownload ? 'secondary' : 'primary'}
          fullWidth={fullWidth}
        />
      )}
    </div>
  );
}

function DownloadIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4" />
    </svg>
  );
}

function StreamIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

export { canDownload, canStream };

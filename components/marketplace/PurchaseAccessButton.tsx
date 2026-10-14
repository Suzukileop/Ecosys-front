'use client';

import { useState } from 'react';
import { getPurchaseAccess } from '@/lib/marketplace-api';
import { getApiErrorMessage } from '@/lib/api-error';
import { triggerBrowserDownload } from '@/lib/download';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import type { DeliveryMode } from '@/types/marketplace';
import { useT } from '@/lib/i18n/I18nProvider';

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

// X palette, black & white: primary = ink fill, secondary = hairline outline. Square like the page CTAs.
const primaryClass =
  'inline-flex h-11 items-center justify-center gap-2 bg-[#0F1419] px-4 text-[15px] font-bold text-white transition-colors hover:bg-[#272C30] disabled:opacity-60 dark:bg-[#EFF3F4] dark:text-[#0F1419] dark:hover:bg-[#D7DBDC]';
const secondaryClass =
  'inline-flex h-11 items-center justify-center gap-2 border border-[#CFD9DE] px-4 text-[15px] font-bold text-[#0F1419] transition-colors hover:bg-[rgba(15,20,25,0.06)] disabled:opacity-60 dark:border-[#536471] dark:text-[#E7E9EA] dark:hover:bg-[rgba(231,233,234,0.1)]';

const pillClass =
  'inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-full bg-[#0F1419] px-5 text-[14px] font-bold text-white transition-colors hover:bg-[#272C30] disabled:opacity-60 dark:bg-[#EFF3F4] dark:text-[#0F1419] dark:hover:bg-[#D7DBDC]';
const cardActionClass =
  'inline-flex h-11 w-full items-center justify-center gap-2 bg-[#0F1419] px-4 text-[15px] font-bold text-white transition-colors hover:bg-[#272C30] disabled:opacity-60 dark:bg-[#EFF3F4] dark:text-[#0F1419] dark:hover:bg-[#D7DBDC]';

export function PurchaseAccessButton({
  purchaseId,
  deliveryMode,
  mode = 'download',
  className = '',
  variant = 'primary',
  fullWidth = false,
  size = 'default',
}: PurchaseAccessButtonProps) {
  const t = useT();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const allowed = mode === 'download' ? canDownload(deliveryMode) : canStream(deliveryMode);
  if (!allowed) return null;

  const label = mode === 'download' ? t('Download') : t('Stream');
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
      setError(getApiErrorMessage(e, t('Unable to {mode} this file.', { mode })));
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
            <span>{t('Preparing…')}</span>
          </>
        ) : (
          <>
            {mode === 'download' ? <DownloadIcon /> : <StreamIcon />}
            <span>{label}</span>
          </>
        )}
      </button>
      {error && <p className="mt-2 text-[13px] text-[#F4212E]">{error}</p>}
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

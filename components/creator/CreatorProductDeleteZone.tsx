'use client';

import { useState } from 'react';
import { deleteProduct } from '@/lib/marketplace-api';
import { getApiErrorMessage } from '@/lib/api-error';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useT } from '@/lib/i18n/I18nProvider';

type CreatorProductDeleteZoneProps = {
  productId: string;
  productTitle: string;
  onDeleted: () => void;
};

export function CreatorProductDeleteZone({
  productId,
  productTitle,
  onDeleted,
}: CreatorProductDeleteZoneProps) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const normalize = (value: string) => value.trim().replace(/\s+/g, ' ').toLowerCase();
  const canDelete = normalize(confirmText) !== '' && normalize(confirmText) === normalize(productTitle);

  const reset = () => {
    setOpen(false);
    setConfirmText('');
    setError(null);
  };

  const handleDelete = async () => {
    if (!canDelete) return;
    setDeleting(true);
    setError(null);
    try {
      await deleteProduct(productId);
      onDeleted();
    } catch (e) {
      setError(getApiErrorMessage(e, t('Delete failed.')));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <section className="gn-rail-box p-6">
      <div className="flex flex-col items-start gap-5">
        <div>
          <h3 className="inline-flex items-center gap-2 text-[17px] font-bold leading-[22px] text-[color:var(--gn-ink)]">
            <span aria-hidden className="h-2 w-2 rounded-full bg-[#F4212E]" />
            {t('Danger zone')}
          </h3>
          <p className="mt-1.5 text-[14px] leading-5 text-[color:var(--gn-ink2)]">
            {t('Deleting a product is permanent. Purchases and download history may be affected.')}
          </p>
        </div>
        {!open ? (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="h-11 w-full rounded-full px-5 text-[15px] font-bold text-[#F4212E] shadow-[inset_0_0_0_1px_rgba(244,33,46,0.45)] transition hover:bg-[rgba(244,33,46,0.08)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F4212E]/40 sm:w-auto"
          >
            {t('Delete this product…')}
          </button>
        ) : null}
      </div>

      {open ? (
        <div className="mt-5 space-y-3 pt-5 shadow-[inset_0_1px_0_var(--gn-line)]">
          <label htmlFor="delete-confirm" className="block text-[14px] leading-5 text-[color:var(--gn-ink2)]">
            {t('To confirm, type the product name')}
            <span className="mt-1.5 block w-fit max-w-full break-words bg-[color:var(--gn-surface)] px-2 py-1 font-semibold text-[color:var(--gn-ink)]">
              {productTitle}
            </span>
          </label>
          <input
            id="delete-confirm"
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder={t('Product name')}
            className="h-11 w-full rounded-full border-0 bg-[color:var(--gn-surface)] px-4 text-[15px] text-[color:var(--gn-ink)] outline-none transition placeholder:text-[color:var(--gn-ink3)] focus:shadow-[inset_0_0_0_2px_#F4212E]"
            autoComplete="off"
          />
          {error && <p className="text-[13px] font-medium text-[#F4212E]">{error}</p>}
          <div className="flex flex-wrap justify-end gap-1">
            <button
              type="button"
              onClick={reset}
              disabled={deleting}
              className="h-11 rounded-full px-5 text-[15px] font-bold text-[color:var(--gn-ink)] shadow-[inset_0_0_0_1px_#CFD9DE] transition hover:bg-[color:var(--gn-hover)] dark:shadow-[inset_0_0_0_1px_#536471]"
            >
              {t('Cancel')}
            </button>
            <button
              type="button"
              onClick={() => void handleDelete()}
              disabled={!canDelete || deleting}
              className="inline-flex h-11 items-center gap-2 rounded-full bg-[#F4212E] px-5 text-[15px] font-bold text-white transition hover:bg-[#DC1E29] disabled:opacity-40"
            >
              {deleting && <LoadingSpinner size="sm" />}
              {t('Delete permanently')}
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}

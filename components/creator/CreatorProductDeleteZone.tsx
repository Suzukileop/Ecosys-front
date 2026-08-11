'use client';

import { useState } from 'react';
import { deleteProduct } from '@/lib/marketplace-api';
import { getApiErrorMessage } from '@/lib/api-error';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

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
  const [open, setOpen] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canDelete = confirmText.trim() === productTitle.trim();

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
      setError(getApiErrorMessage(e, 'Delete failed.'));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <section className="rounded-2xl border border-red-200/80 bg-red-50/40 p-6 dark:border-red-500/25 dark:bg-red-500/5">
      <h2 className="text-sm font-semibold text-red-800 dark:text-red-300">Danger zone</h2>
      <p className="mt-1 text-sm text-red-700/90 dark:text-red-300/80">
        Deleting a product is permanent. Purchases and download history may be affected.
      </p>

      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="mt-4 rounded-xl border border-red-300 bg-white px-4 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-50 dark:border-red-500/40 dark:bg-neutral-900 dark:text-red-300 dark:hover:bg-red-500/10"
        >
          Delete this product…
        </button>
      ) : (
        <div className="mt-4 space-y-4 rounded-xl border border-red-200 bg-white p-4 dark:border-red-500/30 dark:bg-neutral-900">
          <p className="text-sm font-medium text-neutral-900 dark:text-white">
            Type <span className="font-bold text-red-700 dark:text-red-400">{productTitle}</span> to confirm
            deletion.
          </p>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder={productTitle}
            className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-950"
            autoComplete="off"
          />
          {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={reset}
              disabled={deleting}
              className="rounded-full border border-neutral-300 px-4 py-2 text-sm font-semibold text-neutral-700 hover:bg-neutral-50 dark:border-neutral-600 dark:text-neutral-300 dark:hover:bg-neutral-800"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => void handleDelete()}
              disabled={!canDelete || deleting}
              className="inline-flex items-center gap-2 rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
            >
              {deleting && <LoadingSpinner size="sm" />}
              Delete permanently
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

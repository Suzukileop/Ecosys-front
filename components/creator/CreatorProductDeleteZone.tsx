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
      setError(getApiErrorMessage(e, 'Delete failed.'));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <section className="rounded-lg border border-black/[0.06] bg-white p-6 dark:border-white/[0.08] dark:bg-[#111111]">
      <div className="flex flex-col items-start gap-5">
        <div>
          <h3 className="inline-flex items-center gap-2 text-[15px] font-semibold text-[#111111] dark:text-white">
            <span aria-hidden className="h-2 w-2 rounded-full bg-[#E0431A] dark:bg-[#FF7A52]" />
            Danger zone
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
            Deleting a product is permanent. Purchases and download history may be affected.
          </p>
        </div>
        {!open ? (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="h-11 w-full rounded-lg border border-black/[0.1] px-4 text-sm font-medium text-[#E0431A] transition hover:border-[#E0431A]/40 hover:bg-[#E0431A]/[0.04] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5722] dark:border-white/[0.14] dark:text-[#FF7A52] dark:hover:border-[#FF7A52]/40 dark:hover:bg-[#FF7A52]/[0.06]"
          >
            Delete this product…
          </button>
        ) : null}
      </div>

      {open ? (
        <div className="mt-5 space-y-3 border-t border-black/[0.06] pt-5 dark:border-white/[0.08]">
          <label htmlFor="delete-confirm" className="block text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">
            To confirm, type the product name
            <span className="mt-1.5 block w-fit max-w-full break-words rounded-md bg-black/[0.05] px-2 py-1 font-medium text-[#111111] dark:bg-white/[0.08] dark:text-white">
              {productTitle}
            </span>
          </label>
          <input
            id="delete-confirm"
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="Product name"
            className="h-11 w-full rounded-lg border border-black/[0.1] bg-transparent px-3.5 text-sm text-[#111111] outline-none transition placeholder:text-neutral-400 focus:border-[#FF5722] focus:ring-2 focus:ring-[#FF5722]/20 dark:border-white/[0.14] dark:text-white"
            autoComplete="off"
          />
          {error && <p className="text-sm text-[#E0431A] dark:text-[#FF7A52]">{error}</p>}
          <div className="flex flex-wrap justify-end gap-1">
            <button
              type="button"
              onClick={reset}
              disabled={deleting}
              className="h-11 rounded-lg px-5 text-sm font-medium text-neutral-600 transition hover:text-[#111111] dark:text-neutral-300 dark:hover:text-white"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => void handleDelete()}
              disabled={!canDelete || deleting}
              className="inline-flex h-11 items-center gap-2 rounded-lg bg-[#E0431A] px-5 text-sm font-medium text-white transition hover:bg-[#c93a15] disabled:opacity-40"
            >
              {deleting && <LoadingSpinner size="sm" />}
              Delete permanently
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}

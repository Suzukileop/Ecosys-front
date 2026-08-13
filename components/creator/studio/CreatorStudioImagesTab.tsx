'use client';

import { useCallback, useEffect, useState } from 'react';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { getApiErrorMessage } from '@/lib/api-error';
import {
  listCreatorProfileImages,
  restoreCreatorProfileImage,
  type CreatorProfileImageItem,
} from '@/lib/creator-profile-images-api';
import { pushFlashFeedback } from '@/stores/flashFeedbackStore';

function formatAddedAt(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

function ImageTile({
  item,
  restoringId,
  onRestore,
}: {
  item: CreatorProfileImageItem;
  restoringId: string | null;
  onRestore: (id: string) => void;
}) {
  const busy = restoringId === item.id;

  return (
    <li className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
      <div className="relative aspect-square bg-neutral-100 dark:bg-neutral-950">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={item.url} alt="" className="h-full w-full object-cover" />
        {item.current ? (
          <span className="absolute left-2 top-2 rounded-full bg-orange-500 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-white shadow-sm">
            Current
          </span>
        ) : null}
      </div>
      <div className="flex items-center justify-between gap-3 px-3 py-3">
        <p className="min-w-0 truncate text-xs text-neutral-500 dark:text-neutral-400">
          {formatAddedAt(item.createdAt)}
        </p>
        {!item.current ? (
          <button
            type="button"
            disabled={busy || restoringId != null}
            onClick={() => onRestore(item.id)}
            className="shrink-0 rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-800 transition hover:bg-neutral-50 disabled:opacity-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:hover:bg-neutral-800"
          >
            {busy ? 'Restoring…' : 'Use'}
          </button>
        ) : (
          <span className="shrink-0 text-xs font-medium text-neutral-400 dark:text-neutral-500">
            Active
          </span>
        )}
      </div>
    </li>
  );
}

type CreatorStudioImagesTabProps = {
  onImagesUpdated?: () => void;
};

export function CreatorStudioImagesTab({ onImagesUpdated }: CreatorStudioImagesTabProps) {
  const [items, setItems] = useState<CreatorProfileImageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [restoringId, setRestoringId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
      const data = await listCreatorProfileImages();
      setItems(data);
    } catch (e) {
      setError(getApiErrorMessage(e, 'Could not load image history.'));
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handleRestore = useCallback(
    async (imageId: string) => {
      try {
        setRestoringId(imageId);
        setError(null);
        await restoreCreatorProfileImage(imageId);
        await load();
        onImagesUpdated?.();
        pushFlashFeedback({
          variant: 'success',
          title: 'Profile photo restored',
        });
      } catch (e) {
        setError(getApiErrorMessage(e, 'Could not restore this image.'));
      } finally {
        setRestoringId(null);
      }
    },
    [load, onImagesUpdated]
  );

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">Images</h1>
        <p className="mt-1 max-w-2xl text-sm text-neutral-500 dark:text-neutral-400">
          Every profile photo you upload is saved here. Replacing your avatar only sets a new current
          one — previous photos stay in this library.
        </p>
      </div>

      {error ? <ErrorAlert message={error} onDismiss={() => setError(null)} /> : null}

      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-neutral-200 bg-white px-5 py-10 text-center text-sm text-neutral-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400">
          No profile photos yet. Upload one from the profile header.
        </div>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {items.map((item) => (
            <ImageTile
              key={item.id}
              item={item}
              restoringId={restoringId}
              onRestore={handleRestore}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

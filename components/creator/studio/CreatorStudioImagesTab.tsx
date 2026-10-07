'use client';

import { useCallback, useEffect, useState } from 'react';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { MediaImage } from '@/components/ui/MediaImage';
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
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
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
    <li className="group">
      <div
        className={`relative aspect-[4/5] overflow-hidden rounded-lg bg-neutral-100 dark:bg-neutral-900 ${
          item.current
            ? 'ring-2 ring-[#111111] ring-offset-4 ring-offset-[#F9F9F9] dark:ring-white dark:ring-offset-black'
            : ''
        }`}
      >
        <MediaImage
          src={item.url}
          widths={[256, 384, 640]}
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
          className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
        />
        {!item.current ? (
          <div className="absolute inset-x-0 bottom-0 flex justify-center bg-gradient-to-t from-black/45 to-transparent p-4 pt-12 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-within:opacity-100 [@media(hover:none)]:opacity-100">
            <button
              type="button"
              disabled={busy || restoringId != null}
              onClick={() => onRestore(item.id)}
              className="rounded-full bg-white px-5 py-2.5 text-[15px] font-medium text-[#111111] shadow-sm transition-transform hover:scale-[1.03] disabled:opacity-60"
            >
              {busy ? 'Applying…' : 'Use as profile photo'}
            </button>
          </div>
        ) : null}
      </div>
      <div className="mt-4 flex items-center justify-between gap-3">
        <time dateTime={item.createdAt} className="truncate text-[15px] text-neutral-500 dark:text-neutral-400">
          {formatAddedAt(item.createdAt)}
        </time>
        {item.current ? (
          <span className="inline-flex shrink-0 items-center gap-2 text-[15px] font-medium text-[#111111] dark:text-white">
            <span className="h-1.5 w-1.5 rounded-full bg-[#111111] dark:bg-white" aria-hidden />
            Current
          </span>
        ) : null}
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
    <div className="space-y-10">
      <div>
        <h2 className="text-[1.5rem] font-bold tracking-[-0.01em] text-[#111111] dark:text-white">
          Profile
        </h2>
        <p className="mt-2 max-w-xl text-base leading-relaxed text-neutral-500 dark:text-neutral-400">
          Every photo you have used. Pick one to make it your profile photo again.
        </p>
      </div>

      {error ? <ErrorAlert message={error} onDismiss={() => setError(null)} /> : null}

      {items.length === 0 ? (
        <div className="rounded-xl bg-[#FFFFFF] px-6 py-16 text-center dark:bg-[#111111]">
          <p className="text-base text-neutral-500 dark:text-neutral-400">
            No profile photos yet. Upload one from the profile header.
          </p>
        </div>
      ) : (
        <ul className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 sm:gap-x-8 sm:gap-y-12">
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

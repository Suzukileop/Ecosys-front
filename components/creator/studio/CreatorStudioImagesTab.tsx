'use client';

import { localeTag } from '@/lib/i18n/active';
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
import { useT } from '@/lib/i18n/I18nProvider';

function formatAddedAt(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString(localeTag(), { month: 'short', day: 'numeric', year: 'numeric' });
}

/**
 * One photo. The current one is the bento's large tile — two columns by two rows from sm (the full
 * row on phones) — its image filling whatever height the rows beside it set, labelled "Current" on
 * the picture itself instead of a ring around it. The others are 4:5 tiles whose "Use as profile
 * photo" (square, like the page's buttons) rises from the bottom under the pointer.
 */
function ImageTile({
  item,
  restoringId,
  onRestore,
}: {
  item: CreatorProfileImageItem;
  restoringId: string | null;
  onRestore: (id: string) => void;
}) {
  const t = useT();
  const busy = restoringId === item.id;
  const featured = item.current;

  return (
    <li className={`group flex flex-col ${featured ? 'col-span-2 sm:row-span-2' : ''}`}>
      <div
        className={`relative aspect-[4/5] overflow-hidden bg-[color:var(--gn-surface)] ${
          featured ? 'sm:aspect-auto sm:min-h-0 sm:flex-1' : ''
        }`}
      >
        <MediaImage
          src={item.url}
          widths={featured ? [384, 640, 960] : [256, 384, 640]}
          sizes={
            featured
              ? '(min-width: 1024px) 50vw, 100vw'
              : '(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw'
          }
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
        />
        {featured ? (
          <span className="absolute left-3 top-3 bg-black/70 px-2 py-1 text-[11px] font-bold uppercase leading-4 tracking-[0.12em] text-white backdrop-blur-xs">
            {t('Current')}
          </span>
        ) : (
          <div className="absolute inset-x-0 bottom-0 flex justify-center bg-gradient-to-t from-black/55 to-transparent p-4 pt-12 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-within:opacity-100 [@media(hover:none)]:opacity-100">
            <button
              type="button"
              disabled={busy || restoringId != null}
              onClick={() => onRestore(item.id)}
              className="inline-flex h-10 items-center bg-white px-4 text-[14px] font-bold text-[#0F1419] transition-colors hover:bg-[#EFF3F4] disabled:opacity-60"
            >
              {busy ? t('Applying…') : t('Use as profile photo')}
            </button>
          </div>
        )}
      </div>
      <time dateTime={item.createdAt} className="mt-2 block truncate text-[13px] leading-[18px] text-[color:var(--gn-ink2)]">
        {featured ? (
          <>
            <span className="font-semibold text-[color:var(--gn-ink)]">{t('Profile photo')}</span> {t('since')} {formatAddedAt(item.createdAt)}
          </>
        ) : (
          formatAddedAt(item.createdAt)
        )}
      </time>
    </li>
  );
}

type CreatorStudioImagesTabProps = {
  onImagesUpdated?: () => void;
};

export function CreatorStudioImagesTab({ onImagesUpdated }: CreatorStudioImagesTabProps) {
  const t = useT();
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
      setError(getApiErrorMessage(e, t('Could not load image history.')));
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [t]);

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
          title: t('Profile photo restored'),
        });
      } catch (e) {
        setError(getApiErrorMessage(e, t('Could not restore this image.')));
      } finally {
        setRestoringId(null);
      }
    },
    [load, onImagesUpdated, t]
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
        <h2 className="text-[20px] font-extrabold leading-6 tracking-[-0.01em] text-[color:var(--gn-ink)]">
          {t('Photos')}
        </h2>
        <p className="mt-1 max-w-xl text-[15px] leading-5 text-[color:var(--gn-ink2)]">
          {t('Every photo you have used. Hover one to make it your profile photo again.')}
        </p>
      </div>

      {error ? <ErrorAlert message={error} onDismiss={() => setError(null)} /> : null}

      {items.length === 0 ? (
        <div className="gn-card px-6 py-12 text-center">
          <p className="text-[15px] leading-5 text-[color:var(--gn-ink2)]">
            {t('No profile photos yet. Upload one from the profile header.')}
          </p>
        </div>
      ) : (
        <ul className="grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 sm:gap-x-4 sm:gap-y-6">
          {/* The current photo leads, whatever the history order. */}
          {[...items].sort((a, b) => Number(b.current) - Number(a.current)).map((item) => (
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

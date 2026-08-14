'use client';

import { useEffect, useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { getApiErrorMessage } from '@/lib/api-error';
import { updateCreatorProfile } from '@/lib/creator-profile-api';
import { uploadShopCover } from '@/lib/marketplace-api';
import api from '@/lib/api';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { isVideoThumbnailUrl } from '@/lib/product-thumbnail';
import type { CreatorProfileDto } from '@/types/ecosystem';

const COVER_ACCEPT = 'image/jpeg,image/png,image/webp,video/mp4,video/webm,.jpg,.jpeg,.png,.webp,.mp4,.webm';

/**
 * Shop settings: what you sell, description, cover media, shop name.
 */
export function CreatorShopSettingsFields() {
  const coverInputRef = useRef<HTMLInputElement>(null);
  const [sellingFocus, setSellingFocus] = useState('');
  const [description, setDescription] = useState('');
  const [shopName, setShopName] = useState('');
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [saved, setSaved] = useState({
    sellingFocus: '',
    description: '',
    shopName: '',
    coverUrl: null as string | null,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [justSaved, setJustSaved] = useState(false);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const res = await api.get<CreatorProfileDto>('/api/creator/profile');
        if (cancelled) return;
        const focus = (res.data.shopSellingFocus ?? '').trim();
        const desc = (res.data.shopDescription ?? '').trim();
        const shop = (res.data.shopName ?? '').trim();
        const cover = (res.data.shopCoverUrl ?? '').trim() || null;
        setSellingFocus(focus);
        setDescription(desc);
        setShopName(shop);
        setCoverUrl(cover);
        setSaved({ sellingFocus: focus, description: desc, shopName: shop, coverUrl: cover });
      } catch (e) {
        if (!cancelled) {
          setError(getApiErrorMessage(e, 'Could not load shop settings.'));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    return () => {
      if (coverPreview) URL.revokeObjectURL(coverPreview);
    };
  }, [coverPreview]);

  const dirty =
    sellingFocus.trim() !== saved.sellingFocus.trim() ||
    description.trim() !== saved.description.trim() ||
    shopName.trim() !== saved.shopName.trim();

  const displayCover = coverPreview ?? coverUrl;

  const save = async () => {
    if (!dirty || saving) return;
    try {
      setSaving(true);
      setError(null);
      const updated = await updateCreatorProfile({
        shopSellingFocus: sellingFocus.trim(),
        shopDescription: description.trim(),
        shopName: shopName.trim(),
      });
      const focus = (updated.shopSellingFocus ?? '').trim();
      const desc = (updated.shopDescription ?? '').trim();
      const shop = (updated.shopName ?? '').trim();
      const cover = (updated.shopCoverUrl ?? '').trim() || null;
      setSellingFocus(focus);
      setDescription(desc);
      setShopName(shop);
      setCoverUrl(cover);
      setSaved({ sellingFocus: focus, description: desc, shopName: shop, coverUrl: cover });
      setJustSaved(true);
      window.setTimeout(() => setJustSaved(false), 1800);
    } catch (e) {
      setError(getApiErrorMessage(e, 'Could not save shop settings.'));
    } finally {
      setSaving(false);
    }
  };

  const onCoverSelect = async (file: File | undefined) => {
    if (!file || uploadingCover) return;
    const objectUrl = URL.createObjectURL(file);
    setCoverPreview((previous) => {
      if (previous) URL.revokeObjectURL(previous);
      return objectUrl;
    });
    try {
      setUploadingCover(true);
      setError(null);
      const url = await uploadShopCover(file);
      const updated = await updateCreatorProfile({ shopCoverUrl: url });
      const cover = (updated.shopCoverUrl ?? url).trim() || null;
      setCoverUrl(cover);
      setSaved((current) => ({ ...current, coverUrl: cover }));
      setCoverPreview((previous) => {
        if (previous) URL.revokeObjectURL(previous);
        return null;
      });
    } catch (e) {
      setError(getApiErrorMessage(e, 'Could not upload cover.'));
      setCoverPreview((previous) => {
        if (previous) URL.revokeObjectURL(previous);
        return null;
      });
    } finally {
      setUploadingCover(false);
    }
  };

  const removeCover = async () => {
    if (uploadingCover || (!coverUrl && !saved.coverUrl)) return;
    try {
      setUploadingCover(true);
      setError(null);
      await updateCreatorProfile({ shopCoverUrl: '' });
      setCoverUrl(null);
      setSaved((current) => ({ ...current, coverUrl: null }));
      setCoverPreview((previous) => {
        if (previous) URL.revokeObjectURL(previous);
        return null;
      });
    } catch (e) {
      setError(getApiErrorMessage(e, 'Could not remove cover.'));
    } finally {
      setUploadingCover(false);
    }
  };

  const fieldClass =
    'w-full rounded-xl border-0 bg-neutral-100 px-3.5 py-2.5 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:bg-neutral-50 focus:ring-0 disabled:opacity-60 dark:bg-neutral-800 dark:text-white dark:placeholder:text-neutral-500 dark:focus:bg-neutral-700/80';

  return (
    <div className="space-y-5">
      <div className="space-y-1.5">
        <label
          htmlFor="creator-shop-selling-focus"
          className="block text-[11px] font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400"
        >
          What do you sell?
        </label>
        <input
          id="creator-shop-selling-focus"
          type="text"
          maxLength={200}
          disabled={loading || saving}
          value={sellingFocus}
          onChange={(e) => setSellingFocus(e.target.value)}
          placeholder="e.g. Video templates, merch, online courses…"
          className={fieldClass}
        />
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor="creator-shop-description"
          className="block text-[11px] font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400"
        >
          Description
        </label>
        <textarea
          id="creator-shop-description"
          rows={3}
          maxLength={2000}
          disabled={loading || saving}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Introduce your shop to visitors"
          className={`${fieldClass} resize-y`}
        />
      </div>

      <div className="space-y-2">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
          Cover
        </p>
        <div className="relative overflow-hidden rounded-2xl bg-neutral-100 dark:bg-neutral-800">
          <button
            type="button"
            disabled={loading || uploadingCover}
            onClick={() => coverInputRef.current?.click()}
            aria-label={displayCover ? 'Change cover' : 'Add cover'}
            className="relative aspect-[16/7] w-full transition hover:bg-neutral-200/70 disabled:opacity-60 dark:hover:bg-neutral-700/50"
          >
            {displayCover ? (
              isVideoThumbnailUrl(displayCover) ? (
                <video
                  src={displayCover}
                  className="absolute inset-0 h-full w-full object-cover"
                  muted
                  playsInline
                  loop
                  autoPlay
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={displayCover} alt="" className="absolute inset-0 h-full w-full object-cover" />
              )
            ) : (
              <span className="absolute inset-0 flex items-center justify-center text-neutral-400 dark:text-neutral-500">
                <FontAwesomeIcon icon={faPlus} className="h-8 w-8" aria-hidden />
              </span>
            )}
            {displayCover ? (
              <span className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition hover:bg-black/35 hover:opacity-100">
                <FontAwesomeIcon icon={faPlus} className="h-8 w-8 text-white" aria-hidden />
              </span>
            ) : null}
            {uploadingCover ? (
              <span className="absolute inset-0 flex items-center justify-center bg-black/40">
                <LoadingSpinner size="md" />
              </span>
            ) : null}
          </button>
          <input
            ref={coverInputRef}
            type="file"
            accept={COVER_ACCEPT}
            className="sr-only"
            onChange={(e) => {
              void onCoverSelect(e.target.files?.[0]);
              e.target.value = '';
            }}
          />
        </div>
        {displayCover ? (
          <button
            type="button"
            disabled={loading || uploadingCover}
            onClick={() => void removeCover()}
            className="text-xs font-medium text-neutral-500 transition hover:text-red-600 dark:text-neutral-400 dark:hover:text-red-400"
          >
            Remove cover
          </button>
        ) : null}
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor="creator-shop-name"
          className="block text-[11px] font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400"
        >
          Shop name
        </label>
        <input
          id="creator-shop-name"
          type="text"
          maxLength={120}
          disabled={loading || saving}
          value={shopName}
          onChange={(e) => setShopName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              void save();
            }
          }}
          placeholder="e.g. Leo Studio — name shown on all your products"
          className={fieldClass}
        />
        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          Visitors can find your products by this name in Explore.
        </p>
      </div>

      <button
        type="button"
        onClick={() => void save()}
        disabled={!dirty || saving || loading}
        className="inline-flex w-full items-center justify-center rounded-xl bg-neutral-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
      >
        {saving ? 'Saving…' : justSaved ? 'Saved' : 'Save'}
      </button>

      {error ? <p className="text-xs text-red-600 dark:text-red-400">{error}</p> : null}
    </div>
  );
}

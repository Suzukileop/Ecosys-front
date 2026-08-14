'use client';

import { useEffect, useState } from 'react';
import { getApiErrorMessage } from '@/lib/api-error';
import { updateCreatorProfile } from '@/lib/creator-profile-api';
import api from '@/lib/api';
import type { CreatorProfileDto } from '@/types/ecosystem';

type CreatorShopNameFieldProps = {
  /** Narrow sidebar layout (stacked input + save). */
  compact?: boolean;
};

/**
 * Editable boutique / shop name.
 * Represents all products and is searchable in Explore.
 */
export function CreatorShopNameField({ compact = false }: CreatorShopNameFieldProps) {
  const [value, setValue] = useState('');
  const [savedValue, setSavedValue] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [justSaved, setJustSaved] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const res = await api.get<CreatorProfileDto>('/api/creator/profile');
        if (cancelled) return;
        const shop = (res.data.shopName ?? '').trim();
        setValue(shop);
        setSavedValue(shop);
      } catch (e) {
        if (!cancelled) {
          setError(getApiErrorMessage(e, 'Could not load shop name.'));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const dirty = value.trim() !== savedValue.trim();

  const save = async () => {
    if (!dirty || saving) return;
    try {
      setSaving(true);
      setError(null);
      const next = value.trim();
      const updated = await updateCreatorProfile({ shopName: next });
      const shop = (updated.shopName ?? '').trim();
      setValue(shop);
      setSavedValue(shop);
      setJustSaved(true);
      window.setTimeout(() => setJustSaved(false), 1800);
    } catch (e) {
      setError(getApiErrorMessage(e, 'Could not save shop name.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-1.5">
      <label
        htmlFor="creator-shop-name"
        className="block text-[11px] font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400"
      >
        Shop name
      </label>
      <div className={`flex gap-2 ${compact ? 'flex-col' : 'flex-col sm:flex-row sm:items-center'}`}>
        <input
          id="creator-shop-name"
          type="text"
          maxLength={120}
          disabled={loading || saving}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              void save();
            }
          }}
          placeholder={compact ? 'Your boutique name' : 'e.g. Leo Studio — name shown on all your products'}
          className="min-w-0 flex-1 rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-neutral-400 focus:ring-2 focus:ring-neutral-200 disabled:opacity-60 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white dark:placeholder:text-neutral-500 dark:focus:border-neutral-500 dark:focus:ring-neutral-700"
        />
        <button
          type="button"
          onClick={() => void save()}
          disabled={!dirty || saving || loading}
          className="inline-flex w-full shrink-0 items-center justify-center rounded-xl bg-neutral-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200 sm:w-auto"
        >
          {saving ? 'Saving…' : justSaved ? 'Saved' : 'Save'}
        </button>
      </div>
      {!compact && (
        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          Visitors can find your products by this name in Explore.
        </p>
      )}
      {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
}

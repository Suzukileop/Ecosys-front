'use client';

import { useCallback, useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { getApiErrorMessage } from '@/lib/api-error';
import { updateCreatorProfile } from '@/lib/creator-profile-api';
import { uploadShopCover } from '@/lib/marketplace-api';
import api from '@/lib/api';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { isVideoThumbnailUrl } from '@/lib/product-thumbnail';
import { MediaImage } from '@/components/ui/MediaImage';
import type { CreatorProfileDto } from '@/types/profile';
import { useT } from '@/lib/i18n/I18nProvider';

const COVER_ACCEPT = 'image/jpeg,image/png,image/webp,video/mp4,video/webm,.jpg,.jpeg,.png,.webp,.mp4,.webm';
const NAME_LIMIT = 120;
const FOCUS_LIMIT = 200;
const DESCRIPTION_LIMIT = 2000;

const subscribeNoop = () => () => {};

/* The services drawer's vocabulary (ServiceFormDrawer): X ink, hairline fields, pill buttons. */
const INK = 'text-[#0F1419] dark:text-[#E7E9EA]';
const INK2 = 'text-[#536471] dark:text-[#71767B]';
const INPUT_CLASS = `block w-full min-w-0 border-0 bg-transparent p-0 text-[15px] leading-6 ${INK} caret-[#0F1419] outline-none placeholder:text-[#8B98A5] focus:ring-0 disabled:opacity-60 dark:caret-[#E7E9EA] dark:placeholder:text-[#536471]`;
const LINE_CLASS =
  'border-b border-[#CFD9DE] py-2 transition-[border-color,box-shadow] duration-150 focus-within:border-[#0F1419] focus-within:shadow-[inset_0_-1px_0_#0F1419] dark:border-[#3E4144] dark:focus-within:border-[#E7E9EA] dark:focus-within:shadow-[inset_0_-1px_0_#E7E9EA]';
const PRIMARY_BUTTON =
  'inline-flex h-10 items-center justify-center rounded-full bg-[#0F1419] px-5 text-[15px] font-bold text-white transition-colors hover:bg-[#272C30] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F1419]/40 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-[#EFF3F4] dark:text-[#0F1419] dark:hover:bg-[#D7DBDC]';
const SECONDARY_BUTTON = `inline-flex h-10 items-center justify-center rounded-full px-5 text-[15px] font-bold shadow-[inset_0_0_0_1px_#CFD9DE] transition-colors hover:bg-[rgba(15,20,25,0.06)] disabled:opacity-40 dark:shadow-[inset_0_0_0_1px_#536471] dark:hover:bg-[rgba(231,233,234,0.1)] ${INK}`;
/** Glass chips over the cover (Change / Remove). */
const COVER_NOTE = 'JPG, PNG, WebP, MP4 or WebM — wide works best. The cover is saved as soon as you pick it.';
const COVER_CHIP =
  'inline-flex h-8 items-center gap-1.5 rounded-full bg-black/55 px-3 text-[13px] font-semibold text-white backdrop-blur-md transition-colors hover:bg-black/70 disabled:opacity-50';

/** Shown only while its field has focus, or once the text nears (90%) or passes the limit. */
function Counter({ value, limit }: { value: number; limit: number }) {
  const near = value >= limit * 0.9;
  return (
    <span
      className={`text-[13px] tabular-nums transition-opacity ${
        near ? 'opacity-100' : 'opacity-0 group-focus-within/field:opacity-100'
      } ${value > limit ? 'font-semibold text-[#F4212E]' : INK2}`}
    >
      {value} / {limit}
    </span>
  );
}

/**
 * "!" — an important note kept out of the layout: a 16px ringed mark beside a label that shows the
 * note on hover or focus (a tap focuses it on touch screens). For the few notes that matter; the
 * rest of the dialog carries no helper text.
 */
function InfoTip({ text, tone = 'ink', align = 'left' }: { text: string; tone?: 'ink' | 'glass'; align?: 'left' | 'right' }) {
  return (
    <span className="group/tip relative inline-flex">
      <button
        type="button"
        aria-label={text}
        className={`inline-flex items-center justify-center rounded-full text-[11px] font-extrabold leading-none transition-colors focus-visible:outline-none ${
          tone === 'glass'
            ? 'h-8 w-8 bg-black/55 text-white backdrop-blur-md hover:bg-black/70'
            : `h-4 w-4 shadow-[inset_0_0_0_1.5px_currentColor] ${INK2} hover:text-[#0F1419] focus-visible:text-[#0F1419] dark:hover:text-[#E7E9EA] dark:focus-visible:text-[#E7E9EA]`
        }`}
      >
        !
      </button>
      <span
        role="tooltip"
        className={`pointer-events-none absolute top-full z-20 mt-2 w-60 rounded-xl bg-[#0F1419] px-3 py-2 text-[13px] font-medium leading-[18px] text-white opacity-0 shadow-[0_8px_24px_-10px_rgba(0,0,0,0.4)] transition-opacity duration-150 group-focus-within/tip:opacity-100 group-hover/tip:opacity-100 dark:bg-[#EFF3F4] dark:text-[#0F1419] ${
          align === 'right' ? 'right-0' : 'left-0'
        }`}
      >
        {text}
      </span>
    </span>
  );
}

/** A field: a small secondary label (+ counter), the input on one hairline, then a hint. */
function Field({
  id,
  label,
  counter,
  tip,
  children,
}: {
  id: string;
  label: string;
  counter?: ReactNode;
  /** An important note behind a "!" beside the label (see InfoTip). */
  tip?: string;
  children: ReactNode;
}) {
  return (
    <div className="group/field">
      <div className="flex items-center justify-between gap-3">
        <span className="flex items-center gap-1.5">
          <label htmlFor={id} className={`text-[14px] font-medium ${INK2}`}>
            {label}
          </label>
          {tip ? <InfoTip text={tip} /> : null}
        </span>
        {counter}
      </div>
      <div className={`mt-1 ${LINE_CLASS}`}>{children}</div>
    </div>
  );
}

function CameraIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M4 8.5A1.5 1.5 0 0 1 5.5 7h2l1.5-2h6l1.5 2h2A1.5 1.5 0 0 1 20 8.5v9a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 17.5z" />
      <circle cx="12" cy="13" r="3.2" />
    </svg>
  );
}

type ShopFields = { shopName: string; sellingFocus: string; description: string };

function fieldsFrom(profile: CreatorProfileDto): ShopFields & { coverUrl: string | null } {
  return {
    shopName: (profile.shopName ?? '').trim(),
    sellingFocus: (profile.shopSellingFocus ?? '').trim(),
    description: (profile.shopDescription ?? '').trim(),
    coverUrl: (profile.shopCoverUrl ?? '').trim() || null,
  };
}

/**
 * Shop settings, redone. The dialog opens on a live preview of the shop's header — the cover with
 * the name and "what you sell" laid over it, as clients see it — then the identity fields in the
 * services drawer's style (hairlines, counters), then a sticky footer: "View your shop" left, the
 * save state and Save right. The cover saves on pick (said under it); the text saves with Save, and
 * closing with unsaved text asks first instead of dropping it.
 */
function StoreSettingsDialog({ storefrontHref, onClose }: { storefrontHref: string; onClose: () => void }) {
  const t = useT();
  const coverInputRef = useRef<HTMLInputElement>(null);
  const [fields, setFields] = useState<ShopFields>({ shopName: '', sellingFocus: '', description: '' });
  const [saved, setSaved] = useState<ShopFields>({ shopName: '', sellingFocus: '', description: '' });
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [justSaved, setJustSaved] = useState(false);
  const [confirmDiscard, setConfirmDiscard] = useState(false);

  useEffect(() => {
    let cancelled = false;
    api
      .get<CreatorProfileDto>('/api/creator/profile')
      .then((res) => {
        if (cancelled) return;
        const { coverUrl: cover, ...text } = fieldsFrom(res.data);
        setFields(text);
        setSaved(text);
        setCoverUrl(cover);
      })
      .catch((e) => {
        if (!cancelled) setError(getApiErrorMessage(e, t('Could not load shop settings.')));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [t]);

  useEffect(() => {
    return () => {
      if (coverPreview) URL.revokeObjectURL(coverPreview);
    };
  }, [coverPreview]);

  const dirty =
    fields.shopName.trim() !== saved.shopName ||
    fields.sellingFocus.trim() !== saved.sellingFocus ||
    fields.description.trim() !== saved.description;
  const overLimit =
    fields.shopName.length > NAME_LIMIT ||
    fields.sellingFocus.length > FOCUS_LIMIT ||
    fields.description.length > DESCRIPTION_LIMIT;
  const displayCover = coverPreview ?? coverUrl;
  const set = (key: keyof ShopFields) => (value: string) => {
    setConfirmDiscard(false);
    setFields((current) => ({ ...current, [key]: value }));
  };

  const save = async () => {
    if (!dirty || saving || overLimit) return;
    try {
      setSaving(true);
      setError(null);
      const updated = await updateCreatorProfile({
        shopName: fields.shopName.trim(),
        shopSellingFocus: fields.sellingFocus.trim(),
        shopDescription: fields.description.trim(),
      });
      const { coverUrl: cover, ...text } = fieldsFrom(updated);
      setFields(text);
      setSaved(text);
      setCoverUrl(cover);
      setConfirmDiscard(false);
      setJustSaved(true);
      window.setTimeout(() => setJustSaved(false), 2000);
    } catch (e) {
      setError(getApiErrorMessage(e, t('Could not save shop settings.')));
    } finally {
      setSaving(false);
    }
  };

  const requestClose = useCallback(() => {
    if (dirty && !saving) {
      setConfirmDiscard(true);
      return;
    }
    onClose();
  }, [dirty, saving, onClose]);

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') requestClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [requestClose]);

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
      setCoverUrl((updated.shopCoverUrl ?? url).trim() || null);
    } catch (e) {
      setError(getApiErrorMessage(e, t('Could not upload the cover.')));
    } finally {
      setCoverPreview((previous) => {
        if (previous) URL.revokeObjectURL(previous);
        return null;
      });
      setUploadingCover(false);
    }
  };

  const removeCover = async () => {
    if (uploadingCover || !coverUrl) return;
    try {
      setUploadingCover(true);
      setError(null);
      await updateCreatorProfile({ shopCoverUrl: '' });
      setCoverUrl(null);
    } catch (e) {
      setError(getApiErrorMessage(e, t('Could not remove the cover.')));
    } finally {
      setUploadingCover(false);
    }
  };

  const previewName = fields.shopName.trim() || 'Your shop name';
  const previewFocus = fields.sellingFocus.trim();

  return (
    <div className="news-theme news-mono fixed inset-0 z-[220] flex items-end justify-center sm:items-center sm:p-6">
      <button type="button" aria-label={t('Close')} className="absolute inset-0 h-full w-full cursor-default bg-black/40 dark:bg-black/60" onClick={requestClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="store-settings-title"
        className="relative z-10 flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-2xl bg-white pb-[env(safe-area-inset-bottom)] shadow-[0_24px_80px_-24px_rgba(0,0,0,0.35)] dark:bg-black sm:max-h-[min(88vh,760px)] sm:max-w-[560px] sm:rounded-2xl sm:pb-0 sm:dark:shadow-[0_0_0_1px_#2F3336]"
      >
        <span aria-hidden className="mx-auto mt-2.5 block h-1 w-10 shrink-0 rounded-full bg-[#CFD9DE] dark:bg-[#3E4144] sm:hidden" />
        <header className="flex shrink-0 items-start justify-between gap-4 px-5 pb-3 pt-3 sm:px-6 sm:pt-5">
          <div className="min-w-0">
            <h2 id="store-settings-title" className={`text-[20px] font-extrabold leading-6 tracking-[-0.01em] ${INK}`}>
              {t('Shop settings')}
            </h2>
          </div>
          <button
            type="button"
            onClick={requestClose}
            aria-label={t('Close')}
            className="-mr-2 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[#536471] transition hover:bg-[rgba(15,20,25,0.1)] hover:text-[#0F1419] dark:text-[#71767B] dark:hover:bg-[rgba(231,233,234,0.1)] dark:hover:text-[#E7E9EA]"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden>
              <path strokeLinecap="round" d="M6 6l12 12M18 6 6 18" />
            </svg>
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-6 sm:px-6">
          {/* Live preview of the shop's header: cover, then the name and "what you sell" over it. */}
          <div>
            <div className="relative aspect-[16/7] w-full overflow-hidden bg-[#EFF3F4] dark:bg-[#16181C]">
              {loading ? (
                <div className="absolute inset-0 animate-pulse bg-[#EFF3F4] dark:bg-[#202327]" />
              ) : displayCover ? (
                isVideoThumbnailUrl(displayCover) ? (
                  <video src={displayCover} className="absolute inset-0 h-full w-full object-cover" muted playsInline loop autoPlay />
                ) : (
                  <MediaImage
                    src={displayCover}
                    widths={[640, 828, 1080]}
                    sizes="(min-width: 640px) 512px, 100vw"
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                )
              ) : (
                <button
                  type="button"
                  onClick={() => coverInputRef.current?.click()}
                  className={`absolute inset-0 flex flex-col items-center justify-center gap-2 transition-colors hover:bg-[#E1E8ED] dark:hover:bg-[#1D1F23] ${INK2}`}
                >
                  <span className={`flex h-11 w-11 items-center justify-center rounded-full shadow-[inset_0_0_0_1px_#CFD9DE] dark:shadow-[inset_0_0_0_1px_#3E4144] ${INK}`}>
                    <CameraIcon />
                  </span>
                  <span className={`text-[15px] font-bold ${INK}`}>{t('Add a cover')}</span>
                </button>
              )}

              {displayCover ? (
                <>
                  <span aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/75 via-black/30 to-transparent" />
                  <div className="pointer-events-none absolute inset-x-4 bottom-3.5 min-w-0 text-white">
                    <p className="truncate text-[20px] font-extrabold leading-6 tracking-[-0.01em]">{previewName}</p>
                    {previewFocus ? <p className="mt-0.5 truncate text-[14px] leading-5 text-white/80">{previewFocus}</p> : null}
                  </div>
                  <div className="absolute right-3 top-3 flex gap-1.5">
                    <InfoTip tone="glass" align="right" text={COVER_NOTE} />
                    <button type="button" disabled={uploadingCover} onClick={() => coverInputRef.current?.click()} className={COVER_CHIP}>
                      <CameraIcon />
                      {t('Change')}
                    </button>
                    <button type="button" disabled={uploadingCover || !coverUrl} onClick={() => void removeCover()} className={COVER_CHIP}>
                      {t('Remove')}
                    </button>
                  </div>
                </>
              ) : null}

              {uploadingCover ? (
                <span className="absolute inset-0 flex items-center justify-center bg-black/40">
                  <LoadingSpinner size="md" />
                </span>
              ) : null}
              <input
                ref={coverInputRef}
                type="file"
                accept={COVER_ACCEPT}
                className="sr-only"
                onChange={(event) => {
                  void onCoverSelect(event.target.files?.[0]);
                  event.target.value = '';
                }}
              />
            </div>
          </div>

          <div className="mt-7 flex flex-col gap-6">
            <Field
              id="creator-shop-name"
              label={t('Shop name')}
              counter={<Counter value={fields.shopName.length} limit={NAME_LIMIT} />}
              tip="Shown on every product, and searchable in Explore."
            >
              <input
                id="creator-shop-name"
                type="text"
                disabled={loading || saving}
                value={fields.shopName}
                onChange={(event) => set('shopName')(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault();
                    void save();
                  }
                }}
                placeholder={t('e.g. Leo Studio')}
                className={INPUT_CLASS}
              />
            </Field>

            <Field
              id="creator-shop-selling-focus"
              label={t('What you sell')}
              counter={<Counter value={fields.sellingFocus.length} limit={FOCUS_LIMIT} />}
            >
              <input
                id="creator-shop-selling-focus"
                type="text"
                disabled={loading || saving}
                value={fields.sellingFocus}
                onChange={(event) => set('sellingFocus')(event.target.value)}
                placeholder={t('e.g. Video templates, merch, online courses')}
                className={INPUT_CLASS}
              />
            </Field>

            <Field
              id="creator-shop-description"
              label={t('Description')}
              counter={<Counter value={fields.description.length} limit={DESCRIPTION_LIMIT} />}
            >
              <textarea
                id="creator-shop-description"
                rows={4}
                disabled={loading || saving}
                value={fields.description}
                onChange={(event) => set('description')(event.target.value)}
                placeholder={t('Introduce your shop: what you make, for whom, how you ship.')}
                className={`${INPUT_CLASS} resize-none`}
              />
            </Field>
          </div>

          {error ? (
            <p role="alert" className="mt-5 text-[14px] font-medium text-[#F4212E]">
              {error}
            </p>
          ) : null}
        </div>

        {/* Sticky footer: the shop link left; the save state and Save right — or, after a close with
            unsaved text, the choice to discard or keep editing. */}
        <footer className="flex shrink-0 items-center justify-between gap-3 px-5 py-3 shadow-[inset_0_1px_0_#EFF3F4] dark:shadow-[inset_0_1px_0_#2F3336] sm:px-6">
          {confirmDiscard ? (
            <>
              <p className={`min-w-0 text-[14px] font-semibold ${INK}`}>{t('Discard your changes?')}</p>
              <div className="flex shrink-0 items-center gap-2">
                <button type="button" onClick={() => setConfirmDiscard(false)} className={SECONDARY_BUTTON}>
                  {t('Keep editing')}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex h-10 items-center justify-center rounded-full bg-[#F4212E] px-5 text-[15px] font-bold text-white transition-colors hover:bg-[#DC1E29]"
                >
                  {t('Discard')}
                </button>
              </div>
            </>
          ) : (
            <>
              <a
                href={storefrontHref}
                target="_blank"
                rel="noreferrer"
                className={`inline-flex min-w-0 items-center gap-1.5 text-[14px] font-semibold ${INK2} transition-colors hover:text-[#0F1419] dark:hover:text-[#E7E9EA]`}
              >
                <span className="truncate">{t('View your shop')}</span>
                <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />
                </svg>
              </a>
              <div className="flex shrink-0 items-center gap-3">
                <span aria-live="polite" className={`hidden text-[13px] sm:inline ${INK2}`}>
                  {justSaved ? t('Saved') : dirty ? t('Unsaved changes') : ''}
                </span>
                <button type="button" onClick={() => void save()} disabled={!dirty || saving || loading || overLimit} className={PRIMARY_BUTTON}>
                  {saving ? t('Saving…') : justSaved ? t('Saved') : t('Save')}
                </button>
              </div>
            </>
          )}
        </footer>
      </div>
    </div>
  );
}

export function CreatorStoreSettingsModal({
  open,
  storefrontHref,
  onClose,
}: {
  open: boolean;
  storefrontHref: string;
  onClose: () => void;
}) {
  const mounted = useSyncExternalStore(subscribeNoop, () => true, () => false);
  if (!open || !mounted) return null;
  /* Mounted only while open, so every opening reads the shop afresh. */
  return createPortal(<StoreSettingsDialog storefrontHref={storefrontHref} onClose={onClose} />, document.body);
}

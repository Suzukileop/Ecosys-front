'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCloudArrowUp, faClock, faXmark } from '@fortawesome/free-solid-svg-icons';
import type { ProfileServiceForm } from '@/components/creator/studio/profile-form-schema';
import {
  currencyPresetFromCode,
  formatServiceDelivery,
  formatServicePrice,
  SERVICE_CURRENCY_PRESETS,
  SERVICE_DELIVERY_UNIT_OPTIONS,
  SERVICE_DESCRIPTION_SOFT_LIMIT,
  SERVICE_PRICING_OPTIONS,
  SERVICE_STATUS_OPTIONS,
  serviceStatusLabel,
  solidCoverHueFromTitle,
  type ServiceCurrencyPreset,
  type ServiceDeliveryUnit,
  type ServicePricingType,
  type ServiceStatus,
} from '@/lib/profile-services';
import { resolveStorageMediaUrl } from '@/lib/storage-media-url';

function eurosInputFromCents(cents: number | null | undefined): string {
  if (cents == null || Number.isNaN(cents) || cents === 0) return '';
  const euros = cents / 100;
  if (!Number.isFinite(euros)) return '';
  return String(Number(euros.toFixed(2)));
}

function centsFromEurosInput(raw: string): number | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const parsed = Number(trimmed.replace(',', '.'));
  if (Number.isNaN(parsed)) return null;
  return Math.round(parsed * 100);
}

function statusTone(status: ServiceStatus) {
  switch (status) {
    case 'ACTIVE':
      return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300';
    case 'PAUSED':
      return 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300';
    default:
      return 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300';
  }
}

function ServicePreviewCover({
  title,
  coverImageUrl,
}: {
  title: string;
  coverImageUrl?: string | null;
}) {
  const resolved = resolveStorageMediaUrl(coverImageUrl) || coverImageUrl;
  if (resolved) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={resolved} alt="" className="h-full w-full object-cover" />
    );
  }
  const hue = solidCoverHueFromTitle(title || 'Service');
  const initial = (title.trim()[0] || 'S').toUpperCase();
  return (
    <div
      className="flex h-full w-full items-center justify-center"
      style={{ backgroundColor: `hsl(${hue} 48% 42%)` }}
      aria-hidden
    >
      <span className="text-3xl font-bold text-white/90">{initial}</span>
    </div>
  );
}

function LiveServicePreview({ draft }: { draft: ProfileServiceForm }) {
  const status = (draft.status ?? 'ACTIVE') as ServiceStatus;
  const deliveryLabel = formatServiceDelivery(draft);
  const tags = (draft.tags ?? []).filter((tag) => tag.trim());
  return (
    <article className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
      <div className="flex min-h-[10rem] flex-col sm:flex-row">
        <div className="h-28 w-full shrink-0 overflow-hidden sm:h-auto sm:w-28">
          <ServicePreviewCover title={draft.title} coverImageUrl={draft.coverImageUrl} />
        </div>
        <div className="flex min-w-0 flex-1 flex-col p-3">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="truncate text-base font-bold text-neutral-950 dark:text-white">
                {draft.title.trim() || 'Service title'}
              </h3>
              <div className="mt-1.5 flex flex-wrap gap-1">
                {draft.specialty ? (
                  <span className="rounded-full bg-orange-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-orange-800 dark:bg-orange-500/10 dark:text-orange-300">
                    {draft.specialty}
                  </span>
                ) : null}
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${statusTone(status)}`}>
                  {serviceStatusLabel(status)}
                </span>
              </div>
            </div>
            <p className="inline-flex h-7 shrink-0 items-center rounded-lg bg-orange-500 px-2 text-xs font-bold text-white">
              {formatServicePrice(draft)}
            </p>
          </div>
          {draft.description?.trim() ? (
            <p className="mt-2 line-clamp-2 text-xs leading-snug text-neutral-600 dark:text-neutral-400">
              {draft.description.trim()}
            </p>
          ) : (
            <p className="mt-2 text-xs italic text-neutral-400">Description preview…</p>
          )}
          {tags.length > 0 ? (
            <div className="mt-2 flex flex-wrap gap-1">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-md border border-neutral-200 px-1.5 py-0.5 text-[10px] text-neutral-600 dark:border-neutral-700 dark:text-neutral-300"
                >
                  {tag}
                </span>
              ))}
            </div>
          ) : null}
          {deliveryLabel ? (
            <div className="mt-auto border-t border-neutral-200 pt-2 dark:border-neutral-800">
              <p className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-700 dark:text-neutral-300">
                <FontAwesomeIcon icon={faClock} className="h-3 w-3 text-neutral-400" />
                {deliveryLabel}
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </article>
  );
}

type ServiceFormDrawerProps = {
  open: boolean;
  draft: ProfileServiceForm;
  isEdit: boolean;
  specialties: string[];
  keywordTags: string[];
  saving: boolean;
  uploadingCover: boolean;
  onChange: (next: ProfileServiceForm) => void;
  onClose: () => void;
  onSave: () => void;
  onCoverFile: (file: File | null) => void;
};

export function ServiceFormDrawer({
  open,
  draft,
  isEdit,
  specialties,
  keywordTags,
  saving,
  uploadingCover,
  onChange,
  onClose,
  onSave,
  onCoverFile,
}: ServiceFormDrawerProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [mounted, setMounted] = useState(false);
  const [tagDraft, setTagDraft] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const currencyPreset = currencyPresetFromCode(draft.currency);
  const customCurrency = currencyPreset === 'OTHER';
  const pricingType = (draft.pricingType ?? 'FIXED') as ServicePricingType;
  const showAmount = pricingType !== 'QUOTE';
  const descriptionLength = (draft.description ?? '').length;
  const descriptionOver = descriptionLength > SERVICE_DESCRIPTION_SOFT_LIMIT;
  const coverResolved = resolveStorageMediaUrl(draft.coverImageUrl) || draft.coverImageUrl;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previous;
    };
  }, [open, onClose]);

  if (!open || !mounted) return null;

  const setCurrencyPreset = (preset: ServiceCurrencyPreset) => {
    if (preset === 'OTHER') {
      const keepCustom =
        currencyPreset === 'OTHER' && Boolean((draft.currency ?? '').trim()) &&
        draft.currency !== 'EUR' &&
        draft.currency !== 'USD';
      onChange({ ...draft, currency: keepCustom ? draft.currency : '' });
      return;
    }
    onChange({ ...draft, currency: preset });
  };

  const onDropFiles = (files: FileList | null) => {
    const file = files?.[0] ?? null;
    if (!file) return;
    if (!file.type.startsWith('image/')) return;
    onCoverFile(file);
  };

  return createPortal(
    <div className="fixed inset-0 z-[100]">
      <div
        role="button"
        tabIndex={-1}
        aria-label="Close drawer overlay"
        className="absolute inset-0 z-0 cursor-pointer bg-black/45 backdrop-blur-sm"
        onMouseDown={(event) => {
          if (event.button !== 0) return;
          event.preventDefault();
          onClose();
        }}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="service-form-drawer-title"
        className="absolute inset-y-0 right-0 z-10 flex h-full w-full max-w-xl flex-col bg-white shadow-2xl dark:bg-neutral-950 sm:max-w-[560px]"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-3 dark:border-neutral-800 sm:px-5">
          <div>
            <h2
              id="service-form-drawer-title"
              className="text-lg font-semibold text-neutral-900 dark:text-white"
            >
              {isEdit ? 'Edit service' : 'New service'}
            </h2>
            <p className="mt-0.5 text-xs text-neutral-500">Required fields are marked *</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-800 dark:hover:bg-neutral-800 dark:hover:text-white"
            aria-label="Close"
          >
            <FontAwesomeIcon icon={faXmark} className="h-4 w-4" />
          </button>
        </div>

        <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-4 py-4 sm:px-5">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">
              Live preview
            </p>
            <LiveServicePreview draft={draft} />
          </div>

          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">
              General information
            </h3>
            <label className="block">
              <span className="text-xs font-bold uppercase tracking-wide text-neutral-500">
                Title *
              </span>
              <input
                value={draft.title}
                onChange={(event) => onChange({ ...draft, title: event.target.value })}
                maxLength={100}
                className="mt-1.5 h-11 w-full rounded-xl border border-neutral-300 bg-white px-3 text-sm outline-none focus:border-orange-400 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
                placeholder="e.g. REST API development"
              />
            </label>
            <label className="block">
              <span className="text-xs font-bold uppercase tracking-wide text-neutral-500">
                Specialty *
              </span>
              <select
                value={draft.specialty ?? ''}
                onChange={(event) => onChange({ ...draft, specialty: event.target.value })}
                className="mt-1.5 h-11 w-full rounded-xl border border-neutral-300 bg-white px-3 text-sm outline-none focus:border-orange-400 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
              >
                <option value="">Choose specialty</option>
                {specialties.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-xs font-bold uppercase tracking-wide text-neutral-500">
                Description
              </span>
              <textarea
                value={draft.description ?? ''}
                onChange={(event) => onChange({ ...draft, description: event.target.value })}
                rows={3}
                className="mt-1.5 w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-orange-400 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
                placeholder="What the client receives in 2–3 sentences"
              />
              <span
                className={`mt-1 block text-right text-[11px] ${
                  descriptionOver ? 'font-semibold text-amber-600' : 'text-neutral-400'
                }`}
              >
                {descriptionLength} / {SERVICE_DESCRIPTION_SOFT_LIMIT}
              </span>
            </label>
          </section>

          <div className="border-t border-neutral-200 dark:border-neutral-800" />

          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">
              Pricing & delivery
            </h3>
            <label className="block">
              <span className="text-xs font-bold uppercase tracking-wide text-neutral-500">
                Pricing *
              </span>
              <select
                value={pricingType}
                onChange={(event) => {
                  const next = event.target.value as ServicePricingType;
                  onChange({
                    ...draft,
                    pricingType: next,
                    basePriceCents: next === 'QUOTE' ? null : draft.basePriceCents,
                  });
                }}
                className="mt-1.5 h-11 w-full rounded-xl border border-neutral-300 bg-white px-3 text-sm outline-none focus:border-orange-400 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
              >
                {SERVICE_PRICING_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            {showAmount ? (
              <div className="space-y-3">
                <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                  <label className="block min-w-0">
                    <span className="text-xs font-bold uppercase tracking-wide text-neutral-500">
                      Amount *
                    </span>
                    <input
                      type="text"
                      inputMode="decimal"
                      value={eurosInputFromCents(draft.basePriceCents)}
                      onChange={(event) =>
                        onChange({
                          ...draft,
                          basePriceCents: centsFromEurosInput(event.target.value),
                        })
                      }
                      className="mt-1.5 h-11 w-full rounded-xl border border-neutral-300 bg-white px-3 text-sm outline-none focus:border-orange-400 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
                      placeholder="150"
                    />
                  </label>
                  <label className="block sm:w-40">
                    <span className="text-xs font-bold uppercase tracking-wide text-neutral-500">
                      Currency *
                    </span>
                    <select
                      value={currencyPreset}
                      onChange={(event) =>
                        setCurrencyPreset(event.target.value as ServiceCurrencyPreset)
                      }
                      className="mt-1.5 h-11 w-full rounded-xl border border-neutral-300 bg-white px-3 text-sm outline-none focus:border-orange-400 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
                    >
                      {SERVICE_CURRENCY_PRESETS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                {customCurrency ? (
                  <label className="block">
                    <span className="text-xs font-bold uppercase tracking-wide text-neutral-500">
                      Currency code *
                    </span>
                    <input
                      autoFocus
                      value={draft.currency ?? ''}
                      onChange={(event) =>
                        onChange({
                          ...draft,
                          currency: event.target.value
                            .toUpperCase()
                            .replace(/[^A-Z0-9]/g, '')
                            .slice(0, 8),
                        })
                      }
                      maxLength={8}
                      className="mt-1.5 h-11 w-full rounded-xl border border-neutral-300 bg-white px-3 text-sm outline-none focus:border-orange-400 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
                      placeholder="e.g. GBP, CHF, MGA"
                    />
                    <span className="mt-1 block text-xs text-neutral-500">
                      Enter a short currency code (letters/numbers).
                    </span>
                  </label>
                ) : null}
              </div>
            ) : null}

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <span className="text-xs font-bold uppercase tracking-wide text-neutral-500">
                  Delivery time
                </span>
                <div className="mt-1.5 grid grid-cols-[1fr_auto] gap-2">
                  <input
                    type="number"
                    min={1}
                    value={draft.deliveryValue ?? ''}
                    onChange={(event) => {
                      const raw = event.target.value.trim();
                      onChange({
                        ...draft,
                        deliveryValue: raw ? Math.max(1, Math.round(Number(raw))) : null,
                      });
                    }}
                    className="h-11 w-full rounded-xl border border-neutral-300 bg-white px-3 text-sm outline-none focus:border-orange-400 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
                    placeholder="3"
                  />
                  <select
                    value={(draft.deliveryUnit ?? 'DAYS') as ServiceDeliveryUnit}
                    onChange={(event) =>
                      onChange({
                        ...draft,
                        deliveryUnit: event.target.value as ServiceDeliveryUnit,
                      })
                    }
                    className="h-11 rounded-xl border border-neutral-300 bg-white px-3 text-sm outline-none focus:border-orange-400 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
                  >
                    {SERVICE_DELIVERY_UNIT_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <label className="block">
                <span className="text-xs font-bold uppercase tracking-wide text-neutral-500">
                  Status
                </span>
                <select
                  value={draft.status ?? 'ACTIVE'}
                  onChange={(event) =>
                    onChange({ ...draft, status: event.target.value as ServiceStatus })
                  }
                  className="mt-1.5 h-11 w-full rounded-xl border border-neutral-300 bg-white px-3 text-sm outline-none focus:border-orange-400 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
                >
                  {SERVICE_STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </section>

          <div className="border-t border-neutral-200 dark:border-neutral-800" />

          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">
              Visual & tags
            </h3>
            <div>
              <span className="text-xs font-bold uppercase tracking-wide text-neutral-500">
                Cover image
              </span>
              <button
                type="button"
                disabled={uploadingCover || saving}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(event) => {
                  event.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(event) => {
                  event.preventDefault();
                  setDragOver(false);
                  onDropFiles(event.dataTransfer.files);
                }}
                className={`relative mt-1.5 flex h-36 w-full items-center justify-center overflow-hidden rounded-xl border border-dashed transition ${
                  dragOver
                    ? 'border-orange-400 bg-orange-50 dark:bg-orange-500/10'
                    : 'border-neutral-300 bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900'
                }`}
              >
                {coverResolved ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={coverResolved} alt="" className="absolute inset-0 h-full w-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center gap-2 px-4 text-center text-neutral-500">
                    <FontAwesomeIcon icon={faCloudArrowUp} className="h-6 w-6" />
                    <span className="text-sm font-medium">
                      {uploadingCover ? 'Uploading…' : 'Drop an image or click to upload'}
                    </span>
                    <span className="text-[11px]">JPEG, PNG or WebP</span>
                  </div>
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="sr-only"
                disabled={uploadingCover || saving}
                onChange={(event) => {
                  onCoverFile(event.target.files?.[0] ?? null);
                  event.target.value = '';
                }}
              />
              {draft.coverImageUrl ? (
                <button
                  type="button"
                  onClick={() => onChange({ ...draft, coverImageUrl: '' })}
                  className="mt-2 text-sm text-neutral-500 hover:text-red-600"
                >
                  Remove cover
                </button>
              ) : null}
            </div>

            <div>
              <span className="text-xs font-bold uppercase tracking-wide text-neutral-500">Tags</span>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {(draft.tags ?? []).map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 rounded-lg border border-neutral-200 bg-neutral-50 px-2 py-0.5 text-xs dark:border-neutral-700 dark:bg-neutral-800"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() =>
                        onChange({
                          ...draft,
                          tags: (draft.tags ?? []).filter((item) => item !== tag),
                        })
                      }
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <input
                value={tagDraft}
                onChange={(event) => setTagDraft(event.target.value)}
                list="service-form-keyword-suggestions"
                maxLength={40}
                placeholder="Add a tag"
                className="mt-2 h-10 w-full rounded-xl border border-neutral-300 bg-white px-3 text-sm outline-none focus:border-orange-400 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
                onKeyDown={(event) => {
                  if (event.key !== 'Enter') return;
                  event.preventDefault();
                  const trimmed = tagDraft.trim();
                  if (!trimmed) return;
                  const tags = draft.tags ?? [];
                  if (tags.some((item) => item.toLowerCase() === trimmed.toLowerCase())) {
                    setTagDraft('');
                    return;
                  }
                  if (tags.length >= 8) return;
                  onChange({ ...draft, tags: [...tags, trimmed] });
                  setTagDraft('');
                }}
              />
              <datalist id="service-form-keyword-suggestions">
                {keywordTags.map((tag) => (
                  <option key={tag} value={tag} />
                ))}
              </datalist>
            </div>
          </section>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-neutral-200 px-4 py-3 dark:border-neutral-800 sm:px-5">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-xl px-4 py-2 text-sm font-medium text-neutral-600 dark:text-neutral-300"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={saving || uploadingCover}
            className="rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
          >
            {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Publish service'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

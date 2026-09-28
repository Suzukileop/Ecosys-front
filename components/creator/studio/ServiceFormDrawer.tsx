'use client';

import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCloudArrowUp, faImage, faTrashCan, faXmark } from '@fortawesome/free-solid-svg-icons';
import type { ProfileServiceForm } from '@/components/creator/studio/profile-form-schema';
import {
  STUDIO_FLOAT_IN_STYLE,
  STUDIO_INLINE_TEXT_CLASS,
  STUDIO_LABEL_CLASS,
  StudioUnderline,
} from '@/components/portfolio/PortfolioStudioKit';
import {
  currencyPresetFromCode,
  SERVICE_CURRENCY_PRESETS,
  SERVICE_DELIVERY_UNIT_OPTIONS,
  SERVICE_DESCRIPTION_SOFT_LIMIT,
  SERVICE_PRICING_OPTIONS,
  SERVICE_STATUS_OPTIONS,
  type ServiceCurrencyPreset,
  type ServiceDeliveryUnit,
  type ServicePricingType,
  type ServiceStatus,
} from '@/lib/profile-services';
import { resolveStorageMediaUrl } from '@/lib/storage-media-url';

const MAX_TAGS = 8;

const subscribeNoop = () => () => {};

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

function statusDot(status: ServiceStatus) {
  switch (status) {
    case 'ACTIVE':
      return 'bg-emerald-500';
    case 'PAUSED':
      return 'bg-amber-500';
    default:
      return 'bg-neutral-400';
  }
}

function FieldLabel({ label, required, aside }: { label: string; required?: boolean; aside?: ReactNode }) {
  return (
    <div className="mb-2.5 flex items-baseline justify-between gap-3">
      <span className={STUDIO_LABEL_CLASS}>
        {label}
        {required ? <span className="ml-0.5 text-[#FF5722]">*</span> : null}
      </span>
      {aside}
    </div>
  );
}

function FieldError({ error }: { error?: string | null }) {
  return error ? <p className="mt-2 text-[13px] font-medium text-[#FF5722]">{error}</p> : null;
}

/** Underlined text field, same treatment as the portfolio information studio. */
function LineField({
  label,
  required,
  error,
  aside,
  className = '',
  children,
}: {
  label: string;
  required?: boolean;
  error?: string | null;
  aside?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div data-invalid={Boolean(error)} className={`min-w-0 ${className}`}>
      <StudioUnderline>
        <FieldLabel label={label} required={required} aside={aside} />
        {children}
        {error ? <span aria-hidden className="absolute inset-x-0 bottom-0 h-px bg-[#FF5722]" /> : null}
      </StudioUnderline>
      <FieldError error={error} />
    </div>
  );
}

function ChoiceField<T extends string>({
  label,
  required,
  error,
  value,
  options,
  onChange,
  renderPrefix,
  className = '',
}: {
  label: string;
  required?: boolean;
  error?: string | null;
  value: T;
  options: readonly { value: T; label: string }[];
  onChange: (value: T) => void;
  renderPrefix?: (value: T) => ReactNode;
  className?: string;
}) {
  return (
    <div data-invalid={Boolean(error)} className={`min-w-0 ${className}`}>
      <FieldLabel label={label} required={required} />
      <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-2">
        {options.map((option) => {
          const active = option.value === value;
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange(option.value)}
              className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[14px] font-medium transition-colors duration-200 ${
                active
                  ? 'border-[#111111] bg-[#111111] text-white dark:border-white dark:bg-white dark:text-[#111111]'
                  : 'border-black/[0.1] text-neutral-600 hover:border-black/30 hover:text-[#111111] dark:border-white/[0.12] dark:text-neutral-300 dark:hover:border-white/30 dark:hover:text-white'
              }`}
            >
              {renderPrefix?.(option.value)}
              {option.label}
            </button>
          );
        })}
      </div>
      <FieldError error={error} />
    </div>
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
  saving,
  uploadingCover,
  onChange,
  onClose,
  onSave,
  onCoverFile,
}: ServiceFormDrawerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const mounted = useSyncExternalStore(subscribeNoop, () => true, () => false);
  const [tagDraft, setTagDraft] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [attempted, setAttempted] = useState(false);
  const [wasOpen, setWasOpen] = useState(open);

  if (wasOpen !== open) {
    setWasOpen(open);
    if (open) {
      setAttempted(false);
      setTagDraft('');
    }
  }

  const currencyPreset = currencyPresetFromCode(draft.currency);
  const customCurrency = currencyPreset === 'OTHER';
  const pricingType = (draft.pricingType ?? 'FIXED') as ServicePricingType;
  const showAmount = pricingType !== 'QUOTE';
  const descriptionLength = (draft.description ?? '').length;
  const descriptionOver = descriptionLength > SERVICE_DESCRIPTION_SOFT_LIMIT;
  const coverResolved = resolveStorageMediaUrl(draft.coverImageUrl) || draft.coverImageUrl;
  const tags = draft.tags ?? [];

  const errors = {
    title: draft.title.trim() ? null : 'Give your service a title.',
    specialty: draft.specialty?.trim() ? null : 'Pick a specialty.',
    amount: showAmount && draft.basePriceCents == null ? 'Enter a price.' : null,
    currency: showAmount && customCurrency && !(draft.currency ?? '').trim() ? 'Enter a currency code.' : null,
  };
  const hasErrors = Object.values(errors).some(Boolean);
  const show = (key: keyof typeof errors) => (attempted ? errors[key] : null);

  const submit = () => {
    if (saving || uploadingCover) return;
    if (hasErrors) {
      setAttempted(true);
      requestAnimationFrame(() => {
        bodyRef.current?.querySelector('[data-invalid="true"]')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
      return;
    }
    onSave();
  };

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !saving) onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previous;
    };
  }, [open, onClose, saving]);

  if (!open || !mounted) return null;

  const setCurrencyPreset = (preset: ServiceCurrencyPreset) => {
    if (preset === 'OTHER') {
      const keepCustom =
        currencyPreset === 'OTHER' &&
        Boolean((draft.currency ?? '').trim()) &&
        draft.currency !== 'EUR' &&
        draft.currency !== 'USD';
      onChange({ ...draft, currency: keepCustom ? draft.currency : '' });
      return;
    }
    onChange({ ...draft, currency: preset });
  };

  const onDropFiles = (files: FileList | null) => {
    const file = files?.[0] ?? null;
    if (!file || !file.type.startsWith('image/')) return;
    onCoverFile(file);
  };

  const addTag = (raw: string) => {
    const trimmed = raw.trim().replace(/,$/, '').trim();
    if (!trimmed) return;
    if (tags.some((item) => item.toLowerCase() === trimmed.toLowerCase()) || tags.length >= MAX_TAGS) {
      setTagDraft('');
      return;
    }
    onChange({ ...draft, tags: [...tags, trimmed] });
    setTagDraft('');
  };

  const removeTag = (tag: string) => onChange({ ...draft, tags: tags.filter((item) => item !== tag) });

  const currencyOptions = SERVICE_CURRENCY_PRESETS.map((option) => ({
    value: option.value,
    label: option.value === 'OTHER' ? 'Other' : option.code,
  }));

  return createPortal(
    <div className="fixed inset-0 z-[100]">
      <div
        role="button"
        tabIndex={-1}
        aria-label="Close drawer overlay"
        className="absolute inset-0 z-0 cursor-pointer bg-black/40 backdrop-blur-[2px]"
        onMouseDown={(event) => {
          if (event.button !== 0 || saving) return;
          event.preventDefault();
          onClose();
        }}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="service-form-drawer-title"
        style={STUDIO_FLOAT_IN_STYLE}
        className="absolute inset-y-0 right-0 z-10 flex h-full w-full flex-col bg-white shadow-2xl dark:bg-[#0A0A0A] sm:max-w-[600px] sm:border-l sm:border-black/[0.06] sm:dark:border-white/[0.08]"
        onMouseDown={(event) => event.stopPropagation()}
        onKeyDown={(event) => {
          if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
            event.preventDefault();
            submit();
          }
        }}
      >
        <div className="flex items-center justify-between gap-4 px-8 pb-2 pt-8 sm:px-10">
          <h2 id="service-form-drawer-title" className="text-[1.75rem] font-bold tracking-[-0.02em] text-[#111111] dark:text-white">
            {isEdit ? 'Edit service' : 'New service'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-neutral-500 transition-colors hover:bg-black/[0.06] hover:text-[#111111] disabled:opacity-40 dark:text-neutral-400 dark:hover:bg-white/[0.08] dark:hover:text-white"
            aria-label="Close"
          >
            <FontAwesomeIcon icon={faXmark} className="h-4 w-4" />
          </button>
        </div>

        <div
          ref={bodyRef}
          className="min-h-0 flex-1 overflow-y-auto px-8 pb-12 sm:px-10 [scrollbar-color:rgba(0,0,0,0.18)_transparent] [scrollbar-width:thin] dark:[scrollbar-color:rgba(255,255,255,0.16)_transparent]"
        >
          <section className="grid grid-cols-1 gap-y-10 py-10" aria-label="About the service">
            <LineField label="Title" required error={show('title')}>
              <input
                autoFocus={!isEdit}
                value={draft.title}
                onChange={(event) => onChange({ ...draft, title: event.target.value })}
                maxLength={100}
                className={STUDIO_INLINE_TEXT_CLASS}
                placeholder="e.g. REST API development"
              />
            </LineField>

            {specialties.length > 0 ? (
              <ChoiceField
                label="Specialty"
                required
                error={show('specialty')}
                value={draft.specialty ?? ''}
                options={specialties.map((item) => ({ value: item, label: item }))}
                onChange={(specialty) => onChange({ ...draft, specialty })}
              />
            ) : null}

            <LineField
              label="Description"
              aside={
                <span className={`text-[13px] tabular-nums ${descriptionOver ? 'font-semibold text-amber-600' : 'text-neutral-400'}`}>
                  {descriptionLength} / {SERVICE_DESCRIPTION_SOFT_LIMIT}
                </span>
              }
            >
              <textarea
                value={draft.description ?? ''}
                onChange={(event) => onChange({ ...draft, description: event.target.value })}
                rows={1}
                className={`${STUDIO_INLINE_TEXT_CLASS} resize-none leading-relaxed [field-sizing:content]`}
                placeholder="What the client receives"
              />
            </LineField>
          </section>

          <section
            className="grid grid-cols-1 gap-x-8 gap-y-10 border-t border-black/[0.06] py-10 dark:border-white/[0.06]"
            aria-label="Pricing and delivery"
          >
            <ChoiceField
              label="Pricing"
              required
              value={pricingType}
              options={SERVICE_PRICING_OPTIONS}
              onChange={(next) =>
                onChange({
                  ...draft,
                  pricingType: next,
                  basePriceCents: next === 'QUOTE' ? null : draft.basePriceCents,
                })
              }
            />

            {showAmount ? (
              <div className="grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
                <LineField label={pricingType === 'FROM' ? 'Starting price' : 'Price'} required error={show('amount')}>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={eurosInputFromCents(draft.basePriceCents)}
                    onChange={(event) => onChange({ ...draft, basePriceCents: centsFromEurosInput(event.target.value) })}
                    className={`${STUDIO_INLINE_TEXT_CLASS} tabular-nums`}
                    placeholder="150"
                  />
                </LineField>
                <ChoiceField label="Currency" value={currencyPreset} options={currencyOptions} onChange={setCurrencyPreset} />
                {customCurrency ? (
                  <LineField label="Currency code" required error={show('currency')}>
                    <input
                      autoFocus
                      value={draft.currency ?? ''}
                      onChange={(event) =>
                        onChange({
                          ...draft,
                          currency: event.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8),
                        })
                      }
                      maxLength={8}
                      className={`${STUDIO_INLINE_TEXT_CLASS} uppercase`}
                      placeholder="GBP"
                    />
                  </LineField>
                ) : null}
              </div>
            ) : null}

            <div className="grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
              <LineField label="Delivery">
                <input
                  type="number"
                  min={1}
                  value={draft.deliveryValue ?? ''}
                  onChange={(event) => {
                    const raw = event.target.value.trim();
                    onChange({ ...draft, deliveryValue: raw ? Math.max(1, Math.round(Number(raw))) : null });
                  }}
                  className={`${STUDIO_INLINE_TEXT_CLASS} tabular-nums [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none`}
                  placeholder="3"
                />
              </LineField>
              <ChoiceField
                label="Unit"
                value={(draft.deliveryUnit ?? 'DAYS') as ServiceDeliveryUnit}
                options={SERVICE_DELIVERY_UNIT_OPTIONS}
                onChange={(deliveryUnit) => onChange({ ...draft, deliveryUnit })}
              />
            </div>

            <ChoiceField
              label="Status"
              value={(draft.status ?? 'ACTIVE') as ServiceStatus}
              options={SERVICE_STATUS_OPTIONS}
              onChange={(status) => onChange({ ...draft, status })}
              renderPrefix={(value) => <span className={`h-2 w-2 rounded-full ${statusDot(value)}`} aria-hidden />}
            />
          </section>

          <section
            className="grid grid-cols-1 gap-y-10 border-t border-black/[0.06] pt-10 dark:border-white/[0.06]"
            aria-label="Cover and tags"
          >
            <div>
              <FieldLabel label="Cover" />
              <div
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
                className={`group/cover relative aspect-[16/9] w-full overflow-hidden rounded-lg border transition-colors ${
                  dragOver
                    ? 'border-[#FF5722] bg-[#FF5722]/[0.04]'
                    : coverResolved
                      ? 'border-black/[0.06] dark:border-white/[0.08]'
                      : 'border-dashed border-black/[0.12] dark:border-white/[0.14]'
                }`}
              >
                {coverResolved ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={coverResolved} alt="" className="absolute inset-0 h-full w-full object-cover" />
                    <div className="absolute inset-x-0 top-0 flex h-[45%] items-start justify-end gap-2 bg-gradient-to-b from-black/55 via-black/20 via-45% to-transparent p-3 opacity-100 transition-opacity sm:opacity-0 sm:group-hover/cover:opacity-100 sm:group-focus-within/cover:opacity-100">
                      <button
                        type="button"
                        disabled={uploadingCover || saving}
                        onClick={() => fileInputRef.current?.click()}
                        className="inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-[13px] font-medium text-[#111111] backdrop-blur transition hover:bg-white"
                      >
                        <FontAwesomeIcon icon={faImage} className="h-3 w-3" />
                        Replace
                      </button>
                      <button
                        type="button"
                        disabled={saving}
                        onClick={() => onChange({ ...draft, coverImageUrl: '' })}
                        aria-label="Remove cover"
                        className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-[#111111] backdrop-blur transition hover:bg-white hover:text-[#FF5722]"
                      >
                        <FontAwesomeIcon icon={faTrashCan} className="h-3 w-3" />
                      </button>
                    </div>
                  </>
                ) : (
                  <button
                    type="button"
                    disabled={uploadingCover || saving}
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 flex flex-col items-center justify-center gap-2.5 text-neutral-400 transition-colors hover:text-[#111111] dark:text-neutral-500 dark:hover:text-white"
                  >
                    <FontAwesomeIcon icon={faCloudArrowUp} className="h-5 w-5" />
                    <span className="text-[15px] font-medium">Upload an image</span>
                  </button>
                )}
                {uploadingCover ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/70 text-[14px] font-medium text-[#111111] backdrop-blur-sm dark:bg-black/60 dark:text-white">
                    Uploading…
                  </div>
                ) : null}
              </div>
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
            </div>

            <LineField
              label="Tags"
              aside={<span className="text-[13px] tabular-nums text-neutral-400">{tags.length} / {MAX_TAGS}</span>}
            >
              <div className="flex flex-wrap items-center gap-2 pb-3">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 rounded-full border border-black/[0.1] py-1 pl-3 pr-1.5 text-[14px] font-medium text-[#111111] dark:border-white/[0.12] dark:text-white"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      aria-label={`Remove ${tag}`}
                      className="inline-flex h-5 w-5 items-center justify-center rounded-full text-neutral-400 transition hover:text-[#FF5722]"
                    >
                      <FontAwesomeIcon icon={faXmark} className="h-2.5 w-2.5" />
                    </button>
                  </span>
                ))}
                {tags.length < MAX_TAGS ? (
                  <input
                    value={tagDraft}
                    onChange={(event) => {
                      const value = event.target.value;
                      if (value.endsWith(',')) addTag(value);
                      else setTagDraft(value);
                    }}
                    maxLength={40}
                    placeholder={tags.length === 0 ? 'Type and press Enter' : 'Add a tag'}
                    className="min-w-[8rem] flex-1 border-0 bg-transparent p-0 py-1 text-base text-black caret-[#FF5722] outline-none placeholder:text-neutral-400 focus:ring-0 dark:text-neutral-100 dark:placeholder:text-neutral-600"
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        event.preventDefault();
                        addTag(tagDraft);
                      } else if (event.key === 'Backspace' && !tagDraft && tags.length > 0) {
                        removeTag(tags[tags.length - 1]);
                      }
                    }}
                  />
                ) : null}
              </div>
            </LineField>
          </section>
        </div>

        <div className="flex items-center justify-between gap-4 border-t border-black/[0.06] px-8 py-5 dark:border-white/[0.08] sm:px-10">
          <p className="text-[13px] font-medium text-[#FF5722]">
            {attempted && hasErrors ? 'Complete the highlighted fields.' : null}
          </p>
          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-lg px-4 py-2.5 text-[15px] font-medium text-neutral-600 transition-colors hover:text-[#111111] disabled:opacity-40 dark:text-neutral-300 dark:hover:text-white"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={submit}
              disabled={saving || uploadingCover}
              className="rounded-lg bg-[#111111] px-5 py-2.5 text-[15px] font-medium text-white transition-opacity hover:opacity-85 disabled:opacity-40 dark:bg-white dark:text-[#111111]"
            >
              {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Publish service'}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

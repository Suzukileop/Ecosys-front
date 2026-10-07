'use client';

import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowUpFromBracket, faImage, faTrashCan, faXmark } from '@fortawesome/free-solid-svg-icons';
import type { ProfileServiceForm } from '@/components/creator/studio/profile-form-schema';
import { STUDIO_FLOAT_IN_STYLE } from '@/components/portfolio/PortfolioStudioKit';
import {
  currencyPresetFromCode,
  normalizeBillingPeriod,
  SERVICE_BILLING_PERIOD_OPTIONS,
  SERVICE_CURRENCY_PRESETS,
  SERVICE_DELIVERY_UNIT_OPTIONS,
  SERVICE_DESCRIPTION_SOFT_LIMIT,
  SERVICE_PRICING_OPTIONS,
  servicePriceCentsForPricing,
  servicePricingNeedsAmount,
  SERVICE_STATUS_OPTIONS,
  type ServiceBillingPeriod,
  type ServiceCurrencyPreset,
  type ServiceDeliveryUnit,
  type ServicePricingType,
  type ServiceStatus,
} from '@/lib/profile-services';
import { resolveStorageMediaUrl } from '@/lib/storage-media-url';
import { MediaImage } from '@/components/ui/MediaImage';

const MAX_TAGS = 8;
const TITLE_LIMIT = 60;
const BILLING_ONE_TIME = 'ONE_TIME';
const billingOptions: { value: ServiceBillingPeriod | typeof BILLING_ONE_TIME; label: string }[] = [
  { value: BILLING_ONE_TIME, label: 'One-time' },
  ...SERVICE_BILLING_PERIOD_OPTIONS,
];

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

const INK_CLASS = 'text-[#0F0F0F] dark:text-[#F1F1F1]';
const MUTED_CLASS = 'text-[#606060] dark:text-[#AAAAAA]';

/** Filled values read solid ink; placeholders stay grey so they never pass for a value. */
const FIELD_INPUT_CLASS = `block w-full border-0 bg-transparent p-0 text-[15px] font-medium leading-5 ${INK_CLASS} caret-[#FF5722] outline-none focus:ring-0 placeholder:font-normal placeholder:text-[#909090] disabled:opacity-60 dark:placeholder:text-[#717171]`;

function fieldBoxClass(error?: string | null) {
  return `rounded-[10px] border bg-[#FFFFFF] transition-[border-color,box-shadow] duration-150 focus-within:border-[#CCCCCC] focus-within:shadow-[0_0_0_3px_rgba(255,87,34,0.16)] dark:bg-white/[0.02] dark:focus-within:border-white/[0.24] ${
    error
      ? 'border-[#FF5722]'
      : 'border-[#E5E5E5] hover:border-[#CCCCCC] dark:border-white/[0.12] dark:hover:border-white/[0.24]'
  }`;
}

function Counter({ value, limit }: { value: number; limit: number }) {
  return (
    <span className={`text-[13px] tabular-nums ${value > limit ? 'font-semibold text-amber-600' : MUTED_CLASS}`}>
      {value} / {limit}
    </span>
  );
}

function SectionHeading({ step, title }: { step: number; title: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#0F0F0F] text-[11px] font-bold tabular-nums text-white dark:bg-[#F1F1F1] dark:text-[#0F0F0F]">
        {step}
      </span>
      <h3 className={`text-[12.5px] font-semibold uppercase tracking-[0.08em] ${MUTED_CLASS}`}>{title}</h3>
      <span aria-hidden className="h-px flex-1 bg-[#E5E5E5] dark:bg-white/[0.1]" />
    </div>
  );
}

function FieldLabel({
  label,
  required,
  optional,
  aside,
}: {
  label: string;
  required?: boolean;
  optional?: boolean;
  aside?: ReactNode;
}) {
  return (
    <div className="mb-2 flex items-baseline justify-between gap-3">
      <span className={`text-[15px] font-semibold ${INK_CLASS}`}>
        {label}
        {required ? <span className="ml-0.5 text-[#FF5722]">*</span> : null}
        {optional ? <span className={`ml-1.5 text-[13px] font-normal ${MUTED_CLASS}`}>Optional</span> : null}
      </span>
      {aside}
    </div>
  );
}

function FieldError({ error }: { error?: string | null }) {
  return error ? <p className="mt-2 text-[14px] font-medium text-[#FF5722]">{error}</p> : null;
}

function FieldHint({ children }: { children: ReactNode }) {
  return <p className={`mt-2 text-[13px] ${MUTED_CLASS}`}>{children}</p>;
}

function LineField({
  label,
  required,
  error,
  aside,
  hint,
  className = '',
  children,
}: {
  label: string;
  required?: boolean;
  error?: string | null;
  aside?: ReactNode;
  hint?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div data-invalid={Boolean(error)} className={`min-w-0 ${className}`}>
      <FieldLabel label={label} required={required} aside={aside} />
      <div className={`px-3.5 py-3 ${fieldBoxClass(error)}`}>{children}</div>
      {error ? <FieldError error={error} /> : hint ? <FieldHint>{hint}</FieldHint> : null}
    </div>
  );
}

function ChevronDown({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="m6 9 6 6 6-6" />
    </svg>
  );
}

/** Input with an attached native select on the right (currency, delivery unit). */
function AffixField<T extends string>({
  label,
  required,
  optional,
  error,
  selectLabel,
  selectValue,
  selectOptions,
  onSelectChange,
  children,
}: {
  label: string;
  required?: boolean;
  optional?: boolean;
  error?: string | null;
  selectLabel: string;
  selectValue: T;
  selectOptions: readonly { value: T; label: string }[];
  onSelectChange: (value: T) => void;
  children: ReactNode;
}) {
  return (
    <div data-invalid={Boolean(error)} className="min-w-0">
      <FieldLabel label={label} required={required} optional={optional} />
      <div className={`flex h-[46px] overflow-hidden ${fieldBoxClass(error)}`}>
        <div className="flex min-w-0 flex-1 items-center px-3.5">{children}</div>
        <div className="relative shrink-0 border-l border-[#E5E5E5] bg-[#F9F9F9] dark:border-white/[0.12] dark:bg-white/[0.04]">
          <select
            aria-label={selectLabel}
            value={selectValue}
            onChange={(event) => onSelectChange(event.target.value as T)}
            className={`h-full min-w-[5.75rem] cursor-pointer appearance-none border-0 bg-transparent bg-none py-0 pl-3.5 pr-9 text-[15px] font-semibold ${INK_CLASS} outline-none focus:ring-0 dark:[color-scheme:dark]`}
          >
            {selectOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown className={`pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 ${MUTED_CLASS}`} />
        </div>
      </div>
      <FieldError error={error} />
    </div>
  );
}

function SelectField({
  label,
  required,
  error,
  value,
  options,
  placeholder,
  onChange,
}: {
  label: string;
  required?: boolean;
  error?: string | null;
  value: string;
  options: readonly string[];
  placeholder: string;
  onChange: (value: string) => void;
}) {
  return (
    <div data-invalid={Boolean(error)} className="min-w-0">
      <FieldLabel label={label} required={required} />
      <div className={`relative h-[46px] ${fieldBoxClass(error)}`}>
        <select
          aria-label={label}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={`h-full w-full cursor-pointer appearance-none truncate rounded-[10px] border-0 bg-transparent bg-none py-0 pl-3.5 pr-10 text-[15px] outline-none focus:ring-0 dark:[color-scheme:dark] ${
            value ? `font-medium ${INK_CLASS}` : 'font-normal text-[#909090] dark:text-[#717171]'
          }`}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((option) => (
            <option key={option} value={option} className="text-[#0F0F0F] dark:text-[#F1F1F1]">
              {option}
            </option>
          ))}
        </select>
        <ChevronDown className={`pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 ${MUTED_CLASS}`} />
      </div>
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
  equalOnMobile = false,
  optional,
  className = '',
}: {
  label: string;
  required?: boolean;
  optional?: boolean;
  error?: string | null;
  value: T;
  options: readonly { value: T; label: string }[];
  onChange: (value: T) => void;
  renderPrefix?: (value: T) => ReactNode;
  /** One row of equal-width pills on mobile (short, fixed option sets). */
  equalOnMobile?: boolean;
  className?: string;
}) {
  return (
    <div data-invalid={Boolean(error)} className={`min-w-0 ${className}`}>
      <FieldLabel label={label} required={required} optional={optional} />
      <div
        role="radiogroup"
        aria-label={label}
        style={equalOnMobile ? { gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` } : undefined}
        className={equalOnMobile ? 'grid gap-1.5 sm:flex sm:flex-wrap sm:gap-2' : 'flex flex-wrap gap-2'}
      >
        {options.map((option) => {
          const active = option.value === value;
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange(option.value)}
              className={`inline-flex h-10 items-center rounded-full border font-medium transition-colors duration-200 ${
                equalOnMobile
                  ? 'min-w-0 justify-center gap-1.5 whitespace-nowrap px-2 text-[14px] sm:gap-2 sm:px-4 sm:text-[15px]'
                  : 'gap-2 px-4 text-[15px]'
              } ${
                active
                  ? 'border-[#0F0F0F] bg-[#0F0F0F] text-white dark:border-[#F1F1F1] dark:bg-[#F1F1F1] dark:text-[#0F0F0F]'
                  : `border-[#E5E5E5] bg-[#FFFFFF] ${INK_CLASS} hover:border-[#CCCCCC] hover:bg-[#F9F9F9] dark:border-white/[0.12] dark:bg-transparent dark:hover:border-white/[0.24] dark:hover:bg-white/[0.04]`
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

function SegmentedField<T extends string>({
  label,
  required,
  optional,
  value,
  options,
  onChange,
}: {
  label: string;
  required?: boolean;
  optional?: boolean;
  value: T;
  options: readonly { value: T; label: string }[];
  onChange: (value: T) => void;
}) {
  return (
    <div className="min-w-0">
      <FieldLabel label={label} required={required} optional={optional} />
      <div
        role="radiogroup"
        aria-label={label}
        className="grid grid-cols-2 gap-1 rounded-xl bg-[#F2F2F2] p-1 dark:bg-white/[0.06] sm:grid-cols-4"
      >
        {options.map((option) => {
          const active = option.value === value;
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange(option.value)}
              className={`min-h-10 rounded-lg px-2 py-2 text-[14.5px] font-medium leading-tight transition-[background-color,color,box-shadow] duration-150 ${
                active
                  ? `bg-[#FFFFFF] ${INK_CLASS} shadow-[0_1px_3px_rgba(0,0,0,0.1)] dark:bg-[#272727]`
                  : 'text-[#3F3F3F] hover:text-[#0F0F0F] dark:text-[#AAAAAA] dark:hover:text-[#F1F1F1]'
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
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
  const showAmount = servicePricingNeedsAmount(pricingType);
  const billingPeriod = normalizeBillingPeriod(draft.billingPeriod);
  const descriptionLength = (draft.description ?? '').length;
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

  const deliveryField = (
    <AffixField
      label="Delivery"
      optional
      selectLabel="Delivery unit"
      selectValue={(draft.deliveryUnit ?? 'DAYS') as ServiceDeliveryUnit}
      selectOptions={SERVICE_DELIVERY_UNIT_OPTIONS}
      onSelectChange={(deliveryUnit) => onChange({ ...draft, deliveryUnit })}
    >
      <input
        type="number"
        min={1}
        aria-label="Delivery time"
        value={draft.deliveryValue ?? ''}
        onChange={(event) => {
          const raw = event.target.value.trim();
          onChange({ ...draft, deliveryValue: raw ? Math.max(1, Math.round(Number(raw))) : null });
        }}
        className={`${FIELD_INPUT_CLASS} tabular-nums [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none`}
        placeholder="e.g. 3"
      />
    </AffixField>
  );

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
        className="absolute inset-y-0 right-0 z-10 flex h-full w-full flex-col bg-[#FFFFFF] shadow-2xl dark:bg-[#0F0F0F] sm:max-w-[600px]"
        onMouseDown={(event) => event.stopPropagation()}
        onKeyDown={(event) => {
          if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
            event.preventDefault();
            submit();
          }
        }}
      >
        <div className="flex items-center justify-between gap-4 border-b border-[#E5E5E5] px-6 py-5 dark:border-white/[0.1] sm:px-8">
          <h2 id="service-form-drawer-title" className={`text-[1.625rem] font-bold tracking-[-0.02em] ${INK_CLASS}`}>
            {isEdit ? 'Edit service' : 'New service'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className={`-mr-2 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${MUTED_CLASS} outline-none transition-colors duration-150 hover:bg-[#F2F2F2] hover:text-[#0F0F0F] focus-visible:ring-2 focus-visible:ring-[#FF5722]/40 disabled:pointer-events-none disabled:opacity-40 dark:hover:bg-white/[0.1] dark:hover:text-[#F1F1F1]`}
            aria-label="Close"
          >
            <FontAwesomeIcon icon={faXmark} className="h-4 w-4" />
          </button>
        </div>

        <div
          ref={bodyRef}
          className="min-h-0 flex-1 overflow-y-auto px-6 pb-12 pt-7 sm:px-8 [scrollbar-color:rgba(0,0,0,0.18)_transparent] [scrollbar-width:thin] dark:[scrollbar-color:rgba(255,255,255,0.16)_transparent]"
        >
          <div className="space-y-12">
            <section className="space-y-6" aria-label="Essentials">
              <SectionHeading step={1} title="Essentials" />

              <LineField
                label="Title"
                required
                error={show('title')}
                aside={<Counter value={draft.title.length} limit={TITLE_LIMIT} />}
                hint="Say what you deliver, not who you are."
              >
                <input
                  autoFocus={!isEdit}
                  value={draft.title}
                  onChange={(event) => onChange({ ...draft, title: event.target.value })}
                  maxLength={TITLE_LIMIT}
                  className={FIELD_INPUT_CLASS}
                  placeholder="e.g. REST API development"
                />
              </LineField>

              {specialties.length > 0 ? (
                <SelectField
                  label="Specialty"
                  required
                  error={show('specialty')}
                  value={draft.specialty ?? ''}
                  options={
                    draft.specialty && !specialties.includes(draft.specialty)
                      ? [draft.specialty, ...specialties]
                      : specialties
                  }
                  placeholder="Select a specialty"
                  onChange={(specialty) => onChange({ ...draft, specialty })}
                />
              ) : null}

              <LineField
                label="Description"
                aside={<Counter value={descriptionLength} limit={SERVICE_DESCRIPTION_SOFT_LIMIT} />}
              >
                <textarea
                  value={draft.description ?? ''}
                  onChange={(event) => onChange({ ...draft, description: event.target.value })}
                  rows={3}
                  className={`${FIELD_INPUT_CLASS} min-h-[4.5rem] resize-none leading-relaxed [field-sizing:content]`}
                  placeholder="What the client receives"
                />
              </LineField>
            </section>

            <section className="space-y-6" aria-label="Pricing and delivery">
              <SectionHeading step={2} title="Pricing & delivery" />

              <SegmentedField
                label="Pricing"
                required
                value={pricingType}
                options={SERVICE_PRICING_OPTIONS}
                onChange={(next) =>
                  onChange({
                    ...draft,
                    pricingType: next,
                    basePriceCents: servicePricingNeedsAmount(next)
                      ? draft.pricingType === 'FREE'
                        ? null
                        : draft.basePriceCents
                      : servicePriceCentsForPricing(next, null),
                  })
                }
              />

              <div className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                {showAmount ? (
                  <AffixField
                    label={pricingType === 'FROM' ? 'Starting price' : 'Price'}
                    required
                    error={show('amount')}
                    selectLabel="Currency"
                    selectValue={currencyPreset}
                    selectOptions={currencyOptions}
                    onSelectChange={setCurrencyPreset}
                  >
                    <input
                      type="text"
                      inputMode="decimal"
                      aria-label="Price"
                      value={eurosInputFromCents(draft.basePriceCents)}
                      onChange={(event) => onChange({ ...draft, basePriceCents: centsFromEurosInput(event.target.value) })}
                      className={`${FIELD_INPUT_CLASS} tabular-nums`}
                      placeholder="150"
                    />
                  </AffixField>
                ) : null}
                {deliveryField}
                {showAmount && customCurrency ? (
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
                      className={`${FIELD_INPUT_CLASS} uppercase`}
                      placeholder="GBP"
                    />
                  </LineField>
                ) : null}
              </div>

              {showAmount ? (
                <SegmentedField
                  label="Billing period"
                  optional
                  value={billingPeriod ?? BILLING_ONE_TIME}
                  options={billingOptions}
                  onChange={(next) =>
                    onChange({
                      ...draft,
                      billingPeriod: next === BILLING_ONE_TIME ? null : next,
                    })
                  }
                />
              ) : null}
            </section>

            <section className="space-y-6" aria-label="Presentation">
              <SectionHeading step={3} title="Presentation" />

              <div>
                <FieldLabel label="Cover" aside={<span className={`text-[13px] ${MUTED_CLASS}`}>16:10 · JPG, PNG, WebP</span>} />
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
                  className={`group/cover relative w-full overflow-hidden rounded-[10px] border transition-colors ${
                    coverResolved ? 'aspect-[16/10]' : 'h-36'
                  } ${
                    dragOver
                      ? 'border-dashed border-[#FF5722] bg-[#FF5722]/[0.04]'
                      : coverResolved
                        ? 'border-[#E5E5E5] dark:border-white/[0.1]'
                        : 'border-dashed border-[#CCCCCC] bg-[#F9F9F9] hover:bg-[#F2F2F2] dark:border-white/[0.2] dark:bg-white/[0.03] dark:hover:bg-white/[0.06]'
                  }`}
                >
                  {coverResolved ? (
                    <>
                      <MediaImage
                        src={coverResolved}
                        widths={[640, 828, 1080]}
                        sizes="(min-width: 640px) 540px, 100vw"
                        priority
                        className="absolute inset-0 h-full w-full object-cover"
                      />
                      <div className="absolute inset-x-0 top-0 flex h-[45%] items-start justify-end gap-2 bg-gradient-to-b from-black/55 via-black/20 via-45% to-transparent p-3 opacity-100 transition-opacity sm:opacity-0 sm:group-hover/cover:opacity-100 sm:group-focus-within/cover:opacity-100">
                        <button
                          type="button"
                          disabled={uploadingCover || saving}
                          onClick={() => fileInputRef.current?.click()}
                          className="inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3.5 py-1.5 text-[14px] font-medium text-[#0F0F0F] backdrop-blur transition hover:bg-white"
                        >
                          <FontAwesomeIcon icon={faImage} className="h-3 w-3" />
                          Replace
                        </button>
                        <button
                          type="button"
                          disabled={saving}
                          onClick={() => onChange({ ...draft, coverImageUrl: '' })}
                          aria-label="Remove cover"
                          className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-[#0F0F0F] backdrop-blur transition hover:bg-white hover:text-[#FF5722]"
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
                      className="absolute inset-0 flex flex-col items-center justify-center gap-1.5"
                    >
                      <span className={`inline-flex items-center gap-2 text-[15px] font-semibold ${INK_CLASS}`}>
                        <FontAwesomeIcon icon={faArrowUpFromBracket} className="h-3.5 w-3.5" />
                        Upload an image
                      </span>
                      <span className={`text-[13px] ${MUTED_CLASS}`}>or drag &amp; drop it here</span>
                    </button>
                  )}
                  {uploadingCover ? (
                    <div className={`absolute inset-0 flex items-center justify-center bg-white/70 text-[14px] font-medium ${INK_CLASS} backdrop-blur-sm dark:bg-black/60`}>
                      Uploading…
                    </div>
                  ) : null}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="sr-only"
                  tabIndex={-1}
                  aria-hidden
                  disabled={uploadingCover || saving}
                  onChange={(event) => {
                    onCoverFile(event.target.files?.[0] ?? null);
                    event.target.value = '';
                  }}
                />
              </div>

              <LineField label="Tags" aside={<Counter value={tags.length} limit={MAX_TAGS} />}>
                <div className="flex flex-wrap items-center gap-2">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className={`inline-flex items-center gap-1 rounded-lg bg-black/[0.05] py-1 pl-2.5 pr-1 text-[14px] font-medium ${INK_CLASS} dark:bg-white/[0.1]`}
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        aria-label={`Remove ${tag}`}
                        className={`inline-flex h-5 w-5 items-center justify-center rounded-full ${MUTED_CLASS} transition hover:text-[#FF5722]`}
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
                      className={`${FIELD_INPUT_CLASS} !w-auto min-w-[8rem] flex-1`}
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

            <section className="space-y-6" aria-label="Visibility">
              <SectionHeading step={4} title="Visibility" />
              <ChoiceField
                label="Status"
                value={(draft.status ?? 'ACTIVE') as ServiceStatus}
                options={SERVICE_STATUS_OPTIONS}
                onChange={(status) => onChange({ ...draft, status })}
                equalOnMobile
                renderPrefix={(value) => <span className={`h-2 w-2 shrink-0 rounded-full ${statusDot(value)}`} aria-hidden />}
              />
            </section>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 border-t border-[#E5E5E5] px-6 py-4 dark:border-white/[0.1] sm:px-8">
          <p className="text-[14px] font-medium text-[#FF5722]">
            {attempted && hasErrors ? 'Complete the highlighted fields.' : null}
          </p>
          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className={`h-10 rounded-full px-4 text-[15px] font-medium ${INK_CLASS} transition-colors hover:bg-[#F2F2F2] disabled:opacity-40 dark:hover:bg-white/[0.1]`}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={submit}
              disabled={saving || uploadingCover}
              className="h-10 rounded-full bg-[#0F0F0F] px-5 text-[15px] font-medium text-white transition-opacity hover:opacity-85 disabled:opacity-40 dark:bg-[#F1F1F1] dark:text-[#0F0F0F]"
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

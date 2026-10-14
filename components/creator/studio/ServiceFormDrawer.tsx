'use client';

import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowUpFromBracket, faXmark } from '@fortawesome/free-solid-svg-icons';
import type { ProfileServiceForm } from '@/components/creator/studio/profile-form-schema';
import { STUDIO_FLOAT_IN_STYLE } from '@/components/portfolio/PortfolioStudioKit';
import { ServiceCard } from '@/components/marketplace/CreatorProfileServicesTab';
import { providerChipClass } from '@/components/marketplace/ProviderDirectoryPrimitives';
import { CurrencyPicker } from '@/components/ui/CurrencyPicker';
import { MediaImage } from '@/components/ui/MediaImage';
import { CURRENCIES } from '@/lib/currencies';
import {
  MAX_SERVICE_INCLUDES,
  normalizeBillingPeriod,
  normalizeServiceCurrency,
  normalizeServiceStatus,
  SERVICE_BILLING_PERIOD_OPTIONS,
  SERVICE_DELIVERY_UNIT_OPTIONS,
  SERVICE_DESCRIPTION_SOFT_LIMIT,
  SERVICE_INCLUDE_MAX_LENGTH,
  SERVICE_PRICING_OPTIONS,
  servicePriceCentsForPricing,
  servicePricingNeedsAmount,
  type ServiceDeliveryUnit,
  type ServicePricingType,
  type ServiceStatus,
} from '@/lib/profile-services';
import { resolveStorageMediaUrl } from '@/lib/storage-media-url';
import type { ProfileServiceItem } from '@/types/profile';
import { useT } from '@/lib/i18n/I18nProvider';

const MAX_TAGS = 8;
const TITLE_LIMIT = 60;

const subscribeNoop = () => () => {};

/* The app's X palette (ink #0F1419 / #E7E9EA, secondary #536471 / #71767B), errors in red. */
const INK = 'text-[#0F1419] dark:text-[#E7E9EA]';
const INK2 = 'text-[#536471] dark:text-[#71767B]';

const INPUT_CLASS = `block w-full min-w-0 border-0 bg-transparent p-0 text-[15px] leading-6 ${INK} caret-[#0F1419] outline-none placeholder:text-[#8B98A5] focus:ring-0 disabled:opacity-60 dark:caret-[#E7E9EA] dark:placeholder:text-[#536471]`;

const primaryButtonClass =
  'inline-flex h-10 items-center justify-center rounded-full bg-[#0F1419] px-5 text-[15px] font-bold text-white transition-colors hover:bg-[#272C30] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F1419]/40 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-[#EFF3F4] dark:text-[#0F1419] dark:hover:bg-[#D7DBDC]';
const secondaryButtonClass = `inline-flex h-10 items-center justify-center rounded-full px-5 text-[15px] font-bold shadow-[inset_0_0_0_1px_#CFD9DE] transition-colors hover:bg-[rgba(15,20,25,0.06)] disabled:cursor-not-allowed disabled:opacity-40 dark:shadow-[inset_0_0_0_1px_#536471] dark:hover:bg-[rgba(231,233,234,0.1)] ${INK}`;
const ghostButtonClass = `inline-flex h-10 items-center justify-center rounded-full px-4 text-[15px] font-semibold transition-colors hover:bg-[rgba(15,20,25,0.06)] disabled:opacity-40 dark:hover:bg-[rgba(231,233,234,0.1)] ${INK}`;
/** Quiet text action ("+ Delivery time", "Add an item", tag suggestions). */
const textActionClass = `text-[14px] font-semibold underline-offset-4 hover:underline focus-visible:underline focus-visible:outline-none ${INK}`;

/** A field is one hairline under its content (no box); focus draws it in ink, an error in red. */
function lineClass(error?: string | null) {
  return `border-b py-2 transition-[border-color,box-shadow] duration-150 ${
    error
      ? 'border-[#F4212E] shadow-[inset_0_-1px_0_#F4212E]'
      : 'border-[#CFD9DE] focus-within:border-[#0F1419] focus-within:shadow-[inset_0_-1px_0_#0F1419] dark:border-[#3E4144] dark:focus-within:border-[#E7E9EA] dark:focus-within:shadow-[inset_0_-1px_0_#E7E9EA]'
  }`;
}

function amountInputFromCents(cents: number | null | undefined): string {
  if (cents == null || Number.isNaN(cents) || cents <= 0) return '';
  return String(Number((cents / 100).toFixed(2)));
}

function centsFromAmountInput(raw: string): number | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const parsed = Number(trimmed.replace(',', '.'));
  if (!Number.isFinite(parsed) || parsed < 0) return null;
  return Math.round(parsed * 100);
}

function Counter({ value, limit }: { value: number; limit: number }) {
  return (
    <span className={`text-[13px] tabular-nums ${value > limit ? 'font-semibold text-[#F4212E]' : INK2}`}>
      {value} / {limit}
    </span>
  );
}

/** Required mark: a red "*" after the label (fields without it are optional — no "Optional" text). */
function RequiredMark() {
  return (
    <span aria-hidden className="ml-0.5 text-[#F4212E]">
      *
    </span>
  );
}

/**
 * One block of the form, set apart from the next by space alone (no rule — the fields already draw
 * their own hairlines): a 17px title (+ an aside such as a counter, on the same line), an optional
 * one-line description, then the content.
 */
function Section({
  title,
  aside,
  description,
  children,
}: {
  title: string;
  aside?: ReactNode;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section aria-label={title} className="pt-16">
      <div className="flex items-baseline justify-between gap-3">
        <h3 className={`text-[17px] font-extrabold tracking-[-0.01em] ${INK}`}>{title}</h3>
        {aside}
      </div>
      {description ? <p className={`mt-1 text-[14px] leading-5 ${INK2}`}>{description}</p> : null}
      <div className="mt-5">{children}</div>
    </section>
  );
}

/** Field label: small and secondary, a step below the section title; "*" when required. */
function FieldLabel({ label, required, aside }: { label: string; required?: boolean; aside?: ReactNode }) {
  return (
    <div className="mb-0.5 flex items-baseline justify-between gap-3">
      <span className={`text-[13px] font-medium ${INK2}`}>
        {label}
        {required ? <RequiredMark /> : null}
      </span>
      {aside}
    </div>
  );
}

function FieldMessage({ error, hint }: { error?: string | null; hint?: ReactNode }) {
  if (error) return <p className="mt-1.5 text-[13px] font-medium text-[#F4212E]">{error}</p>;
  if (hint) return <p className={`mt-1.5 text-[13px] ${INK2}`}>{hint}</p>;
  return null;
}

function LineField({
  label,
  required,
  error,
  aside,
  hint,
  children,
}: {
  /** Omitted when the section title already names the field. */
  label?: string;
  required?: boolean;
  error?: string | null;
  aside?: ReactNode;
  hint?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div data-invalid={Boolean(error)} className="min-w-0">
      {label ? <FieldLabel label={label} required={required} aside={aside} /> : null}
      <div className={lineClass(error)}>{children}</div>
      <FieldMessage error={error} hint={hint} />
    </div>
  );
}

/** One choice among a few — the app's chips (no native select). */
function ChipField<T extends string>({
  label,
  required,
  error,
  value,
  options,
  onChange,
}: {
  label: string;
  required?: boolean;
  error?: string | null;
  value: T | null;
  options: readonly { value: T; label: string }[];
  onChange: (value: T) => void;
}) {
  const t = useT();
  return (
    <div data-invalid={Boolean(error)} className="min-w-0">
      <FieldLabel label={label} required={required} />
      <div role="radiogroup" aria-label={label} className="mt-2 flex flex-wrap gap-2">
        {options.map((option) => {
          const active = option.value === value;
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange(option.value)}
              className={providerChipClass(active)}
            >
              {t(option.label)}
            </button>
          );
        })}
      </div>
      <FieldMessage error={error} />
    </div>
  );
}

/** An optional detail revealed on demand: its label with a quiet "Remove" (clears and hides it). */
function OptionalBlock({ label, onRemove, children }: { label: string; onRemove: () => void; children: ReactNode }) {
  const t = useT();
  return (
    <div className="min-w-0">
      <div className="mb-0.5 flex items-baseline justify-between gap-3">
        <span className={`text-[13px] font-medium ${INK2}`}>{label}</span>
        <button type="button" onClick={onRemove} className={`text-[13px] font-semibold ${INK2} hover:text-[#F4212E]`}>
          {t('Remove')}
        </button>
      </div>
      {children}
    </div>
  );
}

type ServiceFormDrawerProps = {
  open: boolean;
  draft: ProfileServiceForm;
  isEdit: boolean;
  specialties: string[];
  saving: boolean;
  uploadingCover: boolean;
  onChange: (next: ProfileServiceForm) => void;
  onClose: () => void;
  /** `status` overrides the draft's status: ACTIVE = publish, PAUSED = save as draft. */
  onSave: (status?: ServiceStatus) => void;
  onCoverFile: (file: File | null) => void;
};

type SaveAction = 'publish' | 'draft' | 'save';

/**
 * New / edit service — a right-hand panel (Etsy / Fiverr listing editor, on Skraft's X palette):
 *  - a live preview of the public service card on top (sticky from sm) that follows every keystroke;
 *  - then one block per concern, set apart by space (no rules): Cover (first: the card's most
 *    visible element), Details (title, specialty, description, tags), What's included, Pricing &
 *    delivery — no step numbers;
 *  - fields are one hairline (no boxes), choices are chips, the currency is the searchable picker;
 *    optional details (delivery time, billing period) stay folded until asked for;
 *  - the footer carries the outcome: Publish / Save as draft (new), Save changes (live), Save /
 *    Save & publish (paused or archived);
 *  - closing with unsaved edits asks first ("Discard changes?").
 */
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
  const t = useT();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  const includeRefs = useRef<(HTMLInputElement | null)[]>([]);
  const pendingIncludeFocus = useRef<number | null>(null);
  const mounted = useSyncExternalStore(subscribeNoop, () => true, () => false);
  const [tagDraft, setTagDraft] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [attempted, setAttempted] = useState(false);
  const [wasOpen, setWasOpen] = useState(open);
  const [initialSnapshot, setInitialSnapshot] = useState(() => JSON.stringify(draft));
  const [priceInput, setPriceInput] = useState(() => amountInputFromCents(draft.basePriceCents));
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const [pendingAction, setPendingAction] = useState<SaveAction | null>(null);
  /* Optional details start folded unless the service already uses them. */
  const [showDelivery, setShowDelivery] = useState(() => draft.deliveryValue != null);
  const [showBilling, setShowBilling] = useState(() => normalizeBillingPeriod(draft.billingPeriod) != null);

  if (wasOpen !== open) {
    setWasOpen(open);
    if (open) {
      setAttempted(false);
      setTagDraft('');
      setInitialSnapshot(JSON.stringify(draft));
      setPriceInput(amountInputFromCents(draft.basePriceCents));
      setConfirmDiscard(false);
      setPendingAction(null);
      setShowDelivery(draft.deliveryValue != null);
      setShowBilling(normalizeBillingPeriod(draft.billingPeriod) != null);
    }
  }

  const dirty = JSON.stringify(draft) !== initialSnapshot;
  const pricingType = (draft.pricingType ?? 'FIXED') as ServicePricingType;
  const showAmount = servicePricingNeedsAmount(pricingType);
  const billingPeriod = normalizeBillingPeriod(draft.billingPeriod);
  const currency = normalizeServiceCurrency(draft.currency);
  const descriptionLength = (draft.description ?? '').length;
  const coverResolved = resolveStorageMediaUrl(draft.coverImageUrl) || draft.coverImageUrl || '';
  const tags = draft.tags ?? [];
  const includes = draft.tasks ?? [];
  const status = normalizeServiceStatus(draft.status);
  const specialtyOptions = (
    draft.specialty && !specialties.includes(draft.specialty) ? [draft.specialty, ...specialties] : specialties
  ).map((item) => ({ value: item, label: item }));
  const currencyOptions = CURRENCIES.some((option) => option.code === currency)
    ? CURRENCIES
    : [...CURRENCIES, { code: currency, name: currency }].sort((a, b) => a.code.localeCompare(b.code));

  const errors = {
    title: draft.title.trim() ? null : t('Give your service a title.'),
    specialty: draft.specialty?.trim() ? null : 'Pick a specialty.',
    amount: showAmount && draft.basePriceCents == null ? 'Enter a price.' : null,
  };
  const hasErrors = Object.values(errors).some(Boolean);
  const show = (key: keyof typeof errors) => (attempted ? errors[key] : null);

  /* Closing with unsaved edits asks first; a clean form just closes. */
  const requestClose = () => {
    if (saving) return;
    if (dirty) setConfirmDiscard(true);
    else onClose();
  };

  const submit = (action: SaveAction) => {
    if (saving || uploadingCover) return;
    if (hasErrors) {
      setAttempted(true);
      requestAnimationFrame(() => {
        bodyRef.current?.querySelector('[data-invalid="true"]')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
      return;
    }
    setPendingAction(action);
    onSave(action === 'publish' ? 'ACTIVE' : action === 'draft' ? 'PAUSED' : undefined);
  };

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || saving) return;
      if (confirmDiscard) setConfirmDiscard(false);
      else if (dirty) setConfirmDiscard(true);
      else onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previous;
    };
  }, [open, onClose, saving, dirty, confirmDiscard]);

  /* The description starts one line tall like every other field and grows with its text. */
  useEffect(() => {
    const el = descriptionRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, [draft.description, open, mounted]);

  /* Focus the "What's included" row just added (Enter) or the one above a removed row (Backspace). */
  useEffect(() => {
    const index = pendingIncludeFocus.current;
    if (index == null) return;
    pendingIncludeFocus.current = null;
    includeRefs.current[index]?.focus();
  });

  if (!open || !mounted) return null;

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

  const setInclude = (index: number, value: string) =>
    onChange({ ...draft, tasks: includes.map((item, i) => (i === index ? { value } : item)) });

  const addInclude = (afterIndex = includes.length - 1) => {
    if (includes.length >= MAX_SERVICE_INCLUDES) return;
    const next = [...includes];
    next.splice(afterIndex + 1, 0, { value: '' });
    pendingIncludeFocus.current = afterIndex + 1;
    onChange({ ...draft, tasks: next });
  };

  const removeInclude = (index: number) => {
    pendingIncludeFocus.current = index > 0 ? index - 1 : null;
    onChange({ ...draft, tasks: includes.filter((_, i) => i !== index) });
  };

  const previewService: ProfileServiceItem = {
    id: draft.id,
    sortOrder: draft.sortOrder,
    title: draft.title.trim() || t('Your service title'),
    description: draft.description?.trim() ?? '',
    basePriceCents: showAmount ? draft.basePriceCents ?? null : servicePriceCentsForPricing(pricingType, null),
    deadline: draft.deadline ?? null,
    tasks: includes.map((item) => item.value.trim()).filter(Boolean),
    specialty: draft.specialty || null,
    pricingType,
    coverImageUrl: coverResolved || null,
    status,
    tags,
    currency,
    deliveryValue: draft.deliveryValue ?? null,
    deliveryUnit: draft.deliveryUnit ?? null,
    billingPeriod: showAmount ? billingPeriod : null,
  };

  const actionLabel = (action: SaveAction, idle: string) => (saving && pendingAction === action ? t('Saving…') : idle);
  const canAddBilling = showAmount && !showBilling;

  return createPortal(
    <div className="fixed inset-0 z-[100]">
      <div
        role="button"
        tabIndex={-1}
        aria-label={t('Close drawer overlay')}
        className="absolute inset-0 z-0 cursor-pointer bg-black/40 backdrop-blur-[2px]"
        onMouseDown={(event) => {
          if (event.button !== 0) return;
          event.preventDefault();
          requestClose();
        }}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="service-form-drawer-title"
        style={STUDIO_FLOAT_IN_STYLE}
        className="absolute inset-y-0 right-0 z-10 flex h-full w-full flex-col bg-white dark:bg-black sm:max-w-[600px] sm:shadow-[0_0_0_1px_#EFF3F4] sm:dark:shadow-[0_0_0_1px_#2F3336]"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-4 border-b border-[#EFF3F4] px-6 py-4 dark:border-[#2F3336] sm:px-8">
          <h2 id="service-form-drawer-title" className={`text-[20px] font-extrabold tracking-[-0.015em] ${INK}`}>
            {isEdit ? t('Edit service') : t('New service')}
          </h2>
          <button
            type="button"
            onClick={requestClose}
            disabled={saving}
            className={`-mr-2 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${INK} transition-colors hover:bg-[rgba(15,20,25,0.06)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F1419]/30 disabled:opacity-40 dark:hover:bg-[rgba(231,233,234,0.1)] dark:focus-visible:ring-white/30`}
            aria-label={t('Close')}
          >
            <FontAwesomeIcon icon={faXmark} className="h-4 w-4" />
          </button>
        </div>

        <div
          ref={bodyRef}
          className="min-h-0 flex-1 overflow-y-auto px-6 pb-8 sm:px-8 [scrollbar-color:rgba(0,0,0,0.18)_transparent] [scrollbar-width:thin] dark:[scrollbar-color:rgba(255,255,255,0.16)_transparent]"
        >
          {/* Live preview — the public card as clients will see it. From sm it stays pinned under the
              header, so every edit below shows up in it right away. */}
          <section
            aria-label={t('Preview')}
            className="-mx-6 bg-white px-6 pb-5 pt-5 dark:bg-black sm:sticky sm:top-0 sm:z-10 sm:-mx-8 sm:px-8 sm:shadow-[0_1px_0_#EFF3F4] sm:dark:shadow-[0_1px_0_#2F3336]"
          >
            <div className="mb-2.5 flex items-baseline justify-between gap-3">
              <p className={`text-[11px] font-semibold uppercase tracking-[0.12em] ${INK2}`}>{t('Preview')}</p>
              <p className={`text-[13px] ${INK2}`}>{t('How clients see it on your profile')}</p>
            </div>
            <div aria-hidden className="pointer-events-none select-none">
              <ServiceCard service={previewService} compact />
            </div>
          </section>

          {/* One block per concern, separated by space; the first one sits a little closer to the preview. */}
          <div className="pb-6 [&>section:first-child]:pt-10">
            <Section title={t('Cover')} description={t('The image clients see first. 16:10 works best — JPG, PNG or WebP.')}>
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
                className="relative"
              >
                {coverResolved ? (
                  <div className="flex items-center gap-4">
                    <div
                      className={`relative h-20 w-32 shrink-0 overflow-hidden bg-[#EFF3F4] dark:bg-[#202327] ${
                        dragOver ? 'ring-2 ring-[#0F1419] dark:ring-[#E7E9EA]' : ''
                      }`}
                    >
                      <MediaImage
                        src={coverResolved}
                        widths={[256, 384]}
                        sizes="128px"
                        className="absolute inset-0 h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
                      <button
                        type="button"
                        disabled={uploadingCover || saving}
                        onClick={() => fileInputRef.current?.click()}
                        className={`${secondaryButtonClass} !h-9 !px-4 !text-[14px]`}
                      >
                        {t('Replace')}
                      </button>
                      <button
                        type="button"
                        disabled={saving}
                        onClick={() => onChange({ ...draft, coverImageUrl: '' })}
                        className="inline-flex h-9 items-center rounded-full px-3 text-[14px] font-semibold text-[#F4212E] transition-colors hover:bg-[rgba(244,33,46,0.08)] disabled:opacity-40"
                      >
                        {t('Remove')}
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    disabled={uploadingCover || saving}
                    onClick={() => fileInputRef.current?.click()}
                    className={`flex h-28 w-full flex-col items-center justify-center gap-1 border border-dashed transition-colors ${
                      dragOver
                        ? 'border-[#0F1419] bg-[#F7F9F9] dark:border-[#E7E9EA] dark:bg-[#16181C]'
                        : 'border-[#CFD9DE] hover:bg-[#F7F9F9] dark:border-[#3E4144] dark:hover:bg-[#16181C]'
                    }`}
                  >
                    <span className={`inline-flex items-center gap-2 text-[15px] font-semibold ${INK}`}>
                      <FontAwesomeIcon icon={faArrowUpFromBracket} className="h-3.5 w-3.5" />
                      {t('Upload a cover image')}
                    </span>
                    <span className={`text-[13px] ${INK2}`}>{t('or drag and drop it here')}</span>
                  </button>
                )}
                {uploadingCover ? (
                  <div className={`absolute inset-0 flex items-center justify-center bg-white/75 text-[14px] font-semibold ${INK} dark:bg-black/70`}>
                    {t('Uploading…')}
                  </div>
                ) : null}
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
            </Section>

            <Section title={t('Details')}>
              <div className="space-y-9">
                <LineField
                  label={t('Title')}
                  required
                  error={show('title')}
                  aside={<Counter value={draft.title.length} limit={TITLE_LIMIT} />}
                  hint={t('Say what you deliver, not who you are.')}
                >
                  <input
                    autoFocus={!isEdit}
                    aria-label={t('Title')}
                    value={draft.title}
                    onChange={(event) => onChange({ ...draft, title: event.target.value })}
                    maxLength={TITLE_LIMIT}
                    className={INPUT_CLASS}
                    placeholder={t('e.g. REST API development')}
                  />
                </LineField>

                {specialtyOptions.length > 0 ? (
                  <ChipField
                    label={t('Specialty')}
                    required
                    error={show('specialty')}
                    value={draft.specialty || null}
                    options={specialtyOptions}
                    onChange={(specialty) => onChange({ ...draft, specialty })}
                  />
                ) : null}

                <LineField
                  label={t('Description')}
                  aside={<Counter value={descriptionLength} limit={SERVICE_DESCRIPTION_SOFT_LIMIT} />}
                >
                  <textarea
                    ref={descriptionRef}
                    aria-label={t('Description')}
                    value={draft.description ?? ''}
                    onChange={(event) => onChange({ ...draft, description: event.target.value })}
                    maxLength={SERVICE_DESCRIPTION_SOFT_LIMIT}
                    rows={1}
                    className={`${INPUT_CLASS} resize-none overflow-hidden`}
                    placeholder={t('The problem you solve and how you work')}
                  />
                </LineField>

                <LineField label={t('Tags')} aside={<Counter value={tags.length} limit={MAX_TAGS} />}>
                  <div className="flex flex-wrap items-center gap-2">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className={`inline-flex items-center gap-1 rounded-full bg-[#EFF3F4] py-0.5 pl-3 pr-1 text-[13px] font-medium dark:bg-[#202327] ${INK}`}
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          aria-label={t('Remove {tag}', { tag })}
                          className={`inline-flex h-5 w-5 items-center justify-center rounded-full ${INK2} transition-colors hover:text-[#F4212E]`}
                        >
                          <FontAwesomeIcon icon={faXmark} className="h-2.5 w-2.5" />
                        </button>
                      </span>
                    ))}
                    {tags.length < MAX_TAGS ? (
                      <input
                        aria-label={t('Add a tag')}
                        value={tagDraft}
                        onChange={(event) => {
                          const value = event.target.value;
                          if (value.endsWith(',')) addTag(value);
                          else setTagDraft(value);
                        }}
                        maxLength={40}
                        placeholder={tags.length === 0 ? t('Add keywords, press Enter') : t('Add a tag')}
                        className={`${INPUT_CLASS} !w-auto min-w-[8rem] flex-1`}
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
              </div>
            </Section>

            <Section
              title={t('What\'s included')}
              aside={<Counter value={includes.length} limit={MAX_SERVICE_INCLUDES} />}
              description={t('One deliverable per line — clients see it as a checklist.')}
            >
              {includes.length > 0 ? (
                <ul className="mb-4">
                  {includes.map((item, index) => (
                    <li key={index} className={`flex items-center gap-3 ${lineClass()}`}>
                      <svg aria-hidden className="h-4 w-4 shrink-0 text-[#00BA7C]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
                        <path d="m5 12.5 4.5 4.5L19 7.5" />
                      </svg>
                      <input
                        ref={(node) => {
                          includeRefs.current[index] = node;
                        }}
                        aria-label={`Included item ${index + 1}`}
                        value={item.value}
                        maxLength={SERVICE_INCLUDE_MAX_LENGTH}
                        onChange={(event) => setInclude(index, event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter') {
                            event.preventDefault();
                            if (item.value.trim()) addInclude(index);
                          } else if (event.key === 'Backspace' && !item.value) {
                            event.preventDefault();
                            removeInclude(index);
                          }
                        }}
                        placeholder={t('e.g. Source files (Figma, PSD)')}
                        className={INPUT_CLASS}
                      />
                      <button
                        type="button"
                        onClick={() => removeInclude(index)}
                        aria-label={`Remove item ${index + 1}`}
                        className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${INK2} transition-colors hover:bg-[rgba(15,20,25,0.06)] hover:text-[#0F1419] dark:hover:bg-[rgba(231,233,234,0.1)] dark:hover:text-[#E7E9EA]`}
                      >
                        <FontAwesomeIcon icon={faXmark} className="h-3 w-3" />
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}
              {includes.length < MAX_SERVICE_INCLUDES ? (
                <button type="button" onClick={() => addInclude()} className={textActionClass}>
                  {t('+ Add an item')}
                </button>
              ) : null}
            </Section>

            <Section title={t('Pricing & delivery')}>
              <div className="space-y-9">
                <ChipField
                  label={t('Pricing')}
                  required
                  value={pricingType}
                  options={SERVICE_PRICING_OPTIONS}
                  onChange={(next) => {
                    if (!servicePricingNeedsAmount(next)) setShowBilling(false);
                    onChange({
                      ...draft,
                      pricingType: next,
                      basePriceCents: servicePricingNeedsAmount(next)
                        ? centsFromAmountInput(priceInput)
                        : servicePriceCentsForPricing(next, null),
                      billingPeriod: servicePricingNeedsAmount(next) ? draft.billingPeriod : null,
                    });
                  }}
                />

                {showAmount ? (
                  <div className="max-w-xs">
                    <LineField label={pricingType === 'FROM' ? t('Starting price') : t('Price')} required error={show('amount')}>
                      <div className="flex items-center">
                        <input
                          type="text"
                          inputMode="decimal"
                          aria-label={t('Price')}
                          value={priceInput}
                          onChange={(event) => {
                            setPriceInput(event.target.value);
                            onChange({ ...draft, basePriceCents: centsFromAmountInput(event.target.value) });
                          }}
                          className={`${INPUT_CLASS} tabular-nums`}
                          placeholder="150"
                        />
                        <span aria-hidden className="mx-1 h-5 w-px shrink-0 bg-[#CFD9DE] dark:bg-[#3E4144]" />
                        <CurrencyPicker
                          value={currency}
                          options={currencyOptions}
                          onChange={(code) => onChange({ ...draft, currency: code })}
                        />
                      </div>
                    </LineField>
                  </div>
                ) : null}

                {showAmount && showBilling ? (
                  <OptionalBlock
                    label={t('Billing period')}
                    onRemove={() => {
                      setShowBilling(false);
                      onChange({ ...draft, billingPeriod: null });
                    }}
                  >
                    <div role="radiogroup" aria-label={t('Billing period')} className="mt-2 flex flex-wrap gap-2">
                      {SERVICE_BILLING_PERIOD_OPTIONS.map((option) => {
                        const active = billingPeriod === option.value;
                        return (
                          <button
                            key={option.value}
                            type="button"
                            role="radio"
                            aria-checked={active}
                            onClick={() => onChange({ ...draft, billingPeriod: option.value })}
                            className={providerChipClass(active)}
                          >
                            {t(option.label)}
                          </button>
                        );
                      })}
                    </div>
                  </OptionalBlock>
                ) : null}

                {showDelivery ? (
                  <div className="max-w-xs">
                    <OptionalBlock
                      label={t('Delivery time')}
                      onRemove={() => {
                        setShowDelivery(false);
                        onChange({ ...draft, deliveryValue: null });
                      }}
                    >
                      <div className={lineClass()}>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min={1}
                            aria-label={t('Delivery time')}
                            value={draft.deliveryValue ?? ''}
                            onChange={(event) => {
                              const raw = event.target.value.trim();
                              onChange({ ...draft, deliveryValue: raw ? Math.max(1, Math.round(Number(raw))) : null });
                            }}
                            className={`${INPUT_CLASS} tabular-nums [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none`}
                            placeholder={t('e.g. 3')}
                          />
                          <div role="radiogroup" aria-label={t('Delivery unit')} className="flex shrink-0 gap-1">
                            {SERVICE_DELIVERY_UNIT_OPTIONS.map((option) => {
                              const active = (draft.deliveryUnit ?? 'DAYS') === option.value;
                              return (
                                <button
                                  key={option.value}
                                  type="button"
                                  role="radio"
                                  aria-checked={active}
                                  onClick={() => onChange({ ...draft, deliveryUnit: option.value as ServiceDeliveryUnit })}
                                  className={`inline-flex h-7 items-center rounded-full px-3 text-[13px] font-semibold transition-colors ${
                                    active
                                      ? 'bg-[#0F1419] text-white dark:bg-[#EFF3F4] dark:text-[#0F1419]'
                                      : `${INK2} hover:bg-[rgba(15,20,25,0.06)] hover:text-[#0F1419] dark:hover:bg-[rgba(231,233,234,0.1)] dark:hover:text-[#E7E9EA]`
                                  }`}
                                >
                                  {t(option.label)}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </OptionalBlock>
                  </div>
                ) : null}

                {/* Optional details stay folded until asked for. */}
                {!showDelivery || canAddBilling ? (
                  <div className="flex flex-wrap gap-x-6 gap-y-2">
                    {!showDelivery ? (
                      <button type="button" onClick={() => setShowDelivery(true)} className={textActionClass}>
                        {t('+ Delivery time')}
                      </button>
                    ) : null}
                    {canAddBilling ? (
                      <button
                        type="button"
                        onClick={() => {
                          setShowBilling(true);
                          if (!billingPeriod) onChange({ ...draft, billingPeriod: 'MONTH' });
                        }}
                        className={textActionClass}
                      >
                        {t('+ Billing period')}
                      </button>
                    ) : null}
                  </div>
                ) : null}
              </div>
            </Section>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-[#EFF3F4] px-6 py-4 dark:border-[#2F3336] sm:px-8">
          <p className="min-w-0 text-[14px] font-medium text-[#F4212E]">
            {attempted && hasErrors ? t('Complete the highlighted fields.') : null}
          </p>
          <div className="ml-auto flex shrink-0 items-center gap-2">
            <button type="button" onClick={requestClose} disabled={saving} className={`${ghostButtonClass} max-sm:hidden`}>
              {t('Cancel')}
            </button>
            {!isEdit ? (
              <>
                <button type="button" onClick={() => submit('draft')} disabled={saving || uploadingCover} className={secondaryButtonClass}>
                  {actionLabel('draft', 'Save as draft')}
                </button>
                <button type="button" onClick={() => submit('publish')} disabled={saving || uploadingCover} className={primaryButtonClass}>
                  {actionLabel('publish', 'Publish')}
                </button>
              </>
            ) : status === 'ACTIVE' ? (
              <button type="button" onClick={() => submit('save')} disabled={saving || uploadingCover} className={primaryButtonClass}>
                {actionLabel('save', 'Save changes')}
              </button>
            ) : (
              <>
                <button type="button" onClick={() => submit('save')} disabled={saving || uploadingCover} className={secondaryButtonClass}>
                  {actionLabel('save', 'Save')}
                </button>
                <button type="button" onClick={() => submit('publish')} disabled={saving || uploadingCover} className={primaryButtonClass}>
                  {actionLabel('publish', 'Save & publish')}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Unsaved edits: ask before throwing them away (overlay click, Escape, ✕, Cancel). */}
        {confirmDiscard ? (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 p-6">
            <div
              role="alertdialog"
              aria-modal="true"
              aria-labelledby="service-discard-title"
              aria-describedby="service-discard-text"
              className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-[0_0_0_1px_#EFF3F4,0_16px_40px_-16px_rgba(15,20,25,0.35)] dark:bg-black dark:shadow-[0_0_0_1px_#2F3336]"
              style={STUDIO_FLOAT_IN_STYLE}
            >
              <h3 id="service-discard-title" className={`text-[20px] font-extrabold tracking-[-0.015em] ${INK}`}>
                {t('Discard changes?')}
              </h3>
              <p id="service-discard-text" className={`mt-1.5 text-[15px] leading-5 ${INK2}`}>
                {isEdit ? t('Your edits to this service will be lost.') : t('This new service will not be saved.')}
              </p>
              <div className="mt-6 flex flex-col gap-2">
                <button
                  type="button"
                  autoFocus
                  onClick={onClose}
                  className="inline-flex h-11 items-center justify-center rounded-full bg-[#F4212E] text-[15px] font-bold text-white transition-colors hover:bg-[#DC1E29]"
                >
                  {t('Discard')}
                </button>
                <button type="button" onClick={() => setConfirmDiscard(false)} className={`${secondaryButtonClass} !h-11`}>
                  {t('Keep editing')}
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>,
    document.body
  );
}

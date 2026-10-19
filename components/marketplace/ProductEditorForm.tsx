'use client';

import Link from 'next/link';
import {
  createContext,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import { useFieldArray, useForm, type FieldErrors } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/context/AuthContext';
import { formatPrice, productTypeName, uploadProductThumbnail } from '@/lib/marketplace-api';
import { getApiErrorMessage } from '@/lib/api-error';
import { resolveStorageMediaUrl } from '@/lib/storage-media-url';
import { CURRENCIES, DEFAULT_CURRENCY } from '@/lib/currencies';
import {
  detectDemoTypeFromFile,
  detectDemoTypeFromUrl,
  isAllowedDemoMediaFile,
} from '@/lib/product-demo';
import {
  getVideoFileDurationSeconds,
  isAllowedThumbnailFile,
  isVideoThumbnailUrl,
  THUMBNAIL_VIDEO_MAX_SECONDS,
} from '@/lib/product-thumbnail';
import { ProductThumbnailMedia } from '@/components/marketplace/ProductThumbnailMedia';
import { ProductSubtitlesField } from '@/components/marketplace/ProductSubtitlesField';
import { ProductWhyBlocksField } from '@/components/marketplace/ProductWhyBlocksField';
import {
  normalizeHashtag,
  ProductHashtagsField,
} from '@/components/marketplace/ProductHashtagsField';
import {
  productEditorSchema,
  PRODUCT_TYPES,
  STOCK_MAX,
  type ProductFormValues,
} from '@/components/marketplace/product-editor-schema';
import { parseDemoSubtitles } from '@/components/creator/studio/profile-form-schema';
import {
  parseProductWhyBlocks,
  serializeProductWhyBlocks,
} from '@/components/marketplace/product-why-block-schema';
import type { ProductFormat } from '@/components/marketplace/product-editor-steps';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { createUploadPreview, UploadingOverlay, type UploadPreview } from '@/components/ui/UploadingOverlay';
import { InfoHint } from '@/components/ui/InfoHint';
import { FormSelect, type FormSelectOption } from '@/components/ui/FormSelect';
import { CurrencyPicker } from '@/components/ui/CurrencyPicker';
import type { MarketplaceProductDetail, MarketplaceProductRequest } from '@/types/marketplace';
import {
  MAX_PRODUCT_STATUS_LABELS,
  PRODUCT_STATUS_LABEL_OPTIONS,
  normalizeProductStatusLabels,
} from '@/lib/product-status-labels';
import { useT } from '@/lib/i18n/I18nProvider';
import { msg } from '@/lib/i18n/config';

const GENRES = ['Tech', 'Lifestyle', 'Business', 'Art', 'Sport', 'Music', 'Other'] as const;
const VIDEO_RESOLUTIONS = ['480p', '720p', '1080p', '4K'] as const;
const PRODUCT_LANGUAGES = [
  'English',
  'French',
  'Spanish',
  'German',
  'Italian',
  'Portuguese',
  'Arabic',
  'Dutch',
  'Other',
] as const;
const NOT_SPECIFIED: FormSelectOption = { value: '', label: msg('Not specified') };
const TYPE_OPTIONS: FormSelectOption[] = PRODUCT_TYPES.map((t) => ({ value: t, label: productTypeName(t) }));
const OTHER_TYPE = 'OTHER';
const CUSTOM_TYPE_MAX = 60;
const GENRE_OPTIONS: FormSelectOption[] = GENRES.map((g) => ({ value: g, label: g }));
const OTHER_GENRE = 'Other';
const CUSTOM_GENRE_MAX = 60;

function isPresetGenre(value: string | null | undefined): boolean {
  return Boolean(value) && value !== OTHER_GENRE && (GENRES as readonly string[]).includes(value!);
}
const LANGUAGE_OPTIONS: FormSelectOption[] = [NOT_SPECIFIED, ...PRODUCT_LANGUAGES.map((l) => ({ value: l, label: l }))];
const OTHER_LANGUAGE = 'Other';
const CUSTOM_LANGUAGE_MAX = 40;

function isCustomLanguage(value: string | null | undefined): boolean {
  const trimmed = value?.trim();
  return Boolean(trimmed) && (trimmed === OTHER_LANGUAGE || !(PRODUCT_LANGUAGES as readonly string[]).includes(trimmed!));
}

type FileSizeUnit = 'MB' | 'GB';
const MB_PER_GB = 1024;

function fileSizeInUnit(mb: number | null | undefined, unit: FileSizeUnit): string {
  if (mb == null) return '';
  return unit === 'GB' ? String(Math.round((mb / MB_PER_GB) * 100) / 100) : String(mb);
}
const RESOLUTION_OPTIONS: FormSelectOption[] = [NOT_SPECIFIED, ...VIDEO_RESOLUTIONS.map((r) => ({ value: r, label: r }))];
const TITLE_MAX = 200;
const DESCRIPTION_MAX = 5000;
const GALLERY_MAX = 12;
const TOOLS_MAX = 10;

const IMAGE_ACCEPT = 'image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp';
const MEDIA_ACCEPT =
  'image/jpeg,image/png,image/webp,video/mp4,video/webm,video/quicktime,.jpg,.jpeg,.png,.webp,.mp4,.webm,.mov';

function secondsToMmSs(seconds: number | null | undefined): string {
  if (!seconds || seconds <= 0) return '';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

function mmSsToSeconds(value: string | undefined): number | undefined {
  const trimmed = value?.trim();
  if (!trimmed) return undefined;
  if (trimmed.includes(':')) {
    const [mRaw, sRaw] = trimmed.split(':');
    const m = Number(mRaw);
    const s = Number(sRaw);
    if (!Number.isNaN(m) && !Number.isNaN(s) && m >= 0 && s >= 0) return m * 60 + s;
    return undefined;
  }
  const n = Number(trimmed);
  return !Number.isNaN(n) && n > 0 ? Math.floor(n) : undefined;
}

/* ─── Styles ─────────────────────────────────────────────────────────────── */

const LABEL = 'block text-[14px] font-semibold text-[#0F1419] dark:text-[#E7E9EA]';
const OPTIONAL = 'ml-1.5 font-normal text-[#536471] dark:text-[#71767B]';
const HINT = 'mt-2 text-[13px] leading-[18px] text-[#536471] dark:text-[#71767B]';
const ERROR = 'mt-2 text-[13px] text-[#F4212E]';
/**
 * Fields are tonal, never outlined (News): `--x-field` is white on the page's #F7F9F9 sections and the
 * X page-field grey inside the dialog (both #202327 in dark) — set in globals.css, PRODUCTS block.
 */
const FIELD_BASE = 'rounded-none border border-transparent bg-[color:var(--x-field,#EFF3F4)] transition-shadow';
const FIELD_FOCUS =
  'focus:outline-hidden focus:shadow-[inset_0_0_0_2px_#0F1419] dark:focus:shadow-[inset_0_0_0_2px_#E7E9EA]';
const FIELD_FOCUS_WITHIN =
  'focus-within:shadow-[inset_0_0_0_2px_#0F1419] dark:focus-within:shadow-[inset_0_0_0_2px_#E7E9EA]';
const INPUT = `mt-2 block h-11 w-full ${FIELD_BASE} ${FIELD_FOCUS} px-3.5 text-[15px] text-[#111111] placeholder:text-neutral-400 disabled:opacity-50 dark:text-white dark:placeholder:text-neutral-500 dark:[color-scheme:dark]`;
const TEXTAREA = `mt-2 block w-full ${FIELD_BASE} ${FIELD_FOCUS} resize-y px-3.5 py-3 text-[15px] leading-relaxed text-[#111111] placeholder:text-neutral-400 dark:text-white dark:placeholder:text-neutral-500`;
const NO_SPIN =
  '[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none';
const PRIMARY_BTN =
  'inline-flex h-11 w-full items-center justify-center gap-2 bg-[#0F1419] px-5 text-[15px] font-bold text-white transition-colors hover:bg-[#272C30] disabled:cursor-not-allowed disabled:opacity-40 dark:bg-[#EFF3F4] dark:text-[#0F1419] dark:hover:bg-[#D7DBDC]';
const SECONDARY_BTN =
  'inline-flex h-11 w-full items-center justify-center gap-2 border border-[#CFD9DE] px-5 text-[15px] font-bold text-[#0F1419] transition-colors hover:bg-[rgba(15,20,25,0.06)] disabled:cursor-not-allowed disabled:opacity-40 dark:border-[#536471] dark:text-[#E7E9EA] dark:hover:bg-[rgba(231,233,234,0.1)]';
const LINK_BTN =
  'text-[14px] font-semibold text-[#536471] transition-colors hover:text-[#0F1419] disabled:opacity-40 dark:text-[#71767B] dark:hover:text-[#E7E9EA]';
const PILL_PRIMARY =
  'inline-flex h-10 items-center justify-center gap-2 rounded-full bg-[#0F1419] px-6 text-[15px] font-bold text-white transition-colors hover:bg-[#272C30] disabled:cursor-not-allowed disabled:opacity-40 dark:bg-[#EFF3F4] dark:text-[#0F1419] dark:hover:bg-[#D7DBDC]';
const PILL_GHOST =
  'inline-flex h-10 items-center justify-center gap-1.5 rounded-full px-4 text-[15px] font-medium text-[#111111] transition-colors hover:bg-black/[0.05] disabled:opacity-40 dark:text-white dark:hover:bg-white/[0.08]';
const ROUND_ICON_BTN =
  'inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[#111111] transition-colors hover:bg-black/[0.06] disabled:opacity-40 dark:text-white dark:hover:bg-white/[0.1]';

type StepKey = 'details' | 'media' | 'pricing';

const STEP_KEYS: StepKey[] = ['details', 'media', 'pricing'];

/*
 * The creation wizard (modal) — Gumroad / Shopify order: 1. Essentials holds every field publishing
 * needs (format, title, cover, price, stock); 2. Showcase the optional extras that sell (photos or
 * sample, highlights, badges, hashtags); 3. Review the listing as buyers will see it, then publish.
 */
const STEP_LABELS: Record<StepKey, string> = {
  details: 'Essentials',
  media: 'Showcase',
  pricing: 'Review',
};

/** Wizard step that owns each field, used to jump back to the first invalid one on submit. */
const FIELD_STEP: Partial<Record<keyof ProductFormValues, StepKey>> = {
  title: 'details',
  description: 'details',
  type: 'details',
  typeLabel: 'details',
  genre: 'details',
  thumbnailUrl: 'details',
  priceAmount: 'details',
  compareAtPriceAmount: 'details',
  currency: 'details',
  stockQuantity: 'details',
  galleryImages: 'media',
  demoType: 'media',
  demoUrl: 'media',
  demoSubtitles: 'media',
  whyProductBlocks: 'media',
  tags: 'media',
  statusLabels: 'media',
};

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  return (parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase();
}

/* ─── Form <-> API mapping ───────────────────────────────────────────────── */

function productToFormValues(product: MarketplaceProductDetail): ProductFormValues {
  const demoUrl = product.demoUrl ?? '';
  const resolvedDemoType =
    demoUrl.trim() && product.demoType === 'NONE' ? detectDemoTypeFromUrl(demoUrl) : product.demoType;
  const isPhysical = product.type === 'PHYSICAL';

  return {
    productFormat: isPhysical ? 'physical' : 'virtual',
    type: product.type,
    typeLabel: product.typeLabel ?? '',
    title: product.title,
    description: product.description ?? '',
    priceAmount: (product.priceCents / 100).toFixed(2),
    compareAtPriceAmount:
      product.compareAtPriceCents != null ? (product.compareAtPriceCents / 100).toFixed(2) : '',
    currency: product.currency,
    stockQuantity: product.stockQuantity != null ? String(product.stockQuantity) : '',
    genre: product.genre ?? '',
    specialite: product.specialite ?? '',
    thumbnailUrl: product.thumbnailUrl ?? '',
    galleryImages: (product.galleryImageUrls ?? []).map((value) => ({ value })),
    demoType: demoUrl.trim() ? resolvedDemoType : 'NONE',
    demoUrl,
    demoSubtitles: parseDemoSubtitles(product.demoSubtitles, product.demoDescription),
    whyProductBlocks: parseProductWhyBlocks(product.whyProductBlocks),
    compatibleTools: product.compatibleTools.map((v) => ({ value: v })),
    fileFormat: product.fileFormat ?? '',
    fileSizeMb: product.fileSizeMb != null ? String(product.fileSizeMb) : '',
    language: product.language ?? '',
    version: product.version ?? '',
    tags: product.tags.map((v) => ({ value: v })),
    statusLabels: normalizeProductStatusLabels(product.statusLabels),
    videoDuration: secondsToMmSs(product.videoDurationSeconds),
    videoResolution: product.videoResolution ?? '',
  };
}

function formValuesToRequest(
  data: ProductFormValues,
  options: { isPublished?: boolean } = {}
): MarketplaceProductRequest {
  const isPhysical = data.productFormat === 'physical';
  const priceCents = Math.round(Number(data.priceAmount) * 100);
  const compareRaw = data.compareAtPriceAmount?.trim();
  const compareAtPriceCents =
    compareRaw && !Number.isNaN(Number(compareRaw)) && Number(compareRaw) > 0
      ? Math.round(Number(compareRaw) * 100)
      : undefined;
  const thumb = data.thumbnailUrl?.trim();
  const demoUrl = data.demoUrl?.trim();
  const demoType = !isPhysical && demoUrl ? data.demoType : 'NONE';
  const fileSize = data.fileSizeMb?.trim();
  const whyBlocks = isPhysical ? [] : serializeProductWhyBlocks(data.whyProductBlocks);
  const demoSubtitles = isPhysical ? [] : data.demoSubtitles.map((item) => item.value.trim()).filter(Boolean);
  const galleryImageUrls = data.galleryImages.map((item) => item.value.trim()).filter(Boolean);
  const stockRaw = data.stockQuantity?.trim();
  const stockQuantity = isPhysical ? (stockRaw ? Number(stockRaw) : 1) : null;

  return {
    type: isPhysical ? 'PHYSICAL' : data.type === 'PHYSICAL' ? 'OTHER' : data.type,
    ...(!isPhysical && data.type === OTHER_TYPE && data.typeLabel?.trim() ? { typeLabel: data.typeLabel.trim() } : {}),
    title: data.title.trim(),
    description: data.description.trim(),
    priceCents,
    ...(compareAtPriceCents != null && priceCents > 0 ? { compareAtPriceCents } : {}),
    currency: data.currency.toUpperCase(),
    ...(!isPhysical && data.genre?.trim() ? { genre: data.genre.trim() } : {}),
    ...(!isPhysical && data.specialite?.trim() ? { specialite: data.specialite.trim() } : {}),
    ...(thumb ? { thumbnailUrl: thumb } : {}),
    demoType,
    ...(!isPhysical && demoUrl ? { demoUrl } : {}),
    ...(!isPhysical && demoSubtitles.length > 0 ? { demoSubtitles } : {}),
    whyProductBlocks: whyBlocks,
    deliveryMode: 'BOTH',
    compatibleTools: isPhysical ? [] : data.compatibleTools.map((t) => t.value.trim()).filter(Boolean),
    ...(!isPhysical && data.fileFormat?.trim() ? { fileFormat: data.fileFormat.trim() } : {}),
    ...(!isPhysical && fileSize && !Number.isNaN(Number(fileSize)) ? { fileSizeMb: Number(fileSize) } : {}),
    ...(!isPhysical && data.language?.trim() ? { language: data.language.trim() } : {}),
    ...(!isPhysical && data.version?.trim() ? { version: data.version.trim() } : {}),
    tags: data.tags.map((t) => normalizeHashtag(t.value)).filter(Boolean),
    galleryImageUrls,
    stockQuantity,
    statusLabels: normalizeProductStatusLabels(data.statusLabels),
    ...(!isPhysical && data.type === 'VIDEO'
      ? {
          videoDurationSeconds: mmSsToSeconds(data.videoDuration),
          ...(data.videoResolution?.trim() ? { videoResolution: data.videoResolution.trim() } : {}),
        }
      : {}),
    isPublished: options.isPublished ?? true,
  };
}

/* ─── Building blocks ────────────────────────────────────────────────────── */

/** `modal` drops the per-section cards: the dialog surface already frames the form. */
const EditorVariantContext = createContext<'page' | 'modal'>('page');

function Section({
  title,
  description,
  aside,
  children,
}: {
  title: string;
  description?: string;
  aside?: ReactNode;
  children: ReactNode;
}) {
  const inModal = useContext(EditorVariantContext) === 'modal';
  return (
    <section
      className={
        inModal
          ? 'py-9 first:pt-8'
          : 'bg-[#F7F9F9] p-5 dark:bg-[#16181C] sm:p-6'
      }
    >
      <header className={`flex justify-between gap-4 ${inModal ? 'items-center' : 'items-start'}`}>
        {inModal ? (
          <div className="flex items-center gap-2">
            <h2 className="text-[17px] font-semibold tracking-[-0.01em] text-[#111111] dark:text-white">{title}</h2>
            {description ? (
              <InfoHint align="start" side="bottom">
                {description}
              </InfoHint>
            ) : null}
          </div>
        ) : (
          <div>
            <h2 className="text-[20px] font-extrabold leading-6 tracking-[-0.01em] text-[#0F1419] dark:text-[#E7E9EA]">{title}</h2>
            {description ? (
              <p className="mt-1 text-[14px] leading-5 text-[#536471] dark:text-[#71767B]">{description}</p>
            ) : null}
          </div>
        )}
        {aside}
      </header>
      <div className={`${inModal ? 'mt-5' : 'mt-6'} space-y-6`}>{children}</div>
    </section>
  );
}

function CollapsibleSection({
  title,
  description,
  summary,
  defaultOpen = false,
  children,
}: {
  title: string;
  description: string;
  summary?: string | null;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  const t = useT();
  const [open, setOpen] = useState(defaultOpen);
  const inModal = useContext(EditorVariantContext) === 'modal';
  return (
    <section
      className={
        inModal ? '' : 'bg-[#F7F9F9] dark:bg-[#16181C]'
      }
    >
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className={`flex w-full items-center justify-between gap-4 text-left ${
          inModal ? 'py-6' : 'px-5 py-5 sm:px-6'
        }`}
      >
        <span className="min-w-0">
          <span className="flex items-center gap-2 text-[17px] font-semibold tracking-[-0.01em] text-[#111111] dark:text-white">
            {title}
            <span className="text-[13px] font-normal text-neutral-400 dark:text-neutral-500">{t('Optional')}</span>
          </span>
          {!inModal || summary ? (
            <span className="mt-1 block text-[14px] text-neutral-500 dark:text-neutral-400">
              {summary || description}
            </span>
          ) : null}
        </span>
        <svg
          className={`h-5 w-5 shrink-0 text-neutral-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.75}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
      {open ? (
        <div
          className={
            inModal
              ? 'space-y-6 pb-9 pt-1'
              : 'space-y-6 px-5 pb-6 pt-1 sm:px-6'
          }
        >
          {children}
        </div>
      ) : null}
    </section>
  );
}

function MediaDrop({
  url,
  uploading,
  disabled,
  accept,
  onFile,
  onRemove,
  title,
  hint,
  className = '',
  compact = false,
  preview,
}: {
  preview?: UploadPreview | null;
  url?: string;
  uploading: boolean;
  disabled?: boolean;
  accept: string;
  onFile: (event: ChangeEvent<HTMLInputElement>) => void;
  onRemove?: () => void;
  title: string;
  hint: string;
  className?: string;
  compact?: boolean;
}) {
  const t = useT();
  const hasMedia = Boolean(url?.trim());
  return (
    <div className={`group relative ${className}`}>
      <label
        className={`relative flex h-full w-full cursor-pointer flex-col items-center justify-center overflow-hidden transition-colors ${
          hasMedia
            ? 'bg-[color:var(--x-field,#EFF3F4)]'
            : 'bg-[color:var(--x-field,#EFF3F4)] hover:shadow-[inset_0_0_0_2px_#CFD9DE] dark:hover:shadow-[inset_0_0_0_2px_#536471]'
        } ${uploading || disabled ? 'pointer-events-none' : ''}`}
      >
        {hasMedia ? (
          <>
            <ProductThumbnailMedia
              url={url!.trim()}
              autoPlay={isVideoThumbnailUrl(url!.trim())}
              className="absolute inset-0 h-full w-full object-cover"
            />
            <span
              aria-hidden
              className="absolute inset-0 flex items-center justify-center bg-black/40 text-[14px] font-medium text-white opacity-0 transition-opacity group-hover:opacity-100"
            >
              {t('Replace')}
            </span>
          </>
        ) : (
          <span className="flex flex-col items-center px-4 text-center">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#0F1419] text-white transition-transform duration-200 group-hover:scale-105 dark:bg-[#EFF3F4] dark:text-[#0F1419]">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" aria-hidden>
                <path d="M12 5v14M5 12h14" />
              </svg>
            </span>
            {!compact ? (
              <>
                <span className="mt-3 text-[14px] font-medium text-[#111111] dark:text-white">{title}</span>
                <span className="mt-1 text-[12px] text-neutral-500 dark:text-neutral-400">{hint}</span>
              </>
            ) : null}
          </span>
        )}
        {uploading ? <UploadingOverlay preview={preview} compact={compact} /> : null}
        <input type="file" accept={accept} className="sr-only" disabled={uploading || disabled} onChange={onFile} />
      </label>
      {hasMedia && onRemove && !uploading ? (
        <button
          type="button"
          onClick={onRemove}
          aria-label={t('Remove {toLowerCase}', { toLowerCase: title.toLowerCase() })}
          className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity hover:bg-black/80 focus-visible:opacity-100 group-hover:opacity-100"
        >
          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden>
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      ) : null}
    </div>
  );
}

/** Compact upload row: small thumbnail, label and an explicit action instead of a large drop zone. */
function MediaRow({
  url,
  uploading,
  disabled,
  accept,
  onFile,
  onRemove,
  title,
  hint,
  preview,
}: {
  url?: string;
  uploading: boolean;
  disabled?: boolean;
  accept: string;
  onFile: (event: ChangeEvent<HTMLInputElement>) => void;
  onRemove?: () => void;
  title: string;
  hint: string;
  preview?: UploadPreview | null;
}) {
  const t = useT();
  const hasMedia = Boolean(url?.trim());
  return (
    <div className="flex items-center gap-3">
      <label
        className={`group flex min-w-0 flex-1 cursor-pointer items-center gap-4 bg-[color:var(--x-field,#EFF3F4)] p-2.5 pr-3 transition-shadow hover:shadow-[inset_0_0_0_2px_#CFD9DE] dark:hover:shadow-[inset_0_0_0_2px_#536471] ${
          uploading || disabled ? 'pointer-events-none opacity-70' : ''
        }`}
      >
        <span className="relative flex h-14 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-black/[0.04] text-neutral-400 dark:bg-white/[0.06] dark:text-neutral-500">
          {hasMedia ? (
            <ProductThumbnailMedia
              url={url!.trim()}
              autoPlay={isVideoThumbnailUrl(url!.trim())}
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <rect x="3" y="4" width="18" height="16" rx="2.5" />
              <circle cx="8.5" cy="9.5" r="1.5" />
              <path d="m21 16-5-5L5 20" />
            </svg>
          )}
          {uploading ? <UploadingOverlay preview={preview} compact /> : null}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[14px] font-medium text-[#111111] dark:text-white">{title}</span>
          <span className="block truncate text-[12px] text-neutral-500 dark:text-neutral-400">{hint}</span>
        </span>
        <span className="inline-flex h-8 shrink-0 items-center rounded-full border border-black/[0.1] px-3.5 text-[13px] font-medium text-[#111111] transition-colors group-hover:border-black/25 dark:border-white/[0.14] dark:text-white dark:group-hover:border-white/30">
          {uploading ? t('Uploading…') : hasMedia ? t('Replace') : t('Upload')}
        </span>
        <input type="file" accept={accept} className="sr-only" disabled={uploading || disabled} onChange={onFile} />
      </label>
      {hasMedia && onRemove && !uploading ? (
        <button
          type="button"
          onClick={onRemove}
          aria-label={t('Remove file')}
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-neutral-400 transition-colors hover:bg-black/[0.05] hover:text-[#111111] dark:hover:bg-white/[0.08] dark:hover:text-white"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden>
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      ) : null}
    </div>
  );
}

function Switch({ checked, onChange, label }: { checked: boolean; onChange: () => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#0F1419]/40 dark:focus-visible:ring-[#E7E9EA]/50 ${
        checked ? 'bg-[#0F1419] dark:bg-[#EFF3F4]' : 'bg-[#CFD9DE] dark:bg-[#3E4144]'
      }`}
    >
      <span
        aria-hidden
        className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-[#fff] transition-transform duration-200 ${
          checked ? 'translate-x-5 dark:bg-[#0F1419]' : 'translate-x-0'
        }`}
      />
    </button>
  );
}

function ChipsInput({
  label,
  values,
  onChange,
  max,
  placeholder,
  hint,
}: {
  label: string;
  values: string[];
  onChange: (next: string[]) => void;
  max: number;
  placeholder: string;
  hint: string;
}) {
  const t = useT();
  const [draft, setDraft] = useState('');
  const commit = () => {
    const value = draft.trim();
    if (!value || values.length >= max) return;
    if (!values.some((v) => v.toLowerCase() === value.toLowerCase())) onChange([...values, value]);
    setDraft('');
  };
  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if ((event.key === 'Enter' || event.key === ',') && draft.trim()) {
      event.preventDefault();
      commit();
    } else if (event.key === 'Backspace' && !draft && values.length > 0) {
      onChange(values.slice(0, -1));
    }
  };
  return (
    <div>
      <div className="flex items-center gap-2">
        <p className={LABEL}>
          {label}
          <span className={OPTIONAL}>
            {values.length}/{max}
          </span>
        </p>
        <InfoHint align="start">{hint}</InfoHint>
      </div>
      <div className={`mt-2 flex min-h-11 flex-wrap items-center gap-1.5 px-2 py-1.5 ${FIELD_BASE} ${FIELD_FOCUS_WITHIN}`}>
        {values.map((value, index) => (
          <span
            key={value.toLowerCase()}
            className="inline-flex h-8 items-center gap-1 rounded-md bg-black/[0.05] pl-2.5 pr-1 text-[14px] text-[#111111] dark:bg-white/[0.08] dark:text-white"
          >
            {value}
            <button
              type="button"
              onClick={() => onChange(values.filter((_, i) => i !== index))}
              aria-label={t('Remove {value}', { value })}
              className="inline-flex h-6 w-6 items-center justify-center rounded text-neutral-400 hover:text-[#111111] dark:hover:text-white"
            >
              <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden>
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </span>
        ))}
        <input
          value={draft}
          disabled={values.length >= max}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={onKeyDown}
          onBlur={commit}
          placeholder={values.length >= max ? t('Limit reached') : placeholder}
          aria-label={label}
          className="h-8 min-w-[8rem] flex-1 bg-transparent px-1.5 text-[15px] text-[#111111] outline-hidden placeholder:text-neutral-400 dark:text-white dark:placeholder:text-neutral-500"
        />
      </div>
    </div>
  );
}

function FormatSelector({
  value,
  onChange,
  disabled,
  fullWidth = false,
}: {
  value: ProductFormat;
  onChange: (next: ProductFormat) => void;
  disabled?: boolean;
  fullWidth?: boolean;
}) {
  const t = useT();
  const options: { id: ProductFormat; title: string; hint: string }[] = [
    { id: 'virtual', title: t('Digital'), hint: t('Files, courses, templates — delivered online') },
    { id: 'physical', title: t('Material'), hint: t('An item you ship to the buyer') },
  ];
  return (
    <div>
      <div
        role="radiogroup"
        aria-label={t('Product format')}
        className={`${fullWidth ? 'grid w-full grid-cols-2' : 'inline-flex'} rounded-full bg-black/[0.05] p-1 dark:bg-white/[0.06]`}
      >
        {options.map((option) => {
          const active = option.id === value;
          return (
            <button
              key={option.id}
              type="button"
              role="radio"
              aria-checked={active}
              title={t(option.hint)}
              disabled={disabled}
              onClick={() => onChange(option.id)}
              className={`${fullWidth ? 'h-9' : 'h-8'} rounded-full px-4 text-[14px] font-medium transition-colors disabled:cursor-not-allowed ${
                active
                  ? 'bg-[#0F1419] text-white dark:bg-[#EFF3F4] dark:text-[#0F1419]'
                  : 'text-[#536471] hover:text-[#0F1419] dark:text-[#71767B] dark:hover:text-[#E7E9EA]'
              }`}
            >
              {t(option.title)}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/**
 * The wizard's first decision, as two cards (icon, name, one line): the format changes the fields
 * that follow (type and category, sample or photos, stock), so it leads the form instead of sitting
 * as a small toggle in the header corner.
 */
function FormatCards({
  value,
  onChange,
  disabled,
}: {
  value: ProductFormat;
  onChange: (next: ProductFormat) => void;
  disabled?: boolean;
}) {
  const t = useT();
  const options: { id: ProductFormat; title: string; hint: string; icon: ReactNode }[] = [
    {
      id: 'virtual',
      title: t('Digital'),
      hint: t('Files, courses, templates'),
      icon: (
        <>
          <path d="M12 4v11" />
          <path d="m7.5 10.5 4.5 4.5 4.5-4.5" />
          <path d="M4.5 15.5v3a1.5 1.5 0 0 0 1.5 1.5h12a1.5 1.5 0 0 0 1.5-1.5v-3" />
        </>
      ),
    },
    {
      id: 'physical',
      title: t('Material'),
      hint: t('An item you ship'),
      icon: (
        <>
          <path d="M12 2.8 20 7.2v9.6l-8 4.4-8-4.4V7.2z" />
          <path d="m4 7.2 8 4.4 8-4.4" />
          <path d="M12 11.6v9.6" />
        </>
      ),
    },
  ];
  return (
    <div role="radiogroup" aria-label={t('Product format')} className="grid grid-cols-2 gap-2 sm:gap-3">
      {options.map((option) => {
        const active = option.id === value;
        return (
          <button
            key={option.id}
            type="button"
            role="radio"
            aria-checked={active}
            disabled={disabled}
            onClick={() => onChange(option.id)}
            className={`flex items-center gap-3 px-4 py-3 text-left transition-[background-color,box-shadow] duration-150 disabled:cursor-not-allowed ${
              active
                ? 'bg-[#F7F9F9] shadow-[inset_0_0_0_2px_#0F1419] dark:bg-[#16181C] dark:shadow-[inset_0_0_0_2px_#E7E9EA]'
                : 'shadow-[inset_0_0_0_1px_#CFD9DE] hover:bg-[#F7F9F9] dark:shadow-[inset_0_0_0_1px_#3E4144] dark:hover:bg-[#16181C]'
            }`}
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0 text-[#0F1419] dark:text-[#E7E9EA]" fill="none" stroke="currentColor" strokeWidth={active ? 2.1 : 1.7} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              {option.icon}
            </svg>
            <span className="min-w-0">
              <span className="block text-[15px] font-bold leading-5 text-[#0F1419] dark:text-[#E7E9EA]">{t(option.title)}</span>
              <span className="block truncate text-[13px] leading-[18px] text-[#536471] dark:text-[#71767B]">{t(option.hint)}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}

/* ─── Form ───────────────────────────────────────────────────────────────── */

type ProductEditorFormProps = {
  initial?: MarketplaceProductDetail;
  submitLabel: string;
  cancelHref?: string;
  onCancel?: () => void;
  /** @deprecated layout no longer depends on it — kept for call-site compatibility */
  embedded?: boolean;
  /** When false, the Digital / Physical choice is not shown (e.g. editing). */
  showFormatToggle?: boolean;
  /** Controlled format when the parent owns the choice. */
  controlledFormat?: ProductFormat;
  onFormatChange?: (format: ProductFormat) => void;
  onSubmit: (body: MarketplaceProductRequest) => Promise<void>;
  /** `modal`: single column with a pinned header (title, format, close) and a pinned action footer. */
  variant?: 'page' | 'modal';
  /** Dialog title in the `modal` variant. */
  heading?: string;
  /** Lets a host confirm before discarding unsaved input. */
  onDirtyChange?: (dirty: boolean) => void;
};

export function ProductEditorForm({
  initial,
  submitLabel,
  cancelHref,
  onCancel,
  showFormatToggle = true,
  controlledFormat,
  onFormatChange,
  onSubmit,
  variant = 'page',
  heading = 'New product',
  onDirtyChange,
}: ProductEditorFormProps) {
  const t = useT();
  const headingId = useId();
  const [uploadingThumb, setUploadingThumb] = useState(false);
  const [uploadingDemo, setUploadingDemo] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [thumbPreview, setThumbPreview] = useState<UploadPreview | null>(null);
  const [demoPreview, setDemoPreview] = useState<UploadPreview | null>(null);
  const [galleryPending, setGalleryPending] = useState<UploadPreview[]>([]);
  const [mediaError, setMediaError] = useState<string | null>(null);
  const [showCompareAt, setShowCompareAt] = useState(Boolean(initial?.compareAtPriceCents));
  const [pendingAction, setPendingAction] = useState<'publish' | 'draft' | null>(null);
  const [customGenre, setCustomGenre] = useState(() => Boolean(initial?.genre?.trim()) && !isPresetGenre(initial?.genre));
  const customGenreInputRef = useRef<HTMLInputElement>(null);
  const [customLanguage, setCustomLanguage] = useState(() => isCustomLanguage(initial?.language));
  const customLanguageInputRef = useRef<HTMLInputElement>(null);
  const [fileSizeUnit, setFileSizeUnit] = useState<FileSizeUnit>(() =>
    initial?.fileSizeMb != null && initial.fileSizeMb >= MB_PER_GB ? 'GB' : 'MB'
  );
  const previousFormatRef = useRef<ProductFormat | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(0);
  const { user } = useAuth();
  const isEdit = Boolean(initial);
  const inModal = variant === 'modal';

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    trigger,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productEditorSchema),
    defaultValues: initial
      ? { ...productToFormValues(initial), fileSizeMb: fileSizeInUnit(initial.fileSizeMb, fileSizeUnit) }
      : {
          productFormat: controlledFormat ?? 'virtual',
          type: controlledFormat === 'physical' ? 'PHYSICAL' : 'TEMPLATE',
          typeLabel: '',
          title: '',
          description: '',
          priceAmount: '',
          compareAtPriceAmount: '',
          currency: DEFAULT_CURRENCY,
          stockQuantity: '',
          genre: GENRES[0],
          specialite: '',
          thumbnailUrl: '',
          galleryImages: [],
          demoType: 'NONE',
          demoUrl: '',
          demoSubtitles: [{ value: '' }],
          whyProductBlocks: [],
          compatibleTools: [],
          fileFormat: '',
          fileSizeMb: '',
          language: '',
          version: '',
          tags: [],
          statusLabels: [],
          videoDuration: '',
          videoResolution: '',
        },
  });

  const productFormat = (watch('productFormat') ?? 'virtual') as ProductFormat;
  const isPhysical = productFormat === 'physical';
  const productType = watch('type');
  const typeLabel = watch('typeLabel') ?? '';
  /* "Other" turns the Type field into a free text field; its chevron brings the list back. */
  const [typeFromList, setTypeFromList] = useState(false);
  const customTypeInputRef = useRef<HTMLInputElement>(null);
  const customType = productType === OTHER_TYPE && !typeFromList;
  const setSelectValue = (name: 'genre' | 'language' | 'videoResolution', next: string) =>
    setValue(name, next, { shouldDirty: true, shouldValidate: true });
  const title = watch('title') ?? '';
  const description = watch('description') ?? '';
  const thumbnailUrl = watch('thumbnailUrl') ?? '';
  const demoUrl = watch('demoUrl') ?? '';
  const priceAmount = watch('priceAmount');
  const compareAtAmount = watch('compareAtPriceAmount');
  const currency = (watch('currency') ?? '').toUpperCase();
  const currencyOptions =
    !currency || CURRENCIES.some((option) => option.code === currency)
      ? CURRENCIES
      : [...CURRENCIES, { code: currency, name: currency }].sort((a, b) => a.code.localeCompare(b.code));
  const stockQuantity = watch('stockQuantity');
  const galleryImages = watch('galleryImages') ?? [];
  const hashtags = (watch('tags') ?? []).map((tag) => tag.value).filter(Boolean);
  const statusLabels = watch('statusLabels') ?? [];
  const tools = (watch('compatibleTools') ?? []).map((tool) => tool.value).filter(Boolean);
  const watchedGenre = watch('genre');
  const whyBlocksCount = (watch('whyProductBlocks') ?? []).length;
  const fileFormat = watch('fileFormat');
  const language = watch('language');

  const isFree = priceAmount !== '' && !Number.isNaN(Number(priceAmount)) && Number(priceAmount) === 0;
  const busy = isSubmitting || uploadingThumb || uploadingDemo || uploadingGallery;

  const whyField = useFieldArray({ control, name: 'whyProductBlocks' });
  const galleryField = useFieldArray({ control, name: 'galleryImages' });

  useEffect(() => {
    if (controlledFormat == null || controlledFormat === productFormat) return;
    setValue('productFormat', controlledFormat, { shouldDirty: true });
  }, [controlledFormat, productFormat, setValue]);

  useEffect(() => {
    if (previousFormatRef.current === null) {
      previousFormatRef.current = productFormat;
      return;
    }
    if (previousFormatRef.current === productFormat) return;
    previousFormatRef.current = productFormat;
    setMediaError(null);
    if (productFormat === 'physical') setValue('type', 'PHYSICAL');
    else if (productType === 'PHYSICAL') setValue('type', 'TEMPLATE');
  }, [productFormat, productType, setValue]);

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
  }, [step]);

  const stepKeys = STEP_KEYS;
  const stepCount = stepKeys.length;
  const currentStep = stepKeys[Math.min(step, stepCount - 1)];
  const isLastStep = currentStep === 'pricing';

  const goToStep = async (target: number) => {
    const next = Math.max(0, Math.min(stepCount - 1, target));
    if (next > step && step === 0 && !(await trigger(['title', 'priceAmount', 'compareAtPriceAmount', 'stockQuantity']))) return;
    setStep(next);
  };

  const changeFormat = (next: ProductFormat) => {
    if (onFormatChange) onFormatChange(next);
    else setValue('productFormat', next, { shouldDirty: true });
  };

  /* Uploads */

  const onThumbnailFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setMediaError(null);
    if (!isAllowedThumbnailFile(file) || (isPhysical && !file.type.startsWith('image/'))) {
      setMediaError(isPhysical ? t('Cover: JPEG, PNG or WebP.') : t('Cover: an image (JPEG, PNG, WebP) or a video (MP4, WebM, MOV).'));
      return;
    }
    if (file.type.startsWith('video/')) {
      try {
        const duration = await getVideoFileDurationSeconds(file);
        if (duration > THUMBNAIL_VIDEO_MAX_SECONDS) {
          setMediaError(`Cover videos can be ${THUMBNAIL_VIDEO_MAX_SECONDS}s max (this one is ${Math.ceil(duration)}s).`);
          return;
        }
        setValue('videoDuration', secondsToMmSs(Math.ceil(duration)));
      } catch (e) {
        setMediaError(getApiErrorMessage(e, t('Could not read the video length.')));
        return;
      }
    }
    const preview = createUploadPreview(file);
    setThumbPreview(preview);
    setUploadingThumb(true);
    try {
      setValue('thumbnailUrl', await uploadProductThumbnail(file), { shouldDirty: true });
    } catch (e) {
      setMediaError(getApiErrorMessage(e, t('Cover upload failed.')));
    } finally {
      setUploadingThumb(false);
      URL.revokeObjectURL(preview.url);
      setThumbPreview(null);
    }
  };

  const onDemoFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setMediaError(null);
    if (!isAllowedDemoMediaFile(file)) {
      setMediaError(t('Sample: an image (JPEG, PNG, WebP) or a video (MP4, WebM, MOV).'));
      return;
    }
    const preview = createUploadPreview(file);
    setDemoPreview(preview);
    setUploadingDemo(true);
    try {
      const url = await uploadProductThumbnail(file);
      setValue('demoUrl', url, { shouldDirty: true });
      setValue('demoType', detectDemoTypeFromFile(file));
    } catch (e) {
      setMediaError(getApiErrorMessage(e, t('Sample upload failed.')));
      setValue('demoUrl', '');
      setValue('demoType', 'NONE');
    } finally {
      setUploadingDemo(false);
      URL.revokeObjectURL(preview.url);
      setDemoPreview(null);
    }
  };

  const onGalleryFiles = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    event.target.value = '';
    if (files.length === 0) return;
    setMediaError(null);
    const selected = files.slice(0, GALLERY_MAX - galleryField.fields.length);
    if (selected.some((file) => !file.type.startsWith('image/') || !isAllowedThumbnailFile(file))) {
      setMediaError(t('Photos: JPEG, PNG or WebP only.'));
      return;
    }
    const previews = selected.map(createUploadPreview);
    setGalleryPending(previews);
    setUploadingGallery(true);
    try {
      for (const file of selected) {
        galleryField.append({ value: await uploadProductThumbnail(file) });
        setGalleryPending((pending) => pending.slice(1));
      }
    } catch (e) {
      setMediaError(getApiErrorMessage(e, t('Photo upload failed.')));
    } finally {
      setUploadingGallery(false);
      previews.forEach((preview) => URL.revokeObjectURL(preview.url));
      setGalleryPending([]);
    }
  };

  /* Submit */

  const submit = (action: 'publish' | 'draft') => {
    setPendingAction(action);
    void handleSubmit(async (data) => {
      const isPublished = isEdit ? initial!.isPublished : action === 'publish';
      const genre = customGenre ? data.genre?.trim() || OTHER_GENRE : data.genre;
      const language = customLanguage ? data.language?.trim() || OTHER_LANGUAGE : data.language;
      const sizeRaw = data.fileSizeMb?.trim();
      const fileSizeMb =
        sizeRaw && fileSizeUnit === 'GB' && !Number.isNaN(Number(sizeRaw))
          ? String(Math.round(Number(sizeRaw) * MB_PER_GB * 10) / 10)
          : data.fileSizeMb;
      await onSubmit(formValuesToRequest({ ...data, genre, language, fileSizeMb }, { isPublished }));
    }, onInvalid)().finally(() => setPendingAction(null));
  };

  const onInvalid = (invalid: FieldErrors<ProductFormValues>) => {
    if (!inModal) return;
    const steps = Object.keys(invalid)
      .map((key) => stepKeys.indexOf(FIELD_STEP[key as keyof ProductFormValues] ?? 'pricing'))
      .filter((index) => index >= 0);
    if (steps.length > 0) setStep(Math.min(...steps));
  };

  const onFormKeyDown = (event: KeyboardEvent<HTMLFormElement>) => {
    if (event.key === 'Enter' && (event.target as HTMLElement).tagName === 'INPUT') event.preventDefault();
  };

  /* Preview + checklist */

  const priceNumber = Number(priceAmount);
  const priceCents = priceAmount !== '' && !Number.isNaN(priceNumber) && priceNumber >= 0 ? Math.round(priceNumber * 100) : null;
  const compareNumber = Number(compareAtAmount);
  const compareCents =
    !isFree && compareAtAmount && !Number.isNaN(compareNumber) && compareNumber > 0 ? Math.round(compareNumber * 100) : null;
  const previewCurrency = /^[A-Z]{3}$/.test(currency) ? currency : 'EUR';

  const checklist = [
    { label: t('Title'), done: title.trim().length > 0, required: true },
    { label: t('Price'), done: priceCents != null, required: true },
    { label: t('Cover'), done: thumbnailUrl.trim().length > 0, required: false },
    { label: t('Description'), done: description.trim().length >= 40, required: false },
    { label: t('Hashtags'), done: hashtags.length > 0, required: false },
  ];
  const doneCount = checklist.filter((item) => item.done).length;

  const technicalCount = [fileFormat, language, watch('fileSizeMb'), watch('version')].filter((v) => v?.trim()).length + tools.length;

  const renderFormatSelector = showFormatToggle && !isEdit;
  const formProps = {
    onSubmit: (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (inModal && !isLastStep) void goToStep(step + 1);
      else submit('publish');
    },
    onKeyDown: onFormKeyDown,
    noValidate: true,
  };

  const productSection = !inModal ? (
        <Section title={t('Product')} description={t('The essentials buyers read first.')}>
          <div>
            <div className="flex items-baseline justify-between gap-3">
              <label htmlFor="title" className={LABEL}>
                {t('Title')}
              </label>
              <span className="text-[12px] tabular-nums text-neutral-400 dark:text-neutral-500">
                {title.length}/{TITLE_MAX}
              </span>
            </div>
            <input
              id="title"
              maxLength={TITLE_MAX}
              autoComplete="off"
              className={INPUT}
              placeholder={isPhysical ? t('e.g. Organic cotton oversized tee') : t('e.g. Notion template for freelancers')}
              aria-invalid={Boolean(errors.title)}
              {...register('title')}
            />
            {errors.title ? <p className={ERROR}>{errors.title.message}</p> : null}
          </div>

          <div>
            <div className="flex items-baseline justify-between gap-3">
              <label htmlFor="description" className={LABEL}>
                {t('Description')}
                <span className={OPTIONAL}>{t('Recommended')}</span>
              </label>
              {description.length > 0 ? (
                <span className="text-[12px] tabular-nums text-neutral-400 dark:text-neutral-500">
                  {description.length}/{DESCRIPTION_MAX}
                </span>
              ) : null}
            </div>
            <textarea
              id="description"
              rows={5}
              maxLength={DESCRIPTION_MAX}
              className={`${TEXTAREA} min-h-[8.5rem]`}
              placeholder={t('What buyers get, who it’s for, and why it’s worth it.')}
              {...register('description')}
            />
            {errors.description ? <p className={ERROR}>{errors.description.message}</p> : null}
          </div>

          {renderTypeCategory()}
        </Section>
  ) : null;

  function renderTypeCategory() {
    if (isPhysical) return null;
    return (
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="type" className={LABEL}>
                  {t('Type')}
                </label>
                {customType ? (
                  <div className="relative mt-2">
                    <input
                      id="type"
                      ref={customTypeInputRef}
                      value={typeLabel}
                      maxLength={CUSTOM_TYPE_MAX}
                      autoComplete="off"
                      placeholder={t('Name your type, e.g. Notion workspace')}
                      onChange={(event) =>
                        setValue('typeLabel', event.target.value, { shouldDirty: true, shouldValidate: true })
                      }
                      className="block h-11 w-full rounded-lg border border-black/[0.1] bg-transparent pl-3.5 pr-11 text-[15px] text-[#111111] transition-colors placeholder:text-neutral-400 hover:border-black/20 focus:border-[#111111] focus:outline-hidden dark:border-white/[0.12] dark:text-white dark:placeholder:text-neutral-500 dark:hover:border-white/25 dark:focus:border-white/70"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setTypeFromList(true);
                        /* Reopen the list right away, where the text field was. */
                        window.setTimeout(() => document.getElementById('type')?.click(), 0);
                      }}
                      aria-label={t('Choose a type from the list')}
                      title={t('Choose from the list')}
                      className="absolute right-1.5 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-neutral-400 transition-colors hover:bg-black/[0.05] hover:text-[#111111] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-black/20 dark:hover:bg-white/[0.08] dark:hover:text-white dark:focus-visible:ring-white/30"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <FormSelect
                    id="type"
                    className="mt-2"
                    /* Back on the list from "Other": no pick shown, so picking "Other" again still counts. */
                    value={productType === OTHER_TYPE ? '' : productType}
                    placeholder={typeLabel.trim() || t('Other')}
                    options={TYPE_OPTIONS}
                    onChange={(next) => {
                      setValue('type', next as ProductFormValues['type'], { shouldDirty: true, shouldValidate: true });
                      setTypeFromList(false);
                      if (next === OTHER_TYPE) window.setTimeout(() => customTypeInputRef.current?.focus(), 0);
                    }}
                  />
                )}
                {errors.typeLabel ? <p className={ERROR}>{errors.typeLabel.message}</p> : null}
              </div>
              <div>
                <label htmlFor="genre" className={LABEL}>
                  {t('Category')}
                </label>
                <FormSelect
                  id="genre"
                  className="mt-2"
                  value={customGenre ? OTHER_GENRE : watchedGenre ?? ''}
                  options={GENRE_OPTIONS}
                  placeholder={t('Choose a category')}
                  onChange={(next) => {
                    if (next === OTHER_GENRE) {
                      setCustomGenre(true);
                      setSelectValue('genre', '');
                      window.setTimeout(() => customGenreInputRef.current?.focus(), 0);
                      return;
                    }
                    setCustomGenre(false);
                    setSelectValue('genre', next);
                  }}
                />
                {customGenre ? (
                  <input
                    ref={customGenreInputRef}
                    aria-label={t('Custom category')}
                    value={watchedGenre === OTHER_GENRE ? '' : watchedGenre ?? ''}
                    maxLength={CUSTOM_GENRE_MAX}
                    autoComplete="off"
                    placeholder={t('Name your category, e.g. Photography')}
                    onChange={(event) => setSelectValue('genre', event.target.value)}
                    className={INPUT}
                  />
                ) : null}
              </div>
            </div>
    );
  }

  const mediaSection = (
        <Section
          title={inModal ? (isPhysical ? t('More photos') : t('Free sample')) : t('Media')}
          description={
            inModal
              ? isPhysical
                ? t('Add more angles so buyers see every detail.')
                : t('Let buyers peek inside: a trailer, an extract or a few pages.')
              : isPhysical
                ? t('A sharp cover sells the product. Add more angles if you have them.')
                : t('The cover sells the click in listings. The sample shows what’s inside, on your product page.')
          }
        >
          {mediaError ? (
            <p role="alert" className="bg-[#F4212E]/[0.08] px-4 py-3 text-[14px] text-[#F4212E]">
              {mediaError}
            </p>
          ) : null}

          {isPhysical ? (
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
              {!inModal ? (
                <MediaDrop
                  url={thumbnailUrl}
                  uploading={uploadingThumb}
                  preview={thumbPreview}
                  disabled={isSubmitting}
                  accept={IMAGE_ACCEPT}
                  onFile={(e) => void onThumbnailFile(e)}
                  onRemove={() => setValue('thumbnailUrl', '', { shouldDirty: true })}
                  title={t('Cover photo')}
                  hint={t('JPEG, PNG or WebP')}
                  className="col-span-2 row-span-2 aspect-square"
                />
              ) : null}
              {galleryField.fields.map((field, index) => (
                <div
                  key={field.id}
                  className="group relative aspect-square overflow-hidden bg-[color:var(--x-field,#EFF3F4)]"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={galleryImages[index]?.value} alt={`Photo ${index + 2}`} className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => galleryField.remove(index)}
                    aria-label={`Remove photo ${index + 2}`}
                    className="absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity hover:bg-black/80 focus-visible:opacity-100 group-hover:opacity-100"
                  >
                    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden>
                      <path d="M6 6l12 12M18 6L6 18" />
                    </svg>
                  </button>
                </div>
              ))}
              {galleryPending.map((preview, index) => (
                <div key={preview.url} className="relative aspect-square overflow-hidden">
                  <UploadingOverlay preview={preview} compact={index > 0} label={index > 0 ? t('Waiting…') : t('Uploading…')} />
                </div>
              ))}
              {galleryField.fields.length + galleryPending.length < GALLERY_MAX ? (
                <label
                  className={`flex aspect-square cursor-pointer flex-col items-center justify-center gap-1.5 bg-[color:var(--x-field,#EFF3F4)] text-[#536471] transition-[color,box-shadow] hover:text-[#0F1419] hover:shadow-[inset_0_0_0_2px_#CFD9DE] dark:text-[#71767B] dark:hover:text-[#E7E9EA] dark:hover:shadow-[inset_0_0_0_2px_#536471] ${
                    uploadingGallery || isSubmitting ? 'pointer-events-none opacity-40' : ''
                  }`}
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" aria-hidden>
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                  <span className="text-[12px] font-medium">{t('Add photos')}</span>
                  <input
                    type="file"
                    accept={IMAGE_ACCEPT}
                    multiple
                    className="sr-only"
                    disabled={uploadingGallery || isSubmitting}
                    onChange={(e) => void onGalleryFiles(e)}
                  />
                </label>
              ) : null}
            </div>
          ) : (
            <div className={`grid gap-4 ${inModal ? '' : 'sm:grid-cols-2'}`}>
              {!inModal ? (
                <div>
                  <p className={LABEL}>
                    {t('Cover')}
                    <span className={OPTIONAL}>{t('Shown in listings')}</span>
                  </p>
                  <MediaDrop
                    url={thumbnailUrl}
                    uploading={uploadingThumb}
                  preview={thumbPreview}
                    disabled={isSubmitting}
                    accept={MEDIA_ACCEPT}
                    onFile={(e) => void onThumbnailFile(e)}
                    onRemove={() => setValue('thumbnailUrl', '', { shouldDirty: true })}
                    title={t('Add a cover')}
                    hint={t('Image or video up to {THUMBNAILVIDEOMAXSECONDS}s', { THUMBNAILVIDEOMAXSECONDS: THUMBNAIL_VIDEO_MAX_SECONDS })}
                    className="mt-2 aspect-[16/10]"
                  />
                </div>
              ) : null}
              <div>
                {!inModal ? (
                  <p className={LABEL}>
                    {t('Free sample')}
                    <span className={OPTIONAL}>{t('Optional')}</span>
                  </p>
                ) : null}
                {inModal ? (
                  <MediaRow
                    url={demoUrl}
                    uploading={uploadingDemo}
                    preview={demoPreview}
                    disabled={isSubmitting}
                    accept={MEDIA_ACCEPT}
                    onFile={(e) => void onDemoFile(e)}
                    onRemove={() => {
                      setValue('demoUrl', '', { shouldDirty: true });
                      setValue('demoType', 'NONE');
                    }}
                    title={demoUrl.trim() ? t('Sample added') : t('Add a sample')}
                    hint={t('Trailer, extract or inside pages')}
                  />
                ) : (
                  <MediaDrop
                    url={demoUrl}
                    uploading={uploadingDemo}
                    preview={demoPreview}
                    disabled={isSubmitting}
                    accept={MEDIA_ACCEPT}
                    onFile={(e) => void onDemoFile(e)}
                    onRemove={() => {
                      setValue('demoUrl', '', { shouldDirty: true });
                      setValue('demoType', 'NONE');
                    }}
                    title={t('Add a sample')}
                    hint={t('Trailer, extract or inside pages')}
                    className="mt-2 aspect-[16/10]"
                  />
                )}
              </div>
              {demoUrl.trim() ? (
                <div className={inModal ? '' : 'sm:col-span-2'}>
                  <ProductSubtitlesField control={control} register={register} label={t('Sample captions')} />
                </div>
              ) : null}
            </div>
          )}
        </Section>
  );

  const pricingSection = (
        <Section
          title={t('Pricing')}
          aside={
            <label className="flex shrink-0 items-center gap-3 text-[14px] text-neutral-600 dark:text-neutral-300">
              {t('Free')}
              <Switch
                label={t('Free product')}
                checked={isFree}
                onChange={() => {
                  if (isFree) {
                    setValue('priceAmount', '', { shouldValidate: false });
                  } else {
                    setValue('priceAmount', '0', { shouldValidate: true });
                    setValue('compareAtPriceAmount', '');
                    setShowCompareAt(false);
                  }
                }}
              />
            </label>
          }
        >
          {isFree ? (
            <p className="rounded-lg bg-black/[0.03] px-4 py-3 text-[14px] text-neutral-600 dark:bg-white/[0.05] dark:text-neutral-300">
              {t('Buyers get this product at no cost.')}
            </p>
          ) : (
            <div className={`grid gap-5 ${showCompareAt ? 'sm:grid-cols-2' : ''}`}>
              <div>
                <label htmlFor="priceAmount" className={LABEL}>
                  {t('Price')}
                </label>
                <div className={`mt-2 flex h-14 items-center ${FIELD_BASE} ${FIELD_FOCUS_WITHIN}`}>
                  <input
                    id="priceAmount"
                    type="number"
                    inputMode="decimal"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    aria-invalid={Boolean(errors.priceAmount)}
                    className={`h-full min-w-0 flex-1 bg-transparent px-4 text-[22px] font-semibold tracking-[-0.01em] tabular-nums text-[#111111] outline-hidden placeholder:text-neutral-400 dark:text-white dark:placeholder:text-neutral-500 ${NO_SPIN}`}
                    {...register('priceAmount')}
                  />
                  <span aria-hidden className="h-5 w-px bg-black/[0.1] dark:bg-white/[0.12]" />
                  <CurrencyPicker
                    id="currency"
                    value={currency || DEFAULT_CURRENCY}
                    options={currencyOptions}
                    onChange={(code) => setValue('currency', code, { shouldDirty: true, shouldValidate: true })}
                  />
                </div>
                {errors.priceAmount ? <p className={ERROR}>{errors.priceAmount.message}</p> : null}
              </div>

              {showCompareAt ? (
                <div>
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <label htmlFor="compareAtPriceAmount" className={LABEL}>
                        {t('Compare-at price')}
                      </label>
                      <InfoHint align="start">{t('Shown crossed out next to your price to highlight a discount.')}</InfoHint>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setValue('compareAtPriceAmount', '');
                        setShowCompareAt(false);
                      }}
                      className="text-[13px] text-neutral-500 hover:text-[#111111] dark:text-neutral-400 dark:hover:text-white"
                    >
                      {t('Remove')}
                    </button>
                  </div>
                  <div className={`mt-2 flex h-14 items-center ${FIELD_BASE} ${FIELD_FOCUS_WITHIN}`}>
                    <input
                      id="compareAtPriceAmount"
                      type="number"
                      inputMode="decimal"
                      step="0.01"
                      min="0"
                      placeholder={t('e.g. 49.00')}
                      className={`h-full min-w-0 flex-1 bg-transparent px-3.5 text-[15px] tabular-nums text-[#111111] outline-hidden placeholder:text-neutral-400 dark:text-white dark:placeholder:text-neutral-500 ${NO_SPIN}`}
                      {...register('compareAtPriceAmount')}
                    />
                    <span className="pr-3.5 text-[14px] font-medium text-neutral-400 dark:text-neutral-500">
                      {currency || '—'}
                    </span>
                  </div>
                </div>
              ) : (
                <button type="button" onClick={() => setShowCompareAt(true)} className={`${LINK_BTN} -mt-1 justify-self-start`}>
                  {t('+ Show a discount')}
                </button>
              )}
            </div>
          )}

          {isPhysical ? (
            <div className="pt-2">
              <div className="flex items-center gap-2">
                <label htmlFor="stockQuantity" className={LABEL}>
                  {t('Stock')}
                  <span className={OPTIONAL}>{t('Optional')}</span>
                </label>
                <InfoHint align="start">{t('Units you have on hand. Leave empty for a single unit, set 0 when sold out.')}</InfoHint>
              </div>
              <div className={`mt-2 flex h-11 items-center sm:max-w-[16rem] ${FIELD_BASE} ${FIELD_FOCUS_WITHIN}`}>
                <input
                  id="stockQuantity"
                  type="number"
                  inputMode="numeric"
                  step="1"
                  min="0"
                  max={STOCK_MAX}
                  placeholder="1"
                  aria-invalid={Boolean(errors.stockQuantity)}
                  className={`h-full min-w-0 flex-1 bg-transparent px-3.5 text-[15px] tabular-nums text-[#111111] outline-hidden placeholder:text-neutral-400 dark:text-white dark:placeholder:text-neutral-500 ${NO_SPIN}`}
                  {...register('stockQuantity')}
                />
                <span className="pr-3.5 text-[14px] text-neutral-400 dark:text-neutral-500">{t('units')}</span>
              </div>
              {errors.stockQuantity ? (
                <p className={ERROR}>{errors.stockQuantity.message}</p>
              ) : stockQuantity?.trim() === '0' ? (
                <p className={HINT}>{t('Buyers will see this product as sold out.')}</p>
              ) : null}
            </div>
          ) : null}
        </Section>
  );

  // Merchandising badges (On sale, Clearance, Trending…): toggle chips, up to 3; once 3 are on, the
  // rest are disabled so the limit is shown rather than reported as an error.
  const statusSection = (
        <Section
          title={t('Product status')}
          description={t('Badges shown on your product card, like On sale or Trending. Pick up to {MAXPRODUCTSTATUSLABELS}.', { MAXPRODUCTSTATUSLABELS: MAX_PRODUCT_STATUS_LABELS })}
          aside={
            <span className="shrink-0 text-[13px] tabular-nums text-neutral-500 dark:text-neutral-400" aria-live="polite">
              {statusLabels.length}/{MAX_PRODUCT_STATUS_LABELS}
            </span>
          }
        >
          <div className="flex flex-wrap gap-2" role="group" aria-label={t('Product status')}>
            {PRODUCT_STATUS_LABEL_OPTIONS.map((option) => {
              const selected = statusLabels.includes(option.value);
              const full = !selected && statusLabels.length >= MAX_PRODUCT_STATUS_LABELS;
              return (
                <button
                  key={option.value}
                  type="button"
                  aria-pressed={selected}
                  disabled={full}
                  title={t(option.hint)}
                  onClick={() =>
                    setValue(
                      'statusLabels',
                      selected
                        ? statusLabels.filter((value) => value !== option.value)
                        : [...statusLabels, option.value],
                      { shouldDirty: true, shouldValidate: true }
                    )
                  }
                  className={`inline-flex min-h-10 items-center gap-1.5 rounded-full border px-4 text-[14px] font-medium transition-colors duration-200 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#111111] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40 dark:focus-visible:ring-white dark:focus-visible:ring-offset-black ${
                    selected
                      ? 'border-[#111111] bg-[#111111] text-white dark:border-white dark:bg-white dark:text-[#111111]'
                      : 'border-black/[0.12] text-[#111111] hover:border-black/30 dark:border-white/[0.14] dark:text-white dark:hover:border-white/30'
                  }`}
                >
                  {selected ? (
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  ) : null}
                  {t(option.label)}
                </button>
              );
            })}
          </div>
        </Section>
  );

  const hashtagsSection = (
        <Section title={t('Hashtags')} description={t('Help buyers find your product in search. Press Enter after each one.')}>
          <ProductHashtagsField
            value={hashtags}
            onChange={(next) =>
              setValue(
                'tags',
                next.map((tag) => ({ value: tag })),
                { shouldDirty: true, shouldValidate: true }
              )
            }
            boxClassName={`${FIELD_BASE} ${FIELD_FOCUS_WITHIN}`}
          />
        </Section>
  );

  const highlightsSection = !isPhysical ? (
            <CollapsibleSection
              title={t('Highlights')}
              description={t('A few clear reasons to choose your product, with photos or text.')}
              summary={whyBlocksCount > 0 ? `${whyBlocksCount} highlight${whyBlocksCount > 1 ? 's' : ''} added` : null}
              defaultOpen={isEdit && whyBlocksCount > 0}
            >
              <ProductWhyBlocksField
                fields={whyField.fields}
                append={whyField.append}
                remove={whyField.remove}
                register={register}
                watch={watch}
                setValue={setValue}
                control={control}
              />
            </CollapsibleSection>
  ) : null;

  const technicalSection = !isPhysical ? (
            <CollapsibleSection
              title={t('Technical details')}
              description={t('Format, language, version and the tools buyers need.')}
              summary={technicalCount > 0 ? `${technicalCount} detail${technicalCount > 1 ? 's' : ''} filled` : null}
              defaultOpen={isEdit && technicalCount > 0}
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="fileFormat" className={LABEL}>
                    {t('File format')}
                  </label>
                  <input id="fileFormat" className={INPUT} placeholder={t('e.g. ZIP, PDF, MP4')} {...register('fileFormat')} />
                </div>
                <div>
                  <label htmlFor="language" className={LABEL}>
                    {t('Language')}
                  </label>
                  <FormSelect
                    id="language"
                    className="mt-2"
                    value={customLanguage ? OTHER_LANGUAGE : language ?? ''}
                    options={LANGUAGE_OPTIONS}
                    onChange={(next) => {
                      if (next === OTHER_LANGUAGE) {
                        setCustomLanguage(true);
                        setSelectValue('language', '');
                        window.setTimeout(() => customLanguageInputRef.current?.focus(), 0);
                        return;
                      }
                      setCustomLanguage(false);
                      setSelectValue('language', next);
                    }}
                  />
                  {customLanguage ? (
                    <input
                      ref={customLanguageInputRef}
                      aria-label={t('Custom language')}
                      value={language === OTHER_LANGUAGE ? '' : language ?? ''}
                      maxLength={CUSTOM_LANGUAGE_MAX}
                      autoComplete="off"
                      placeholder={t('Name the language, e.g. Japanese')}
                      onChange={(event) => setSelectValue('language', event.target.value)}
                      className={INPUT}
                    />
                  ) : null}
                </div>
                <div>
                  <label htmlFor="fileSizeMb" className={LABEL}>
                    {t('File size')}
                  </label>
                  <div className={`mt-2 flex h-11 items-center ${FIELD_BASE} ${FIELD_FOCUS_WITHIN}`}>
                    <input
                      id="fileSizeMb"
                      type="number"
                      min="0"
                      step="0.1"
                      placeholder={fileSizeUnit === 'GB' ? t('e.g. 1.5') : t('e.g. 250')}
                      className={`h-full min-w-0 flex-1 bg-transparent px-3.5 text-[15px] text-[#111111] outline-hidden placeholder:text-neutral-400 dark:text-white dark:placeholder:text-neutral-500 ${NO_SPIN}`}
                      {...register('fileSizeMb')}
                    />
                    <span aria-hidden className="h-5 w-px bg-black/[0.1] dark:bg-white/[0.12]" />
                    <div className="relative h-full shrink-0">
                      <select
                        aria-label={t('File size unit')}
                        value={fileSizeUnit}
                        onChange={(event) => setFileSizeUnit(event.target.value as FileSizeUnit)}
                        className="h-full cursor-pointer appearance-none bg-transparent pl-3 pr-8 text-[14px] font-medium text-[#111111] outline-hidden dark:text-white dark:[color-scheme:dark]"
                      >
                        <option value="MB">{t('MB')}</option>
                        <option value="GB">{t('GB')}</option>
                      </select>
                      <svg
                        className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={1.75}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden
                      >
                        <path d="m6 9 6 6 6-6" />
                      </svg>
                    </div>
                  </div>
                </div>
                <div>
                  <label htmlFor="version" className={LABEL}>
                    {t('Version')}
                  </label>
                  <input id="version" className={INPUT} placeholder={t('e.g. v1.0')} {...register('version')} />
                </div>
                {productType === 'VIDEO' ? (
                  <>
                    <div>
                      <label htmlFor="videoDuration" className={LABEL}>
                        {t('Video duration')}
                      </label>
                      <input id="videoDuration" placeholder="m:ss" className={INPUT} {...register('videoDuration')} />
                    </div>
                    <div>
                      <label htmlFor="videoResolution" className={LABEL}>
                        {t('Resolution')}
                      </label>
                      <FormSelect
                        id="videoResolution"
                        className="mt-2"
                        value={watch('videoResolution') ?? ''}
                        options={RESOLUTION_OPTIONS}
                        onChange={(next) => setSelectValue('videoResolution', next)}
                      />
                    </div>
                  </>
                ) : null}
              </div>

              <ChipsInput
                label={t('Compatible tools')}
                values={tools}
                max={TOOLS_MAX}
                placeholder={t('e.g. Figma')}
                hint={t('Press Enter to add. The apps buyers need to use your product.')}
                onChange={(next) =>
                  setValue(
                    'compatibleTools',
                    next.map((value) => ({ value })),
                    { shouldDirty: true }
                  )
                }
              />
            </CollapsibleSection>
  ) : null;

  const creatorName = user?.fullName ?? 'You';
  const creatorAvatarSrc = user?.avatarUrl ? resolveStorageMediaUrl(user.avatarUrl) || user.avatarUrl : null;

  const composeBlock = inModal ? (
    <div className="pb-8 pt-6 sm:pb-9 sm:pt-7">
      {renderFormatSelector ? (
        <div className="mb-7">
          <FormatCards value={productFormat} onChange={changeFormat} disabled={isSubmitting} />
        </div>
      ) : null}
      <div className="flex gap-4">
        {creatorAvatarSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={creatorAvatarSrc}
            alt=""
            className="hidden h-11 w-11 shrink-0 rounded-full object-cover ring-1 ring-black/[0.06] dark:ring-white/[0.1] sm:block"
          />
        ) : (
          <span className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#111111] text-[14px] font-semibold text-white dark:bg-white dark:text-[#111111] sm:flex">
            {initialsOf(creatorName)}
          </span>
        )}
        <div className="min-w-0 flex-1 sm:pt-1">
          <input
            id="title"
            maxLength={TITLE_MAX}
            autoComplete="off"
            autoFocus
            aria-label={t('Product title')}
            placeholder={isPhysical ? t('Name your product') : t('What are you selling?')}
            aria-invalid={Boolean(errors.title)}
            className="block w-full border-0 bg-transparent p-0 text-[24px] font-semibold leading-tight sm:text-[26px] tracking-[-0.02em] text-[#111111] outline-hidden placeholder:text-neutral-300 dark:text-white dark:placeholder:text-neutral-600"
            {...register('title')}
          />
          {errors.title ? <p className={ERROR}>{errors.title.message}</p> : null}
          <textarea
            id="description"
            rows={2}
            maxLength={DESCRIPTION_MAX}
            aria-label={t('Description')}
            placeholder={t('What buyers get, who it’s for, and why it’s worth it.')}
            className="mt-3 block min-h-[3.5rem] w-full resize-none border-0 bg-transparent p-0 text-[16px] leading-relaxed text-[#111111] outline-hidden [field-sizing:content] placeholder:text-neutral-400 dark:text-white dark:placeholder:text-neutral-500"
            {...register('description')}
          />
          {errors.description ? <p className={ERROR}>{errors.description.message}</p> : null}
          {title.length > 0 ? (
            <p className="mt-4 text-right text-[12px] tabular-nums text-neutral-400 dark:text-neutral-500">
              {title.length}/{TITLE_MAX}
            </p>
          ) : null}
        </div>
      </div>
      <div className="mt-8 space-y-7 sm:mt-10 sm:space-y-8">
        {renderTypeCategory()}
        <div>
          <div className="flex items-center gap-2">
            <p className={LABEL}>{t('Cover')}</p>
            <InfoHint align="start">{t('The first thing buyers see in listings and search.')}</InfoHint>
          </div>
          <div className="mt-2">
            <MediaRow
              url={thumbnailUrl}
              uploading={uploadingThumb}
                  preview={thumbPreview}
              disabled={isSubmitting}
              accept={isPhysical ? IMAGE_ACCEPT : MEDIA_ACCEPT}
              onFile={(e) => void onThumbnailFile(e)}
              onRemove={() => setValue('thumbnailUrl', '', { shouldDirty: true })}
              title={thumbnailUrl.trim() ? t('Cover added') : t('Add a cover')}
              hint={isPhysical ? t('JPEG, PNG or WebP') : t('Image or video up to {THUMBNAILVIDEOMAXSECONDS}s', { THUMBNAILVIDEOMAXSECONDS: THUMBNAIL_VIDEO_MAX_SECONDS })}
            />
          </div>
          {mediaError ? <p role="alert" className={ERROR}>{mediaError}</p> : null}
        </div>
      </div>
    </div>
  ) : null;

  const listingPreview = (
    <div className="pb-9 pt-8">
      <div className="flex gap-4 rounded-2xl bg-black/[0.025] p-3 dark:bg-white/[0.04]">
        <div className="relative aspect-[4/3] w-32 shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-black/[0.03] to-black/[0.08] dark:from-white/[0.04] dark:to-white/[0.09] sm:w-44">
          {thumbnailUrl.trim() ? (
            <ProductThumbnailMedia
              url={thumbnailUrl.trim()}
              autoPlay={isVideoThumbnailUrl(thumbnailUrl.trim())}
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <button
              type="button"
              onClick={() => setStep(0)}
              className="absolute inset-0 flex items-center justify-center text-[12px] font-medium text-neutral-500 hover:text-[#111111] dark:text-neutral-400 dark:hover:text-white"
            >
              {t('+ Add a cover')}
            </button>
          )}
        </div>
        <div className="flex min-w-0 flex-1 flex-col justify-center gap-1.5 py-1 pr-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-400 dark:text-neutral-500">
            {isPhysical ? t('Material') : productTypeName(productType, typeLabel)}
          </p>
          <p
            className={`line-clamp-2 text-[16px] font-semibold leading-snug ${
              title.trim() ? 'text-[#111111] dark:text-white' : 'text-neutral-300 dark:text-neutral-600'
            }`}
          >
            {title.trim() || t('Product title')}
          </p>
          {hashtags.length > 0 ? (
            <p className="truncate text-[13px] text-neutral-500 dark:text-neutral-400">
              {hashtags.slice(0, 3).map((tag) => `#${tag}`).join('  ')}
            </p>
          ) : null}
          <p className="mt-1 flex items-baseline gap-2">
            <span className="text-[18px] font-bold tracking-[-0.01em] text-[#111111] dark:text-white">
              {isFree ? t('Free') : priceCents != null ? formatPrice(priceCents, previewCurrency) : '—'}
            </span>
            {compareCents != null && priceCents != null && compareCents > priceCents ? (
              <>
                <span className="text-[14px] text-neutral-400 line-through dark:text-neutral-500">
                  {formatPrice(compareCents, previewCurrency)}
                </span>
                <span className="rounded-full bg-[#111111] px-2 py-0.5 text-[11px] font-semibold text-white dark:bg-white dark:text-[#111111]">
                  −{Math.round((1 - priceCents / compareCents) * 100)}%
                </span>
              </>
            ) : null}
          </p>
        </div>
      </div>
    </div>
  );

  const stepLabels = stepKeys.map((key) => STEP_LABELS[key]);

  /* Review: what is set and what is missing, each line a way back to its step. */
  const readinessBlock = (
    <section className="py-8">
      <div className="flex items-center justify-between">
        <h2 className="text-[17px] font-semibold tracking-[-0.01em] text-[#0F1419] dark:text-[#E7E9EA]">{t('Ready to publish')}</h2>
        <p className="text-[13px] tabular-nums text-[#536471] dark:text-[#71767B]">
          {doneCount}/{checklist.length}
        </p>
      </div>
      <div className="mt-3 h-1 overflow-hidden rounded-full bg-[#EFF3F4] dark:bg-[#2F3336]">
        <div className="h-full rounded-full bg-[#0F1419] transition-[width] duration-500 dark:bg-[#E7E9EA]" style={{ width: `${(doneCount / checklist.length) * 100}%` }} />
      </div>
      <ul className="mt-4 divide-y divide-[#EFF3F4] dark:divide-[#2F3336]">
        {checklist.map((item) => (
          <li key={item.label}>
            <button
              type="button"
              onClick={() => setStep(item.label === 'Hashtags' ? 1 : 0)}
              className="flex w-full items-center gap-3 py-2.5 text-left text-[15px]"
            >
              <span
                aria-hidden
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                  item.done ? 'bg-[#0F1419] text-white dark:bg-[#EFF3F4] dark:text-[#0F1419]' : 'shadow-[inset_0_0_0_1.5px_#CFD9DE] dark:shadow-[inset_0_0_0_1.5px_#536471]'
                }`}
              >
                {item.done ? (
                  <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round">
                    <path d="m5 12 5 5 9-10" />
                  </svg>
                ) : null}
              </span>
              <span className={item.done ? 'text-[#0F1419] dark:text-[#E7E9EA]' : 'text-[#536471] dark:text-[#71767B]'}>{t(item.label)}</span>
              {!item.done ? (
                <span className={`ml-auto text-[13px] font-semibold ${item.required ? 'text-[#F4212E]' : 'text-[#536471] dark:text-[#71767B]'}`}>
                  {item.required ? t('Required') : t('Add')}
                </span>
              ) : null}
            </button>
          </li>
        ))}
      </ul>
    </section>
  );

  const stepContent =
    currentStep === 'details' ? (
      <>
        {composeBlock}
        {pricingSection}
      </>
    ) : currentStep === 'media' ? (
      <>
        {mediaSection}
        {!isPhysical ? (
          <Section title={t('Highlights')} description={t('Optional. A few clear reasons to choose your product, with a photo or a short text.')}>
            <ProductWhyBlocksField
              fields={whyField.fields}
              append={whyField.append}
              remove={whyField.remove}
              register={register}
              watch={watch}
              setValue={setValue}
              control={control}
            />
          </Section>
        ) : null}
        {statusSection}
        {hashtagsSection}
      </>
    ) : (
      <>
        {listingPreview}
        {readinessBlock}
        {technicalSection}
      </>
    );

  const sections = (
    <>
      {productSection}
      {mediaSection}
      {pricingSection}
      {statusSection}
      {hashtagsSection}
      {highlightsSection}
      {technicalSection}
    </>
  );

  if (variant === 'modal') {
    const missingRequired = checklist.filter((item) => item.required && !item.done).map((item) => item.label);
    return (
      <EditorVariantContext.Provider value="modal">
        <form {...formProps} aria-labelledby={headingId} className="x-editor flex min-h-0 flex-1 flex-col">
          <header className="relative shrink-0 px-4 pb-4 pt-2 sm:px-6 sm:pt-4">
            <span aria-hidden className="mx-auto mb-2 block h-1 w-9 rounded-full bg-black/[0.12] dark:bg-white/[0.16] sm:hidden" />
            <div className="flex items-center gap-2 sm:gap-3">
              {step > 0 ? (
                <button type="button" onClick={() => void goToStep(step - 1)} aria-label={t('Previous step')} className={`${ROUND_ICON_BTN} -ml-1.5`}>
                  <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="M19 12H5m6-6-6 6 6 6" />
                  </svg>
                </button>
              ) : null}
              <div className="min-w-0">
                <h2 id={headingId} className="truncate text-[17px] font-semibold leading-tight tracking-[-0.015em] text-[#111111] dark:text-white sm:text-[18px]">
                  {heading}
                </h2>
                <p className="mt-0.5 text-[13px] leading-tight text-neutral-500 dark:text-neutral-400">
                  <span className="tabular-nums">{t('Step')} {step + 1} {t('of')} {stepCount}</span>
                  <span aria-hidden> · </span>
                  {stepLabels[step]}
                </p>
              </div>
              {onCancel ? (
                <button
                  type="button"
                  onClick={onCancel}
                  aria-label={t('Close')}
                  className={`${ROUND_ICON_BTN} -mr-1.5 ml-auto bg-black/[0.04] dark:bg-white/[0.06]`}
                >
                  <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden>
                    <path d="M6 6l12 12M18 6L6 18" />
                  </svg>
                </button>
              ) : null}
            </div>

            <div className="absolute inset-x-0 bottom-0 flex gap-1" aria-label={t('Steps')}>
              {stepLabels.map((label, index) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => void goToStep(index)}
                  aria-label={label}
                  aria-current={index === step ? 'step' : undefined}
                  className="group flex-1 pt-2"
                >
                  <span
                    className={`block h-[2px] transition-colors duration-300 ${
                      index < step
                        ? 'bg-[#111111] dark:bg-white'
                        : index === step
                          ? 'bg-[#0F1419] dark:bg-[#E7E9EA]'
                          : 'bg-black/[0.08] group-hover:bg-black/[0.16] dark:bg-white/[0.1] dark:group-hover:bg-white/[0.2]'
                    }`}
                  />
                </button>
              ))}
            </div>
          </header>

          <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain px-5 sm:px-8">
            <div className="divide-y divide-black/[0.06] dark:divide-white/[0.08]">{stepContent}</div>
          </div>

          <footer className="flex shrink-0 items-center gap-3 border-t border-black/[0.06] bg-white px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 dark:border-white/[0.08] dark:bg-[#0A0A0A] sm:px-6 sm:pb-3">
            {!isEdit ? (
              <button type="button" onClick={() => submit('draft')} disabled={busy} className={`${LINK_BTN} -ml-2 shrink-0 px-2 py-2`}>
                {pendingAction === 'draft' && isSubmitting ? t('Saving…') : t('Save draft')}
              </button>
            ) : null}
            <div className="ml-auto flex items-center gap-2">
              {isLastStep && missingRequired.length > 0 ? (
                <p className="hidden text-[13px] text-neutral-500 dark:text-neutral-400 sm:block">
                  {t('Add')} <span className="font-medium text-[#111111] dark:text-white">{missingRequired.join(' and ').toLowerCase()}</span>
                </p>
              ) : null}
              {step > 0 ? (
                <button type="button" onClick={() => void goToStep(step - 1)} disabled={isSubmitting} className={`${PILL_GHOST} hidden sm:inline-flex`}>
                  {t('Back')}
                </button>
              ) : null}
              {!isLastStep ? (
                <button type="button" onClick={() => void goToStep(step + 1)} disabled={busy} className={PILL_PRIMARY}>
                  {t('Next')}
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="M5 12h14m-6-6 6 6-6 6" />
                  </svg>
                </button>
              ) : (
                <button type="button" onClick={() => submit('publish')} disabled={busy} className={PILL_PRIMARY}>
                  {pendingAction === 'publish' && isSubmitting ? <LoadingSpinner size="sm" /> : null}
                  {pendingAction === 'publish' && isSubmitting ? t('Publishing…') : submitLabel}
                </button>
              )}
            </div>
          </footer>
        </form>
      </EditorVariantContext.Provider>
    );
  }

  return (
    <form
      {...formProps}
      className="x-editor x-editor-page grid items-start gap-2 sm:gap-6 lg:grid-cols-[minmax(0,1fr)_320px] xl:grid-cols-[minmax(0,1fr)_360px]"
    >
      <div className="min-w-0 space-y-2 sm:space-y-6">
        {renderFormatSelector ? (
          <FormatSelector value={productFormat} onChange={changeFormat} disabled={isSubmitting} />
        ) : null}
        {sections}
      </div>

      {/* Sticky summary: live preview, readiness and actions. */}
      <aside className="space-y-2 sm:space-y-6 lg:sticky lg:top-24">
        <div className="overflow-hidden bg-[#F7F9F9] dark:bg-[#16181C]">
          <div className="relative aspect-[4/3] bg-[#EFF3F4] dark:bg-[#202327]">
            {thumbnailUrl.trim() ? (
              <ProductThumbnailMedia
                url={thumbnailUrl.trim()}
                autoPlay={isVideoThumbnailUrl(thumbnailUrl.trim())}
                className="absolute inset-0 h-full w-full object-cover"
              />
            ) : (
              <span className="absolute inset-0 flex items-center justify-center text-[13px] text-[#536471] dark:text-[#71767B]">
                {t('Your cover appears here')}
              </span>
            )}
          </div>
          <div className="space-y-1.5 p-5">
            <p className="text-[11px] font-semibold uppercase leading-4 tracking-[0.12em] text-[#536471] dark:text-[#71767B]">
              {isPhysical ? t('Material') : productTypeName(productType, typeLabel)}
            </p>
            <p
              className={`line-clamp-2 text-[16px] font-bold leading-[22px] ${
                title.trim() ? 'text-[#0F1419] dark:text-[#E7E9EA]' : 'text-[#8B98A5] dark:text-[#536471]'
              }`}
            >
              {title.trim() || t('Product title')}
            </p>
            <p className="flex items-baseline gap-2">
              <span className="text-[17px] font-bold text-[#0F1419] dark:text-[#E7E9EA]">
                {priceCents != null ? formatPrice(priceCents, previewCurrency) : '—'}
              </span>
              {compareCents != null && priceCents != null && compareCents > priceCents ? (
                <span className="text-[13px] text-[#8B98A5] line-through dark:text-[#536471]">
                  {formatPrice(compareCents, previewCurrency)}
                </span>
              ) : null}
            </p>
          </div>
        </div>

        <div className="bg-[#F7F9F9] p-5 dark:bg-[#16181C]">
          <div className="flex items-center justify-between">
            <p className="text-[15px] font-bold text-[#0F1419] dark:text-[#E7E9EA]">{t('Ready to publish')}</p>
            <p className="text-[13px] tabular-nums text-[#536471] dark:text-[#71767B]">
              {doneCount}/{checklist.length}
            </p>
          </div>
          <div className="mt-3 h-1 overflow-hidden rounded-full bg-[#EFF3F4] dark:bg-[#2F3336]">
            <div
              className="h-full rounded-full bg-[#0F1419] transition-[width] duration-500 dark:bg-[#E7E9EA]"
              style={{ width: `${(doneCount / checklist.length) * 100}%` }}
            />
          </div>
          <ul className="mt-4 space-y-2.5">
            {checklist.map((item) => (
              <li key={item.label} className="flex items-center gap-2.5 text-[14px]">
                <span
                  aria-hidden
                  className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${
                    item.done
                      ? 'bg-[#0F1419] text-white dark:bg-[#EFF3F4] dark:text-[#0F1419]'
                      : 'border border-[#CFD9DE] dark:border-[#536471]'
                  }`}
                >
                  {item.done ? (
                    <svg className="h-2.5 w-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round">
                      <path d="m5 12 5 5 9-10" />
                    </svg>
                  ) : null}
                </span>
                <span className={item.done ? 'text-[#0F1419] dark:text-[#E7E9EA]' : 'text-[#536471] dark:text-[#71767B]'}>
                  {t(item.label)}
                </span>
                {!item.required && !item.done ? (
                  <span className="ml-auto text-[13px] text-[#536471] dark:text-[#71767B]">{t('Recommended')}</span>
                ) : null}
              </li>
            ))}
          </ul>

          <div className="mt-6 space-y-2.5">
            <button type="button" onClick={() => submit('publish')} disabled={busy} className={PRIMARY_BTN}>
              {pendingAction === 'publish' && isSubmitting ? <LoadingSpinner size="sm" /> : null}
              {pendingAction === 'publish' && isSubmitting ? t('Saving…') : submitLabel}
            </button>
            {!isEdit ? (
              <button type="button" onClick={() => submit('draft')} disabled={busy} className={SECONDARY_BTN}>
                {pendingAction === 'draft' && isSubmitting ? t('Saving…') : t('Save as draft')}
              </button>
            ) : null}
            {onCancel ? (
              <button type="button" onClick={onCancel} className={`${LINK_BTN} block w-full py-1.5 text-center`}>
                {t('Cancel')}
              </button>
            ) : cancelHref ? (
              <Link href={cancelHref} className={`${LINK_BTN} block w-full py-1.5 text-center`}>
                {t('Cancel')}
              </Link>
            ) : null}
          </div>
        </div>
      </aside>
    </form>
  );
}

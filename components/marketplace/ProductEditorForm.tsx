'use client';

import Link from 'next/link';
import { useRef, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PRODUCT_TYPE_LABELS, uploadProductMainFile, uploadProductThumbnail } from '@/lib/marketplace-api';
import { getApiErrorMessage } from '@/lib/api-error';
import {
  demoTypeLabel,
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
import { ProductEditorStepper } from '@/components/marketplace/ProductEditorStepper';
import { ProductSubtitlesField } from '@/components/marketplace/ProductSubtitlesField';
import { ProductWhyBlocksField } from '@/components/marketplace/ProductWhyBlocksField';
import {
  productEditorSchema,
  PRODUCT_TYPES,
  type ProductFormValues,
} from '@/components/marketplace/product-editor-schema';
import {
  parseDemoSubtitles,
} from '@/components/creator/studio/profile-form-schema';
import {
  parseProductWhyBlocks,
  serializeProductWhyBlocks,
} from '@/components/marketplace/product-why-block-schema';
import {
  fieldsForStep,
  PRODUCT_EDITOR_STEPS,
  type ProductEditorStepId,
} from '@/components/marketplace/product-editor-steps';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import type {
  DeliveryMode,
  LicenseType,
  MarketplaceProductDetail,
  MarketplaceProductRequest,
} from '@/types/marketplace';

export type { ProductFormValues } from '@/components/marketplace/product-editor-schema';

const DELIVERY_MODES = ['STREAM_ONLY', 'DOWNLOAD', 'BOTH'] as const satisfies readonly DeliveryMode[];
const LICENSE_TYPES = ['PERSONAL', 'COMMERCIAL', 'EXTENDED'] as const satisfies readonly LicenseType[];

const GENRES = ['Tech', 'Lifestyle', 'Business', 'Art', 'Sport', 'Music', 'Other'] as const;
const VIDEO_RESOLUTIONS = ['480p', '720p', '1080p', '4K'] as const;

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

type ProductEditorFormProps = {
  initial?: MarketplaceProductDetail;
  submitLabel: string;
  cancelHref?: string;
  onCancel?: () => void;
  embedded?: boolean;
  onSubmit: (body: MarketplaceProductRequest) => Promise<void>;
};

function formStyles(embedded: boolean) {
  if (!embedded) {
    return {
      section:
        'rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 dark:shadow-none',
      sectionAccent:
        'rounded-2xl border border-orange-100 bg-orange-50/50 p-6 shadow-sm dark:border-orange-500/20 dark:bg-orange-500/5 dark:shadow-none',
      input:
        'mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white dark:placeholder:text-neutral-500',
      label: 'text-sm font-medium text-gray-700 dark:text-neutral-300',
      title: 'text-sm font-semibold text-gray-900 dark:text-white',
      hint: 'mt-1 text-xs text-gray-500 dark:text-neutral-400',
      hintSm: 'mt-1 text-xs text-gray-600 dark:text-neutral-400',
      footerBtnSecondary:
        'rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-neutral-600 dark:text-neutral-300 dark:hover:bg-neutral-800',
      footerBtnPrimary:
        'inline-flex items-center justify-center rounded-lg bg-orange-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-60',
      tagBtn:
        'text-sm font-semibold text-orange-600 hover:text-orange-700 disabled:opacity-40 dark:text-orange-400 dark:hover:text-orange-300',
      removeBtn:
        'rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 dark:border-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-800',
      uploadLabel:
        'inline-flex cursor-pointer items-center rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-orange-600',
      uploadLabelOutline:
        'inline-flex cursor-pointer items-center rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-neutral-600 dark:text-neutral-300 dark:hover:bg-neutral-800',
      alert:
        'rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300',
      checkboxLabel: 'text-sm font-medium text-gray-700 dark:text-neutral-300',
      checkboxRow: 'mt-4 flex items-center gap-3 text-sm text-gray-800 dark:text-neutral-200',
    };
  }
  return {
    section: 'rounded-2xl border border-neutral-200/80 bg-neutral-50/40 p-5 dark:border-neutral-800 dark:bg-neutral-950/40',
    sectionAccent:
      'rounded-2xl border border-orange-200/60 bg-orange-50/30 p-5 dark:border-orange-500/20 dark:bg-orange-500/5',
    input:
      'mt-1 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white dark:placeholder:text-neutral-500',
    label: 'text-sm font-medium text-neutral-700 dark:text-neutral-300',
    title: 'text-sm font-semibold text-neutral-900 dark:text-white',
    hint: 'mt-1 text-xs text-neutral-500 dark:text-neutral-400',
    hintSm: 'mt-1 text-xs text-neutral-500 dark:text-neutral-400',
    footerBtnSecondary:
      'rounded-full border border-neutral-300 px-5 py-2.5 text-sm font-semibold text-neutral-700 hover:bg-neutral-100 dark:border-neutral-600 dark:text-neutral-300 dark:hover:bg-neutral-800',
    footerBtnPrimary:
      'inline-flex items-center justify-center rounded-full bg-orange-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-60',
    tagBtn: 'text-sm font-semibold text-orange-600 hover:text-orange-500 disabled:opacity-40 dark:text-orange-400',
    removeBtn:
      'rounded-lg border border-neutral-200 px-3 py-2 text-sm text-neutral-600 hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-800',
    uploadLabel:
      'inline-flex cursor-pointer items-center rounded-full bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-orange-600',
    uploadLabelOutline:
      'inline-flex cursor-pointer items-center rounded-full border border-neutral-300 px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-600 dark:text-neutral-300 dark:hover:bg-neutral-800',
    alert:
      'rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300',
    checkboxLabel: 'text-sm font-medium text-neutral-700 dark:text-neutral-300',
    checkboxRow: 'mt-4 flex items-center gap-3 text-sm text-neutral-800 dark:text-neutral-200',
  };
}

export function productToFormValues(product: MarketplaceProductDetail): ProductFormValues {
  const demoUrl = product.demoUrl ?? '';
  const resolvedDemoType =
    demoUrl.trim() && product.demoType === 'NONE'
      ? detectDemoTypeFromUrl(demoUrl)
      : product.demoType;

  return {
    type: product.type,
    title: product.title,
    description: product.description ?? '',
    priceAmount: (product.priceCents / 100).toFixed(2),
    compareAtPriceAmount:
      product.compareAtPriceCents != null ? (product.compareAtPriceCents / 100).toFixed(2) : '',
    currency: product.currency,
    genre: product.genre ?? '',
    specialite: product.specialite ?? '',
    thumbnailUrl: product.thumbnailUrl ?? '',
    demoType: demoUrl.trim() ? resolvedDemoType : 'NONE',
    demoUrl,
    demoSubtitles: parseDemoSubtitles(product.demoSubtitles, product.demoDescription),
    whyProductBlocks: parseProductWhyBlocks(product.whyProductBlocks),
    deliveryMode: product.deliveryMode,
    licenseType: product.licenseType,
    compatibleTools: product.compatibleTools.map((v) => ({ value: v })),
    fileFormat: product.fileFormat ?? '',
    fileSizeMb: product.fileSizeMb != null ? String(product.fileSizeMb) : '',
    language: product.language ?? '',
    version: product.version ?? '',
    tags: product.tags.map((v) => ({ value: v })),
    videoDuration: secondsToMmSs(product.videoDurationSeconds),
    videoResolution: product.videoResolution ?? '',
    isBestseller: product.isBestseller ?? false,
    isPublished: product.isPublished,
  };
}

export function formValuesToRequest(
  data: ProductFormValues,
  mainFileR2Key?: string
): MarketplaceProductRequest {
  const priceCents = Math.round(Number(data.priceAmount) * 100);
  const compareRaw = data.compareAtPriceAmount?.trim();
  const compareAtPriceCents =
    compareRaw && !Number.isNaN(Number(compareRaw)) && Number(compareRaw) > 0
      ? Math.round(Number(compareRaw) * 100)
      : undefined;
  const thumb = data.thumbnailUrl?.trim();
  const demoUrl = data.demoUrl?.trim();
  const demoType = demoUrl ? data.demoType : 'NONE';
  const fileSize = data.fileSizeMb?.trim();
  const whyBlocks = serializeProductWhyBlocks(data.whyProductBlocks);
  const demoSubtitles = data.demoSubtitles.map((item) => item.value.trim()).filter(Boolean);

  return {
    type: data.type,
    title: data.title,
    description: data.description,
    priceCents,
    ...(compareAtPriceCents != null ? { compareAtPriceCents } : {}),
    currency: data.currency,
    ...(data.genre?.trim() ? { genre: data.genre.trim() } : {}),
    ...(data.specialite?.trim() ? { specialite: data.specialite.trim() } : {}),
    ...(thumb ? { thumbnailUrl: thumb } : {}),
    demoType,
    ...(demoUrl ? { demoUrl } : {}),
    ...(demoSubtitles.length > 0 ? { demoSubtitles } : {}),
    whyProductBlocks: whyBlocks,
    ...(mainFileR2Key ? { mainFileR2Key } : {}),
    deliveryMode: data.deliveryMode,
    licenseType: data.licenseType,
    compatibleTools: data.compatibleTools.map((t) => t.value.trim()).filter(Boolean),
    ...(data.fileFormat?.trim() ? { fileFormat: data.fileFormat.trim() } : {}),
    ...(fileSize && !Number.isNaN(Number(fileSize)) ? { fileSizeMb: Number(fileSize) } : {}),
    ...(data.language?.trim() ? { language: data.language.trim() } : {}),
    ...(data.version?.trim() ? { version: data.version.trim() } : {}),
    tags: data.tags.map((t) => t.value.trim()).filter(Boolean),
    ...(data.type === 'VIDEO'
      ? {
          videoDurationSeconds: mmSsToSeconds(data.videoDuration),
          ...(data.videoResolution?.trim()
            ? { videoResolution: data.videoResolution.trim() }
            : {}),
        }
      : {}),
    isBestseller: data.isBestseller,
    isPublished: data.isPublished,
  };
}

export function ProductEditorForm({
  initial,
  submitLabel,
  cancelHref,
  onCancel,
  embedded = false,
  onSubmit,
}: ProductEditorFormProps) {
  const s = formStyles(embedded);
  const [mainFileR2Key, setMainFileR2Key] = useState<string | null>(null);
  const [mainFileName, setMainFileName] = useState<string | null>(null);
  const [uploadingMain, setUploadingMain] = useState(false);
  const [uploadingThumb, setUploadingThumb] = useState(false);
  const [uploadingDemo, setUploadingDemo] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [maxStepReached, setMaxStepReached] = useState(
    initial ? PRODUCT_EDITOR_STEPS.length - 1 : 0
  );
  const submitLockRef = useRef(false);

  const hasExistingMainFile = Boolean(initial?.hasMainFile);
  const mainFileReady = Boolean(mainFileR2Key) || hasExistingMainFile;

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    trigger,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productEditorSchema),
    defaultValues: initial
      ? productToFormValues(initial)
      : {
          type: 'TEMPLATE',
          title: '',
          description: '',
          priceAmount: '',
          compareAtPriceAmount: '',
          currency: 'EUR',
          genre: GENRES[0],
          specialite: '',
          thumbnailUrl: '',
          demoType: 'NONE',
          demoUrl: '',
          demoSubtitles: [],
          whyProductBlocks: [],
          deliveryMode: 'DOWNLOAD',
          licenseType: 'PERSONAL',
          compatibleTools: [],
          fileFormat: '',
          fileSizeMb: '',
          language: '',
          version: '',
          tags: [],
          videoDuration: '',
          videoResolution: '',
          isBestseller: false,
          isPublished: true,
        },
  });

  const productType = watch('type');
  const thumbnailUrl = watch('thumbnailUrl');
  const demoUrl = watch('demoUrl');
  const demoType = watch('demoType');
  const priceAmount = watch('priceAmount');
  const isFree =
    priceAmount !== '' && !Number.isNaN(Number(priceAmount)) && Number(priceAmount) === 0;

  const toolsField = useFieldArray({ control, name: 'compatibleTools' });
  const tagsField = useFieldArray({ control, name: 'tags' });
  const whyField = useFieldArray({ control, name: 'whyProductBlocks' });

  const onMainFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploadError(null);
    setUploadingMain(true);
    try {
      const key = await uploadProductMainFile(file);
      setMainFileR2Key(key);
      setMainFileName(file.name);
      if (!watch('fileFormat')?.trim()) {
        const ext = file.name.includes('.') ? file.name.split('.').pop()?.toUpperCase() : '';
        if (ext) setValue('fileFormat', ext);
      }
      const sizeMb = file.size / (1024 * 1024);
      if (sizeMb > 0) setValue('fileSizeMb', sizeMb.toFixed(1));
    } catch (e) {
      setUploadError(getApiErrorMessage(e, 'Main file upload failed.'));
      setMainFileR2Key(null);
      setMainFileName(null);
    } finally {
      setUploadingMain(false);
      event.target.value = '';
    }
  };

  const onThumbnailFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploadError(null);

    if (!isAllowedThumbnailFile(file)) {
      setUploadError('Formats acceptés : image (JPEG, PNG, WebP) ou vidéo (MP4, WebM, MOV).');
      event.target.value = '';
      return;
    }

    const isVideo = file.type.startsWith('video/');
    if (isVideo) {
      try {
        const duration = await getVideoFileDurationSeconds(file);
        if (duration > THUMBNAIL_VIDEO_MAX_SECONDS) {
          setUploadError(
            `La vidéo miniature doit durer ${THUMBNAIL_VIDEO_MAX_SECONDS} secondes maximum (actuellement ${Math.ceil(duration)} s).`
          );
          event.target.value = '';
          return;
        }
        setValue('videoDuration', secondsToMmSs(Math.ceil(duration)));
      } catch (e) {
        setUploadError(getApiErrorMessage(e, 'Impossible de lire la durée de la vidéo.'));
        event.target.value = '';
        return;
      }
    }

    setUploadingThumb(true);
    try {
      const url = await uploadProductThumbnail(file);
      setValue('thumbnailUrl', url);
    } catch (e) {
      setUploadError(getApiErrorMessage(e, 'Échec de l’upload de la miniature.'));
    } finally {
      setUploadingThumb(false);
      event.target.value = '';
    }
  };

  const onDemoFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploadError(null);

    if (!isAllowedDemoMediaFile(file)) {
      setUploadError('Accepted formats: image (JPEG, PNG, WebP) or video (MP4, WebM, MOV).');
      event.target.value = '';
      return;
    }

    setUploadingDemo(true);
    try {
      const url = await uploadProductThumbnail(file);
      const detectedType = detectDemoTypeFromFile(file);
      setValue('demoUrl', url);
      setValue('demoType', detectedType);
    } catch (e) {
      setUploadError(getApiErrorMessage(e, 'Demo media upload failed.'));
      setValue('demoUrl', '');
      setValue('demoType', 'NONE');
    } finally {
      setUploadingDemo(false);
      event.target.value = '';
    }
  };

  const clearDemoMedia = () => {
    setValue('demoUrl', '');
    setValue('demoType', 'NONE');
  };

  const onFormSubmit = async (data: ProductFormValues) => {
    if (submitLockRef.current) return;

    if (!mainFileR2Key && !hasExistingMainFile) {
      setUploadError('Upload the product file buyers will receive (ZIP, PDF, video, etc.).');
      setStepIndex(0);
      return;
    }
    await onSubmit(formValuesToRequest(data, mainFileR2Key ?? undefined));
  };

  const currentStep = PRODUCT_EDITOR_STEPS[stepIndex];
  const isLastStep = stepIndex === PRODUCT_EDITOR_STEPS.length - 1;
  const isFirstStep = stepIndex === 0;

  const goToStep = (index: number) => {
    if (index <= maxStepReached) {
      setStepIndex(index);
      setUploadError(null);
    }
  };

  const goNext = async () => {
    if (stepIndex >= PRODUCT_EDITOR_STEPS.length - 1) return;

    const stepId = currentStep.id as ProductEditorStepId;

    if (stepId === 'file') {
      if (!mainFileReady) {
        setUploadError('Upload the product file buyers will receive (ZIP, PDF, video, etc.).');
        return;
      }
      setUploadError(null);
    } else {
      const valid = await trigger(fieldsForStep(stepId, productType) as (keyof ProductFormValues)[]);
      if (!valid) return;
      setUploadError(null);
    }

    const next = stepIndex + 1;
    submitLockRef.current = true;
    window.setTimeout(() => {
      setStepIndex(next);
      setMaxStepReached((prev) => Math.max(prev, next));
      window.setTimeout(() => {
        submitLockRef.current = false;
      }, 400);
    }, 0);
  };

  const goBack = () => {
    setStepIndex((prev) => Math.max(0, prev - 1));
    setUploadError(null);
  };

  const onFormKeyDown = (event: React.KeyboardEvent<HTMLFormElement>) => {
    if (event.key === 'Enter' && !isLastStep && (event.target as HTMLElement).tagName !== 'TEXTAREA') {
      event.preventDefault();
      void goNext();
    }
  };

  const stepPanelClass = embedded
    ? 'rounded-2xl border border-neutral-200/80 bg-neutral-50/40 p-5 dark:border-neutral-800 dark:bg-neutral-950/40'
    : 'rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 dark:shadow-none';

  return (
    <form
      className={embedded ? 'space-y-5' : 'space-y-6'}
      onSubmit={isLastStep ? handleSubmit(onFormSubmit) : (e) => e.preventDefault()}
      onKeyDown={onFormKeyDown}
      noValidate
    >
      <ProductEditorStepper
        embedded={embedded}
        currentIndex={stepIndex}
        maxReachedIndex={maxStepReached}
        onStepSelect={goToStep}
      />

      {uploadError && (
        <p className={s.alert} role="alert">
          {uploadError}
        </p>
      )}

      <div className={stepPanelClass}>
        <header className="mb-6 border-b border-neutral-100 pb-5 dark:border-neutral-800">
          <p className="text-xs font-semibold uppercase tracking-wider text-orange-600 dark:text-orange-400">
            Step {stepIndex + 1} of {PRODUCT_EDITOR_STEPS.length}
          </p>
          <h2 className="mt-1 text-lg font-bold text-neutral-900 dark:text-white sm:text-xl">
            {currentStep.label}
          </h2>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">{currentStep.description}</p>
        </header>

        {currentStep.id === 'file' && (
          <div className="space-y-4">
            <div className="rounded-xl border border-dashed border-orange-200 bg-orange-50/40 p-6 text-center dark:border-orange-500/30 dark:bg-orange-500/5 sm:p-8">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-500/15">
                <svg className="h-6 w-6 text-orange-600 dark:text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                </svg>
              </div>
              <p className="mt-4 text-sm text-neutral-600 dark:text-neutral-400">
                This file is stored privately and delivered to buyers after purchase.
              </p>
              <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
                <label className={s.uploadLabel}>
                  {uploadingMain ? 'Uploading…' : mainFileReady ? 'Replace file' : 'Upload file'}
                  <input
                    type="file"
                    className="sr-only"
                    disabled={uploadingMain || isSubmitting}
                    onChange={(e) => void onMainFileChange(e)}
                  />
                </label>
              </div>
              {mainFileName && (
                <p className="mt-4 text-sm text-neutral-700 dark:text-neutral-300">
                  Ready: <span className="font-semibold text-emerald-700 dark:text-emerald-400">{mainFileName}</span>
                </p>
              )}
              {!mainFileName && hasExistingMainFile && (
                <p className="mt-4 text-sm font-medium text-emerald-700 dark:text-emerald-400">
                  Existing file on record — upload to replace
                </p>
              )}
            </div>
          </div>
        )}

        {currentStep.id === 'details' && (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="title" className={s.label}>
                Title
              </label>
              <input id="title" className={s.input} {...register('title')} />
              {errors.title && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.title.message}</p>}
            </div>
            <div>
              <label htmlFor="type" className={s.label}>
                Type
              </label>
              <select id="type" className={s.input} {...register('type')}>
                {PRODUCT_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {PRODUCT_TYPE_LABELS[t] ?? t}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="genre" className={s.label}>
                Genre
              </label>
              <select id="genre" className={s.input} {...register('genre')}>
                {GENRES.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="description" className={s.label}>
                Description
              </label>
              <textarea id="description" rows={6} className={s.input} {...register('description')} />
              {errors.description && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.description.message}</p>
              )}
            </div>
          </div>
        )}

        {currentStep.id === 'pricing' && (
          <div className="space-y-4">
            <label className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-neutral-200 bg-neutral-50/60 px-4 py-3 dark:border-neutral-700 dark:bg-neutral-900/50">
              <input
                type="checkbox"
                checked={isFree}
                onChange={(e) => {
                  if (e.target.checked) {
                    setValue('priceAmount', '0', { shouldValidate: true });
                    setValue('compareAtPriceAmount', '');
                  } else {
                    setValue('priceAmount', '', { shouldValidate: true });
                  }
                }}
                className="h-4 w-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500 dark:border-neutral-600 dark:bg-neutral-950"
              />
              <span className={s.checkboxLabel}>Free product</span>
            </label>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="sm:col-span-2">
                <label htmlFor="priceAmount" className={s.label}>
                  Sale price
                </label>
                <input
                  id="priceAmount"
                  type="number"
                  step="0.01"
                  min="0"
                  disabled={isFree}
                  className={`${s.input} disabled:bg-neutral-100 disabled:text-neutral-500 dark:disabled:bg-neutral-900 dark:disabled:text-neutral-500`}
                  {...register('priceAmount')}
                />
                {errors.priceAmount && (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.priceAmount.message}</p>
                )}
              </div>
              <div>
                <label htmlFor="currency" className={s.label}>
                  Currency
                </label>
                <input id="currency" maxLength={3} className={`${s.input} uppercase`} {...register('currency')} />
              </div>
              <div className="sm:col-span-3">
                <label htmlFor="compareAtPriceAmount" className={s.label}>
                  Original price (optional, for discount display)
                </label>
                <input
                  id="compareAtPriceAmount"
                  type="number"
                  step="0.01"
                  min="0"
                  disabled={isFree}
                  placeholder="e.g. 149.97"
                  className={`${s.input} sm:max-w-xs disabled:bg-neutral-100 disabled:text-neutral-500 dark:disabled:bg-neutral-900 dark:disabled:text-neutral-500`}
                  {...register('compareAtPriceAmount')}
                />
              </div>
            </div>
          </div>
        )}

        {currentStep.id === 'media' && (
          <div className="space-y-6">
            <div>
              <label htmlFor="thumbnailUrl" className={s.label}>
                Thumbnail (URL or file)
              </label>
              <p className={s.hint}>
                Image or preview video (max {THUMBNAIL_VIDEO_MAX_SECONDS}s) shown on the product card.
              </p>
              <div className="mt-1 flex flex-wrap gap-2">
                <input
                  id="thumbnailUrl"
                  type="url"
                  placeholder="https://…"
                  className={`min-w-0 flex-1 ${s.input}`}
                  {...register('thumbnailUrl')}
                />
                <label className={s.uploadLabelOutline}>
                  {uploadingThumb ? 'Uploading…' : 'Image / video'}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov"
                    className="sr-only"
                    disabled={uploadingThumb || isSubmitting}
                    onChange={(e) => void onThumbnailFileChange(e)}
                  />
                </label>
              </div>
              {thumbnailUrl?.trim() && (
                <div className="mt-3 overflow-hidden rounded-xl border border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-950">
                  <ProductThumbnailMedia
                    url={thumbnailUrl.trim()}
                    autoPlay={isVideoThumbnailUrl(thumbnailUrl.trim())}
                    className="max-h-48 w-full object-cover"
                  />
                </div>
              )}
            </div>

            {productType === 'VIDEO' && (
              <div className="rounded-xl border border-neutral-200 bg-neutral-50/50 p-4 dark:border-neutral-700 dark:bg-neutral-900/40">
                <p className={s.title}>Video metadata</p>
                <p className={s.hint}>Duration badge and resolution on the product card.</p>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="videoDuration" className={s.label}>
                      Duration (m:ss)
                    </label>
                    <input id="videoDuration" placeholder="0:24" className={s.input} {...register('videoDuration')} />
                  </div>
                  <div>
                    <label htmlFor="videoResolution" className={s.label}>
                      Resolution
                    </label>
                    <select id="videoResolution" className={s.input} {...register('videoResolution')}>
                      <option value="">—</option>
                      {VIDEO_RESOLUTIONS.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            <div className="rounded-xl border border-neutral-200 bg-neutral-50/50 p-4 dark:border-neutral-700 dark:bg-neutral-900/40">
              <p className={s.title}>Demo media</p>
              <p className={s.hint}>Upload a photo or video preview. The demo type is detected automatically.</p>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <label className={s.uploadLabelOutline}>
                  {uploadingDemo ? 'Uploading…' : 'Upload photo / video'}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,video/mp4,video/webm,video/quicktime,.jpg,.jpeg,.png,.webp,.mp4,.webm,.mov"
                    className="sr-only"
                    disabled={uploadingDemo || isSubmitting}
                    onChange={(e) => void onDemoFileChange(e)}
                  />
                </label>
                {demoUrl?.trim() ? (
                  <>
                    <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-800 dark:bg-orange-500/10 dark:text-orange-200">
                      {demoTypeLabel(demoType)}
                    </span>
                    <button type="button" onClick={clearDemoMedia} className="text-sm font-medium text-red-600 dark:text-red-400">
                      Remove demo
                    </button>
                  </>
                ) : null}
              </div>
              {demoUrl?.trim() && (
                <div className="mt-3 overflow-hidden rounded-xl border border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-950">
                  <ProductThumbnailMedia
                    url={demoUrl.trim()}
                    autoPlay={isVideoThumbnailUrl(demoUrl.trim())}
                    className="max-h-48 w-full object-cover"
                  />
                </div>
              )}
            </div>

            <ProductSubtitlesField
              control={control}
              register={register}
              label="Demo subtitles"
              hint="Add one or more lines displayed under the demo media."
              addLabel="+ Add subtitle"
            />

            <ProductWhyBlocksField
              fields={whyField.fields}
              append={whyField.append}
              remove={whyField.remove}
              move={whyField.move}
              register={register}
              watch={watch}
              setValue={setValue}
              control={control}
            />
          </div>
        )}

        {currentStep.id === 'settings' && (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="deliveryMode" className={s.label}>
                  Delivery mode
                </label>
                <select id="deliveryMode" className={s.input} {...register('deliveryMode')}>
                  {DELIVERY_MODES.map((d) => (
                    <option key={d} value={d}>
                      {d.replace(/_/g, ' ')}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="licenseType" className={s.label}>
                  License
                </label>
                <select id="licenseType" className={s.input} {...register('licenseType')}>
                  {LICENSE_TYPES.map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="fileFormat" className={s.label}>
                  File format
                </label>
                <input id="fileFormat" className={s.input} placeholder="e.g. ZIP, MP4" {...register('fileFormat')} />
              </div>
              <div>
                <label htmlFor="fileSizeMb" className={s.label}>
                  File size (MB)
                </label>
                <input
                  id="fileSizeMb"
                  type="number"
                  min="0"
                  step="0.1"
                  className={s.input}
                  {...register('fileSizeMb')}
                />
              </div>
              <div>
                <label htmlFor="language" className={s.label}>
                  Language
                </label>
                <input id="language" className={s.input} {...register('language')} />
              </div>
              <div>
                <label htmlFor="version" className={s.label}>
                  Version
                </label>
                <input id="version" className={s.input} placeholder="v1.0" {...register('version')} />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between gap-4">
                <p className={s.label}>Compatible tools</p>
                <button
                  type="button"
                  disabled={toolsField.fields.length >= 10}
                  onClick={() => toolsField.append({ value: '' })}
                  className={s.tagBtn}
                >
                  + Add tool
                </button>
              </div>
              <div className="mt-3 space-y-2">
                {toolsField.fields.map((field, index) => (
                  <div key={field.id} className="flex gap-2">
                    <input className={`flex-1 ${s.input}`} {...register(`compatibleTools.${index}.value` as const)} />
                    <button type="button" onClick={() => toolsField.remove(index)} className={s.removeBtn} aria-label="Remove tool">
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between gap-4">
                <p className={s.label}>Tags</p>
                <button
                  type="button"
                  disabled={tagsField.fields.length >= 15}
                  onClick={() => tagsField.append({ value: '' })}
                  className={s.tagBtn}
                >
                  + Add tag
                </button>
              </div>
              <div className="mt-3 space-y-2">
                {tagsField.fields.map((field, index) => (
                  <div key={field.id} className="flex gap-2">
                    <input className={`flex-1 ${s.input}`} {...register(`tags.${index}.value` as const)} />
                    <button type="button" onClick={() => tagsField.remove(index)} className={s.removeBtn} aria-label="Remove tag">
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3 rounded-xl border border-neutral-200 bg-neutral-50/60 p-4 dark:border-neutral-700 dark:bg-neutral-900/50">
              <label className="flex cursor-pointer items-start gap-3">
                <input type="checkbox" className="mt-0.5 rounded border-gray-300 dark:border-neutral-600 dark:bg-neutral-950" {...register('isBestseller')} />
                <span>
                  <span className={s.checkboxLabel}>Mark as bestseller</span>
                  <span className="mt-0.5 block text-xs text-neutral-500 dark:text-neutral-400">Shows a badge on the marketplace card</span>
                </span>
              </label>
              <label className="flex cursor-pointer items-start gap-3">
                <input type="checkbox" className="mt-0.5 rounded border-gray-300 dark:border-neutral-600 dark:bg-neutral-950" {...register('isPublished')} />
                <span>
                  <span className={s.checkboxLabel}>Published on the public catalog</span>
                  <span className="mt-0.5 block text-xs text-neutral-500 dark:text-neutral-400">Clients can discover and buy this product</span>
                </span>
              </label>
            </div>
          </div>
        )}
      </div>

      <div
        className={`flex flex-wrap items-center justify-between gap-3 ${
          embedded ? 'border-t border-neutral-200 pt-5 dark:border-neutral-800' : 'pt-2'
        }`}
      >
        <div className="flex gap-2">
          {!isFirstStep && (
            <button type="button" onClick={goBack} className={s.footerBtnSecondary}>
              ← Back
            </button>
          )}
        </div>
        <div className="flex flex-wrap justify-end gap-3">
          {onCancel ? (
            <button type="button" onClick={onCancel} className={s.footerBtnSecondary}>
              Cancel
            </button>
          ) : cancelHref ? (
            <Link href={cancelHref} className={s.footerBtnSecondary}>
              Cancel
            </Link>
          ) : null}
          {isLastStep ? (
            <button type="submit" disabled={isSubmitting} className={s.footerBtnPrimary}>
              {isSubmitting ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span className="ml-2">Saving…</span>
                </>
              ) : (
                submitLabel
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                void goNext();
              }}
              className={s.footerBtnPrimary}
            >
              Continue →
            </button>
          )}
        </div>
      </div>
    </form>
  );
}

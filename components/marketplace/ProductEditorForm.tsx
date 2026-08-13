'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPen, faTrashCan } from '@fortawesome/free-solid-svg-icons';
import { PRODUCT_TYPE_LABELS, uploadProductThumbnail } from '@/lib/marketplace-api';
import { getApiErrorMessage } from '@/lib/api-error';
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
import { ProductEditorStepper } from '@/components/marketplace/ProductEditorStepper';
import { ProductFormatToggle } from '@/components/marketplace/ProductFormatToggle';
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
  stepsForFormat,
  type ProductEditorStepId,
  type ProductFormat,
} from '@/components/marketplace/product-editor-steps';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import type {
  MarketplaceProductDetail,
  MarketplaceProductRequest,
} from '@/types/marketplace';

export type { ProductFormValues } from '@/components/marketplace/product-editor-schema';

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

const DESCRIPTION_SOFT_MIN = 40;

type ProductEditorFormProps = {
  initial?: MarketplaceProductDetail;
  submitLabel: string;
  cancelHref?: string;
  onCancel?: () => void;
  embedded?: boolean;
  /** When false, parent renders the Virtual/Physical toggle (e.g. page header). */
  showFormatToggle?: boolean;
  /** Controlled format when the toggle lives outside this form. */
  controlledFormat?: ProductFormat;
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
        'mt-1 w-full rounded-xl border-0 bg-neutral-100 px-3 py-2.5 text-sm text-gray-900 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-orange-200 dark:bg-neutral-800 dark:text-white dark:placeholder:text-neutral-400 dark:focus:ring-orange-500/30',
      label: 'text-sm font-semibold text-neutral-800 dark:text-neutral-200',
      title: 'text-sm font-semibold text-gray-900 dark:text-white',
      hint: 'mt-1 text-xs text-gray-500 dark:text-neutral-400',
      hintSm: 'mt-1 text-xs text-gray-600 dark:text-neutral-400',
      footerBtnSecondary:
        'text-sm font-medium text-neutral-500 transition hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200',
      footerBtnPrimary:
        'inline-flex items-center justify-center rounded-xl bg-orange-500 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:opacity-60',
      tagBtn:
        'text-sm font-semibold text-orange-600 hover:text-orange-700 disabled:opacity-40 dark:text-orange-400 dark:hover:text-orange-300',
      removeBtn:
        'rounded-lg bg-neutral-100 px-3 py-2 text-sm text-gray-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700',
      uploadLabel:
        'inline-flex cursor-pointer items-center rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-orange-600',
      uploadLabelOutline:
        'inline-flex cursor-pointer items-center rounded-xl bg-neutral-100 px-3 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700',
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
      'mt-1 w-full rounded-xl border-0 bg-neutral-100 px-3 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-orange-200 dark:bg-neutral-800 dark:text-white dark:placeholder:text-neutral-400 dark:focus:ring-orange-500/30',
    label: 'text-sm font-semibold text-neutral-800 dark:text-neutral-200',
    title: 'text-sm font-semibold text-neutral-900 dark:text-white',
    hint: 'mt-1 text-xs text-neutral-500 dark:text-neutral-400',
    hintSm: 'mt-1 text-xs text-neutral-500 dark:text-neutral-400',
    footerBtnSecondary:
      'text-sm font-medium text-neutral-500 transition hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200',
    footerBtnPrimary:
      'inline-flex items-center justify-center rounded-xl bg-orange-500 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:opacity-60',
    tagBtn: 'text-sm font-semibold text-orange-600 hover:text-orange-500 disabled:opacity-40 dark:text-orange-400',
    removeBtn:
      'rounded-lg bg-neutral-100 px-3 py-2 text-sm text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700',
    uploadLabel:
      'inline-flex cursor-pointer items-center rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-orange-600',
    uploadLabelOutline:
      'inline-flex cursor-pointer items-center rounded-xl bg-neutral-100 px-3 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700',
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
  const isPhysical = product.type === 'PHYSICAL';

  return {
    productFormat: isPhysical ? 'physical' : 'virtual',
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
    videoDuration: secondsToMmSs(product.videoDurationSeconds),
    videoResolution: product.videoResolution ?? '',
  };
}

export function formValuesToRequest(
  data: ProductFormValues
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
  const demoSubtitles = isPhysical
    ? []
    : data.demoSubtitles.map((item) => item.value.trim()).filter(Boolean);
  const galleryImageUrls = data.galleryImages.map((item) => item.value.trim()).filter(Boolean);

  return {
    type: isPhysical ? 'PHYSICAL' : data.type === 'PHYSICAL' ? 'OTHER' : data.type,
    title: data.title,
    description: data.description,
    priceCents,
    ...(compareAtPriceCents != null ? { compareAtPriceCents } : {}),
    currency: data.currency,
    ...(!isPhysical && data.genre?.trim() ? { genre: data.genre.trim() } : {}),
    ...(!isPhysical && data.specialite?.trim() ? { specialite: data.specialite.trim() } : {}),
    ...(thumb ? { thumbnailUrl: thumb } : {}),
    demoType,
    ...(!isPhysical && demoUrl ? { demoUrl } : {}),
    ...(!isPhysical && demoSubtitles.length > 0 ? { demoSubtitles } : {}),
    whyProductBlocks: whyBlocks,
    deliveryMode: 'BOTH',
    compatibleTools: isPhysical
      ? []
      : data.compatibleTools.map((t) => t.value.trim()).filter(Boolean),
    ...(!isPhysical && data.fileFormat?.trim() ? { fileFormat: data.fileFormat.trim() } : {}),
    ...(!isPhysical && fileSize && !Number.isNaN(Number(fileSize))
      ? { fileSizeMb: Number(fileSize) }
      : {}),
    ...(!isPhysical && data.language?.trim() ? { language: data.language.trim() } : {}),
    ...(!isPhysical && data.version?.trim() ? { version: data.version.trim() } : {}),
    tags: isPhysical ? [] : data.tags.map((t) => t.value.trim()).filter(Boolean),
    galleryImageUrls,
    ...(!isPhysical && data.type === 'VIDEO'
      ? {
          videoDurationSeconds: mmSsToSeconds(data.videoDuration),
          ...(data.videoResolution?.trim()
            ? { videoResolution: data.videoResolution.trim() }
            : {}),
        }
      : {}),
    isBestseller: false,
    isPublished: true,
  };
}

export function ProductEditorForm({
  initial,
  submitLabel,
  cancelHref,
  onCancel,
  embedded = false,
  showFormatToggle = true,
  controlledFormat,
  onSubmit,
}: ProductEditorFormProps) {
  const s = formStyles(embedded);
  const [uploadingThumb, setUploadingThumb] = useState(false);
  const [uploadingDemo, setUploadingDemo] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [descriptionWarnShort, setDescriptionWarnShort] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [maxStepReached, setMaxStepReached] = useState(0);
  const submitLockRef = useRef(false);
  const previousFormatRef = useRef<ProductFormat | null>(null);

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
          productFormat: 'virtual',
          type: 'TEMPLATE',
          title: '',
          description: '',
          priceAmount: '',
          compareAtPriceAmount: '',
          currency: 'EUR',
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
          videoDuration: '',
          videoResolution: '',
        },
  });

  const productFormat = (watch('productFormat') ?? 'virtual') as ProductFormat;
  const editorSteps = stepsForFormat(productFormat);
  const productType = watch('type');
  const thumbnailUrl = watch('thumbnailUrl');
  const demoUrl = watch('demoUrl');
  const priceAmount = watch('priceAmount');
  const descriptionValue = watch('description') ?? '';
  const descriptionLen = descriptionValue.trim().length;

  useEffect(() => {
    if (initial) {
      setMaxStepReached(stepsForFormat(initial.type === 'PHYSICAL' ? 'physical' : 'virtual').length - 1);
    }
  }, [initial]);

  useEffect(() => {
    if (controlledFormat == null) return;
    if (controlledFormat === productFormat) return;
    setValue('productFormat', controlledFormat, { shouldDirty: true });
  }, [controlledFormat, productFormat, setValue]);

  useEffect(() => {
    if (previousFormatRef.current === null) {
      previousFormatRef.current = productFormat;
      return;
    }
    if (previousFormatRef.current === productFormat) return;
    previousFormatRef.current = productFormat;
    setStepIndex(0);
    setMaxStepReached(0);
    setUploadError(null);
    if (productFormat === 'physical') {
      setValue('type', 'PHYSICAL');
    } else if (productType === 'PHYSICAL') {
      setValue('type', 'TEMPLATE');
    }
  }, [productFormat, productType, setValue]);

  useEffect(() => {
    // Stay neutral on empty / long enough copy — only nudge after idle if short but started.
    if (descriptionLen === 0 || descriptionLen >= DESCRIPTION_SOFT_MIN) {
      setDescriptionWarnShort(false);
      return;
    }
    setDescriptionWarnShort(false);
    const timer = window.setTimeout(() => {
      setDescriptionWarnShort(true);
    }, 2500);
    return () => window.clearTimeout(timer);
  }, [descriptionValue, descriptionLen]);

  const isFree =
    priceAmount !== '' && !Number.isNaN(Number(priceAmount)) && Number(priceAmount) === 0;

  const toolsField = useFieldArray({ control, name: 'compatibleTools' });
  const tagsField = useFieldArray({ control, name: 'tags' });
  const whyField = useFieldArray({ control, name: 'whyProductBlocks' });
  const galleryField = useFieldArray({ control, name: 'galleryImages' });

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

  const onGalleryFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) return;
    setUploadError(null);

    const remaining = 12 - galleryField.fields.length;
    if (remaining <= 0) {
      setUploadError('You can add up to 12 companion images.');
      event.target.value = '';
      return;
    }

    const selected = files.slice(0, remaining);
    const invalid = selected.some(
      (file) => !file.type.startsWith('image/') || !isAllowedThumbnailFile(file)
    );
    if (invalid) {
      setUploadError('Companion images: JPEG, PNG or WebP only.');
      event.target.value = '';
      return;
    }

    setUploadingGallery(true);
    try {
      for (const file of selected) {
        const url = await uploadProductThumbnail(file);
        galleryField.append({ value: url });
      }
    } catch (e) {
      setUploadError(getApiErrorMessage(e, 'Image upload failed.'));
    } finally {
      setUploadingGallery(false);
      event.target.value = '';
    }
  };

  const onFormSubmit = async (data: ProductFormValues) => {
    if (submitLockRef.current) return;
    await onSubmit(formValuesToRequest(data));
  };

  const currentStep = editorSteps[Math.min(stepIndex, editorSteps.length - 1)];
  const isLastStep = stepIndex >= editorSteps.length - 1;
  const isFirstStep = stepIndex === 0;

  const goToStep = (index: number) => {
    if (index <= maxStepReached) {
      setStepIndex(index);
      setUploadError(null);
    }
  };

  const goNext = async () => {
    if (stepIndex >= editorSteps.length - 1) return;

    const stepId = currentStep.id as ProductEditorStepId;

    const valid = await trigger(
      fieldsForStep(stepId, productType, productFormat) as (keyof ProductFormValues)[]
    );
    if (!valid) return;
    setUploadError(null);

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
    if (event.key !== 'Enter' || isLastStep) return;
    const tag = (event.target as HTMLElement).tagName;
    // Keep Enter inside text fields (title, captions, etc.) — don't advance the wizard
    if (tag === 'TEXTAREA' || tag === 'INPUT' || tag === 'SELECT') return;
    event.preventDefault();
    void goNext();
  };

  const stepPanelClass = embedded
    ? 'rounded-2xl border border-neutral-200/80 bg-neutral-50/40 p-5 dark:border-neutral-800 dark:bg-neutral-950/40'
    : 'rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 dark:shadow-none';

  const renderFormatToggle = showFormatToggle && !embedded;

  return (
    <form
      className={embedded ? 'space-y-5' : 'space-y-6'}
      onSubmit={isLastStep ? handleSubmit(onFormSubmit) : (e) => e.preventDefault()}
      onKeyDown={onFormKeyDown}
      noValidate
    >
      {renderFormatToggle ? (
        <div className="flex justify-end">
          <ProductFormatToggle
            value={productFormat}
            disabled={Boolean(initial) || isSubmitting}
            hideInactive={Boolean(initial)}
            onChange={(format) => setValue('productFormat', format, { shouldDirty: true })}
          />
        </div>
      ) : null}

      <ProductEditorStepper
        steps={editorSteps}
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
            Step {stepIndex + 1} of {editorSteps.length}
          </p>
          <h2 className="mt-1 text-lg font-bold text-neutral-900 dark:text-white sm:text-xl">
            {currentStep.label}
          </h2>
          {currentStep.description ? (
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">{currentStep.description}</p>
          ) : null}
        </header>

        {currentStep.id === 'basics' && (
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1.55fr)_minmax(0,0.9fr)] lg:items-start">
            <div className="flex flex-col gap-4">
              <div>
                <label htmlFor="title" className={s.label}>
                  Title
                </label>
                <input id="title" className={s.input} placeholder="e.g. Learn After Effects from scratch" {...register('title')} />
                {errors.title && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.title.message}</p>}
              </div>
              {productFormat === 'virtual' ? (
                <div className="grid gap-4 sm:grid-cols-2">
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
                </div>
              ) : null}
              <div>
                <label htmlFor="description" className={s.label}>
                  Description
                </label>
                <textarea
                  id="description"
                  rows={7}
                  className={`${s.input} resize-none`}
                  placeholder="What buyers get, who it’s for, and why it’s worth it…"
                  {...register('description')}
                />
                <div className="mt-2 flex flex-wrap items-start justify-between gap-2">
                  <p className="text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
                    Tip: top sellers lead with the outcome in 2–3 sentences, then list what’s included.
                  </p>
                  <p
                    className={`shrink-0 text-xs tabular-nums ${
                      descriptionWarnShort
                        ? 'text-amber-600 dark:text-amber-400'
                        : 'text-neutral-400 dark:text-neutral-500'
                    }`}
                  >
                    {descriptionLen} chars
                    {descriptionWarnShort ? ' · aim for 80+' : ''}
                  </p>
                </div>
                {errors.description && (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.description.message}</p>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-4 lg:pt-0">
              <div className="inline-flex items-center gap-3">
                <button
                  type="button"
                  role="switch"
                  aria-checked={isFree}
                  aria-label="Free product"
                  onClick={() => {
                    if (isFree) {
                      setValue('priceAmount', '', { shouldValidate: true });
                    } else {
                      setValue('priceAmount', '0', { shouldValidate: true });
                      setValue('compareAtPriceAmount', '');
                    }
                  }}
                  className={`relative h-7 w-12 shrink-0 rounded-full transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-300 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-neutral-900 ${
                    isFree ? 'bg-orange-500' : 'bg-neutral-200 dark:bg-neutral-600'
                  }`}
                >
                  <span
                    aria-hidden
                    className={`absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-white shadow-sm transition-transform duration-200 ease-out ${
                      isFree ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
                <span className={s.checkboxLabel}>Free product</span>
              </div>

              <div
                className={`transition-opacity duration-200 ${
                  isFree ? 'pointer-events-none opacity-45' : 'opacity-100'
                }`}
              >
                <label htmlFor="priceAmount" className={s.label}>
                  Sale price
                </label>
                <input
                  id="priceAmount"
                  type="number"
                  step="0.01"
                  min="0"
                  disabled={isFree}
                  className={`${s.input} disabled:cursor-not-allowed`}
                  {...register('priceAmount')}
                />
                {errors.priceAmount && (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.priceAmount.message}</p>
                )}
              </div>

              <div
                className={`transition-opacity duration-200 ${
                  isFree ? 'pointer-events-none opacity-45' : 'opacity-100'
                }`}
              >
                <label htmlFor="currency" className={s.label}>
                  Currency
                </label>
                <input
                  id="currency"
                  maxLength={3}
                  disabled={isFree}
                  className={`${s.input} uppercase disabled:cursor-not-allowed`}
                  {...register('currency')}
                />
              </div>

              <div
                className={`overflow-hidden transition-all duration-200 ease-out ${
                  isFree ? 'max-h-0 opacity-0 pointer-events-none' : 'max-h-28 opacity-100'
                }`}
                aria-hidden={isFree}
              >
                <label htmlFor="compareAtPriceAmount" className={s.label}>
                  Original price
                  <span className="ml-1 font-normal text-neutral-400">(optional)</span>
                </label>
                <input
                  id="compareAtPriceAmount"
                  type="number"
                  step="0.01"
                  min="0"
                  disabled={isFree}
                  placeholder="e.g. 149.97"
                  tabIndex={isFree ? -1 : undefined}
                  className={s.input}
                  {...register('compareAtPriceAmount')}
                />
              </div>
            </div>
          </div>
        )}

        {currentStep.id === 'media' && productFormat === 'physical' && (
          <div className="space-y-8">
            <section>
              <div className="mb-2 flex justify-end">
                <span className="shrink-0 rounded-md bg-neutral-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400">
                  Thumbnail
                </span>
              </div>
              <label
                className={`group relative flex aspect-[16/10] max-w-xl cursor-pointer flex-col overflow-hidden rounded-2xl bg-neutral-100 transition hover:bg-neutral-200/80 dark:bg-neutral-800 dark:hover:bg-neutral-700 ${
                  uploadingThumb || isSubmitting ? 'pointer-events-none opacity-60' : ''
                }`}
              >
                {thumbnailUrl?.trim() ? (
                  <>
                    <ProductThumbnailMedia
                      url={thumbnailUrl.trim()}
                      autoPlay={false}
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                    <span
                      className={`pointer-events-none absolute inset-0 flex items-center justify-center bg-black/45 transition-opacity duration-200 ${
                        uploadingThumb ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                      }`}
                      aria-hidden
                    >
                      {uploadingThumb ? (
                        <span className="text-sm font-semibold text-white">Uploading…</span>
                      ) : (
                        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/95 text-neutral-900 shadow-lg">
                          <FontAwesomeIcon icon={faPen} className="text-lg" />
                        </span>
                      )}
                    </span>
                    <span className="sr-only">{uploadingThumb ? 'Uploading cover' : 'Change cover'}</span>
                  </>
                ) : (
                  <span className="flex flex-1 flex-col items-center justify-center px-5 py-8 text-center">
                    <span className="mt-3 text-sm font-bold text-neutral-900 dark:text-white">
                      {uploadingThumb ? 'Uploading…' : 'Drop cover image'}
                    </span>
                  </span>
                )}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
                  className="sr-only"
                  disabled={uploadingThumb || isSubmitting}
                  onChange={(e) => void onThumbnailFileChange(e)}
                />
              </label>
            </section>

            <section>
              <div className="mb-3 flex items-center justify-between gap-3">
                <p className={s.label}>Companion images</p>
                <label
                  className={`${s.tagBtn} cursor-pointer ${
                    galleryField.fields.length >= 12 || uploadingGallery || isSubmitting
                      ? 'pointer-events-none opacity-40'
                      : ''
                  }`}
                >
                  {uploadingGallery ? 'Uploading…' : '+ Add images'}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
                    multiple
                    className="sr-only"
                    disabled={galleryField.fields.length >= 12 || uploadingGallery || isSubmitting}
                    onChange={(e) => void onGalleryFileChange(e)}
                  />
                </label>
              </div>
              {galleryField.fields.length === 0 ? (
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Add extra photos that show the product from other angles.
                </p>
              ) : (
                <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                  {galleryField.fields.map((field, index) => (
                    <li
                      key={field.id}
                      className="group relative aspect-square overflow-hidden rounded-xl bg-neutral-100 dark:bg-neutral-800"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={watch(`galleryImages.${index}.value`)}
                        alt={`Companion ${index + 1}`}
                        className="h-full w-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => galleryField.remove(index)}
                        className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/55 text-white opacity-0 transition hover:bg-black/75 group-hover:opacity-100"
                        aria-label={`Remove image ${index + 1}`}
                      >
                        <FontAwesomeIcon icon={faTrashCan} className="text-xs" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        )}

        {currentStep.id === 'media' && productFormat === 'virtual' && (
          <div className="grid gap-x-6 gap-y-5 lg:grid-cols-2">
            {/* Row 1 — media */}
            <section>
              <div className="mb-2 flex justify-end">
                <span className="shrink-0 rounded-md bg-neutral-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400">
                  Thumbnail
                </span>
              </div>
              <label
                className={`group relative flex aspect-[16/10] min-h-[10rem] cursor-pointer flex-col overflow-hidden rounded-2xl bg-neutral-100 transition hover:bg-neutral-200/80 dark:bg-neutral-800 dark:hover:bg-neutral-700 ${
                  uploadingThumb || isSubmitting ? 'pointer-events-none opacity-60' : ''
                }`}
              >
                {thumbnailUrl?.trim() ? (
                  <>
                    <ProductThumbnailMedia
                      url={thumbnailUrl.trim()}
                      autoPlay={isVideoThumbnailUrl(thumbnailUrl.trim())}
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                    <span
                      className={`pointer-events-none absolute inset-0 flex items-center justify-center bg-black/45 transition-opacity duration-200 ${
                        uploadingThumb ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                      }`}
                      aria-hidden
                    >
                      {uploadingThumb ? (
                        <span className="text-sm font-semibold text-white">Uploading…</span>
                      ) : (
                        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/95 text-neutral-900 shadow-lg">
                          <FontAwesomeIcon icon={faPen} className="text-lg" />
                        </span>
                      )}
                    </span>
                    <span className="sr-only">{uploadingThumb ? 'Uploading cover' : 'Change cover'}</span>
                  </>
                ) : (
                  <span className="flex flex-1 flex-col items-center justify-center px-5 py-8 text-center">
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-neutral-400 transition group-hover:text-neutral-600 dark:bg-neutral-900 dark:text-neutral-500 dark:group-hover:text-neutral-300">
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z"
                        />
                      </svg>
                    </span>
                    <span className="mt-3 text-sm font-bold text-neutral-900 dark:text-white">
                      {uploadingThumb ? 'Uploading…' : 'Drop cover image or video'}
                    </span>
                  </span>
                )}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov"
                  className="sr-only"
                  disabled={uploadingThumb || isSubmitting}
                  onChange={(e) => void onThumbnailFileChange(e)}
                />
              </label>
            </section>

            <section>
              <div className="mb-2 flex justify-end">
                <span className="shrink-0 rounded-md bg-orange-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-orange-700 dark:bg-orange-500/10 dark:text-orange-300">
                  Demo
                </span>
              </div>
              <label
                className={`group relative flex aspect-[16/10] min-h-[10rem] cursor-pointer flex-col overflow-hidden rounded-2xl bg-neutral-100 transition hover:bg-neutral-200/80 dark:bg-neutral-800 dark:hover:bg-neutral-700 ${
                  uploadingDemo || isSubmitting ? 'pointer-events-none opacity-60' : ''
                }`}
              >
                {demoUrl?.trim() ? (
                  <>
                    <ProductThumbnailMedia
                      url={demoUrl.trim()}
                      autoPlay={isVideoThumbnailUrl(demoUrl.trim())}
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                    <span
                      className={`pointer-events-none absolute inset-0 flex items-center justify-center bg-black/45 transition-opacity duration-200 ${
                        uploadingDemo ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                      }`}
                      aria-hidden
                    >
                      {uploadingDemo ? (
                        <span className="text-sm font-semibold text-white">Uploading…</span>
                      ) : (
                        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/95 text-neutral-900 shadow-lg">
                          <FontAwesomeIcon icon={faPen} className="text-lg" />
                        </span>
                      )}
                    </span>
                    <span className="sr-only">{uploadingDemo ? 'Uploading demo' : 'Change demo'}</span>
                  </>
                ) : (
                  <span className="flex flex-1 flex-col items-center justify-center px-5 py-8 text-center">
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-neutral-400 transition group-hover:text-neutral-600 dark:bg-neutral-900 dark:text-neutral-500 dark:group-hover:text-neutral-300">
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 010 1.972l-11.54 6.347a1.125 1.125 0 01-1.667-.986V5.653z"
                        />
                      </svg>
                    </span>
                    <span className="mt-3 text-sm font-bold text-neutral-900 dark:text-white">
                      {uploadingDemo ? 'Uploading…' : 'Drop demo photo or video'}
                    </span>
                  </span>
                )}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,video/mp4,video/webm,video/quicktime,.jpg,.jpeg,.png,.webp,.mp4,.webm,.mov"
                  className="sr-only"
                  disabled={uploadingDemo || isSubmitting}
                  onChange={(e) => void onDemoFileChange(e)}
                />
              </label>
              {/* Fixed-height slot so bottom row stays aligned whether demo exists or not */}
              <div className="mt-1.5 flex h-6 items-center">
                {demoUrl?.trim() ? (
                  <button
                    type="button"
                    onClick={clearDemoMedia}
                    className="inline-flex items-center gap-1.5 text-xs text-neutral-400 transition hover:text-red-500 dark:text-neutral-500 dark:hover:text-red-400"
                    aria-label="Remove demo"
                  >
                    <FontAwesomeIcon icon={faTrashCan} className="text-[11px]" />
                    <span>Remove</span>
                  </button>
                ) : null}
              </div>
            </section>

            {/* Row 2 — complementary fields (same top edge on lg) */}
            <section className={productType === 'VIDEO' ? '' : 'hidden lg:block'}>
              {productType === 'VIDEO' ? (
                <>
                  <p className={s.label}>Video badges</p>
                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="videoDuration" className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
                        Duration
                      </label>
                      <input
                        id="videoDuration"
                        placeholder="0:24"
                        className={`${s.input} mt-1`}
                        {...register('videoDuration')}
                      />
                    </div>
                    <div>
                      <label htmlFor="videoResolution" className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
                        Resolution
                      </label>
                      <select id="videoResolution" className={`${s.input} mt-1`} {...register('videoResolution')}>
                        <option value="">—</option>
                        {VIDEO_RESOLUTIONS.map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </>
              ) : null}
            </section>

            <section>
              <ProductSubtitlesField
                control={control}
                register={register}
                label="Demo captions"
              />
            </section>
          </div>
        )}

        {currentStep.id === 'highlights' && productFormat === 'virtual' && (
          <ProductWhyBlocksField
            fields={whyField.fields}
            append={whyField.append}
            remove={whyField.remove}
            register={register}
            watch={watch}
            setValue={setValue}
            control={control}
          />
        )}

        {currentStep.id === 'settings' && productFormat === 'virtual' && (
          <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
            <div className="space-y-4">
              <div>
                <label htmlFor="fileFormat" className={s.label}>
                  File format
                </label>
                <input id="fileFormat" className={s.input} placeholder="e.g. ZIP, MP4" {...register('fileFormat')} />
              </div>
              <div>
                <label htmlFor="language" className={s.label}>
                  Language
                </label>
                <select id="language" className={s.input} {...register('language')}>
                  <option value="">Select a language</option>
                  {PRODUCT_LANGUAGES.map((lang) => (
                    <option key={lang} value={lang}>
                      {lang}
                    </option>
                  ))}
                </select>
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
                <label htmlFor="version" className={s.label}>
                  Version
                </label>
                <input id="version" className={s.input} placeholder="v1.0" {...register('version')} />
              </div>
            </div>

            <div className="space-y-6">
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
                  {toolsField.fields.length === 0 ? (
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">No tools yet.</p>
                  ) : (
                    toolsField.fields.map((field, index) => (
                      <div key={field.id} className="flex gap-2">
                        <input className={`flex-1 ${s.input}`} {...register(`compatibleTools.${index}.value` as const)} />
                        <button
                          type="button"
                          onClick={() => toolsField.remove(index)}
                          className={s.removeBtn}
                          aria-label="Remove tool"
                        >
                          ✕
                        </button>
                      </div>
                    ))
                  )}
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
                  {tagsField.fields.length === 0 ? (
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">No tags yet.</p>
                  ) : (
                    tagsField.fields.map((field, index) => (
                      <div key={field.id} className="flex gap-2">
                        <input className={`flex-1 ${s.input}`} {...register(`tags.${index}.value` as const)} />
                        <button
                          type="button"
                          onClick={() => tagsField.remove(index)}
                          className={s.removeBtn}
                          aria-label="Remove tag"
                        >
                          ✕
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div
        className={`flex flex-wrap items-center justify-between gap-3 ${
          embedded ? 'border-t border-neutral-200 pt-5 dark:border-neutral-800' : 'pt-2'
        }`}
      >
        <div className="flex items-center gap-4">
          {!isFirstStep && (
            <button type="button" onClick={goBack} className={s.footerBtnSecondary}>
              ← Back
            </button>
          )}
          {onCancel ? (
            <button type="button" onClick={onCancel} className={s.footerBtnSecondary}>
              Cancel
            </button>
          ) : cancelHref ? (
            <Link href={cancelHref} className={s.footerBtnSecondary}>
              Cancel
            </Link>
          ) : null}
        </div>
        <div className="flex flex-wrap justify-end gap-3">
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

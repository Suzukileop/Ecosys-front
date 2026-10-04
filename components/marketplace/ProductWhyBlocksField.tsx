'use client';

import { useState, type ChangeEvent } from 'react';
import type { Control, FieldArrayWithId, UseFormRegister, UseFormSetValue, UseFormWatch } from 'react-hook-form';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPen, faTrashCan } from '@fortawesome/free-solid-svg-icons';
import {
  ContentMediaPreview,
  useContentMediaUpload,
} from '@/components/creator/creator-content-media';
import { inferProfileMediaType } from '@/components/creator/studio/profile-form-schema';
import { InlineBulletLinesField } from '@/components/marketplace/InlineBulletLinesField';
import { createUploadPreview, UploadingOverlay, type UploadPreview } from '@/components/ui/UploadingOverlay';
import {
  createEmptyProductWhyBlock,
  type ProductWhyBlockForm,
} from '@/components/marketplace/product-why-block-schema';
import type { ProductFormValues } from '@/components/marketplace/product-editor-schema';

const MEDIA_ACCEPT =
  'image/jpeg,image/png,image/webp,video/mp4,video/webm,video/quicktime,.jpg,.jpeg,.png,.webp,.mp4,.webm,.mov';

type ProductWhyBlocksFieldProps = {
  fields: FieldArrayWithId<ProductFormValues, 'whyProductBlocks', 'id'>[];
  append: (value: ProductWhyBlockForm) => void;
  remove: (index: number) => void;
  register: UseFormRegister<ProductFormValues>;
  watch: UseFormWatch<ProductFormValues>;
  setValue: UseFormSetValue<ProductFormValues>;
  control: Control<ProductFormValues>;
};

function CaptionLines({
  index,
  register,
  control,
  label = 'Captions',
  placeholderPrefix = 'Caption line',
  onRemoveSection,
}: {
  index: number;
  register: UseFormRegister<ProductFormValues>;
  control: Control<ProductFormValues>;
  label?: string;
  placeholderPrefix?: string;
  onRemoveSection?: () => void;
}) {
  return (
    <InlineBulletLinesField
      control={control}
      register={register}
      name={`whyProductBlocks.${index}.opinions`}
      label={label}
      placeholderPrefix={placeholderPrefix}
      onRemoveSection={onRemoveSection}
    />
  );
}

function MediaWhyBlock({
  index,
  register,
  watch,
  setValue,
  control,
  onRemove,
}: {
  index: number;
  register: UseFormRegister<ProductFormValues>;
  watch: UseFormWatch<ProductFormValues>;
  setValue: UseFormSetValue<ProductFormValues>;
  control: Control<ProductFormValues>;
  onRemove: () => void;
}) {
  const mediaUrl = watch(`whyProductBlocks.${index}.mediaUrl`) ?? '';
  const [localPreview, setLocalPreview] = useState<UploadPreview | null>(null);
  const { inputRef, uploading, uploadError, pickFile, uploadFile } = useContentMediaUpload({
    locale: 'en',
    onUrlChange: (url) => {
      setValue(`whyProductBlocks.${index}.mediaUrl`, url, { shouldDirty: true });
      setValue(`whyProductBlocks.${index}.mediaType`, url ? inferProfileMediaType(url) : null, {
        shouldDirty: true,
      });
    },
  });

  const onFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    const preview = createUploadPreview(file);
    setLocalPreview(preview);
    try {
      await uploadFile(file);
    } finally {
      URL.revokeObjectURL(preview.url);
      setLocalPreview(null);
    }
  };

  return (
    <section className="w-full">
      <div className="group/block relative">
      <button
        type="button"
        onClick={pickFile}
        disabled={uploading}
        className="group relative flex aspect-[2/1] min-h-[9rem] w-full cursor-pointer flex-col overflow-hidden rounded-2xl bg-neutral-100 transition hover:bg-neutral-200/80 dark:bg-neutral-800 dark:hover:bg-neutral-700"
      >
        {mediaUrl ? (
          <>
            <div className="absolute inset-0 [&_img]:h-full [&_img]:w-full [&_img]:object-cover [&_video]:h-full [&_video]:w-full [&_video]:object-cover">
              <ContentMediaPreview locale="en" mediaUrl={mediaUrl} mediaType="FILE" large fluid />
            </div>
            {!uploading ? (
              <span
                className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/45 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                aria-hidden
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/95 text-neutral-900 shadow-lg">
                  <FontAwesomeIcon icon={faPen} className="text-lg" />
                </span>
              </span>
            ) : null}
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
            <span className="mt-3 text-sm font-bold text-neutral-900 dark:text-white">Drop photo or video</span>
          </span>
        )}
        {uploading ? <UploadingOverlay preview={localPreview} /> : null}
      </button>
      {!uploading ? (
        <button
          type="button"
          onClick={onRemove}
          aria-label="Remove highlight"
          title="Remove highlight"
          className="absolute right-3 top-3 z-10 inline-flex h-8 w-8 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur-md transition-[opacity,background-color] hover:bg-black/75 focus-visible:opacity-100 sm:opacity-0 sm:group-hover/block:opacity-100"
        >
          <FontAwesomeIcon icon={faTrashCan} className="text-[12px]" />
        </button>
      ) : null}
      </div>
      <input ref={inputRef} type="file" accept={MEDIA_ACCEPT} className="sr-only" onChange={(e) => void onFileChange(e)} />
      {uploadError ? <p className="mt-2 text-xs text-red-600">{uploadError}</p> : null}

      <div className="mt-6">
        <CaptionLines index={index} register={register} control={control} />
      </div>
    </section>
  );
}

function TextWhyBlock({
  index,
  register,
  control,
  onRemove,
}: {
  index: number;
  register: UseFormRegister<ProductFormValues>;
  control: Control<ProductFormValues>;
  onRemove: () => void;
}) {
  return (
    <section className="w-full">
      <CaptionLines
        index={index}
        register={register}
        control={control}
        label="Selling points"
        placeholderPrefix="Point"
        onRemoveSection={onRemove}
      />
    </section>
  );
}

export function ProductWhyBlocksField({
  fields,
  append,
  remove,
  register,
  watch,
  setValue,
  control,
}: ProductWhyBlocksFieldProps) {
  const canAdd = fields.length < 10;

  return (
    <div className="w-full space-y-8">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={!canAdd}
          onClick={() => append(createEmptyProductWhyBlock(fields.length, 'media'))}
          className="inline-flex h-10 items-center rounded-lg border border-black/[0.1] px-4 text-[14px] font-medium text-[#111111] transition-colors hover:border-black/25 disabled:opacity-40 dark:border-white/[0.14] dark:text-white dark:hover:border-white/30"
        >
          + Photo highlight
        </button>
        <button
          type="button"
          disabled={!canAdd}
          onClick={() => append(createEmptyProductWhyBlock(fields.length, 'text'))}
          className="inline-flex h-10 items-center rounded-lg border border-black/[0.1] px-4 text-[14px] font-medium text-[#111111] transition-colors hover:border-black/25 disabled:opacity-40 dark:border-white/[0.14] dark:text-white dark:hover:border-white/30"
        >
          + Text highlight
        </button>
      </div>

      {fields.length === 0 ? null : (
        <div className="flex flex-col divide-y divide-black/[0.06] dark:divide-white/[0.08] [&>*]:py-7 [&>*:first-child]:pt-0 [&>*:last-child]:pb-0">
          {fields.map((field, index) => {
            const kind = watch(`whyProductBlocks.${index}.kind`) ?? 'media';
            return (
              <div key={field.id} className="min-w-0">
                {kind === 'text' ? (
                  <TextWhyBlock
                    index={index}
                    register={register}
                    control={control}
                    onRemove={() => remove(index)}
                  />
                ) : (
                  <MediaWhyBlock
                    index={index}
                    register={register}
                    watch={watch}
                    setValue={setValue}
                    control={control}
                    onRemove={() => remove(index)}
                  />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

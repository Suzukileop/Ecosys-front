'use client';

import type { Control, FieldArrayWithId, UseFormRegister, UseFormSetValue, UseFormWatch } from 'react-hook-form';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPen, faTrashCan } from '@fortawesome/free-solid-svg-icons';
import {
  ContentMediaPreview,
  useContentMediaUpload,
} from '@/components/creator/creator-content-media';
import { inferProfileMediaType } from '@/components/creator/studio/profile-form-schema';
import { InlineBulletLinesField } from '@/components/marketplace/InlineBulletLinesField';
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
  const { inputRef, uploading, uploadError, pickFile, onFileChange } = useContentMediaUpload({
    locale: 'en',
    onUrlChange: (url) => {
      setValue(`whyProductBlocks.${index}.mediaUrl`, url, { shouldDirty: true });
      setValue(`whyProductBlocks.${index}.mediaType`, url ? inferProfileMediaType(url) : null, {
        shouldDirty: true,
      });
    },
  });

  return (
    <section className="w-full">
      <button
        type="button"
        onClick={pickFile}
        disabled={uploading}
        className="group relative flex aspect-[16/10] min-h-[10rem] w-full cursor-pointer flex-col overflow-hidden rounded-2xl bg-neutral-100 transition hover:bg-neutral-200/80 dark:bg-neutral-800 dark:hover:bg-neutral-700"
      >
        {mediaUrl ? (
          <>
            <div className="absolute inset-0 [&_img]:h-full [&_img]:w-full [&_img]:object-cover [&_video]:h-full [&_video]:w-full [&_video]:object-cover">
              <ContentMediaPreview locale="en" mediaUrl={mediaUrl} mediaType="FILE" large fluid />
            </div>
            <span
              className={`pointer-events-none absolute inset-0 flex items-center justify-center bg-black/45 transition-opacity duration-200 ${
                uploading ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
              }`}
              aria-hidden
            >
              {uploading ? (
                <span className="text-sm font-semibold text-white">Uploading…</span>
              ) : (
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/95 text-neutral-900 shadow-lg">
                  <FontAwesomeIcon icon={faPen} className="text-lg" />
                </span>
              )}
            </span>
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
              {uploading ? 'Uploading…' : 'Drop photo or video'}
            </span>
          </span>
        )}
      </button>
      <input ref={inputRef} type="file" accept={MEDIA_ACCEPT} className="sr-only" onChange={onFileChange} />

      <div className="mt-1.5 mb-5 flex h-6 items-center">
        <button
          type="button"
          onClick={onRemove}
          className="inline-flex items-center gap-1.5 text-xs text-neutral-400 transition hover:text-red-500 dark:text-neutral-500 dark:hover:text-red-400"
          aria-label="Remove highlight"
        >
          <FontAwesomeIcon icon={faTrashCan} className="text-[11px]" />
          <span>Remove</span>
        </button>
      </div>
      {uploadError ? <p className="mb-2 text-xs text-red-600">{uploadError}</p> : null}

      <div>
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
      <div className="flex flex-wrap justify-end gap-2">
        <button
          type="button"
          disabled={!canAdd}
          onClick={() => append(createEmptyProductWhyBlock(fields.length, 'media'))}
            className="rounded-xl border border-neutral-200 bg-white px-5 py-2.5 text-sm font-semibold text-neutral-900 transition hover:bg-neutral-50 disabled:opacity-40 dark:border-transparent dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100"
        >
          + Photo & captions
        </button>
        <button
          type="button"
          disabled={!canAdd}
          onClick={() => append(createEmptyProductWhyBlock(fields.length, 'text'))}
          className="rounded-xl bg-neutral-200 px-5 py-2.5 text-sm font-semibold text-neutral-800 transition hover:bg-neutral-300 disabled:opacity-40 dark:bg-neutral-700 dark:text-neutral-100 dark:hover:bg-neutral-600"
        >
          + Text only
        </button>
      </div>

      {fields.length === 0 ? (
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          No highlights yet — choose a type above to start.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-x-6 gap-y-8 lg:grid-cols-2 lg:items-start">
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

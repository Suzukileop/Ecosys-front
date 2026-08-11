'use client';

import type { Control, FieldArrayWithId, UseFormRegister, UseFormSetValue, UseFormWatch } from 'react-hook-form';
import { useFieldArray } from 'react-hook-form';
import {
  ContentMediaPreview,
  useContentMediaUpload,
} from '@/components/creator/creator-content-media';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { inferProfileMediaType } from '@/components/creator/studio/profile-form-schema';
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
  move: (from: number, to: number) => void;
  register: UseFormRegister<ProductFormValues>;
  watch: UseFormWatch<ProductFormValues>;
  setValue: UseFormSetValue<ProductFormValues>;
  control: Control<ProductFormValues>;
};

function WhyBlockRow({
  index,
  register,
  watch,
  setValue,
  onRemove,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
  control,
}: {
  index: number;
  register: UseFormRegister<ProductFormValues>;
  watch: UseFormWatch<ProductFormValues>;
  setValue: UseFormSetValue<ProductFormValues>;
  control: Control<ProductFormValues>;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
}) {
  const mediaUrl = watch(`whyProductBlocks.${index}.mediaUrl`) ?? '';
  const mediaType = watch(`whyProductBlocks.${index}.mediaType`);
  const opinionsField = useFieldArray({
    control: control as Control<ProductFormValues>,
    name: `whyProductBlocks.${index}.opinions`,
  });
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
    <div className="rounded-xl border border-neutral-200 bg-neutral-50/60 p-4 dark:border-neutral-700 dark:bg-neutral-900/40">
      <div className="mb-3 flex items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Highlight {index + 1}</p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onMoveUp}
            disabled={!canMoveUp}
            className="text-sm font-medium text-neutral-600 disabled:opacity-30 dark:text-neutral-300"
          >
            Up
          </button>
          <button
            type="button"
            onClick={onMoveDown}
            disabled={!canMoveDown}
            className="text-sm font-medium text-neutral-600 disabled:opacity-30 dark:text-neutral-300"
          >
            Down
          </button>
          <button type="button" onClick={onRemove} className="text-sm font-medium text-red-600 dark:text-red-400">
            Remove
          </button>
        </div>
      </div>

      <div>
        <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
          Image or video <span className="text-orange-600 dark:text-orange-400">*</span>
        </p>
        {mediaUrl ? (
          <div className="mt-2 space-y-2">
            <ContentMediaPreview locale="en" mediaUrl={mediaUrl} mediaType="FILE" large fluid />
            <button
              type="button"
              onClick={() => {
                setValue(`whyProductBlocks.${index}.mediaUrl`, '', { shouldDirty: true });
                setValue(`whyProductBlocks.${index}.mediaType`, null, { shouldDirty: true });
              }}
              className="text-sm font-medium text-red-600 dark:text-red-400"
            >
              Remove media
            </button>
          </div>
        ) : (
          <>
            <button
              type="button"
              onClick={pickFile}
              disabled={uploading}
              className="mt-2 inline-flex items-center gap-2 rounded-full border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100 dark:border-neutral-600 dark:text-neutral-300 dark:hover:bg-neutral-800"
            >
              {uploading ? <LoadingSpinner size="sm" /> : null}
              Upload photo / video
            </button>
            <input ref={inputRef} type="file" accept={MEDIA_ACCEPT} className="sr-only" onChange={onFileChange} />
          </>
        )}
        {uploadError ? <p className="mt-1 text-xs text-red-600">{uploadError}</p> : null}
        {mediaType ? <p className="mt-1 text-xs text-neutral-500">Type: {mediaType}</p> : null}
      </div>

      <div className="mt-4">
        <div className="mb-2 flex items-center justify-between gap-2">
          <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Opinions</p>
          <button
            type="button"
            disabled={opinionsField.fields.length >= 10}
            onClick={() => opinionsField.append({ value: '' })}
            className="text-sm font-semibold text-orange-600 hover:text-orange-700 disabled:opacity-40 dark:text-orange-400"
          >
            + Add opinion
          </button>
        </div>
        {opinionsField.fields.length === 0 ? (
          <p className="text-xs text-neutral-500">Customer reviews or selling points for this highlight.</p>
        ) : (
          <div className="space-y-2">
            {opinionsField.fields.map((field, opinionIndex) => (
              <div key={field.id} className="flex items-center gap-2">
                <input
                  className="min-w-0 flex-1 rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm dark:border-neutral-600 dark:bg-neutral-950"
                  placeholder={`Opinion ${opinionIndex + 1}`}
                  {...register(`whyProductBlocks.${index}.opinions.${opinionIndex}.value`)}
                />
                <button
                  type="button"
                  onClick={() => opinionsField.remove(opinionIndex)}
                  className="text-sm font-medium text-red-600 dark:text-red-400"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function ProductWhyBlocksField({
  fields,
  append,
  remove,
  move,
  register,
  watch,
  setValue,
  control,
}: ProductWhyBlocksFieldProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-neutral-900 dark:text-white">Why your product?</p>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Add highlights with an image or video and customer opinions.
          </p>
        </div>
        <button
          type="button"
          disabled={fields.length >= 10}
          onClick={() => append(createEmptyProductWhyBlock(fields.length))}
          className="shrink-0 rounded-full border border-dashed border-neutral-300 px-4 py-2 text-sm font-semibold text-neutral-700 hover:bg-neutral-50 dark:border-neutral-600 dark:text-neutral-300 dark:hover:bg-neutral-800"
        >
          + Add highlight
        </button>
      </div>

      {fields.length === 0 ? (
        <p className="rounded-xl border border-dashed border-neutral-200 px-4 py-8 text-center text-sm text-neutral-500 dark:border-neutral-700">
          No highlights yet. Show what customers love about your product.
        </p>
      ) : (
        fields.map((field, index) => (
          <WhyBlockRow
            key={field.id}
            index={index}
            register={register}
            watch={watch}
            setValue={setValue}
            control={control}
            onRemove={() => remove(index)}
            onMoveUp={() => move(index, index - 1)}
            onMoveDown={() => move(index, index + 1)}
            canMoveUp={index > 0}
            canMoveDown={index < fields.length - 1}
          />
        ))
      )}
    </div>
  );
}

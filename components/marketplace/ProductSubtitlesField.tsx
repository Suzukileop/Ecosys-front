'use client';

import type { Control, UseFormRegister } from 'react-hook-form';
import { useFieldArray } from 'react-hook-form';
import type { ProductFormValues } from '@/components/marketplace/product-editor-schema';

type ProductSubtitlesFieldProps = {
  control: Control<ProductFormValues>;
  register: UseFormRegister<ProductFormValues>;
  label: string;
  hint?: string;
  addLabel?: string;
  maxItems?: number;
};

export function ProductSubtitlesField({
  control,
  register,
  label,
  hint,
  addLabel = '+ Add subtitle',
  maxItems = 10,
}: ProductSubtitlesFieldProps) {
  const { fields, append, remove } = useFieldArray({ control, name: 'demoSubtitles' });

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">{label}</p>
          {hint ? <p className="text-xs text-neutral-500 dark:text-neutral-400">{hint}</p> : null}
        </div>
        <button
          type="button"
          disabled={fields.length >= maxItems}
          onClick={() => append({ value: '' })}
          className="text-sm font-semibold text-orange-600 hover:text-orange-700 disabled:opacity-40 dark:text-orange-400 dark:hover:text-orange-300"
        >
          {addLabel}
        </button>
      </div>
      {fields.length === 0 ? (
        <p className="rounded-lg border border-dashed border-neutral-200 px-3 py-4 text-center text-xs text-neutral-500 dark:border-neutral-700">
          No subtitles yet.
        </p>
      ) : (
        <div className="space-y-2">
          {fields.map((field, index) => (
            <div key={field.id} className="flex items-center gap-2">
              <input
                className="min-w-0 flex-1 rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm dark:border-neutral-600 dark:bg-neutral-950"
                placeholder={`Subtitle ${index + 1}`}
                {...register(`demoSubtitles.${index}.value`)}
              />
              <button
                type="button"
                onClick={() => remove(index)}
                className="shrink-0 text-sm font-medium text-red-600 dark:text-red-400"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

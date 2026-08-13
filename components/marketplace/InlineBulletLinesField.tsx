'use client';

import { useEffect } from 'react';
import type {
  Control,
  FieldValues,
  Path,
  UseFormRegister,
} from 'react-hook-form';
import { useFieldArray } from 'react-hook-form';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashCan } from '@fortawesome/free-solid-svg-icons';

type InlineBulletLinesFieldProps<T extends FieldValues> = {
  control: Control<T>;
  register: UseFormRegister<T>;
  /** react-hook-form field array name, e.g. demoSubtitles or whyProductBlocks.0.opinions */
  name: Path<T>;
  label: string;
  placeholderPrefix?: string;
  maxItems?: number;
  /** Optional: remove the whole section (e.g. text-only highlight block) */
  onRemoveSection?: () => void;
};

/**
 * Inline orange-bullet lines: one fillable row by default, Enter adds the next line.
 */
export function InlineBulletLinesField<T extends FieldValues>({
  control,
  register,
  name,
  label,
  placeholderPrefix = 'Caption line',
  maxItems = 10,
  onRemoveSection,
}: InlineBulletLinesFieldProps<T>) {
  const { fields, append, remove } = useFieldArray({
    control,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- field array path is dynamic
    name: name as any,
  });

  useEffect(() => {
    if (fields.length === 0) {
      append({ value: '' } as never);
    }
  }, [fields.length, append]);

  return (
    <div className="flex min-h-0 flex-col">
      <div className="flex items-center justify-between gap-3">
        <p className="text-base font-semibold text-neutral-800 dark:text-neutral-200">{label}</p>
        <div className="flex shrink-0 items-center gap-3">
          <button
            type="button"
            disabled={fields.length >= maxItems}
            onClick={() => append({ value: '' } as never)}
            className="text-sm font-medium text-orange-600 transition hover:text-orange-700 disabled:opacity-40 dark:text-orange-400 dark:hover:text-orange-300"
          >
            + new text
          </button>
          {onRemoveSection ? (
            <button
              type="button"
              onClick={onRemoveSection}
              className="text-neutral-400 transition hover:text-red-500 dark:text-neutral-500 dark:hover:text-red-400"
              aria-label="Remove section"
            >
              <FontAwesomeIcon icon={faTrashCan} className="text-[12px]" />
            </button>
          ) : null}
        </div>
      </div>

      <ul className="mt-3 space-y-1.5">
        {fields.map((field, index) => (
          <li key={field.id} className="group/line flex items-start gap-2.5 py-2">
            <span
              className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center text-base font-semibold leading-none text-orange-500"
              aria-hidden
            >
              +
            </span>
            <input
              className="min-w-0 flex-1 border-0 bg-transparent p-0 text-base leading-relaxed text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-0 dark:text-neutral-200 dark:placeholder:text-neutral-500"
              placeholder={`${placeholderPrefix} ${index + 1}`}
              {...register(`${String(name)}.${index}.value` as Path<T>)}
              onKeyDown={(event) => {
                if (event.key !== 'Enter') return;
                event.preventDefault();
                event.stopPropagation();
                if (fields.length >= maxItems) return;
                if (index === fields.length - 1) {
                  append({ value: '' } as never);
                }
              }}
            />
            {fields.length > 1 ? (
              <button
                type="button"
                onClick={() => remove(index)}
                className="mt-0.5 shrink-0 px-0.5 text-sm font-medium text-red-500 opacity-70 transition hover:opacity-100 dark:text-red-400"
                aria-label={`Remove line ${index + 1}`}
              >
                ✕
              </button>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}

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
 * Inline bullet lines: one fillable row by default, Enter adds the next line.
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
        <p className="text-[14px] font-medium text-[#111111] dark:text-white">{label}</p>
        <div className="flex shrink-0 items-center gap-3">
          <button
            type="button"
            disabled={fields.length >= maxItems}
            onClick={() => append({ value: '' } as never)}
            className="text-[13px] font-medium text-neutral-500 transition-colors hover:text-[#111111] disabled:opacity-40 dark:text-neutral-400 dark:hover:text-white"
          >
            Add line
          </button>
          {onRemoveSection ? (
            <button
              type="button"
              onClick={onRemoveSection}
              className="text-neutral-400 transition-colors hover:text-[#111111] dark:text-neutral-500 dark:hover:text-white"
              aria-label="Remove section"
            >
              <FontAwesomeIcon icon={faTrashCan} className="text-[12px]" />
            </button>
          ) : null}
        </div>
      </div>

      <ul className="mt-2">
        {fields.map((field, index) => (
          <li key={field.id} className="group/line flex items-center gap-3 py-2">
            <span className="h-1 w-1 shrink-0 rounded-full bg-neutral-400 dark:bg-neutral-500" aria-hidden />
            <input
              className="min-w-0 flex-1 border-0 bg-transparent p-0 text-[15px] leading-relaxed text-[#111111] placeholder:text-neutral-400 focus:outline-none focus:ring-0 dark:text-white dark:placeholder:text-neutral-500"
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
                className="shrink-0 text-neutral-400 opacity-0 transition-[opacity,color] hover:text-[#111111] focus-visible:opacity-100 group-hover/line:opacity-100 dark:text-neutral-500 dark:hover:text-white"
                aria-label={`Remove line ${index + 1}`}
              >
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden>
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}

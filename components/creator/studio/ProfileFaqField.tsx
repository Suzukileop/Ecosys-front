'use client';

import type { Control, FieldArrayWithId, UseFormRegister } from 'react-hook-form';
import {
  createEmptyFaqItem,
  type ProfileFormValues,
} from '@/components/creator/studio/profile-form-schema';
import {
  profileFormInputClass,
  profileFormLabelClass,
  profileSectionEmptyClass,
} from '@/components/creator/studio/profile-section-ui';
import { ProfileSectionItemCount } from '@/components/creator/studio/ProfileSectionLimitUpgradeHint';

export const MAX_FAQ = 8;

type ProfileFaqFieldProps = {
  control: Control<ProfileFormValues>;
  fields: FieldArrayWithId<ProfileFormValues, 'faqItems', 'id'>[];
  append: (value: ReturnType<typeof createEmptyFaqItem>) => void;
  remove: (index: number) => void;
  move: (from: number, to: number) => void;
  register: UseFormRegister<ProfileFormValues>;
  readOnly?: boolean;
  values?: ProfileFormValues['faqItems'];
};

export function ProfileFaqField({
  fields,
  append,
  remove,
  move,
  register,
  readOnly = false,
  values = [],
}: ProfileFaqFieldProps) {
  if (readOnly) {
    const filled = values.filter((item) => item.question.trim() && item.answer.trim());
    if (filled.length === 0) {
      return <p className={profileSectionEmptyClass}>Aucune question ajoutée.</p>;
    }
    return (
      <div className="space-y-3">
        {filled.map((item) => (
          <details
            key={item.id}
            className="group rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900"
          >
            <summary className="cursor-pointer list-none px-4 py-3 font-semibold text-neutral-900 dark:text-white [&::-webkit-details-marker]:hidden">
              {item.question}
            </summary>
            <div className="border-t border-neutral-100 px-4 py-3 text-sm leading-relaxed text-neutral-600 dark:border-neutral-800 dark:text-neutral-300">
              {item.answer}
            </div>
          </details>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <ProfileSectionItemCount count={fields.length} limit={MAX_FAQ} unit="FAQ items" />

      {fields.length === 0 ? (
        <p className={profileSectionEmptyClass}>Aucune question ajoutée.</p>
      ) : (
        fields.map((field, index) => (
          <div
            key={field.id}
            className="space-y-3 rounded-xl border border-neutral-200 p-4 dark:border-neutral-800"
          >
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">FAQ {index + 1}</p>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={index === 0}
                  onClick={() => move(index, index - 1)}
                  className="rounded-lg border border-neutral-200 px-2 py-1 text-xs disabled:opacity-40 dark:border-neutral-700"
                  aria-label="Move up"
                >
                  ↑
                </button>
                <button
                  type="button"
                  disabled={index === fields.length - 1}
                  onClick={() => move(index, index + 1)}
                  className="rounded-lg border border-neutral-200 px-2 py-1 text-xs disabled:opacity-40 dark:border-neutral-700"
                  aria-label="Move down"
                >
                  ↓
                </button>
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="rounded-lg border border-red-200 px-2 py-1 text-xs text-red-700 dark:border-red-500/30 dark:text-red-400"
                >
                  Remove
                </button>
              </div>
            </div>

            <div>
              <label htmlFor={`faq-q-${field.id}`} className={profileFormLabelClass}>
                Question
              </label>
              <input
                id={`faq-q-${field.id}`}
                type="text"
                className={profileFormInputClass}
                {...register(`faqItems.${index}.question`)}
              />
            </div>

            <div>
              <label htmlFor={`faq-a-${field.id}`} className={profileFormLabelClass}>
                Answer
              </label>
              <textarea
                id={`faq-a-${field.id}`}
                rows={3}
                className={profileFormInputClass}
                {...register(`faqItems.${index}.answer`)}
              />
            </div>
          </div>
        ))
      )}

      {fields.length < MAX_FAQ ? (
        <button
          type="button"
          onClick={() => append(createEmptyFaqItem(fields.length))}
          className="rounded-lg border border-dashed border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-600 dark:text-neutral-300 dark:hover:bg-neutral-800"
        >
          Add FAQ item
        </button>
      ) : null}
    </div>
  );
}

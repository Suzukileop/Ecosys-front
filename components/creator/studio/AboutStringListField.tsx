'use client';

import { useFieldArray, type Control, type FieldPath, type UseFormRegister } from 'react-hook-form';
import {
  type ProfileFormValues,
} from '@/components/creator/studio/profile-form-schema';
import {
  profileFormInputClass,
  profileSectionEmptyClass,
  profileSectionMutedTextClass,
  profileSectionSubheadingClass,
} from '@/components/creator/studio/profile-section-ui';
import { ProfileSectionItemCount } from '@/components/creator/studio/ProfileSectionLimitUpgradeHint';

type AboutStringListFieldName =
  | 'aboutStrengths'
  | 'aboutSystemsTools'
  | 'aboutInterests';

type AboutStringListFieldProps = {
  control: Control<ProfileFormValues>;
  register: UseFormRegister<ProfileFormValues>;
  name: AboutStringListFieldName;
  label: string;
  description?: string;
  maxItems: number;
  readOnly?: boolean;
  values?: string[];
};

export function AboutStringListField({
  control,
  register,
  name,
  label,
  description,
  maxItems,
  readOnly = false,
  values = [],
}: AboutStringListFieldProps) {
  const { fields, append, remove, move } = useFieldArray({
    control,
    name: name as 'aboutStrengths' | 'aboutSystemsTools' | 'aboutInterests',
  });

  if (readOnly) {
    const filled = values.filter((item) => item.trim());
    if (filled.length === 0) {
      return <p className={profileSectionEmptyClass}>Not set</p>;
    }
    return (
      <ul className="space-y-1.5">
        {filled.map((item) => (
          <li
            key={item}
            className="flex items-start gap-2 text-sm text-neutral-800 dark:text-neutral-200"
          >
            <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[#F97316]" aria-hidden />
            {item}
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <p className={profileSectionSubheadingClass}>{label}</p>
        {description ? (
          <p className={`mt-1 ${profileSectionMutedTextClass}`}>{description}</p>
        ) : null}
      </div>

      <ProfileSectionItemCount count={fields.length} limit={maxItems} unit="items" />

      {fields.length === 0 ? (
        <p className={profileSectionEmptyClass}>No items added yet.</p>
      ) : (
        <div className="space-y-2">
          {fields.map((field, index) => (
            <div
              key={field.id}
              className="flex items-center gap-2 rounded-xl border border-neutral-200 p-2 dark:border-neutral-700"
            >
              <input
                type="text"
                className={`${profileFormInputClass} mt-0 min-w-0 flex-1`}
                placeholder={`${label} item`}
                {...register(`${name}.${index}.value` as FieldPath<ProfileFormValues>)}
              />
              <div className="flex shrink-0 items-center gap-1">
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
          ))}
        </div>
      )}

      <button
        type="button"
        disabled={fields.length >= maxItems}
        onClick={() => append({ value: '' })}
        className="inline-flex items-center rounded-full border border-neutral-200 px-4 py-2 text-sm font-semibold text-neutral-700 hover:bg-neutral-50 disabled:opacity-50 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-900"
      >
        Add item
      </button>
    </div>
  );
}

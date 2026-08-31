'use client';

import type {
  Control,
  FieldArrayWithId,
  UseFormRegister,
} from 'react-hook-form';
import {
  createEmptyAboutEducationEntry,
  type ProfileFormValues,
} from '@/components/creator/studio/profile-form-schema';
import {
  profileFormInputClass,
  profileFormLabelClass,
  profileSectionEmptyClass,
  profileSectionMutedTextClass,
  profileSectionSubheadingClass,
} from '@/components/creator/studio/profile-section-ui';
import { ProfileSectionItemCount } from '@/components/creator/studio/ProfileSectionLimitUpgradeHint';
import type { ProfileEducationEntry } from '@/types/ecosystem';

export const MAX_ABOUT_EDUCATION = 8;

type AboutEducationFieldProps = {
  control: Control<ProfileFormValues>;
  fields: FieldArrayWithId<ProfileFormValues, 'aboutEducation', 'id'>[];
  append: (value: ReturnType<typeof createEmptyAboutEducationEntry>) => void;
  remove: (index: number) => void;
  move: (from: number, to: number) => void;
  register: UseFormRegister<ProfileFormValues>;
  readOnly?: boolean;
  values?: ProfileEducationEntry[];
};

export function AboutEducationField({
  fields,
  append,
  remove,
  move,
  register,
  readOnly = false,
  values = [],
}: AboutEducationFieldProps) {
  if (readOnly) {
    const filled = values.filter(
      (item) =>
        item.schoolYear.trim() || item.title.trim() || item.institution.trim()
    );
    if (filled.length === 0) {
      return <p className={profileSectionEmptyClass}>Not set</p>;
    }
    return (
      <div className="grid gap-3 sm:grid-cols-2">
        {filled.map((item) => (
          <div
            key={item.id}
            className="rounded-xl border border-neutral-200 bg-neutral-50/70 p-4 dark:border-neutral-700/40 dark:bg-[#141414]"
          >
            {item.schoolYear.trim() ? (
              <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                {item.schoolYear}
              </p>
            ) : null}
            {item.title.trim() ? (
              <p className="mt-1 text-[15px] font-bold text-neutral-900 dark:text-white">
                {item.title}
              </p>
            ) : null}
            {item.institution.trim() ? (
              <p className="mt-0.5 text-sm text-neutral-600 dark:text-neutral-400">
                {item.institution}
              </p>
            ) : null}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <p className={profileSectionSubheadingClass}>Education</p>
        <p className={`mt-1 ${profileSectionMutedTextClass}`}>
          Add schools, degrees, or training programs with year, title, and institution.
        </p>
      </div>

      <ProfileSectionItemCount count={fields.length} limit={MAX_ABOUT_EDUCATION} unit="entries" />

      {fields.length === 0 ? (
        <p className={profileSectionEmptyClass}>No education entries added yet.</p>
      ) : (
        <div className="space-y-4">
          {fields.map((field, index) => (
            <div
              key={field.id}
              className="space-y-3 rounded-xl border border-neutral-200 p-4 dark:border-neutral-800"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">
                  Entry {index + 1}
                </p>
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
                <label htmlFor={`about-edu-year-${field.id}`} className={profileFormLabelClass}>
                  School year
                </label>
                <input
                  id={`about-edu-year-${field.id}`}
                  type="text"
                  placeholder="e.g. 2020 — 2024"
                  className={profileFormInputClass}
                  {...register(`aboutEducation.${index}.schoolYear`)}
                />
              </div>

              <div>
                <label htmlFor={`about-edu-title-${field.id}`} className={profileFormLabelClass}>
                  Degree / title
                </label>
                <input
                  id={`about-edu-title-${field.id}`}
                  type="text"
                  placeholder="e.g. B.Sc. Computer Science"
                  className={profileFormInputClass}
                  {...register(`aboutEducation.${index}.title`)}
                />
              </div>

              <div>
                <label htmlFor={`about-edu-institution-${field.id}`} className={profileFormLabelClass}>
                  Institution
                </label>
                <input
                  id={`about-edu-institution-${field.id}`}
                  type="text"
                  placeholder="e.g. University of Example"
                  className={profileFormInputClass}
                  {...register(`aboutEducation.${index}.institution`)}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      <button
        type="button"
        disabled={fields.length >= MAX_ABOUT_EDUCATION}
        onClick={() => append(createEmptyAboutEducationEntry(fields.length))}
        className="inline-flex items-center rounded-full border border-neutral-200 px-4 py-2 text-sm font-semibold text-neutral-700 hover:bg-neutral-50 disabled:opacity-50 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-900"
      >
        Add education entry
      </button>
    </div>
  );
}

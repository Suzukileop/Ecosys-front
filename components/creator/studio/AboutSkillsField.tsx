'use client';

import type {
  Control,
  FieldArrayWithId,
  UseFormRegister,
} from 'react-hook-form';
import {
  createEmptyAboutSkillEntry,
  MAX_ABOUT_SKILLS,
  type ProfileSkillEntry,
} from '@/lib/about-skills';
import type { ProfileFormValues } from '@/components/creator/studio/profile-form-schema';
import {
  profileFormInputClass,
  profileFormLabelClass,
  profileSectionEmptyClass,
  profileSectionMutedTextClass,
  profileSectionSubheadingClass,
} from '@/components/creator/studio/profile-section-ui';
import { ProfileSectionItemCount } from '@/components/creator/studio/ProfileSectionLimitUpgradeHint';

type AboutSkillsFieldProps = {
  control: Control<ProfileFormValues>;
  fields: FieldArrayWithId<ProfileFormValues, 'aboutSkills', 'id'>[];
  append: (value: ReturnType<typeof createEmptyAboutSkillEntry>) => void;
  remove: (index: number) => void;
  move: (from: number, to: number) => void;
  register: UseFormRegister<ProfileFormValues>;
  readOnly?: boolean;
  values?: ProfileSkillEntry[];
};

export function AboutSkillsField({
  fields,
  append,
  remove,
  move,
  register,
  readOnly = false,
  values = [],
}: AboutSkillsFieldProps) {
  if (readOnly) {
    const filled = values.filter((item) => item.title.trim());
    if (filled.length === 0) {
      return <p className={profileSectionEmptyClass}>Not set</p>;
    }
    return (
      <ul className="space-y-3">
        {filled.map((item) => (
          <li
            key={item.id}
            className="rounded-xl border border-neutral-200 bg-neutral-50/70 p-4 dark:border-neutral-700/40 dark:bg-[#141414]"
          >
            <p className="text-[15px] font-bold text-neutral-900 dark:text-white">{item.title}</p>
            {item.description.trim() ? (
              <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                {item.description}
              </p>
            ) : null}
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <p className={profileSectionSubheadingClass}>Skills</p>
        <p className={`mt-1 ${profileSectionMutedTextClass}`}>
          Add skills with a title and an optional short description.
        </p>
      </div>

      <ProfileSectionItemCount count={fields.length} limit={MAX_ABOUT_SKILLS} unit="skills" />

      {fields.length === 0 ? (
        <p className={profileSectionEmptyClass}>No skills added yet.</p>
      ) : (
        <div className="space-y-4">
          {fields.map((field, index) => (
            <div
              key={field.id}
              className="space-y-3 rounded-xl border border-neutral-200 p-4 dark:border-neutral-800"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">
                  Skill {index + 1}
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
                <label className={profileFormLabelClass}>Title</label>
                <input
                  type="text"
                  {...register(`aboutSkills.${index}.title`)}
                  placeholder="e.g. Web application development"
                  className={profileFormInputClass}
                />
              </div>
              <div>
                <label className={profileFormLabelClass}>Description (optional)</label>
                <textarea
                  {...register(`aboutSkills.${index}.description`)}
                  placeholder="Short context or detail"
                  rows={2}
                  className={profileFormInputClass}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      <button
        type="button"
        disabled={fields.length >= MAX_ABOUT_SKILLS}
        onClick={() => append(createEmptyAboutSkillEntry(fields.length))}
        className="rounded-full border border-neutral-200 px-4 py-2 text-sm font-semibold text-neutral-700 hover:bg-neutral-50 disabled:opacity-50 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-900"
      >
        Add skill
      </button>
    </div>
  );
}

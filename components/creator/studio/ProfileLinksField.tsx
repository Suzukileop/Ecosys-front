'use client';

import type {
  Control,
  FieldArrayWithId,
  FieldErrors,
  UseFormRegister,
} from 'react-hook-form';
import {
  createEmptyProfileLink,
  deriveProfileLinkLabel,
  type ProfileFormValues,
} from '@/components/creator/studio/profile-form-schema';
import {
  profileFormInputClass,
  profileFormLabelClass,
  profileSectionEmptyClass,
  profileSectionMutedTextClass,
} from '@/components/creator/studio/profile-section-ui';

const MAX_LINKS = 10;

type ProfileLinksFieldProps = {
  control: Control<ProfileFormValues>;
  fields: FieldArrayWithId<ProfileFormValues, 'profileLinks', 'id'>[];
  append: (value: ReturnType<typeof createEmptyProfileLink>) => void;
  remove: (index: number) => void;
  move: (from: number, to: number) => void;
  register: UseFormRegister<ProfileFormValues>;
  errors?: FieldErrors<ProfileFormValues>['profileLinks'];
  readOnly?: boolean;
  values?: ProfileFormValues['profileLinks'];
};

export function ProfileLinksField({
  fields,
  append,
  remove,
  move,
  register,
  errors,
  readOnly = false,
  values = [],
}: ProfileLinksFieldProps) {
  if (readOnly) {
    const filled = values.filter((link) => link.url.trim());
    if (filled.length === 0) {
      return <p className={profileSectionEmptyClass}>Aucun lien ajouté.</p>;
    }
    return (
      <div className="space-y-2">
        {filled.map((link) => {
          const title = link.label.trim() || deriveProfileLinkLabel(link.url);
          return (
            <div
              key={link.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-neutral-200/70 bg-neutral-50/50 px-4 py-3 dark:border-neutral-800 dark:bg-neutral-950/50"
            >
              <div className="min-w-0">
                <p className="font-semibold text-neutral-800 dark:text-neutral-200">{title}</p>
              </div>
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="truncate text-sm text-orange-600 hover:underline dark:text-orange-400"
              >
                {link.url}
              </a>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className={profileSectionMutedTextClass}>
        Ajoutez jusqu&apos;à {MAX_LINKS} liens. Le premier lien devient le bouton principal sur
        votre profil public.
      </p>

      {fields.length === 0 ? (
        <p className={profileSectionEmptyClass}>Aucun lien ajouté.</p>
      ) : (
        fields.map((field, index) => (
          <div
            key={field.id}
            className="space-y-3 rounded-xl border border-neutral-200 p-4 dark:border-neutral-800"
          >
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">
                Link {index + 1}
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
              <label htmlFor={`link-url-${field.id}`} className={profileFormLabelClass}>
                URL
              </label>
              <input
                id={`link-url-${field.id}`}
                type="text"
                inputMode="url"
                autoComplete="url"
                placeholder="https://"
                className={profileFormInputClass}
                aria-invalid={errors?.[index]?.url ? true : undefined}
                {...register(`profileLinks.${index}.url`)}
              />
              {errors?.[index]?.url?.message ? (
                <p className="mt-1 text-xs font-medium text-red-600 dark:text-red-400">
                  {errors[index]?.url?.message}
                </p>
              ) : null}
            </div>
          </div>
        ))
      )}

      {fields.length < MAX_LINKS ? (
        <button
          type="button"
          onClick={() => append(createEmptyProfileLink(fields.length))}
          className="rounded-lg border border-dashed border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-600 dark:text-neutral-300 dark:hover:bg-neutral-800"
        >
          Add link
        </button>
      ) : null}
    </div>
  );
}

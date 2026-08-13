'use client';

import {
  useFieldArray,
  useFormState,
  type Control,
  type FieldArrayWithId,
  type UseFormRegister,
  type UseFormSetValue,
  type UseFormWatch,
} from 'react-hook-form';
import {
  ContentMediaPreview,
  useContentMediaUpload,
} from '@/components/creator/creator-content-media';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import {
  createEmptyTeamMember,
  createEmptyTeamSocialLink,
  inferTeamSocialPlatform,
  type ProfileFormValues,
} from '@/components/creator/studio/profile-form-schema';
import {
  profileFormInputClass,
  profileFormLabelClass,
  profileSectionEmptyClass,
} from '@/components/creator/studio/profile-section-ui';
import { ProfileSectionItemCount } from '@/components/creator/studio/ProfileSectionLimitUpgradeHint';

export const MAX_TEAM = 3;
const MAX_SOCIAL_LINKS = 6;

const TEAM_MEDIA_ACCEPT = 'image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp';

type ProfileTeamFieldProps = {
  control: Control<ProfileFormValues>;
  fields: FieldArrayWithId<ProfileFormValues, 'teamMembers', 'id'>[];
  append: (value: ReturnType<typeof createEmptyTeamMember>) => void;
  remove: (index: number) => void;
  move: (from: number, to: number) => void;
  register: UseFormRegister<ProfileFormValues>;
  setValue: UseFormSetValue<ProfileFormValues>;
  watch: UseFormWatch<ProfileFormValues>;
  readOnly?: boolean;
  values?: ProfileFormValues['teamMembers'];
};

function TeamMemberCard({
  control,
  register,
  setValue,
  watch,
  fieldId,
  index,
  total,
  move,
  remove,
}: {
  control: Control<ProfileFormValues>;
  register: UseFormRegister<ProfileFormValues>;
  setValue: UseFormSetValue<ProfileFormValues>;
  watch: UseFormWatch<ProfileFormValues>;
  fieldId: string;
  index: number;
  total: number;
  move: (from: number, to: number) => void;
  remove: (index: number) => void;
}) {
  const imageUrl = watch(`teamMembers.${index}.imageUrl`) ?? '';
  const { errors } = useFormState({ control, name: `teamMembers.${index}` as const });
  const memberErrors = errors.teamMembers?.[index];
  const {
    fields: socialFields,
    append: appendSocial,
    remove: removeSocial,
    move: moveSocial,
  } = useFieldArray({
    control,
    name: `teamMembers.${index}.socialLinks`,
  });

  const { inputRef, uploading, uploadError, pickFile, onFileChange } = useContentMediaUpload({
    locale: 'fr',
    onUrlChange: (url) => {
      setValue(`teamMembers.${index}.imageUrl`, url, { shouldDirty: true });
    },
  });

  return (
    <div className="space-y-3 rounded-xl border border-neutral-200 p-4 dark:border-neutral-800">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">
          Membre {index + 1}
        </p>
        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={index === 0}
            onClick={() => move(index, index - 1)}
            className="rounded-lg border border-neutral-200 px-2 py-1 text-xs disabled:opacity-40 dark:border-neutral-700"
            aria-label="Monter"
          >
            ↑
          </button>
          <button
            type="button"
            disabled={index === total - 1}
            onClick={() => move(index, index + 1)}
            className="rounded-lg border border-neutral-200 px-2 py-1 text-xs disabled:opacity-40 dark:border-neutral-700"
            aria-label="Descendre"
          >
            ↓
          </button>
          <button
            type="button"
            onClick={() => remove(index)}
            className="rounded-lg border border-red-200 px-2 py-1 text-xs text-red-700 dark:border-red-500/30 dark:text-red-400"
          >
            Retirer
          </button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor={`team-name-${fieldId}`} className={profileFormLabelClass}>
            Nom
          </label>
          <input
            id={`team-name-${fieldId}`}
            type="text"
            className={profileFormInputClass}
            {...register(`teamMembers.${index}.name`)}
          />
        </div>
        <div>
          <label htmlFor={`team-role-${fieldId}`} className={profileFormLabelClass}>
            Responsabilité
          </label>
          <input
            id={`team-role-${fieldId}`}
            type="text"
            placeholder="ex. Directeur artistique"
            className={profileFormInputClass}
            {...register(`teamMembers.${index}.responsibility`)}
          />
        </div>
      </div>

      <div>
        <p className={profileFormLabelClass}>Photo</p>
        {imageUrl ? (
          <div className="mt-2 space-y-2">
            <ContentMediaPreview locale="fr" mediaUrl={imageUrl} mediaType="FILE" large fluid />
            <button
              type="button"
              onClick={() => setValue(`teamMembers.${index}.imageUrl`, '', { shouldDirty: true })}
              className="text-sm font-medium text-neutral-700 hover:text-neutral-950 dark:text-neutral-300 dark:hover:text-white"
            >
              Retirer la photo
            </button>
          </div>
        ) : null}
        <div className="mt-2">
          <input
            ref={inputRef}
            type="file"
            accept={TEAM_MEDIA_ACCEPT}
            className="hidden"
            onChange={onFileChange}
          />
          <button
            type="button"
            onClick={pickFile}
            disabled={uploading}
            className="inline-flex items-center gap-2 rounded-full border border-neutral-300 px-4 py-2 text-sm font-semibold text-neutral-800 hover:bg-white dark:border-neutral-600 dark:text-neutral-100 dark:hover:bg-neutral-900"
          >
            {uploading ? <LoadingSpinner size="sm" /> : null}
            {imageUrl ? 'Remplacer la photo' : 'Ajouter une photo'}
          </button>
          {uploadError ? <p className="mt-2 text-xs text-red-600">{uploadError}</p> : null}
        </div>
      </div>

      <div>
        <label className={`${profileFormLabelClass} mb-2 block`}>Réseaux / contact</label>
        {socialFields.length === 0 ? (
          <p className="mb-3 rounded-lg border border-dashed border-neutral-200 px-3 py-3 text-xs text-neutral-500 dark:border-neutral-700">
            Aucun réseau ajouté — LinkedIn, email, site web…
          </p>
        ) : (
          <div className="mb-3 space-y-3">
            {socialFields.map((socialField, socialIndex) => (
              <div
                key={socialField.id}
                className="grid gap-2 rounded-lg border border-neutral-100 p-3 dark:border-neutral-800 sm:grid-cols-[1fr_auto]"
              >
                <div>
                  <label
                    htmlFor={`team-url-${socialField.id}`}
                    className="mb-1 block text-xs font-medium text-neutral-500"
                  >
                    URL / email
                  </label>
                  <input
                    id={`team-url-${socialField.id}`}
                    type="text"
                    inputMode="url"
                    autoComplete="url"
                    className={profileFormInputClass}
                    placeholder="https://… ou email"
                    aria-invalid={memberErrors?.socialLinks?.[socialIndex]?.url ? true : undefined}
                    {...register(`teamMembers.${index}.socialLinks.${socialIndex}.url`, {
                      onChange: (event) => {
                        const url = event.target.value as string;
                        setValue(
                          `teamMembers.${index}.socialLinks.${socialIndex}.platform`,
                          inferTeamSocialPlatform(url),
                          { shouldDirty: true }
                        );
                      },
                    })}
                  />
                  {memberErrors?.socialLinks?.[socialIndex]?.url?.message ? (
                    <p className="mt-1 text-xs font-medium text-red-600 dark:text-red-400">
                      {memberErrors.socialLinks[socialIndex]?.url?.message}
                    </p>
                  ) : null}
                </div>
                <div className="flex items-end gap-1">
                  <button
                    type="button"
                    disabled={socialIndex === 0}
                    onClick={() => moveSocial(socialIndex, socialIndex - 1)}
                    className="rounded-lg border border-neutral-200 px-2 py-1 text-xs disabled:opacity-40 dark:border-neutral-700"
                    aria-label="Monter le lien"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    disabled={socialIndex === socialFields.length - 1}
                    onClick={() => moveSocial(socialIndex, socialIndex + 1)}
                    className="rounded-lg border border-neutral-200 px-2 py-1 text-xs disabled:opacity-40 dark:border-neutral-700"
                    aria-label="Descendre le lien"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    onClick={() => removeSocial(socialIndex)}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-neutral-400 transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10 dark:hover:text-red-400"
                    aria-label="Retirer le lien"
                    title="Retirer"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        <button
          type="button"
          disabled={socialFields.length >= MAX_SOCIAL_LINKS}
          onClick={() => appendSocial(createEmptyTeamSocialLink(socialFields.length))}
          className="inline-flex w-full items-center justify-center gap-2.5 rounded-xl border-2 border-dashed border-neutral-300 bg-neutral-50/80 px-4 py-3 text-sm font-semibold text-neutral-600 transition hover:border-orange-400/60 hover:bg-orange-50 hover:text-orange-700 disabled:cursor-not-allowed disabled:opacity-40 dark:border-neutral-600 dark:bg-neutral-900/40 dark:text-neutral-300 dark:hover:border-orange-400/50 dark:hover:bg-orange-500/10 dark:hover:text-orange-300"
        >
          <span
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-neutral-200 bg-white text-orange-600 dark:border-neutral-700 dark:bg-neutral-900 dark:text-orange-400"
            aria-hidden
          >
            +
          </span>
          Ajouter un lien
        </button>
      </div>
    </div>
  );
}

export function ProfileTeamField({
  control,
  fields,
  append,
  remove,
  move,
  register,
  setValue,
  watch,
  readOnly = false,
  values = [],
}: ProfileTeamFieldProps) {
  if (readOnly) {
    const filled = values.filter((item) => item.name.trim() && item.responsibility.trim());
    if (filled.length === 0) {
      return <p className={profileSectionEmptyClass}>Aucun membre d&apos;équipe ajouté.</p>;
    }
    return (
      <div className="space-y-3">
        {filled.map((member) => {
          const links = (member.socialLinks ?? []).filter((link) => link.url.trim());
          return (
            <div
              key={member.id}
              className="flex gap-4 rounded-xl border border-neutral-200 bg-neutral-50/50 p-4 dark:border-neutral-800 dark:bg-neutral-950/50"
            >
              {member.imageUrl?.trim() ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={member.imageUrl}
                  alt=""
                  className="h-16 w-16 shrink-0 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-neutral-200 text-sm font-semibold text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
                  {member.name.trim().charAt(0).toUpperCase() || '?'}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-neutral-900 dark:text-white">{member.name}</p>
                <p className="text-sm text-neutral-600 dark:text-neutral-300">{member.responsibility}</p>
                {links.length > 0 ? (
                  <ul className="mt-2 flex flex-wrap gap-2 text-xs text-neutral-500 dark:text-neutral-400">
                    {links.map((link) => (
                      <li key={link.id}>
                        <span className="font-medium">{link.platform}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <ProfileSectionItemCount count={fields.length} limit={MAX_TEAM} unit="team members" />

      {fields.length === 0 ? (
        <p className={profileSectionEmptyClass}>Aucun membre d&apos;équipe ajouté.</p>
      ) : (
        fields.map((field, index) => (
          <TeamMemberCard
            key={field.id}
            control={control}
            register={register}
            setValue={setValue}
            watch={watch}
            fieldId={field.id}
            index={index}
            total={fields.length}
            move={move}
            remove={remove}
          />
        ))
      )}

      {fields.length < MAX_TEAM ? (
        <button
          type="button"
          onClick={() => append(createEmptyTeamMember(fields.length))}
          className="rounded-lg border border-dashed border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-600 dark:text-neutral-300 dark:hover:bg-neutral-800"
        >
          Ajouter un membre
        </button>
      ) : null}
    </div>
  );
}

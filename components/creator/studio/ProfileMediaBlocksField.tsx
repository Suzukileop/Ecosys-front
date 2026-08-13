'use client';

import type { Control, FieldArrayWithId, UseFormRegister, UseFormSetValue, UseFormWatch } from 'react-hook-form';
import { useFieldArray, Controller, useFormState, useWatch } from 'react-hook-form';
import {
  ContentMediaPreview,
  useContentMediaUpload,
} from '@/components/creator/creator-content-media';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import {
  createEmptyExperienceProofLink,
  createEmptyProfileBlock,
  inferProfileMediaType,
  type ProfileFormValues,
} from '@/components/creator/studio/profile-form-schema';
import { CreatorToolsPicker } from '@/components/creator/studio/CreatorToolsPicker';
import {
  profileFormInputClass,
  profileSectionEmptyClass,
  profileSectionFieldClass,
  profileSectionSubheadingClass,
} from '@/components/creator/studio/profile-section-ui';

const PROFILE_BLOCK_MEDIA_ACCEPT =
  'image/jpeg,image/png,image/webp,video/mp4,video/webm,video/quicktime,.jpg,.jpeg,.png,.webp,.mp4,.webm,.mov';

const EMPLOYMENT_OPTIONS: { value: NonNullable<ProfileFormValues['experienceBlocks'][number]['employmentType']>; label: string }[] = [
  { value: 'FREELANCE', label: 'Freelance' },
  { value: 'CONTRACT', label: 'Contract' },
  { value: 'FULL_TIME', label: 'Full-time' },
  { value: 'PART_TIME', label: 'Part-time' },
  { value: 'INTERNSHIP', label: 'Internship' },
];

type ProfileMediaBlocksFieldProps = {
  control: Control<ProfileFormValues>;
  name: 'whyMeBlocks' | 'experienceBlocks';
  fields: FieldArrayWithId<ProfileFormValues, 'whyMeBlocks' | 'experienceBlocks', 'id'>[];
  append: (value: ReturnType<typeof createEmptyProfileBlock>) => void;
  remove: (index: number) => void;
  move: (from: number, to: number) => void;
  register: UseFormRegister<ProfileFormValues>;
  watch: UseFormWatch<ProfileFormValues>;
  setValue: UseFormSetValue<ProfileFormValues>;
  readOnly?: boolean;
  /** Why choose me is text-only — no image/video upload or preview. */
  allowMedia?: boolean;
};

function BlockFieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
      {children}
    </label>
  );
}

function ProfileMediaBlockRow({
  index,
  name,
  control,
  register,
  watch,
  setValue,
  readOnly,
  allowMedia,
  onRemove,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
}: {
  index: number;
  name: 'whyMeBlocks' | 'experienceBlocks';
  control: Control<ProfileFormValues>;
  register: UseFormRegister<ProfileFormValues>;
  watch: UseFormWatch<ProfileFormValues>;
  setValue: UseFormSetValue<ProfileFormValues>;
  readOnly?: boolean;
  allowMedia: boolean;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
}) {
  const isExperience = name === 'experienceBlocks';
  const mediaUrl = allowMedia ? watch(`${name}.${index}.mediaUrl`) ?? '' : '';
  const mediaType = allowMedia ? watch(`${name}.${index}.mediaType`) : null;
  const status = watch(`${name}.${index}.status`);
  const { errors } = useFormState({ control });
  const blockLinkErrors =
    name === 'experienceBlocks'
      ? errors.experienceBlocks?.[index]?.links
      : errors.whyMeBlocks?.[index]?.links;
  const { fields: tagFields, append: appendTag, remove: removeTag } = useFieldArray({
    control,
    name: `${name}.${index}.subtitles`,
  });
  const { fields: taskFields, append: appendTask, remove: removeTask } = useFieldArray({
    control,
    name: `${name}.${index}.tasks`,
  });
  const { fields: linkFields, append: appendLink, remove: removeLink } = useFieldArray({
    control,
    name: `${name}.${index}.links`,
  });
  const watchedTools = useWatch({ control, name: `${name}.${index}.tools` });
  const selectedTools = (watchedTools ?? [])
    .filter((item) => item.value.trim())
    .map((item) => ({
      value: item.value,
      iconUrl: item.iconUrl ?? null,
    }));
  const { inputRef, uploading, uploadError, pickFile, onFileChange } = useContentMediaUpload({
    locale: 'en',
    onUrlChange: (url) => {
      if (!allowMedia) return;
      setValue(`${name}.${index}.mediaUrl`, url, { shouldDirty: true });
      setValue(`${name}.${index}.mediaType`, url ? inferProfileMediaType(url) : null, { shouldDirty: true });
    },
  });

  const readOnlyClass = readOnly ? 'cursor-default bg-neutral-50 dark:bg-neutral-900/60' : '';

  return (
    <div className={profileSectionFieldClass}>
      <div className="mb-3 flex items-center justify-between gap-2">
        <p className={profileSectionSubheadingClass}>Block {index + 1}</p>
        {!readOnly && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onMoveUp}
              disabled={!canMoveUp}
              className="text-sm font-medium text-neutral-700 hover:text-neutral-950 disabled:opacity-30 dark:text-neutral-300 dark:hover:text-white"
            >
              Up
            </button>
            <button
              type="button"
              onClick={onMoveDown}
              disabled={!canMoveDown}
              className="text-sm font-medium text-neutral-700 hover:text-neutral-950 disabled:opacity-30 dark:text-neutral-300 dark:hover:text-white"
            >
              Down
            </button>
            <button
              type="button"
              onClick={onRemove}
              className="text-sm font-medium text-red-600 hover:text-red-700 dark:text-red-400"
            >
              Remove
            </button>
          </div>
        )}
      </div>

      {isExperience ? (
        <div className="space-y-3">
          <div>
            <BlockFieldLabel>Status</BlockFieldLabel>
            <div className="flex flex-wrap gap-2">
              {(
                [
                  { value: null, label: 'Not set' },
                  { value: 'ONGOING' as const, label: 'Ongoing' },
                  { value: 'FINISHED' as const, label: 'Finished' },
                ] as const
              ).map((option) => {
                const active = (status ?? null) === option.value;
                return (
                  <button
                    key={option.label}
                    type="button"
                    disabled={readOnly}
                    onClick={() =>
                      setValue(`${name}.${index}.status`, option.value, { shouldDirty: true })
                    }
                    className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                      active
                        ? 'border-neutral-900 bg-neutral-900 text-white'
                        : 'border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-200'
                    } disabled:opacity-60`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <BlockFieldLabel>Period</BlockFieldLabel>
              <input
                type="text"
                readOnly={readOnly}
                placeholder="2021 — present"
                className={`${profileFormInputClass} mt-0 ${readOnlyClass}`}
                {...register(`${name}.${index}.period`)}
              />
            </div>
            <div>
              <BlockFieldLabel>Organization</BlockFieldLabel>
              <input
                type="text"
                readOnly={readOnly}
                placeholder="Freelance, Studio, Agency…"
                className={`${profileFormInputClass} mt-0 ${readOnlyClass}`}
                {...register(`${name}.${index}.organization`)}
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <BlockFieldLabel>Employment type</BlockFieldLabel>
              <Controller
                control={control}
                name={`${name}.${index}.employmentType`}
                render={({ field }) => (
                  <select
                    disabled={readOnly}
                    value={field.value ?? ''}
                    onChange={(event) =>
                      field.onChange(event.target.value ? event.target.value : null)
                    }
                    className={`${profileFormInputClass} mt-0 ${readOnlyClass}`}
                  >
                    <option value="">Not set</option>
                    {EMPLOYMENT_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                )}
              />
            </div>
            <div>
              <BlockFieldLabel>Location</BlockFieldLabel>
              <input
                type="text"
                readOnly={readOnly}
                placeholder="Paris, Remote…"
                className={`${profileFormInputClass} mt-0 ${readOnlyClass}`}
                {...register(`${name}.${index}.location`)}
              />
            </div>
          </div>

          <div>
            <BlockFieldLabel>Job title</BlockFieldLabel>
            <input
              type="text"
              readOnly={readOnly}
              placeholder="Video director & editor"
              className={`${profileFormInputClass} mt-0 ${readOnlyClass}`}
              {...register(`${name}.${index}.title`)}
            />
          </div>
          <div>
            <BlockFieldLabel>Description</BlockFieldLabel>
            <textarea
              rows={3}
              readOnly={readOnly}
              placeholder="What you did, outcomes, scope of work…"
              className={`${profileFormInputClass} mt-0 ${readOnlyClass}`}
              {...register(`${name}.${index}.text`)}
            />
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between gap-2">
              <BlockFieldLabel>Tasks</BlockFieldLabel>
              {!readOnly && (
                <button
                  type="button"
                  disabled={taskFields.length >= 12}
                  onClick={() => appendTask({ value: '' })}
                  className="text-sm font-semibold text-orange-600 hover:text-orange-700 disabled:opacity-40 dark:text-orange-400"
                >
                  + Add task
                </button>
              )}
            </div>
            {taskFields.length === 0 ? (
              <p className="rounded-lg border border-dashed border-neutral-200 px-3 py-3 text-xs text-neutral-500 dark:border-neutral-700">
                No tasks yet — e.g. Directed shoots, Edited trailers, Color graded finals
              </p>
            ) : (
              <div className="space-y-2">
                {taskFields.map((field, taskIndex) => (
                  <div key={field.id} className="flex items-center gap-2">
                    <input
                      readOnly={readOnly}
                      placeholder={`Task ${taskIndex + 1}`}
                      className={`${profileFormInputClass} mt-0 min-w-0 flex-1 ${readOnlyClass}`}
                      {...register(`${name}.${index}.tasks.${taskIndex}.value`)}
                    />
                    {!readOnly && (
                      <button
                        type="button"
                        onClick={() => removeTask(taskIndex)}
                        className="shrink-0 text-sm font-medium text-red-600 dark:text-red-400"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <BlockFieldLabel>Tools</BlockFieldLabel>
            <CreatorToolsPicker
              value={selectedTools}
              readOnly={readOnly}
              max={8}
              emptyLabel="No tools yet."
              onChange={(next) =>
                setValue(
                  `${name}.${index}.tools`,
                  next.map((item) => ({
                    value: item.value,
                    description: '',
                    iconUrl: item.iconUrl ?? null,
                  })),
                  { shouldDirty: true, shouldValidate: true }
                )
              }
            />
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between gap-2">
              <BlockFieldLabel>Proof links</BlockFieldLabel>
              {!readOnly && (
                <button
                  type="button"
                  disabled={linkFields.length >= 5}
                  onClick={() => appendLink(createEmptyExperienceProofLink(linkFields.length))}
                  className="text-sm font-semibold text-orange-600 hover:text-orange-700 disabled:opacity-40 dark:text-orange-400"
                >
                  + Add link
                </button>
              )}
            </div>
            {linkFields.length === 0 ? (
              <p className="rounded-lg border border-dashed border-neutral-200 px-3 py-3 text-xs text-neutral-500 dark:border-neutral-700">
                No proof links — GitHub repo, Facebook page, case study, reel…
              </p>
            ) : (
              <div className="space-y-3">
                {linkFields.map((field, linkIndex) => (
                  <div
                    key={field.id}
                    className="space-y-2 rounded-xl border border-neutral-200/80 p-3 dark:border-neutral-700"
                  >
                    <input
                      readOnly={readOnly}
                      placeholder="Label (e.g. GitHub repo)"
                      className={`${profileFormInputClass} mt-0 ${readOnlyClass}`}
                      {...register(`${name}.${index}.links.${linkIndex}.label`)}
                    />
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <input
                          readOnly={readOnly}
                          type="text"
                          inputMode="url"
                          autoComplete="url"
                          placeholder="https://…"
                          className={`${profileFormInputClass} mt-0 min-w-0 flex-1 ${readOnlyClass}`}
                          aria-invalid={blockLinkErrors?.[linkIndex]?.url ? true : undefined}
                          {...register(`${name}.${index}.links.${linkIndex}.url`)}
                        />
                        {!readOnly && (
                          <button
                            type="button"
                            onClick={() => removeLink(linkIndex)}
                            className="shrink-0 text-sm font-medium text-red-600 dark:text-red-400"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                      {blockLinkErrors?.[linkIndex]?.url?.message ? (
                        <p className="text-xs font-medium text-red-600 dark:text-red-400">
                          {blockLinkErrors[linkIndex]?.url?.message}
                        </p>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <BlockFieldLabel>Remarks</BlockFieldLabel>
            <textarea
              rows={2}
              readOnly={readOnly}
              placeholder="Optional note — NDAs, confidential client, still shipping…"
              className={`${profileFormInputClass} mt-0 ${readOnlyClass}`}
              {...register(`${name}.${index}.remarks`)}
            />
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between gap-2">
              <BlockFieldLabel>Tags</BlockFieldLabel>
              {!readOnly && (
                <button
                  type="button"
                  disabled={tagFields.length >= 10}
                  onClick={() => appendTag({ value: '' })}
                  className="text-sm font-semibold text-orange-600 hover:text-orange-700 disabled:opacity-40 dark:text-orange-400"
                >
                  + Add tag
                </button>
              )}
            </div>
            {tagFields.length === 0 ? (
              <p className="rounded-lg border border-dashed border-neutral-200 px-3 py-3 text-xs text-neutral-500 dark:border-neutral-700">
                No tags yet — e.g. Editing, Motion design, After Effects
              </p>
            ) : (
              <div className="space-y-2">
                {tagFields.map((field, tagIndex) => (
                  <div key={field.id} className="flex items-center gap-2">
                    <input
                      readOnly={readOnly}
                      placeholder={`Tag ${tagIndex + 1}`}
                      className={`${profileFormInputClass} mt-0 min-w-0 flex-1 ${readOnlyClass}`}
                      {...register(`${name}.${index}.subtitles.${tagIndex}.value`)}
                    />
                    {!readOnly && (
                      <button
                        type="button"
                        onClick={() => removeTag(tagIndex)}
                        className="shrink-0 text-sm font-medium text-red-600 dark:text-red-400"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <textarea
          rows={4}
          readOnly={readOnly}
          placeholder="Describe what makes you stand out…"
          className={`${profileFormInputClass} mt-0 ${readOnlyClass}`}
          {...register(`${name}.${index}.text`)}
        />
      )}

      {allowMedia && mediaUrl ? (
        <div className="mt-3 space-y-2">
          <ContentMediaPreview
            locale="en"
            mediaUrl={mediaUrl}
            mediaType={mediaType === 'VIDEO' ? 'FILE' : 'FILE'}
            large
            fluid
          />
          {!readOnly && (
            <button
              type="button"
              onClick={() => {
                setValue(`${name}.${index}.mediaUrl`, '', { shouldDirty: true });
                setValue(`${name}.${index}.mediaType`, null, { shouldDirty: true });
              }}
              className="text-sm font-medium text-neutral-700 hover:text-neutral-950 dark:text-neutral-300 dark:hover:text-white"
            >
              Remove media
            </button>
          )}
        </div>
      ) : null}

      {allowMedia && !readOnly ? (
        <div className="mt-3">
          <input
            ref={inputRef}
            type="file"
            accept={PROFILE_BLOCK_MEDIA_ACCEPT}
            className="hidden"
            onChange={onFileChange}
          />
          <button
            type="button"
            onClick={pickFile}
            disabled={uploading}
            className="inline-flex items-center gap-2 rounded-full border border-neutral-300 px-4 py-2 text-sm font-semibold text-neutral-800 hover:bg-white dark:border-neutral-600 dark:text-neutral-100 dark:hover:bg-neutral-900"
          >
            {uploading && <LoadingSpinner size="sm" />}
            {mediaUrl ? 'Replace image/video' : 'Add image or video'}
          </button>
          {uploadError ? <p className="mt-2 text-xs text-red-600">{uploadError}</p> : null}
        </div>
      ) : null}
    </div>
  );
}

export function ProfileMediaBlocksField({
  control,
  name,
  fields,
  append,
  remove,
  move,
  register,
  watch,
  setValue,
  readOnly = false,
  allowMedia = true,
}: ProfileMediaBlocksFieldProps) {
  if (readOnly) {
    if (fields.length === 0) {
      return <p className={profileSectionEmptyClass}>No blocks added yet.</p>;
    }
    return (
      <div className="space-y-3">
        {fields.map((field, index) => (
          <ProfileMediaBlockRow
            key={field.id}
            index={index}
            name={name}
            control={control}
            register={register}
            watch={watch}
            setValue={setValue}
            readOnly
            allowMedia={allowMedia}
            onRemove={() => undefined}
            onMoveUp={() => undefined}
            onMoveDown={() => undefined}
            canMoveUp={false}
            canMoveDown={false}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {fields.map((field, index) => (
        <ProfileMediaBlockRow
          key={field.id}
          index={index}
          name={name}
          control={control}
          register={register}
          watch={watch}
          setValue={setValue}
          allowMedia={allowMedia}
          onRemove={() => remove(index)}
          onMoveUp={() => move(index, index - 1)}
          onMoveDown={() => move(index, index + 1)}
          canMoveUp={index > 0}
          canMoveDown={index < fields.length - 1}
        />
      ))}
      <button
        type="button"
        onClick={() => append(createEmptyProfileBlock(fields.length))}
        className="inline-flex rounded-full bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600"
      >
        Add block
      </button>
    </div>
  );
}

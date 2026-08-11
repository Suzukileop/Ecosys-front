'use client';

import { useEffect, useRef, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import api from '@/lib/api';
import { getApiErrorMessage } from '@/lib/api-error';
import { useAuth } from '@/context/AuthContext';
import {
  ContentTitleField,
  type ContentTitleFieldHandle,
} from '@/components/creator/ContentTitleField';
import { ContentComposeAudienceControls } from '@/components/creator/ContentComposeAudienceControls';
import { CreatorContentComposeTools } from '@/components/creator/CreatorContentComposeTools';
import {
  ContentComposeMediaPreview,
  useContentMediaUpload,
} from '@/components/creator/creator-content-media';
import { ContentCategorySelect } from '@/components/creator/ContentCategorySelect';
import {
  creatorContentPublishDefaults,
  creatorContentPublishSchema,
  creatorContentPublishStep1Schema,
  type CreatorContentPublishFormValues,
} from '@/components/creator/creator-content-form';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import type { CreatorContentCreateBody } from '@/types/creator-content';

type CreatorContentPublishFormProps = {
  formId: string;
  onCancel: () => void;
  onSuccess: () => void;
  onSubmittingChange?: (submitting: boolean) => void;
  submitError: string | null;
  onSubmitError: (message: string | null) => void;
  onUploadErrorChange?: (message: string | null) => void;
  onStepChange?: (step: 1 | 2) => void;
};

function userInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0] ?? ''}${parts[1]![0] ?? ''}`.toUpperCase();
}

export function CreatorContentPublishForm({
  formId,
  onCancel,
  onSuccess,
  onSubmittingChange,
  submitError,
  onSubmitError,
  onUploadErrorChange,
  onStepChange,
}: CreatorContentPublishFormProps) {
  const { user } = useAuth();
  const [step, setStep] = useState<1 | 2>(1);
  const titleFieldRef = useRef<ContentTitleFieldHandle>(null);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    trigger,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<CreatorContentPublishFormValues>({
    resolver: zodResolver(creatorContentPublishSchema),
    defaultValues: creatorContentPublishDefaults,
    mode: 'onTouched',
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'toolsUsed' });
  const {
    fields: tagFields,
    append: appendTag,
    remove: removeTag,
  } = useFieldArray({ control, name: 'tags' });
  const mediaUrl = watch('mediaUrl');
  const mediaType = watch('mediaType');
  const title = watch('title');
  const genre = watch('genre');
  const moodLabel = watch('moodLabel');
  const moodEmoji = watch('moodEmoji');
  const taggedUsers = watch('taggedUsers');
  const isPublic = watch('isPublic');
  const commentsEnabled = watch('commentsEnabled');

  const media = useContentMediaUpload({
    locale: 'en',
    onUrlChange: (url) => {
      setValue('mediaUrl', url, { shouldValidate: true });
      setValue('mediaType', 'FILE', { shouldValidate: true });
    },
  });

  useEffect(() => {
    onUploadErrorChange?.(media.uploadError);
  }, [media.uploadError, onUploadErrorChange]);

  useEffect(() => {
    onStepChange?.(step);
  }, [onStepChange, step]);

  const hasMedia = Boolean(mediaUrl?.trim());

  const goToStep2 = async () => {
    onSubmitError(null);
    const values = getValues();
    const parsed = creatorContentPublishStep1Schema.safeParse({
      title: values.title,
      mediaUrl: values.mediaUrl,
      mediaType: values.mediaType,
      moodLabel: values.moodLabel,
      moodEmoji: values.moodEmoji,
      taggedUsers: values.taggedUsers,
    });
    if (!parsed.success) {
      await trigger(['mediaUrl']);
      return;
    }
    setStep(2);
  };

  const goToStep1 = () => {
    onSubmitError(null);
    setStep(1);
  };

  const publishContent = async (data: CreatorContentPublishFormValues) => {
    onSubmitError(null);
    onSubmittingChange?.(true);
    const tools = data.toolsUsed.map((t) => t.value.trim()).filter(Boolean);
    const tags = data.tags.map((t) => t.value.trim()).filter(Boolean);
    const body: CreatorContentCreateBody = {
      title: data.title?.trim() || null,
      genre: data.genre?.trim() || null,
      description: data.description?.trim() || null,
      mediaUrl: data.mediaUrl.trim(),
      mediaType: data.mediaType ?? 'FILE',
      moodLabel: data.moodLabel ?? null,
      moodEmoji: data.moodEmoji ?? null,
      taggedUserIds: data.taggedUsers.map((u) => u.id),
      priceInfo: data.priceInfo?.trim() || null,
      toolsUsed: tools,
      tags,
      isPublic: data.isPublic,
      commentsEnabled: data.commentsEnabled,
    };
    try {
      await api.post('/api/creator/content', body);
      onSuccess();
    } catch (e) {
      onSubmitError(getApiErrorMessage(e, 'Unable to publish content.'));
    } finally {
      onSubmittingChange?.(false);
    }
  };

  const onFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (step === 1) {
      void goToStep2();
      return;
    }
    void handleSubmit(publishContent)(e);
  };

  const borderlessField =
    'w-full border-0 border-b border-neutral-200/90 bg-transparent px-0 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-500 focus:border-orange-400/70 focus:outline-none focus:ring-0 dark:border-neutral-700 dark:text-white dark:placeholder:text-neutral-400';

  const detailLabel = 'text-[11px] font-medium uppercase tracking-[0.14em] text-neutral-400';

  const listAddBtn =
    'shrink-0 text-xs font-semibold text-orange-600 transition hover:text-orange-700 disabled:opacity-40 dark:text-orange-400';

  const creatorName = user?.fullName ?? 'You';

  return (
    <div className={step === 2 ? 'flex min-h-0 flex-1 flex-col' : 'flex flex-col'}>
      {submitError && (
        <div className="mb-3 shrink-0">
          <ErrorAlert message={submitError} onDismiss={() => onSubmitError(null)} />
        </div>
      )}

      <form
        id={formId}
        className={step === 2 ? 'flex min-h-0 flex-1 flex-col' : 'flex flex-col'}
        onSubmit={onFormSubmit}
        noValidate
      >
        <input
          ref={media.inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime,application/pdf,.jpg,.jpeg,.png,.webp,.gif,.mp4,.webm,.mov,.pdf"
          className="sr-only"
          onChange={(e) => void media.onFileChange(e)}
        />

        {step === 1 ? (
          <div className="space-y-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex min-w-0 items-center gap-3">
                {user?.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={user.avatarUrl}
                    alt=""
                    className="h-10 w-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-500 text-sm font-bold text-white">
                    {userInitials(creatorName)}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-neutral-900 dark:text-white">{creatorName}</p>
                  <p className="text-xs text-neutral-400">Creator Studio</p>
                </div>
              </div>
              <ContentComposeAudienceControls
                isPublic={isPublic}
                commentsEnabled={commentsEnabled}
                onPublicChange={(v) => setValue('isPublic', v, { shouldValidate: true })}
                onCommentsChange={(v) => setValue('commentsEnabled', v, { shouldValidate: true })}
              />
            </div>

            {(moodLabel || taggedUsers.length > 0) && (
              <div className="flex flex-wrap gap-1.5">
                {moodLabel && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-700 dark:bg-neutral-800 dark:text-neutral-200">
                    {moodEmoji} <span className="capitalize">{moodLabel}</span>
                  </span>
                )}
                {taggedUsers.map((u) => (
                  <span
                    key={u.id}
                    className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
                  >
                    @{u.fullName}
                  </span>
                ))}
              </div>
            )}

            <ContentTitleField
              ref={titleFieldRef}
              id="content-title"
              value={title ?? ''}
              onChange={(v) => setValue('title', v, { shouldValidate: true })}
              placeholder="Post headline"
              error={errors.title?.message}
              rows={3}
              size="compose"
            />

            {hasMedia && (
              <ContentComposeMediaPreview
                locale="en"
                mediaUrl={mediaUrl ?? ''}
                fileName={media.fileName}
                mediaType={mediaType}
                onRemove={() => {
                  setValue('mediaUrl', '', { shouldValidate: true });
                  setValue('mediaType', 'FILE', { shouldValidate: true });
                  media.setFileName(null);
                }}
              />
            )}
            {errors.mediaUrl && (
              <p className="text-xs text-red-600">{errors.mediaUrl.message}</p>
            )}

            <CreatorContentComposeTools
              locale="en"
              moodLabel={moodLabel ?? null}
              moodEmoji={moodEmoji ?? null}
              taggedUsers={taggedUsers}
              hasMedia={hasMedia}
              onMoodChange={(mood) => {
                setValue('moodLabel', mood?.label ?? null, { shouldValidate: true });
                setValue('moodEmoji', mood?.emoji ?? null, { shouldValidate: true });
              }}
              onTaggedUsersChange={(users) => setValue('taggedUsers', users, { shouldValidate: true })}
              onMediaPick={() => media.pickFile()}
              onInsertEmoji={(emoji) => titleFieldRef.current?.insertEmoji(emoji)}
              mediaUploading={media.uploading}
            />
          </div>
        ) : (
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pr-0.5">
            <div className="space-y-8">
              <p className="text-xs text-neutral-400">Everything below is optional.</p>

              <div className="grid gap-8 sm:grid-cols-2 sm:gap-6">
                <ContentCategorySelect
                  id="content-genre"
                  value={genre ?? ''}
                  onChange={(next) => setValue('genre', next, { shouldValidate: true, shouldDirty: true })}
                  labelClass={detailLabel}
                  fieldClass={borderlessField}
                />
                <div className="space-y-1.5">
                  <label htmlFor="content-price" className={detailLabel}>
                    Price to recreate
                  </label>
                  <input
                    id="content-price"
                    className={borderlessField}
                    placeholder="e.g. 500 Ar"
                    title="What you would charge to produce the same montage again"
                    {...register('priceInfo')}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="content-description" className={detailLabel}>
                  Description
                </label>
                <textarea
                  id="content-description"
                  rows={3}
                  className={`${borderlessField} resize-none`}
                  placeholder="Describe your content…"
                  {...register('description')}
                />
                {errors.description && <p className="text-xs text-red-600">{errors.description.message}</p>}
              </div>

              <div className="space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className={detailLabel}>Tags</p>
                    <button
                      type="button"
                      disabled={tagFields.length >= 10}
                      onClick={() => appendTag({ value: '' })}
                      className={listAddBtn}
                    >
                      + Add tag
                    </button>
                  </div>
                  {tagFields.length > 0 && (
                    <ul className="space-y-2">
                      {tagFields.map((field, index) => (
                        <li key={field.id} className="flex items-center gap-2">
                          <input
                            className={borderlessField}
                            placeholder="Tag name"
                            {...register(`tags.${index}.value` as const)}
                          />
                          <button
                            type="button"
                            onClick={() => removeTag(index)}
                            className="shrink-0 px-1 py-2 text-sm text-neutral-400 transition hover:text-neutral-700 dark:hover:text-neutral-200"
                            aria-label="Remove tag"
                          >
                            ✕
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="space-y-3 border-t border-neutral-100 pt-6 dark:border-neutral-800/80">
                  <div className="flex items-center justify-between gap-3">
                    <p className={detailLabel}>Tools used</p>
                    <button
                      type="button"
                      disabled={fields.length >= 10}
                      onClick={() => append({ value: '' })}
                      className={listAddBtn}
                    >
                      + Add tool
                    </button>
                  </div>
                  {fields.length > 0 && (
                    <ul className="space-y-2">
                      {fields.map((field, index) => (
                        <li key={field.id} className="flex items-center gap-2">
                          <input
                            className={borderlessField}
                            placeholder="Tool name"
                            {...register(`toolsUsed.${index}.value` as const)}
                          />
                          <button
                            type="button"
                            onClick={() => remove(index)}
                            className="shrink-0 px-1 py-2 text-sm text-neutral-400 transition hover:text-neutral-700 dark:hover:text-neutral-200"
                            aria-label="Remove tool"
                          >
                            ✕
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                  {errors.toolsUsed && <p className="text-xs text-red-600">{errors.toolsUsed.message}</p>}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 flex shrink-0 flex-col gap-3 border-t border-neutral-100/80 pt-5 dark:border-neutral-800/80 sm:flex-row sm:items-center sm:justify-between">
          <div>
            {step === 2 ? (
              <button
                type="button"
                onClick={goToStep1}
                disabled={isSubmitting}
                className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-800 disabled:opacity-50 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
                Back
              </button>
            ) : (
              <p className="text-xs text-neutral-400">
                {isPublic ? 'Visible in the feed' : 'Visible only to you'}
                {commentsEnabled ? ' · Comments on' : ' · Comments off'}
              </p>
            )}
          </div>

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="rounded-xl px-5 py-2.5 text-sm font-medium text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-800 disabled:opacity-50 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
            >
              Cancel
            </button>
            {step === 1 ? (
              <button
                type="submit"
                aria-label="Continue to details"
                className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-orange-500 text-white transition hover:bg-orange-600"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center justify-center rounded-xl bg-orange-500 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <LoadingSpinner size="sm" />
                    <span className="ml-2">Publishing…</span>
                  </>
                ) : (
                  'Publish'
                )}
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}

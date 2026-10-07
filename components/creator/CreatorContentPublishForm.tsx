'use client';

import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import api from '@/lib/api';
import { getApiErrorMessage } from '@/lib/api-error';
import { useAuth } from '@/context/AuthContext';
import {
  ContentTitleField,
  type ContentTitleFieldHandle,
} from '@/components/creator/ContentTitleField';
import { CreatorContentComposeTools } from '@/components/creator/CreatorContentComposeTools';
import { ContentComposeMedia } from '@/components/creator/ContentComposeMedia';
import { useContentGalleryUpload } from '@/components/creator/creator-content-media';
import {
  CREATOR_CONTENT_TITLE_MAX,
  creatorContentPublishDefaults,
  creatorContentPublishSchema,
  type CreatorContentPublishFormValues,
} from '@/components/creator/creator-content-form';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { AvatarImage } from '@/components/ui/PersonAvatar';
import type { CreatorContentCreateBody } from '@/types/creator-content';
import {
  creatorComposePlaceholder,
  creatorComposeShowsDetails,
  normalizeCreatorAppRole,
} from '@/lib/creator-app-role';

type CreatorContentPublishFormProps = {
  formId: string;
  onCancel: () => void;
  onSuccess: () => void;
  onSubmittingChange?: (submitting: boolean) => void;
  submitError: string | null;
  onSubmitError: (message: string | null) => void;
  onUploadErrorChange?: (message: string | null) => void;
  onStepChange?: (step: 1 | 2) => void;
  appRole?: string | null;
};

const MAX_LIST_ITEMS = 10;

const FIELD_CLASS =
  'block w-full rounded-lg border border-black/[0.14] bg-transparent px-3.5 py-2.5 text-[15px] font-medium text-[#111111] caret-[#FF5722] outline-none transition-[border-color,box-shadow] duration-150 placeholder:font-normal placeholder:text-neutral-400 hover:border-black/30 focus:border-[#FF5722] focus:shadow-[0_0_0_3px_rgba(255,87,34,0.16)] focus:ring-0 dark:border-white/[0.16] dark:text-white dark:placeholder:text-neutral-600 dark:hover:border-white/30 dark:focus:border-[#FF5722]';

const LABEL_CLASS = 'mb-2 block text-[14px] font-semibold text-[#111111] dark:text-neutral-200';

const ROUND_ICON_BUTTON_CLASS =
  'inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-transparent text-[#111111] outline-none transition-colors duration-150 hover:border-black/[0.08] hover:bg-black/[0.06] focus-visible:border-[#FF5722] disabled:pointer-events-none disabled:opacity-40 dark:text-white dark:hover:border-white/[0.12] dark:hover:bg-white/[0.1]';

const POST_BUTTON_CLASS =
  'inline-flex h-9 items-center justify-center gap-2 rounded-full bg-[#111111] px-5 text-[15px] font-semibold text-white transition-opacity hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-35 dark:bg-white dark:text-[#111111]';

function userInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0] ?? ''}${parts[1]![0] ?? ''}`.toUpperCase();
}

function CharCounter({ length, max }: { length: number; max: number }) {
  if (length === 0) return null;
  const remaining = max - length;
  const warn = remaining <= 20;
  const radius = 9;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(1, length / max);
  const strokeClass =
    remaining <= 0 ? 'stroke-[#FF5722]' : warn ? 'stroke-amber-500' : 'stroke-neutral-500 dark:stroke-neutral-400';
  return (
    <span className="relative inline-flex h-6 w-6 items-center justify-center" aria-label={`${remaining} characters left`}>
      <svg className="h-6 w-6 -rotate-90" viewBox="0 0 24 24" aria-hidden>
        <circle cx="12" cy="12" r={radius} fill="none" strokeWidth="2" className="stroke-black/[0.1] dark:stroke-white/[0.14]" />
        <circle
          cx="12"
          cy="12"
          r={radius}
          fill="none"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - progress)}
          className={`transition-[stroke-dashoffset] duration-150 ${strokeClass}`}
        />
      </svg>
      {warn ? (
        <span className={`absolute text-[10px] font-semibold tabular-nums ${remaining <= 0 ? 'text-[#FF5722]' : 'text-neutral-500'}`}>
          {remaining}
        </span>
      ) : null}
    </span>
  );
}

function AudiencePill({ isPublic, onChange }: { isPublic: boolean; onChange: (isPublic: boolean) => void }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  const options = [
    { value: true, label: 'Everyone', hint: 'Visible in the feed', icon: <GlobeIcon className="h-4 w-4" /> },
    { value: false, label: 'Only me', hint: 'Saved privately to your studio', icon: <LockIcon className="h-4 w-4" /> },
  ];

  return (
    <div ref={rootRef} className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="inline-flex h-7 items-center gap-1 rounded-full border border-black/[0.14] px-3 text-[14px] font-semibold text-[#111111] transition-colors hover:bg-black/[0.04] dark:border-white/[0.18] dark:text-white dark:hover:bg-white/[0.06]"
      >
        {isPublic ? 'Everyone' : 'Only me'}
        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.25} aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open ? (
        <div
          role="menu"
          className="absolute left-0 top-full z-30 mt-2 w-64 overflow-hidden rounded-xl border border-black/[0.08] bg-white py-1.5 shadow-[0_12px_40px_-12px_rgba(0,0,0,0.3)] dark:border-white/[0.1] dark:bg-[#111111]"
        >
          <p className="px-4 pb-1.5 pt-1 text-[14px] font-semibold text-[#111111] dark:text-white">Choose audience</p>
          {options.map((option) => {
            const selected = option.value === isPublic;
            return (
              <button
                key={option.label}
                type="button"
                role="menuitemradio"
                aria-checked={selected}
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-black/[0.04] dark:hover:bg-white/[0.06]"
              >
                <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-black/[0.05] text-[#111111] dark:bg-white/[0.08] dark:text-white">
                  {option.icon}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[15px] font-semibold text-[#111111] dark:text-white">{option.label}</span>
                  <span className="block text-[13px] text-neutral-500 dark:text-neutral-400">{option.hint}</span>
                </span>
                {selected ? (
                  <svg className="h-4 w-4 shrink-0 text-[#111111] dark:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : null}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

function ChipListField({
  id,
  label,
  items,
  placeholder,
  onAdd,
  onRemove,
  error,
}: {
  id: string;
  label: string;
  items: { id: string; value: string }[];
  placeholder: string;
  onAdd: (value: string) => void;
  onRemove: (index: number) => void;
  error?: string;
}) {
  const [draft, setDraft] = useState('');
  const full = items.length >= MAX_LIST_ITEMS;

  const commit = (raw: string) => {
    const value = raw.trim().replace(/,$/, '').trim();
    setDraft('');
    if (!value || full) return;
    if (items.some((item) => item.value.toLowerCase() === value.toLowerCase())) return;
    onAdd(value);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      commit(draft);
    } else if (event.key === 'Backspace' && !draft && items.length > 0) {
      onRemove(items.length - 1);
    }
  };

  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className={LABEL_CLASS}>
          {label}
        </label>
        <span className="text-[13px] tabular-nums text-neutral-400">
          {items.length} / {MAX_LIST_ITEMS}
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-2 rounded-lg border border-black/[0.14] px-3 py-2 transition-[border-color,box-shadow] duration-150 focus-within:border-[#FF5722] focus-within:shadow-[0_0_0_3px_rgba(255,87,34,0.16)] hover:border-black/30 dark:border-white/[0.16] dark:hover:border-white/30 dark:focus-within:border-[#FF5722]">
        {items.map((item, index) => (
          <span
            key={item.id}
            className="inline-flex items-center gap-1 rounded-full border border-black/[0.1] py-0.5 pl-3 pr-1 text-[14px] font-medium text-[#111111] dark:border-white/[0.14] dark:text-white"
          >
            {item.value}
            <button
              type="button"
              onClick={() => onRemove(index)}
              aria-label={`Remove ${item.value}`}
              className="inline-flex h-5 w-5 items-center justify-center rounded-full text-neutral-400 transition-colors hover:text-[#111111] dark:hover:text-white"
            >
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </span>
        ))}
        {!full ? (
          <input
            id={id}
            value={draft}
            maxLength={60}
            onChange={(event) => {
              const value = event.target.value;
              if (value.endsWith(',')) commit(value);
              else setDraft(value);
            }}
            onKeyDown={onKeyDown}
            onBlur={() => commit(draft)}
            placeholder={items.length === 0 ? placeholder : 'Add another'}
            className="min-w-[8rem] flex-1 border-0 bg-transparent p-0 py-1 text-[15px] font-medium text-[#111111] caret-[#FF5722] outline-none placeholder:font-normal placeholder:text-neutral-400 focus:ring-0 dark:text-white dark:placeholder:text-neutral-600"
          />
        ) : null}
      </div>
      {error ? <p className="mt-2 text-[14px] font-medium text-[#FF5722]">{error}</p> : null}
    </div>
  );
}

function Field({ label, htmlFor, children }: { label: string; htmlFor: string; children: ReactNode }) {
  return (
    <div className="min-w-0">
      <label htmlFor={htmlFor} className={LABEL_CLASS}>
        {label}
      </label>
      {children}
    </div>
  );
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
  appRole,
}: CreatorContentPublishFormProps) {
  const { user } = useAuth();
  const role = normalizeCreatorAppRole(appRole);
  const showDetails = creatorComposeShowsDetails(role);
  const [step, setStep] = useState<1 | 2>(1);
  const titleFieldRef = useRef<ContentTitleFieldHandle>(null);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CreatorContentPublishFormValues>({
    resolver: zodResolver(creatorContentPublishSchema),
    defaultValues: creatorContentPublishDefaults,
    mode: 'onTouched',
  });

  const { fields: toolFields, append: appendTool, remove: removeTool } = useFieldArray({ control, name: 'toolsUsed' });
  const { fields: tagFields, append: appendTag, remove: removeTag } = useFieldArray({ control, name: 'tags' });
  const mediaUrls = watch('mediaUrls');
  const mediaType = watch('mediaType');
  const title = watch('title') ?? '';
  const description = watch('description') ?? '';
  const moodLabel = watch('moodLabel');
  const moodEmoji = watch('moodEmoji');
  const taggedUsers = watch('taggedUsers');
  const isPublic = watch('isPublic');
  const commentsEnabled = watch('commentsEnabled');

  const media = useContentGalleryUpload({
    locale: 'en',
    urls: mediaUrls,
    onChange: (urls) => {
      setValue('mediaUrls', urls, { shouldValidate: true });
      /* The cover stays in `mediaUrl`, so every surface that only knows one media keeps working. */
      setValue('mediaUrl', urls[0] ?? '', { shouldValidate: true });
      setValue('mediaType', 'FILE', { shouldValidate: true });
    },
  });

  useEffect(() => {
    onUploadErrorChange?.(media.uploadError);
  }, [media.uploadError, onUploadErrorChange]);

  useEffect(() => {
    onStepChange?.(step);
  }, [onStepChange, step]);

  const hasMedia = mediaUrls.length > 0;
  const canPost = (Boolean(title.trim()) || Boolean(description.trim()) || hasMedia) && !media.uploading;
  const detailsCount =
    (description.trim() ? 1 : 0) + (watch('priceInfo')?.trim() ? 1 : 0) + tagFields.length + toolFields.length;

  const publishContent = async (data: CreatorContentPublishFormValues) => {
    onSubmitError(null);
    onSubmittingChange?.(true);
    const body: CreatorContentCreateBody = {
      title: data.title?.trim() || null,
      genre: null,
      description: data.description?.trim() || null,
      mediaUrl: data.mediaUrls[0]?.trim() || data.mediaUrl.trim() || null,
      mediaUrls: data.mediaUrls,
      mediaType: data.mediaType ?? 'FILE',
      moodLabel: data.moodLabel ?? null,
      moodEmoji: data.moodEmoji ?? null,
      taggedUserIds: data.taggedUsers.map((u) => u.id),
      priceInfo: data.priceInfo?.trim() || null,
      toolsUsed: data.toolsUsed.map((t) => t.value.trim()).filter(Boolean),
      tags: data.tags.map((t) => t.value.trim()).filter(Boolean),
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
    if (!canPost || isSubmitting) return;
    void handleSubmit(publishContent)(e);
  };

  const creatorName = user?.fullName ?? 'You';

  const postButton = (
    <button type="submit" disabled={!canPost || isSubmitting} className={POST_BUTTON_CLASS}>
      {isSubmitting ? (
        <>
          <LoadingSpinner size="sm" />
          Posting…
        </>
      ) : (
        'Post'
      )}
    </button>
  );

  const errorLine = submitError ? (
    <div className="flex items-start justify-between gap-3 text-[14px] font-medium text-red-600 dark:text-red-400" role="alert">
      <span>{submitError}</span>
      <button type="button" onClick={() => onSubmitError(null)} className="shrink-0 underline-offset-2 hover:underline">
        Dismiss
      </button>
    </div>
  ) : null;

  return (
    <form
      id={formId}
      className={step === 2 ? 'flex min-h-0 flex-1 flex-col' : 'flex flex-col'}
      onSubmit={onFormSubmit}
      onKeyDown={(event) => {
        if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
          event.preventDefault();
          event.currentTarget.requestSubmit();
        }
      }}
      noValidate
    >
      <input
        ref={media.inputRef}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime,application/pdf,.jpg,.jpeg,.png,.webp,.gif,.mp4,.webm,.mov,.pdf"
        className="sr-only"
        onChange={(e) => void media.onFilesChange(e)}
      />

      {step === 1 ? (
        <>
          <div className="flex items-center justify-between px-3 pt-3 sm:px-4">
            <button type="button" onClick={onCancel} disabled={isSubmitting} className={ROUND_ICON_BUTTON_CLASS} aria-label="Close">
              <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex gap-3 px-4 pb-3 pt-1 sm:px-5">
            {/* AvatarImage resolves the stored URL (relative upload paths, rendition params) and falls
                back to initials on a load error — a bare <img> rendered as a broken icon. */}
            <AvatarImage
              src={user?.avatarUrl}
              className="h-10 w-10 shrink-0 rounded-full object-cover"
              displayWidth={40}
              fallback={
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#111111] text-[13px] font-semibold text-white dark:bg-white dark:text-[#111111]">
                  {userInitials(creatorName)}
                </div>
              }
            />

            <div className="min-w-0 flex-1">
              <AudiencePill isPublic={isPublic} onChange={(v) => setValue('isPublic', v, { shouldValidate: true })} />

              <ContentTitleField
                ref={titleFieldRef}
                id="content-title"
                value={title}
                onChange={(v) => setValue('title', v, { shouldValidate: true })}
                placeholder={creatorComposePlaceholder(role)}
                error={errors.title?.message}
                rows={3}
                size="compose"
                maxLength={CREATOR_CONTENT_TITLE_MAX}
                autoFocus
              />

              {taggedUsers.length > 0 ? (
                <p className="mb-3 text-[14px] text-neutral-500 dark:text-neutral-400">
                  with{' '}
                  <span className="font-medium text-[#111111] dark:text-white">
                    {taggedUsers.map((u) => u.fullName).join(', ')}
                  </span>
                </p>
              ) : null}

              {hasMedia || media.uploading ? (
                <div className="mb-3">
                  <ContentComposeMedia
                    urls={mediaUrls}
                    mediaType={mediaType}
                    fileName={media.fileName}
                    uploading={media.uploading}
                    onRemoveAt={media.removeAt}
                    onMakeCover={media.makeCover}
                    onAddMore={media.pickFiles}
                    onClear={media.clear}
                  />
                </div>
              ) : null}

              <button
                type="button"
                onClick={() => setValue('commentsEnabled', !commentsEnabled, { shouldValidate: true })}
                aria-pressed={commentsEnabled}
                className="-ml-2 inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[14px] font-medium text-neutral-500 transition-colors hover:bg-black/[0.04] hover:text-[#111111] dark:text-neutral-400 dark:hover:bg-white/[0.06] dark:hover:text-white"
              >
                {commentsEnabled ? <ChatIcon className="h-4 w-4" /> : <ChatOffIcon className="h-4 w-4" />}
                {commentsEnabled ? (isPublic ? 'Everyone can comment' : 'Comments on') : 'Comments off'}
              </button>

              <div className="mt-3 flex flex-wrap items-center justify-between gap-x-3 gap-y-2 border-t border-black/[0.08] pt-3 dark:border-white/[0.08]">
                <CreatorContentComposeTools
                  locale="en"
                  variant="icons"
                  showMood={false}
                  moodLabel={moodLabel ?? null}
                  moodEmoji={moodEmoji ?? null}
                  taggedUsers={taggedUsers}
                  hasMedia={hasMedia}
                  onMoodChange={(mood) => {
                    setValue('moodLabel', mood?.label ?? null, { shouldValidate: true });
                    setValue('moodEmoji', mood?.emoji ?? null, { shouldValidate: true });
                  }}
                  onTaggedUsersChange={(users) => setValue('taggedUsers', users, { shouldValidate: true })}
                  onMediaPick={() => media.pickFiles()}
                  onInsertEmoji={(emoji) => titleFieldRef.current?.insertEmoji(emoji)}
                  mediaUploading={media.uploading}
                />

                <div className="ml-auto flex shrink-0 items-center gap-3">
                  <CharCounter length={title.length} max={CREATOR_CONTENT_TITLE_MAX} />
                  {title.length > 0 ? <span className="h-6 w-px bg-black/[0.1] dark:bg-white/[0.14]" aria-hidden /> : null}
                  {showDetails ? (
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-[15px] font-medium text-neutral-600 transition-colors hover:bg-black/[0.05] hover:text-[#111111] dark:text-neutral-300 dark:hover:bg-white/[0.08] dark:hover:text-white"
                  >
                    Details
                    {detailsCount > 0 ? (
                      <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-black/[0.08] px-1.5 text-[11px] font-semibold tabular-nums text-[#111111] dark:bg-white/[0.12] dark:text-white">
                        {detailsCount}
                      </span>
                    ) : null}
                  </button>
                  ) : null}
                  {postButton}
                </div>
              </div>

              {errorLine ? <div className="mt-3">{errorLine}</div> : null}
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="flex shrink-0 items-center gap-2 border-b border-black/[0.08] px-3 py-3 dark:border-white/[0.08] sm:px-4">
            <button
              type="button"
              onClick={() => {
                onSubmitError(null);
                setStep(1);
              }}
              disabled={isSubmitting}
              className={ROUND_ICON_BUTTON_CLASS}
              aria-label="Back to post"
            >
              <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5m6-6l-6 6 6 6" />
              </svg>
            </button>
            <h2 className="text-[17px] font-bold tracking-[-0.01em] text-[#111111] dark:text-white">Details</h2>
            <span className="ml-auto pr-2 text-[14px] text-neutral-400">All optional</span>
          </div>

          <div className="min-h-0 flex-1 space-y-8 overflow-y-auto overscroll-contain px-5 py-7 sm:px-6 [scrollbar-width:thin]">
            <Field label="Description" htmlFor="content-description">
              <textarea
                id="content-description"
                rows={3}
                maxLength={2000}
                placeholder="Tell the story behind this post"
                className={`${FIELD_CLASS} min-h-[5.5rem] resize-none leading-relaxed [field-sizing:content]`}
                {...register('description')}
              />
            </Field>

            <div>
              <Field label="Price to recreate" htmlFor="content-price">
                <input
                  id="content-price"
                  className={FIELD_CLASS}
                  placeholder="e.g. 500 €"
                  title="What you would charge to produce the same work again"
                  {...register('priceInfo')}
                />
              </Field>
            </div>

            <ChipListField
              id="content-tags"
              label="Tags"
              items={tagFields}
              placeholder="Type a tag and press Enter"
              onAdd={(value) => appendTag({ value })}
              onRemove={removeTag}
            />

            <ChipListField
              id="content-tools"
              label="Tools used"
              items={toolFields}
              placeholder="Figma, After Effects…"
              onAdd={(value) => appendTool({ value })}
              onRemove={removeTool}
              error={errors.toolsUsed?.message}
            />
          </div>

          <div className="flex shrink-0 flex-col gap-3 border-t border-black/[0.08] px-5 py-3 dark:border-white/[0.08] sm:px-6">
            {errorLine}
            <div className="flex items-center justify-between gap-3">
              <p className="text-[14px] text-neutral-500 dark:text-neutral-400">
                {isPublic ? 'Everyone' : 'Only me'} · {commentsEnabled ? 'Comments on' : 'Comments off'}
              </p>
              {postButton}
            </div>
          </div>
        </>
      )}
    </form>
  );
}

function GlobeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12h18M12 3a14 14 0 010 18M12 3a14 14 0 000 18" />
    </svg>
  );
}

function LockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 11V7a4 4 0 018 0v4" />
    </svg>
  );
}

function ChatIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
      />
    </svg>
  );
}

function ChatOffIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
      />
      <path strokeLinecap="round" d="M4 4l16 16" />
    </svg>
  );
}

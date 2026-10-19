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
import { useT } from '@/lib/i18n/I18nProvider';

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

/* Soft filled fields (the profile / News language): a quiet tone at rest, an ink ring when typing. */
const FIELD_CLASS =
  'block w-full rounded-lg border-0 bg-[#F7F9F9] px-3.5 py-3 text-[15px] text-[#0F1419] caret-current outline-hidden transition-[background-color,box-shadow] duration-150 placeholder:text-[#536471] focus:bg-white focus:shadow-[inset_0_0_0_1.5px_#0F1419] focus:ring-0 dark:bg-[#16181C] dark:text-[#E7E9EA] dark:placeholder:text-[#71767B] dark:focus:bg-black dark:focus:shadow-[inset_0_0_0_1.5px_#E7E9EA]';

const LABEL_CLASS = 'mb-2 block text-[14px] font-semibold text-[#0F1419] dark:text-[#E7E9EA]';

const ROUND_ICON_BUTTON_CLASS =
  '-ml-1 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[#0F1419] outline-hidden transition-colors duration-150 hover:bg-[rgba(15,20,25,0.1)] focus-visible:ring-2 focus-visible:ring-[#0F1419]/40 disabled:pointer-events-none disabled:opacity-40 dark:text-[#E7E9EA] dark:hover:bg-[rgba(231,233,234,0.1)] dark:focus-visible:ring-[#E7E9EA]/50';

/* Facebook's full-width Post: 44px, 8px corners, ink — the one primary of the sheet. */
const POST_BUTTON_CLASS =
  'inline-flex h-11 min-w-0 flex-1 items-center justify-center gap-2 rounded-lg bg-[#0F1419] px-5 text-[15px] font-bold text-white transition-colors hover:bg-[#272C30] disabled:cursor-not-allowed disabled:opacity-40 dark:bg-[#EFF3F4] dark:text-[#0F1419] dark:hover:bg-[#D7DBDC]';

/* Small soft chips under the author's name (audience, comments, details). */
const CHIP_CLASS =
  'inline-flex h-7 items-center gap-1.5 rounded-md bg-[#EFF3F4] px-2.5 text-[13px] font-semibold text-[#0F1419] transition-colors hover:bg-[#E1E8ED] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#0F1419]/30 dark:bg-[#202327] dark:text-[#E7E9EA] dark:hover:bg-[#2F3336] dark:focus-visible:ring-white/30';

/* Sheet header: icon button · centred title · balancing spacer, then a hairline (Facebook). */
const SHEET_HEADER_CLASS =
  'grid shrink-0 grid-cols-[2.5rem_minmax(0,1fr)_2.5rem] items-center border-b border-[#EFF3F4] px-3 pb-2.5 pt-2 dark:border-[#2F3336] sm:px-4 sm:pt-3';

function userInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0] ?? ''}${parts[1]![0] ?? ''}`.toUpperCase();
}

function CharCounter({ length, max }: { length: number; max: number }) {
  const t = useT();
  if (length === 0) return null;
  const remaining = max - length;
  const warn = remaining <= 20;
  const radius = 9;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(1, length / max);
  const strokeClass =
    remaining <= 0 ? 'stroke-[#F4212E]' : warn ? 'stroke-[#0F1419] dark:stroke-[#E7E9EA]' : 'stroke-[#536471] dark:stroke-[#71767B]';
  return (
    <span className="relative inline-flex h-6 w-6 items-center justify-center" aria-label={t('{remaining} characters left', { remaining })}>
      <svg className="h-6 w-6 -rotate-90" viewBox="0 0 24 24" aria-hidden>
        <circle cx="12" cy="12" r={radius} fill="none" strokeWidth="2" className="stroke-[#EFF3F4] dark:stroke-[#2F3336]" />
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
        <span className={`absolute text-[10px] font-semibold tabular-nums ${remaining <= 0 ? 'text-[#F4212E]' : 'text-[#536471] dark:text-[#71767B]'}`}>
          {remaining}
        </span>
      ) : null}
    </span>
  );
}

function AudiencePill({ isPublic, onChange }: { isPublic: boolean; onChange: (isPublic: boolean) => void }) {
  const t = useT();
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
    { value: true, label: t('Everyone'), hint: t('Visible in the feed'), icon: <GlobeIcon className="h-4 w-4" /> },
    { value: false, label: t('Only me'), hint: t('Saved privately to your studio'), icon: <LockIcon className="h-4 w-4" /> },
  ];

  return (
    <div ref={rootRef} className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className={CHIP_CLASS}
      >
        {isPublic ? <GlobeIcon className="h-3.5 w-3.5" /> : <LockIcon className="h-3.5 w-3.5" />}
        {isPublic ? t('Everyone') : t('Only me')}
        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open ? (
        <div
          role="menu"
          className="absolute left-0 top-full z-30 mt-2 w-64 overflow-hidden rounded-2xl bg-white py-1.5 shadow-[0_0_15px_rgba(101,119,134,0.2),0_0_3px_1px_rgba(101,119,134,0.15)] dark:bg-black dark:shadow-[0_0_15px_rgba(255,255,255,0.2),0_0_3px_1px_rgba(255,255,255,0.15)]"
        >
          <p className="px-4 pb-1.5 pt-1 text-[15px] font-bold text-[#0F1419] dark:text-[#E7E9EA]">{t('Choose audience')}</p>
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
                className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-[rgba(15,20,25,0.06)] dark:hover:bg-[rgba(231,233,234,0.1)]"
              >
                <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#EFF3F4] text-[#0F1419] dark:bg-[#202327] dark:text-[#E7E9EA]">
                  {option.icon}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[15px] font-bold text-[#0F1419] dark:text-[#E7E9EA]">{t(option.label)}</span>
                  <span className="block text-[13px] text-[#536471] dark:text-[#71767B]">{t(option.hint)}</span>
                </span>
                {selected ? (
                  <svg className="h-4 w-4 shrink-0 text-[#0F1419] dark:text-[#E7E9EA]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden>
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
  const t = useT();
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
        <span className="text-[13px] tabular-nums text-[#536471] dark:text-[#71767B]">
          {items.length} / {MAX_LIST_ITEMS}
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-2 rounded-lg bg-[#F7F9F9] px-3 py-2.5 transition-[background-color,box-shadow] duration-150 focus-within:bg-white focus-within:shadow-[inset_0_0_0_1.5px_#0F1419] dark:bg-[#16181C] dark:focus-within:bg-black dark:focus-within:shadow-[inset_0_0_0_1.5px_#E7E9EA]">
        {items.map((item, index) => (
          <span
            key={item.id}
            className="inline-flex items-center gap-1 rounded-md bg-white py-0.5 pl-2.5 pr-1 text-[14px] font-medium text-[#0F1419] dark:bg-[#2F3336] dark:text-[#E7E9EA]"
          >
            {item.value}
            <button
              type="button"
              onClick={() => onRemove(index)}
              aria-label={t('Remove {value}', { value: item.value })}
              className="inline-flex h-5 w-5 items-center justify-center rounded-full text-[#536471] transition-colors hover:text-[#0F1419] dark:text-[#71767B] dark:hover:text-[#E7E9EA]"
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
            placeholder={items.length === 0 ? placeholder : t('Add another')}
            className="min-w-[8rem] flex-1 border-0 bg-transparent p-0 py-1 text-[15px] text-[#0F1419] caret-current outline-hidden placeholder:text-[#536471] focus:ring-0 dark:text-[#E7E9EA] dark:placeholder:text-[#71767B]"
          />
        ) : null}
      </div>
      {error ? <p className="mt-2 text-[14px] font-medium text-[#F4212E]">{error}</p> : null}
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
  const t = useT();
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
    (description.trim() ? 1 : 0) + (watch('priceInfo')?.trim() ? 1 : 0) + tagFields.length;

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
      tags: data.tags.map((t) => t.value.trim()).filter(Boolean),
      isPublic: data.isPublic,
      commentsEnabled: data.commentsEnabled,
    };
    try {
      await api.post('/api/creator/content', body);
      onSuccess();
    } catch (e) {
      onSubmitError(getApiErrorMessage(e, t('Unable to publish content.')));
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
          {t('Posting…')}
        </>
      ) : (
        t('Post')
      )}
    </button>
  );

  const errorLine = submitError ? (
    <div className="flex items-start justify-between gap-3 text-[14px] font-medium text-[#F4212E]" role="alert">
      <span>{submitError}</span>
      <button type="button" onClick={() => onSubmitError(null)} className="shrink-0 underline-offset-2 hover:underline">
        {t('Dismiss')}
      </button>
    </div>
  ) : null;

  return (
    <form
      id={formId}
      className="flex min-h-0 flex-1 flex-col"
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
          {/* Header: close · "New post" · spacer, then a hairline — the Facebook sheet anatomy. */}
          <div className={SHEET_HEADER_CLASS}>
            <button type="button" onClick={onCancel} disabled={isSubmitting} className={ROUND_ICON_BUTTON_CLASS} aria-label={t('Close')}>
              <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h2 className="text-center text-[17px] font-bold leading-6 text-[#0F1419] dark:text-[#E7E9EA]">{t('New post')}</h2>
            <span aria-hidden />
          </div>

          {/* Who posts, to whom, and whether people can reply — one block, three soft chips under the
              name, pinned above the writing area. */}
          <div className="flex shrink-0 items-center gap-3 px-4 pt-4 sm:px-5">
            {/* AvatarImage resolves the stored URL (relative upload paths, rendition params) and falls
                back to initials on a load error — a bare <img> rendered as a broken icon. */}
            <AvatarImage
              src={user?.avatarUrl}
              className="h-11 w-11 shrink-0 rounded-full object-cover"
              displayWidth={44}
              fallback={
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#EFF3F4] text-[13px] font-semibold text-[#0F1419] dark:bg-[#202327] dark:text-[#E7E9EA]">
                  {userInitials(creatorName)}
                </div>
              }
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[15px] font-bold leading-5 text-[#0F1419] dark:text-[#E7E9EA]">{creatorName}</p>
              <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                <AudiencePill isPublic={isPublic} onChange={(v) => setValue('isPublic', v, { shouldValidate: true })} />
                <button
                  type="button"
                  onClick={() => setValue('commentsEnabled', !commentsEnabled, { shouldValidate: true })}
                  aria-pressed={commentsEnabled}
                  title={commentsEnabled ? t('Turn comments off') : t('Turn comments on')}
                  className={CHIP_CLASS}
                >
                  {commentsEnabled ? <ChatIcon className="h-3.5 w-3.5" /> : <ChatOffIcon className="h-3.5 w-3.5" />}
                  {commentsEnabled ? t('Comments on') : t('Comments off')}
                </button>
              </div>
            </div>
          </div>

          {/* Only the writing area scrolls; the "Add to your post" bar and Post stay at the bottom. */}
          <div className="min-h-[9rem] flex-1 overflow-y-auto overscroll-contain px-4 pb-2 pt-2 sm:min-h-[11rem] sm:px-5 compose-scroll">
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
              <p className="mb-3 text-[14px] text-[#536471] dark:text-[#71767B]">
                {t('with')}{' '}
                <span className="font-medium text-[#0F1419] dark:text-[#E7E9EA]">
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
          </div>

          <div className="shrink-0 space-y-3 px-4 pb-4 pt-2 sm:px-5">
            {/* Facebook's "Add to your post": one outlined bar, the label on the left, the tools on the
                right — what each icon adds is named instead of guessed. */}
            <div className="relative flex items-center justify-between gap-2 rounded-xl py-1 pl-4 pr-1.5 shadow-[inset_0_0_0_1px_#E1E8ED] dark:shadow-[inset_0_0_0_1px_#2F3336]">
              <span className="min-w-0 truncate text-[14px] font-semibold text-[#0F1419] dark:text-[#E7E9EA]">
                {t('Add to your post')}
              </span>
              <div className="flex shrink-0 items-center gap-1">
                <CreatorContentComposeTools
                  locale="en"
                  variant="icons"
                  panelPlacement="above"
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
                {showDetails ? (
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    title={t('Description, price and tags')}
                    className="relative inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-[14px] font-semibold text-[#0F1419] transition-colors hover:bg-[rgba(15,20,25,0.06)] dark:text-[#E7E9EA] dark:hover:bg-[rgba(231,233,234,0.1)]"
                  >
                    {t('Details')}
                    {detailsCount > 0 ? (
                      <span className="inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#0F1419] px-1 text-[11px] font-bold tabular-nums text-white dark:bg-[#E7E9EA] dark:text-[#0F1419]">
                        {detailsCount}
                      </span>
                    ) : (
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.4} aria-hidden>
                        <path strokeLinecap="round" strokeLinejoin="round" d="m9 6 6 6-6 6" />
                      </svg>
                    )}
                  </button>
                ) : null}
              </div>
            </div>

            {errorLine}

            <div className="flex items-center gap-3">
              {postButton}
              <CharCounter length={title.length} max={CREATOR_CONTENT_TITLE_MAX} />
            </div>
          </div>
        </>
      ) : (
        <>
          <div className={SHEET_HEADER_CLASS}>
            <button
              type="button"
              onClick={() => {
                onSubmitError(null);
                setStep(1);
              }}
              disabled={isSubmitting}
              className={ROUND_ICON_BUTTON_CLASS}
              aria-label={t('Back to post')}
            >
              <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5m6-6l-6 6 6 6" />
              </svg>
            </button>
            <div className="text-center">
              <h2 className="text-[17px] font-bold leading-6 text-[#0F1419] dark:text-[#E7E9EA]">{t('Details')}</h2>
              <p className="text-[12px] leading-4 text-[#536471] dark:text-[#71767B]">{t('All optional')}</p>
            </div>
            <span aria-hidden />
          </div>

          <div className="min-h-0 flex-1 space-y-6 overflow-y-auto overscroll-contain px-4 py-5 sm:px-5 compose-scroll">
            <Field label={t('Description')} htmlFor="content-description">
              <textarea
                id="content-description"
                rows={3}
                maxLength={2000}
                placeholder={t('Tell the story behind this post')}
                className={`${FIELD_CLASS} min-h-[5.5rem] resize-none leading-relaxed [field-sizing:content]`}
                {...register('description')}
              />
            </Field>

            <Field label={t('Price to recreate')} htmlFor="content-price">
              <input
                id="content-price"
                className={FIELD_CLASS}
                placeholder="500 €"
                title={t('What you would charge to produce the same work again')}
                {...register('priceInfo')}
              />
            </Field>

            <ChipListField
              id="content-tags"
              label={t('Tags')}
              items={tagFields}
              placeholder={t('Type a tag and press Enter')}
              onAdd={(value) => appendTag({ value })}
              onRemove={removeTag}
            />
          </div>

          <div className="shrink-0 space-y-3 border-t border-[#EFF3F4] px-4 pb-4 pt-3 dark:border-[#2F3336] sm:px-5">
            {errorLine}
            <p className="flex items-center gap-1.5 text-[13px] text-[#536471] dark:text-[#71767B]">
              {isPublic ? <GlobeIcon className="h-3.5 w-3.5" /> : <LockIcon className="h-3.5 w-3.5" />}
              {isPublic ? t('Everyone') : t('Only me')} · {commentsEnabled ? t('Comments on') : t('Comments off')}
            </p>
            <div className="flex items-center gap-3">{postButton}</div>
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

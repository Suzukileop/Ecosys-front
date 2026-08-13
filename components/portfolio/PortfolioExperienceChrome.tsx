'use client';

import { useEffect, useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleCheck, faXmark } from '@fortawesome/free-solid-svg-icons';
import {
  ContentMediaPreview,
  useContentMediaUpload,
} from '@/components/creator/creator-content-media';
import { CreatorToolLogo } from '@/components/creator/studio/CreatorToolLogo';
import { CreatorToolsPicker } from '@/components/creator/studio/CreatorToolsPicker';
import {
  createEmptyExperienceProofLink,
  getHttpUrlFieldError,
  inferProfileMediaType,
  toAbsoluteHttpUrl,
  type ProfileMediaBlockForm,
} from '@/components/creator/studio/profile-form-schema';
import { PortfolioFlatField } from '@/components/portfolio/PortfolioInformationChrome';
import {
  PortfolioEntryPager,
  portfolioFieldErrorTextClass,
  portfolioInlineInputClass,
  portfolioInlineInputErrorClass,
} from '@/components/portfolio/portfolio-section-shared';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import type { ContactVisibilityLevel } from '@/lib/contact-visibility';
import { ProfileSectionItemCount } from '@/components/creator/studio/ProfileSectionLimitUpgradeHint';

export const MAX_EXPERIENCE_ENTRIES = 3;

function ExperienceIconButton({
  label,
  onClick,
  children,
  disabled = false,
  tone = 'neutral',
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
  disabled?: boolean;
  tone?: 'neutral' | 'confirm' | 'cancel';
}) {
  const toneClass =
    tone === 'confirm'
      ? 'border-emerald-300 bg-emerald-50 text-emerald-700 hover:border-emerald-400 hover:bg-emerald-100 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-300'
      : tone === 'cancel'
        ? 'border-neutral-200 bg-white text-neutral-500 hover:border-neutral-300 hover:bg-neutral-50 hover:text-neutral-700 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400'
        : 'border-neutral-200 bg-white text-neutral-500 hover:border-red-300 hover:bg-red-50 hover:text-red-600 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400 dark:hover:border-red-500/40 dark:hover:bg-red-500/10 dark:hover:text-red-400';

  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      disabled={disabled}
      className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition disabled:cursor-not-allowed disabled:opacity-50 ${toneClass}`}
    >
      {children}
    </button>
  );
}

export type PortfolioExperienceStatus = 'ONGOING' | 'FINISHED';

export type PortfolioExperienceEmploymentType =
  | 'FULL_TIME'
  | 'PART_TIME'
  | 'CONTRACT'
  | 'FREELANCE'
  | 'INTERNSHIP';

export type PortfolioExperienceProofPlatform =
  | 'GITHUB'
  | 'FACEBOOK'
  | 'LINKEDIN'
  | 'INSTAGRAM'
  | 'YOUTUBE'
  | 'WEBSITE'
  | 'OTHER';

export type PortfolioExperienceProofLink = {
  id: string;
  label: string;
  url: string;
  platform: PortfolioExperienceProofPlatform | null;
  sortOrder: number;
};

export type PortfolioExperienceBlock = {
  id: string;
  title: string;
  organization: string;
  period: string;
  text: string;
  status: PortfolioExperienceStatus | null;
  location: string;
  employmentType: PortfolioExperienceEmploymentType | null;
  remarks: string;
  mediaUrl: string;
  mediaType: 'IMAGE' | 'VIDEO' | null;
  subtitles: Array<{ value: string }>;
  tasks: Array<{ value: string }>;
  tools: Array<{ value: string; description?: string; iconUrl?: string | null }>;
  links: PortfolioExperienceProofLink[];
};

export type PortfolioExperienceBlockDraft = {
  title: string;
  organization: string;
  period: string;
  text: string;
  status: PortfolioExperienceStatus | null;
  location: string;
  employmentType: PortfolioExperienceEmploymentType | null;
  remarks: string;
  mediaUrl: string;
  mediaType: 'IMAGE' | 'VIDEO' | null;
  subtitles: Array<{ value: string }>;
  tasks: Array<{ value: string }>;
  tools: Array<{ value: string; description?: string; iconUrl?: string | null }>;
  links: PortfolioExperienceProofLink[];
};

type ExperienceFieldKey =
  | 'status'
  | 'period'
  | 'organization'
  | 'employmentType'
  | 'location'
  | 'title'
  | 'text'
  | 'tasks'
  | 'tools'
  | 'links'
  | 'remarks'
  | 'subtitles'
  | 'media';

const EXPERIENCE_MEDIA_ACCEPT =
  'image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,.jpg,.jpeg,.png,.webp,.gif,.mp4,.webm';

function ExperienceMediaEditor({
  mediaUrl,
  onChange,
  disabled,
}: {
  mediaUrl: string;
  onChange: (next: { mediaUrl: string; mediaType: 'IMAGE' | 'VIDEO' | null }) => void;
  disabled?: boolean;
}) {
  const { inputRef, uploading, uploadError, pickFile, onFileChange } = useContentMediaUpload({
    locale: 'en',
    onUrlChange: (url) => {
      const trimmed = url.trim();
      onChange({
        mediaUrl: trimmed,
        mediaType: trimmed ? inferProfileMediaType(trimmed) : null,
      });
    },
  });

  return (
    <div className="space-y-2">
      {mediaUrl.trim() ? (
        <div className="aspect-[16/10] w-full overflow-hidden rounded-xl border border-neutral-200/80 bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-900">
          <ContentMediaPreview
            locale="en"
            mediaUrl={mediaUrl}
            mediaType="FILE"
            large
            fluid
            fit="cover"
          />
        </div>
      ) : null}
      <input
        ref={inputRef}
        type="file"
        accept={EXPERIENCE_MEDIA_ACCEPT}
        className="hidden"
        onChange={onFileChange}
      />
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={pickFile}
          disabled={disabled || uploading}
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#EA580C] hover:text-[#C2410C] disabled:opacity-50"
        >
          {uploading ? <LoadingSpinner size="sm" /> : null}
          {mediaUrl.trim() ? 'Replace image/video' : 'Add image or video'}
        </button>
        {mediaUrl.trim() ? (
          <button
            type="button"
            disabled={disabled || uploading}
            onClick={() => onChange({ mediaUrl: '', mediaType: null })}
            className="text-xs font-semibold text-neutral-600 hover:text-neutral-900 disabled:opacity-50 dark:text-neutral-400 dark:hover:text-white"
          >
            Remove media
          </button>
        ) : null}
      </div>
      {uploadError ? <p className="text-xs text-red-600">{uploadError}</p> : null}
    </div>
  );
}

type EditingTarget =
  | { kind: 'years' }
  | { kind: 'field'; index: number; field: ExperienceFieldKey };

const EMPLOYMENT_OPTIONS: { value: PortfolioExperienceEmploymentType; label: string }[] = [
  { value: 'FREELANCE', label: 'Freelance' },
  { value: 'CONTRACT', label: 'Contract' },
  { value: 'FULL_TIME', label: 'Full-time' },
  { value: 'PART_TIME', label: 'Part-time' },
  { value: 'INTERNSHIP', label: 'Internship' },
];

function statusLabel(status: PortfolioExperienceStatus | null): string | null {
  if (status === 'ONGOING') return 'Ongoing';
  if (status === 'FINISHED') return 'Finished';
  return null;
}

function employmentLabel(value: PortfolioExperienceEmploymentType | null): string | null {
  if (!value) return null;
  return EMPLOYMENT_OPTIONS.find((option) => option.value === value)?.label ?? value;
}

function toDraft(block: PortfolioExperienceBlock): PortfolioExperienceBlockDraft {
  return {
    title: block.title,
    organization: block.organization,
    period: block.period,
    text: block.text,
    status: block.status,
    location: block.location,
    employmentType: block.employmentType,
    remarks: block.remarks,
    mediaUrl: block.mediaUrl,
    mediaType: block.mediaType,
    subtitles: block.subtitles.map((item) => ({ value: item.value })),
    tasks: block.tasks.map((item) => ({ value: item.value })),
    tools: block.tools.map((item) => ({
      value: item.value,
      description: item.description ?? '',
      iconUrl: item.iconUrl ?? null,
    })),
    links: block.links.map((link) => ({ ...link })),
  };
}

export function mapProfileBlockToExperienceBlock(
  block: ProfileMediaBlockForm
): PortfolioExperienceBlock {
  return {
    id: block.id,
    title: block.title ?? '',
    organization: block.organization ?? '',
    period: block.period ?? '',
    text: block.text ?? '',
    status: block.status ?? null,
    location: block.location ?? '',
    employmentType: block.employmentType ?? null,
    remarks: block.remarks ?? '',
    mediaUrl: block.mediaUrl ?? '',
    mediaType: block.mediaType ?? null,
    subtitles: (block.subtitles ?? []).map((item) => ({ value: item.value ?? '' })),
    tasks: (block.tasks ?? []).map((item) => ({ value: item.value ?? '' })),
    tools: (block.tools ?? []).map((item) => ({
      value: item.value ?? '',
      description: item.description ?? '',
      iconUrl: item.iconUrl ?? null,
    })),
    links: (block.links ?? []).map((link, index) => ({
      id: link.id,
      label: link.label ?? '',
      url: link.url ?? '',
      platform: link.platform ?? null,
      sortOrder: link.sortOrder ?? index,
    })),
  };
}

function normalizeStringList(items: Array<{ value: string }>): string[] {
  return items.map((item) => item.value.trim()).filter(Boolean);
}

function normalizeTools(
  tools: Array<{ value: string; description?: string; iconUrl?: string | null }>
): Array<{ value: string; description: string; iconUrl: string | null }> {
  return tools
    .map((item) => ({
      value: item.value.trim(),
      description: (item.description ?? '').trim(),
      iconUrl: item.iconUrl?.trim() ? item.iconUrl.trim() : null,
    }))
    .filter((item) => item.value.length > 0);
}

function normalizeLinks(links: PortfolioExperienceProofLink[]): PortfolioExperienceProofLink[] {
  return links
    .map((link, index) => {
      const raw = link.url.trim();
      return {
        id: link.id,
        label: link.label.trim(),
        url: toAbsoluteHttpUrl(raw) ?? raw,
        platform: link.platform,
        sortOrder: index,
      };
    })
    .filter((link) => link.label.length > 0 || link.url.length > 0);
}

function collectProofLinkUrlErrors(
  links: PortfolioExperienceProofLink[]
): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const link of links) {
    const url = link.url.trim();
    const label = link.label.trim();
    if (!url && !label) continue;
    if (!url) {
      errors[link.id] = 'URL is required.';
      continue;
    }
    const message = getHttpUrlFieldError(url);
    if (message) errors[link.id] = message;
  }
  return errors;
}

function cleanDraft(draft: PortfolioExperienceBlockDraft): PortfolioExperienceBlockDraft {
  return {
    title: draft.title.trim(),
    organization: draft.organization.trim(),
    period: draft.period.trim(),
    text: draft.text.trim(),
    status: draft.status,
    location: draft.location.trim(),
    employmentType: draft.employmentType,
    remarks: draft.remarks.trim(),
    mediaUrl: draft.mediaUrl.trim(),
    mediaType: draft.mediaUrl.trim() ? draft.mediaType : null,
    subtitles: normalizeStringList(draft.subtitles).map((value) => ({ value })),
    tasks: normalizeStringList(draft.tasks).map((value) => ({ value })),
    tools: normalizeTools(draft.tools),
    links: normalizeLinks(draft.links),
  };
}

function draftsEqual(
  left: PortfolioExperienceBlockDraft,
  right: PortfolioExperienceBlockDraft
): boolean {
  const a = cleanDraft(left);
  const b = cleanDraft(right);
  return (
    a.title === b.title &&
    a.organization === b.organization &&
    a.period === b.period &&
    a.text === b.text &&
    a.status === b.status &&
    a.location === b.location &&
    a.employmentType === b.employmentType &&
    a.remarks === b.remarks &&
    a.mediaUrl === b.mediaUrl &&
    a.mediaType === b.mediaType &&
    JSON.stringify(a.subtitles) === JSON.stringify(b.subtitles) &&
    JSON.stringify(a.tasks) === JSON.stringify(b.tasks) &&
    JSON.stringify(a.tools) === JSON.stringify(b.tools) &&
    JSON.stringify(a.links) === JSON.stringify(b.links)
  );
}

function blockHasContent(block: {
  title: string;
  organization: string;
  period: string;
  text: string;
  status: PortfolioExperienceStatus | null;
  location: string;
  employmentType: PortfolioExperienceEmploymentType | null;
  remarks: string;
  mediaUrl: string;
  subtitles: Array<{ value: string }>;
  tasks: Array<{ value: string }>;
  tools: Array<{ value: string; description?: string }>;
  links: PortfolioExperienceProofLink[];
}): boolean {
  return (
    Boolean(block.text.trim()) ||
    Boolean(block.title.trim()) ||
    Boolean(block.organization.trim()) ||
    Boolean(block.period.trim()) ||
    Boolean(block.remarks.trim()) ||
    Boolean(block.location.trim()) ||
    Boolean(block.mediaUrl.trim()) ||
    block.status != null ||
    block.employmentType != null ||
    block.subtitles.some((item) => item.value.trim()) ||
    block.tasks.some((item) => item.value.trim()) ||
    block.tools.some((item) => item.value.trim() || item.description?.trim()) ||
    block.links.some((item) => item.url.trim() || item.label.trim())
  );
}

function ChipRow({
  values,
  emptyLabel,
}: {
  values: Array<{ value: string; iconUrl?: string | null } | string>;
  emptyLabel: string;
}) {
  if (values.length === 0) {
    return <p className="text-[15px] italic text-neutral-500 dark:text-neutral-400">{emptyLabel}</p>;
  }
  return (
    <div className="flex flex-wrap items-center gap-2">
      {values.map((entry, index) => {
        const label = typeof entry === 'string' ? entry : entry.value;
        const iconUrl = typeof entry === 'string' ? null : entry.iconUrl ?? null;
        return (
          <span
            key={`${label}-${index}`}
            className="inline-flex items-center gap-2 rounded-lg border border-neutral-200 bg-neutral-100 px-3.5 py-1.5 text-sm font-medium text-neutral-800 dark:border-neutral-700 dark:bg-[#141414] dark:text-neutral-100"
          >
            <CreatorToolLogo label={label} iconUrl={iconUrl} size={18} />
            {label}
          </span>
        );
      })}
    </div>
  );
}

function StackedValues({ values, emptyLabel }: { values: string[]; emptyLabel: string }) {
  if (values.length === 0) {
    return <p className="text-[15px] italic text-neutral-500 dark:text-neutral-400">{emptyLabel}</p>;
  }
  return (
    <ul className="space-y-2">
      {values.map((value, index) => (
        <li key={`${value}-${index}`} className="flex items-start gap-3">
          <span
            className="mt-[0.35rem] inline-flex h-3.5 w-3.5 shrink-0 items-center justify-center text-[#EA580C]"
            aria-hidden
          >
            <svg viewBox="0 0 12 12" className="h-full w-full" fill="currentColor">
              <path d="M3.2 1.4v9.2L10.4 6 3.2 1.4z" />
            </svg>
          </span>
          <span className="min-w-0 text-[15px] font-semibold leading-relaxed text-neutral-900 dark:text-white">
            {value}
          </span>
        </li>
      ))}
    </ul>
  );
}

function StringListEditor({
  values,
  onChange,
  placeholder,
  addLabel,
  max,
  disabled,
}: {
  values: Array<{ value: string }>;
  onChange: (next: Array<{ value: string }>) => void;
  placeholder: string;
  addLabel: string;
  max: number;
  disabled?: boolean;
}) {
  return (
    <div className="space-y-2">
      {values.map((item, index) => (
        <div key={`list-${index}`} className="flex items-center gap-2">
          <input
            type="text"
            value={item.value}
            onChange={(event) =>
              onChange(
                values.map((entry, entryIndex) =>
                  entryIndex === index ? { value: event.target.value } : entry
                )
              )
            }
            placeholder={`${placeholder} ${index + 1}`}
            className={`${portfolioInlineInputClass} min-w-0 flex-1`}
            disabled={disabled}
          />
          <button
            type="button"
            disabled={disabled}
            onClick={() => onChange(values.filter((_, entryIndex) => entryIndex !== index))}
            className="shrink-0 text-xs font-semibold text-red-600 hover:text-red-700 disabled:opacity-50 dark:text-red-400"
          >
            Remove
          </button>
        </div>
      ))}
      <button
        type="button"
        disabled={disabled || values.length >= max}
        onClick={() => onChange([...values, { value: '' }])}
        className="text-sm font-semibold text-[#EA580C] hover:text-[#C2410C] disabled:opacity-50"
      >
        {addLabel}
      </button>
    </div>
  );
}

function ProofLinksEditor({
  links,
  onChange,
  disabled,
  urlErrors = {},
}: {
  links: PortfolioExperienceProofLink[];
  onChange: (next: PortfolioExperienceProofLink[]) => void;
  disabled?: boolean;
  urlErrors?: Record<string, string>;
}) {
  return (
    <div className="space-y-3">
      {links.map((link, index) => {
        const urlError = urlErrors[link.id];
        return (
          <div key={link.id} className="space-y-2">
            <input
              type="text"
              value={link.label}
              onChange={(event) =>
                onChange(
                  links.map((entry, entryIndex) =>
                    entryIndex === index ? { ...entry, label: event.target.value } : entry
                  )
                )
              }
              placeholder="Label"
              className={portfolioInlineInputClass}
              disabled={disabled}
            />
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  inputMode="url"
                  autoComplete="url"
                  value={link.url}
                  onChange={(event) =>
                    onChange(
                      links.map((entry, entryIndex) =>
                        entryIndex === index ? { ...entry, url: event.target.value } : entry
                      )
                    )
                  }
                  placeholder="https://…"
                  aria-invalid={urlError ? true : undefined}
                  className={`${urlError ? portfolioInlineInputErrorClass : portfolioInlineInputClass} min-w-0 flex-1`}
                  disabled={disabled}
                />
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => onChange(links.filter((_, entryIndex) => entryIndex !== index))}
                  className="shrink-0 text-xs font-semibold text-red-600 hover:text-red-700 disabled:opacity-50 dark:text-red-400"
                >
                  Remove
                </button>
              </div>
              {urlError ? <p className={portfolioFieldErrorTextClass}>{urlError}</p> : null}
            </div>
          </div>
        );
      })}
      <button
        type="button"
        disabled={disabled || links.length >= 5}
        onClick={() => onChange([...links, createEmptyExperienceProofLink(links.length)])}
        className="text-sm font-semibold text-[#EA580C] hover:text-[#C2410C] disabled:opacity-50"
      >
        + Add link
      </button>
    </div>
  );
}

function ProofLinksDisplay({ links }: { links: PortfolioExperienceProofLink[] }) {
  const visible = links.filter((link) => link.url.trim() || link.label.trim());
  if (visible.length === 0) {
    return <p className="text-[15px] italic text-neutral-500 dark:text-neutral-400">Not set</p>;
  }
  return (
    <ul className="space-y-2">
      {visible.map((link) => {
        const label = link.label.trim() || link.url.trim();
        return (
          <li key={link.id}>
            {link.url.trim() ? (
              <a
                href={link.url.trim()}
                target="_blank"
                rel="noreferrer"
                className="text-[15px] font-semibold leading-relaxed text-[#EA580C] hover:text-[#C2410C]"
              >
                {label}
              </a>
            ) : (
              <p className="text-[15px] font-semibold leading-relaxed text-neutral-900 dark:text-white">
                {label}
              </p>
            )}
          </li>
        );
      })}
    </ul>
  );
}

function ExperienceEntryFields({
  block,
  draft,
  editing,
  editingField,
  showFieldActions,
  isGlobal,
  fieldSaving,
  onStartFieldEdit,
  onConfirmField,
  onCancelField,
  fieldHasChanges,
  onDraftChange,
  onRemove,
  linkUrlErrors = {},
}: {
  block: PortfolioExperienceBlock;
  draft: PortfolioExperienceBlockDraft;
  editing: boolean;
  editingField: ExperienceFieldKey | null;
  showFieldActions: boolean;
  isGlobal: boolean;
  fieldSaving: boolean;
  onStartFieldEdit?: (field: ExperienceFieldKey) => void;
  onConfirmField?: () => void;
  onCancelField?: () => void;
  fieldHasChanges: boolean;
  onDraftChange: (next: PortfolioExperienceBlockDraft) => void;
  onRemove?: () => void;
  linkUrlErrors?: Record<string, string>;
}) {
  const display = editing ? draft : toDraft(block);
  const confirming = fieldSaving && editing && !isGlobal;

  const fieldEditing = (field: ExperienceFieldKey) =>
    isGlobal || (showFieldActions && editing && editingField === field);

  const fieldOnEdit = (field: ExperienceFieldKey) =>
    showFieldActions && onStartFieldEdit ? () => onStartFieldEdit(field) : undefined;

  const fieldOnConfirm = isGlobal ? undefined : onConfirmField;
  const fieldOnCancel = isGlobal ? undefined : onCancelField;

  const patch = (partial: Partial<PortfolioExperienceBlockDraft>) =>
    onDraftChange({ ...draft, ...partial });

  const mediaUrl = display.mediaUrl.trim();

  const metaFieldKeys: ExperienceFieldKey[] = [
    'period',
    'organization',
    'location',
    'employmentType',
  ];
  const metaEditing =
    isGlobal ||
    (showFieldActions && editing && editingField != null && metaFieldKeys.includes(editingField));
  const metaLine = [
    display.period.trim(),
    display.organization.trim(),
    display.location.trim(),
    employmentLabel(display.employmentType),
  ]
    .filter((part): part is string => Boolean(part && part.trim()))
    .join(' · ');

  return (
    <div className="divide-y divide-neutral-200/50 dark:divide-white/[0.06]">
      <PortfolioFlatField
        label="Details"
        value={metaLine || null}
        emptyLabel="Not set"
        editing={metaEditing}
        onEdit={fieldOnEdit('period')}
        onConfirm={fieldOnConfirm}
        onCancelEdit={fieldOnCancel}
        confirming={
          confirming && editingField != null && metaFieldKeys.includes(editingField)
        }
        canConfirm={fieldHasChanges}
        editControl={
          <div className="grid items-start gap-3 sm:grid-cols-2">
            <div>
              <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-500">
                Period
              </p>
              <input
                type="text"
                value={display.period}
                onChange={(event) => patch({ period: event.target.value })}
                placeholder="2021 — present"
                className={portfolioInlineInputClass}
                autoFocus={editingField === 'period'}
                disabled={fieldSaving}
              />
            </div>
            <div>
              <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-500">
                Organization
              </p>
              <input
                type="text"
                value={display.organization}
                onChange={(event) => patch({ organization: event.target.value })}
                placeholder="Freelance, Studio, Agency…"
                className={portfolioInlineInputClass}
                autoFocus={editingField === 'organization'}
                disabled={fieldSaving}
              />
            </div>
            <div>
              <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-500">
                Location
              </p>
              <input
                type="text"
                value={display.location}
                onChange={(event) => patch({ location: event.target.value })}
                placeholder="Paris, Remote…"
                className={portfolioInlineInputClass}
                autoFocus={editingField === 'location'}
                disabled={fieldSaving}
              />
            </div>
            <div>
              <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-500">
                Employment type
              </p>
              <select
                value={display.employmentType ?? ''}
                onChange={(event) =>
                  patch({
                    employmentType: event.target.value
                      ? (event.target.value as PortfolioExperienceEmploymentType)
                      : null,
                  })
                }
                className={portfolioInlineInputClass}
                autoFocus={editingField === 'employmentType'}
                disabled={fieldSaving}
              >
                <option value="">Not set</option>
                {EMPLOYMENT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        }
      />

      <PortfolioFlatField
        label="Job title"
        value={display.title}
        emptyLabel="Not set"
        editing={fieldEditing('title')}
        onEdit={fieldOnEdit('title')}
        onConfirm={fieldOnConfirm}
        onCancelEdit={fieldOnCancel}
        confirming={confirming && editingField === 'title'}
        canConfirm={fieldHasChanges}
        editControl={
          <input
            type="text"
            value={display.title}
            onChange={(event) => patch({ title: event.target.value })}
            placeholder="Video director & editor"
            className={portfolioInlineInputClass}
            autoFocus={editingField === 'title'}
            disabled={fieldSaving}
          />
        }
      />

      <PortfolioFlatField
        label="Description"
        value={display.text}
        emptyLabel="Not set"
        editing={fieldEditing('text')}
        onEdit={fieldOnEdit('text')}
        onConfirm={fieldOnConfirm}
        onCancelEdit={fieldOnCancel}
        confirming={confirming && editingField === 'text'}
        canConfirm={fieldHasChanges}
        editControl={
          <textarea
            value={display.text}
            onChange={(event) => patch({ text: event.target.value })}
            rows={3}
            placeholder="What you did, outcomes, scope of work…"
            className={`${portfolioInlineInputClass} resize-y font-medium leading-relaxed`}
            autoFocus={editingField === 'text'}
            disabled={fieldSaving}
          />
        }
      />

      <PortfolioFlatField
        label="Tasks"
        editing={fieldEditing('tasks')}
        onEdit={fieldOnEdit('tasks')}
        onConfirm={fieldOnConfirm}
        onCancelEdit={fieldOnCancel}
        confirming={confirming && editingField === 'tasks'}
        canConfirm={fieldHasChanges}
        editControl={
          <StringListEditor
            values={display.tasks}
            onChange={(tasks) => patch({ tasks })}
            placeholder="Task"
            addLabel="+ Add task"
            max={12}
            disabled={fieldSaving}
          />
        }
      >
        <StackedValues values={normalizeStringList(display.tasks)} emptyLabel="Not set" />
      </PortfolioFlatField>

      <PortfolioFlatField
        label="Tools"
        editing={fieldEditing('tools')}
        onEdit={fieldOnEdit('tools')}
        onConfirm={fieldOnConfirm}
        onCancelEdit={fieldOnCancel}
        confirming={confirming && editingField === 'tools'}
        canConfirm={fieldHasChanges}
        editControl={
          <CreatorToolsPicker
            value={display.tools
              .filter((item) => item.value.trim())
              .map((item) => ({
                value: item.value,
                iconUrl: item.iconUrl ?? null,
              }))}
            max={8}
            emptyLabel="No tools yet."
            onChange={(next) =>
              patch({
                tools: next.map((item) => {
                  const existing = display.tools.find(
                    (tool) =>
                      tool.value.trim().toLowerCase() === item.value.trim().toLowerCase()
                  );
                  return {
                    value: item.value,
                    description: existing?.description ?? '',
                    iconUrl: item.iconUrl ?? null,
                  };
                }),
              })
            }
          />
        }
      >
        <ChipRow values={normalizeTools(display.tools)} emptyLabel="Not set" />
      </PortfolioFlatField>

      <PortfolioFlatField
        label="Proof links"
        editing={fieldEditing('links')}
        onEdit={fieldOnEdit('links')}
        onConfirm={fieldOnConfirm}
        onCancelEdit={fieldOnCancel}
        confirming={confirming && editingField === 'links'}
        canConfirm={fieldHasChanges}
        editControl={
          <ProofLinksEditor
            links={display.links}
            onChange={(links) => patch({ links })}
            disabled={fieldSaving}
            urlErrors={linkUrlErrors}
          />
        }
      >
        <ProofLinksDisplay links={display.links} />
      </PortfolioFlatField>

      <PortfolioFlatField
        label="Remarks"
        value={display.remarks}
        emptyLabel="Not set"
        editing={fieldEditing('remarks')}
        onEdit={fieldOnEdit('remarks')}
        onConfirm={fieldOnConfirm}
        onCancelEdit={fieldOnCancel}
        confirming={confirming && editingField === 'remarks'}
        canConfirm={fieldHasChanges}
        editControl={
          <textarea
            value={display.remarks}
            onChange={(event) => patch({ remarks: event.target.value })}
            rows={2}
            placeholder="Optional note — NDAs, confidential client…"
            className={`${portfolioInlineInputClass} resize-y font-medium leading-relaxed`}
            autoFocus={editingField === 'remarks'}
            disabled={fieldSaving}
          />
        }
      />

      <PortfolioFlatField
        label="Tags"
        editing={fieldEditing('subtitles')}
        onEdit={fieldOnEdit('subtitles')}
        onConfirm={fieldOnConfirm}
        onCancelEdit={fieldOnCancel}
        confirming={confirming && editingField === 'subtitles'}
        canConfirm={fieldHasChanges}
        editControl={
          <StringListEditor
            values={display.subtitles}
            onChange={(subtitles) => patch({ subtitles })}
            placeholder="Tag"
            addLabel="+ Add tag"
            max={10}
            disabled={fieldSaving}
          />
        }
      >
        <ChipRow values={normalizeStringList(display.subtitles)} emptyLabel="Not set" />
      </PortfolioFlatField>

      <PortfolioFlatField
        label="Media"
        value={mediaUrl || null}
        emptyLabel="Not set"
        className="!items-start"
        editing={fieldEditing('media')}
        onEdit={fieldOnEdit('media')}
        onConfirm={fieldOnConfirm}
        onCancelEdit={fieldOnCancel}
        confirming={confirming && editingField === 'media'}
        canConfirm={fieldHasChanges}
        editControl={
          <ExperienceMediaEditor
            mediaUrl={display.mediaUrl}
            disabled={fieldSaving}
            onChange={({ mediaUrl: nextUrl, mediaType }) =>
              patch({ mediaUrl: nextUrl, mediaType })
            }
          />
        }
      >
        {mediaUrl ? (
          <div className="aspect-[16/10] w-full overflow-hidden rounded-xl border border-neutral-200/80 bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-900">
            <ContentMediaPreview
              locale="en"
              mediaUrl={mediaUrl}
              mediaType="FILE"
              large
              fluid
              fit="cover"
            />
          </div>
        ) : null}
      </PortfolioFlatField>

      {onRemove ? (
        <div className="flex items-center justify-end py-4">
          <button
            type="button"
            disabled={fieldSaving}
            onClick={onRemove}
            className="text-xs font-semibold text-red-600 hover:text-red-700 disabled:opacity-50 dark:text-red-400"
          >
            Remove experience
          </button>
        </div>
      ) : null}
    </div>
  );
}

export function PortfolioExperienceReadOnly({
  yearsOfExperience,
  blocks,
  yearsVisibility,
  onYearsVisibilityChange,
  onYearsSave,
  onBlockSave,
  onExperienceSave,
  onAddBlock,
  onRemoveBlock,
  fieldSaving = false,
  actionsVisible = false,
  editMode = 'individual',
  deleteMode = false,
  onDeleteModeChange,
  onGlobalHasChangesChange,
  onRegisterGlobalConfirm,
}: {
  yearsOfExperience: number | null;
  blocks: PortfolioExperienceBlock[];
  yearsVisibility?: ContactVisibilityLevel;
  onYearsVisibilityChange?: (value: ContactVisibilityLevel) => void;
  onYearsSave?: (years: number | null) => Promise<void>;
  onBlockSave?: (index: number, next: PortfolioExperienceBlockDraft) => Promise<void>;
  onExperienceSave?: (next: {
    yearsOfExperience: number | null;
    blocks: PortfolioExperienceBlockDraft[];
  }) => Promise<void>;
  onAddBlock?: () => void;
  onRemoveBlock?: (index: number) => Promise<void> | void;
  fieldSaving?: boolean;
  actionsVisible?: boolean;
  editMode?: 'individual' | 'global';
  deleteMode?: boolean;
  onDeleteModeChange?: (active: boolean) => void;
  onGlobalHasChangesChange?: (hasChanges: boolean) => void;
  onRegisterGlobalConfirm?: (confirm: (() => Promise<void>) | null) => void;
}) {
  const isGlobal = actionsVisible && editMode === 'global' && !deleteMode;
  const showFieldActions = actionsVisible && editMode === 'individual' && !deleteMode;

  const [editing, setEditing] = useState<EditingTarget | null>(null);
  const [draftYears, setDraftYears] = useState(
    yearsOfExperience != null ? String(yearsOfExperience) : ''
  );
  const [drafts, setDrafts] = useState<PortfolioExperienceBlockDraft[]>(() =>
    blocks.map(toDraft)
  );
  const [activeSlot, setActiveSlot] = useState(0);
  const [pendingDeleteIndex, setPendingDeleteIndex] = useState<number | null>(null);
  const [linkUrlErrors, setLinkUrlErrors] = useState<Record<string, string>>({});
  const prevVisibleCountRef = useRef(0);

  const syncYearsDraft = () => {
    setDraftYears(yearsOfExperience != null ? String(yearsOfExperience) : '');
  };

  const syncDraftsFromBlocks = () => {
    setDrafts(blocks.map(toDraft));
  };

  useEffect(() => {
    if (!actionsVisible) {
      setEditing(null);
      syncYearsDraft();
      syncDraftsFromBlocks();
      return;
    }
    if (isGlobal) {
      setEditing(null);
      syncYearsDraft();
      syncDraftsFromBlocks();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actionsVisible, editMode]);

  useEffect(() => {
    if (deleteMode) {
      setPendingDeleteIndex(null);
      setEditing(null);
    } else {
      setPendingDeleteIndex(null);
    }
  }, [deleteMode]);

  useEffect(() => {
    if (!actionsVisible) return;
    setPendingDeleteIndex(null);
    onDeleteModeChange?.(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actionsVisible]);

  useEffect(() => {
    if (editing?.kind === 'years' || isGlobal) return;
    syncYearsDraft();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [yearsOfExperience]);

  useEffect(() => {
    if ((editing && editing.kind === 'field') || isGlobal) return;
    syncDraftsFromBlocks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blocks]);

  useEffect(() => {
    if (!isGlobal) return;
    if (drafts.length === blocks.length) return;
    syncDraftsFromBlocks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blocks.length, isGlobal]);

  const parseYearsDraft = (raw: string): number | null => {
    const trimmed = raw.trim();
    if (!trimmed) return null;
    const parsed = Number(trimmed);
    if (!Number.isFinite(parsed) || parsed < 0) return null;
    return Math.min(80, Math.round(parsed));
  };

  const yearsHasChanges = parseYearsDraft(draftYears) !== (yearsOfExperience ?? null);

  const editingIndex = editing?.kind === 'field' ? editing.index : null;
  const editingField = editing?.kind === 'field' ? editing.field : null;

  const fieldHasChanges =
    editingIndex != null &&
    drafts[editingIndex] != null &&
    blocks[editingIndex] != null &&
    !draftsEqual(drafts[editingIndex], toDraft(blocks[editingIndex]));

  const globalHasChanges =
    yearsHasChanges ||
    (drafts.length === blocks.length &&
      drafts.some((draft, index) => !draftsEqual(draft, toDraft(blocks[index]))));

  useEffect(() => {
    onGlobalHasChangesChange?.(isGlobal ? globalHasChanges : false);
  }, [globalHasChanges, isGlobal, onGlobalHasChangesChange]);

  const startYearsEdit = () => {
    syncYearsDraft();
    setEditing({ kind: 'years' });
  };

  const cancelYearsEdit = () => {
    if (fieldSaving) return;
    setEditing(null);
    syncYearsDraft();
  };

  const confirmYearsEdit = async () => {
    if (!onYearsSave || fieldSaving || !yearsHasChanges) return;
    try {
      await onYearsSave(parseYearsDraft(draftYears));
      setEditing(null);
    } catch {
      // Parent surfaces the error.
    }
  };

  const startFieldEdit = (index: number, field: ExperienceFieldKey) => {
    syncDraftsFromBlocks();
    setLinkUrlErrors({});
    setEditing({ kind: 'field', index, field });
  };

  const cancelFieldEdit = async () => {
    if (fieldSaving || editingIndex == null) return;
    const original = blocks[editingIndex];
    const wasEmpty = original ? !blockHasContent(original) : true;
    setEditing(null);
    setLinkUrlErrors({});
    syncDraftsFromBlocks();
    if (wasEmpty && onRemoveBlock) {
      await onRemoveBlock(editingIndex);
    }
  };

  const updateDraft = (index: number, next: PortfolioExperienceBlockDraft) => {
    setLinkUrlErrors((prev) => {
      if (Object.keys(prev).length === 0) return prev;
      const nextErrors = { ...prev };
      for (const link of next.links) {
        delete nextErrors[link.id];
      }
      return nextErrors;
    });
    setDrafts((prev) => prev.map((item, itemIndex) => (itemIndex === index ? next : item)));
  };

  const confirmFieldEdit = async () => {
    if (editingIndex == null || !onBlockSave || fieldSaving) return;
    const draft = drafts[editingIndex];
    if (!draft) return;
    const nextLinkErrors = collectProofLinkUrlErrors(draft.links);
    if (Object.keys(nextLinkErrors).length > 0) {
      setLinkUrlErrors(nextLinkErrors);
      if (editingField !== 'links') {
        setEditing({ kind: 'field', index: editingIndex, field: 'links' });
      }
      return;
    }
    setLinkUrlErrors({});
    const cleaned = cleanDraft(draft);
    if (!blockHasContent(cleaned)) {
      setEditing(null);
      if (onRemoveBlock) await onRemoveBlock(editingIndex);
      return;
    }
    if (!fieldHasChanges) return;
    try {
      await onBlockSave(editingIndex, cleaned);
      setEditing(null);
    } catch {
      // Parent surfaces the error.
    }
  };

  const confirmGlobal = async () => {
    if (!onExperienceSave || fieldSaving) return;
    const nextYears = parseYearsDraft(draftYears);
    const allLinkErrors: Record<string, string> = {};
    for (const draft of drafts) {
      Object.assign(allLinkErrors, collectProofLinkUrlErrors(draft.links));
    }
    if (Object.keys(allLinkErrors).length > 0) {
      setLinkUrlErrors(allLinkErrors);
      return;
    }
    setLinkUrlErrors({});
    const cleaned = drafts.map(cleanDraft).filter((item) => blockHasContent(item));
    const currentFilled = blocks.map(toDraft).map(cleanDraft).filter((item) => blockHasContent(item));
    const blocksUnchanged =
      cleaned.length === currentFilled.length &&
      cleaned.every((item, index) => draftsEqual(item, currentFilled[index]));
    const yearsUnchanged = nextYears === (yearsOfExperience ?? null);
    if (blocksUnchanged && yearsUnchanged && cleaned.length === blocks.length) return;
    try {
      await onExperienceSave({ yearsOfExperience: nextYears, blocks: cleaned });
    } catch {
      // Parent surfaces the error.
    }
  };

  const confirmGlobalRef = useRef(confirmGlobal);
  confirmGlobalRef.current = confirmGlobal;

  useEffect(() => {
    if (!isGlobal) {
      onRegisterGlobalConfirm?.(null);
      return;
    }
    onRegisterGlobalConfirm?.(async () => {
      await confirmGlobalRef.current();
    });
    return () => onRegisterGlobalConfirm?.(null);
  }, [isGlobal, onRegisterGlobalConfirm]);

  const yearsEditing = isGlobal || (showFieldActions && editing?.kind === 'years');
  const hasVisibleBlocks = actionsVisible
    ? blocks.length > 0
    : blocks.some((block) => blockHasContent(block));

  const visibleEntries = blocks
    .map((block, index) => ({ block, index }))
    .filter(({ block }) => actionsVisible || blockHasContent(block));

  useEffect(() => {
    const count = visibleEntries.length;
    const prev = prevVisibleCountRef.current;
    prevVisibleCountRef.current = count;
    if (count === 0) {
      setActiveSlot(0);
      return;
    }
    if (count > prev) {
      setActiveSlot(count - 1);
      return;
    }
    setActiveSlot((slot) => (slot >= count ? count - 1 : slot));
  }, [visibleEntries.length]);

  const selectExperienceSlot = (slot: number) => {
    if (fieldSaving || slot === activeSlot) return;
    if (editing?.kind === 'field') {
      setEditing(null);
      syncDraftsFromBlocks();
    }
    setActiveSlot(slot);
  };

  const activeEntry = visibleEntries[activeSlot] ?? visibleEntries[0] ?? null;
  const activeBlockIndex = activeEntry?.index ?? -1;

  if (!actionsVisible && yearsOfExperience == null && !hasVisibleBlocks) {
    return (
      <div className="space-y-4 py-5">
        <ProfileSectionItemCount
          count={0}
          limit={MAX_EXPERIENCE_ENTRIES}
          unit="experiences"
          className="mb-2"
        />
        <p className="py-6 text-center text-sm italic text-neutral-500 dark:text-neutral-400">
          No experience yet. Click Edit Profile to add your background.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <ProfileSectionItemCount
        count={visibleEntries.length}
        limit={MAX_EXPERIENCE_ENTRIES}
        unit="experiences"
        className="mb-3"
      />
      {visibleEntries.length > 0 ? (
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-200/50 pb-3 dark:border-white/[0.06]">
          {deleteMode && onRemoveBlock && activeEntry ? (
            <div className="inline-flex h-8 shrink-0 items-center gap-1.5">
              {pendingDeleteIndex === activeBlockIndex ? (
                <>
                  <span className="hidden text-[11px] font-medium text-red-600 sm:inline dark:text-red-400">
                    Delete?
                  </span>
                  <ExperienceIconButton
                    label="Confirm delete experience"
                    tone="confirm"
                    disabled={fieldSaving}
                    onClick={() => {
                      void (async () => {
                        const wasLast = blocks.length <= 1;
                        await onRemoveBlock(activeBlockIndex);
                        setPendingDeleteIndex(null);
                        setEditing(null);
                        if (wasLast) onDeleteModeChange?.(false);
                      })();
                    }}
                  >
                    {fieldSaving && pendingDeleteIndex === activeBlockIndex ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      <FontAwesomeIcon icon={faCircleCheck} className="h-4 w-4" fixedWidth />
                    )}
                  </ExperienceIconButton>
                  <ExperienceIconButton
                    label="Cancel"
                    tone="cancel"
                    disabled={fieldSaving}
                    onClick={() => setPendingDeleteIndex(null)}
                  >
                    <FontAwesomeIcon icon={faXmark} className="h-3.5 w-3.5" fixedWidth />
                  </ExperienceIconButton>
                </>
              ) : (
                <ExperienceIconButton
                  label="Delete experience"
                  disabled={fieldSaving}
                  onClick={() => {
                    setEditing(null);
                    setPendingDeleteIndex(activeBlockIndex);
                  }}
                >
                  <FontAwesomeIcon icon={faXmark} className="h-3.5 w-3.5" fixedWidth />
                </ExperienceIconButton>
              )}
            </div>
          ) : (
            <span aria-hidden className="hidden sm:block" />
          )}
          <PortfolioEntryPager
            count={visibleEntries.length}
            activeIndex={Math.min(activeSlot, Math.max(visibleEntries.length - 1, 0))}
            onSelect={selectExperienceSlot}
            disabled={fieldSaving}
            label="Experience"
            align="end"
          />
        </div>
      ) : null}

      <div className="divide-y divide-neutral-200/50 dark:divide-white/[0.06]">
        <div
          className={
            activeEntry
              ? 'grid items-start gap-x-8 sm:grid-cols-2'
              : undefined
          }
        >
          <PortfolioFlatField
            label="Years of experience"
            value={yearsOfExperience != null ? String(yearsOfExperience) : null}
            emptyLabel="Not set"
            editing={yearsEditing}
            onEdit={showFieldActions && onYearsSave ? startYearsEdit : undefined}
            onConfirm={isGlobal ? undefined : () => void confirmYearsEdit()}
            onCancelEdit={isGlobal ? undefined : cancelYearsEdit}
            confirming={fieldSaving && editing?.kind === 'years'}
            canConfirm={yearsHasChanges}
            showVisibility={actionsVisible}
            visibility={yearsVisibility}
            onVisibilityChange={onYearsVisibilityChange}
            editControl={
              <input
                type="number"
                min={0}
                max={80}
                value={draftYears}
                onChange={(event) => setDraftYears(event.target.value)}
                placeholder="e.g. 8"
                className={`${portfolioInlineInputClass} max-w-xs`}
                autoFocus={editing?.kind === 'years'}
                disabled={fieldSaving}
              />
            }
          />
          {activeEntry ? (
            <PortfolioFlatField
              label="Status"
              value={statusLabel(
                (drafts[activeBlockIndex] ?? toDraft(activeEntry.block)).status
              )}
              emptyLabel="Not set"
              editing={
                isGlobal ||
                (showFieldActions &&
                  editing?.kind === 'field' &&
                  editing.index === activeBlockIndex &&
                  editing.field === 'status')
              }
              onEdit={
                onBlockSave && showFieldActions
                  ? () => startFieldEdit(activeBlockIndex, 'status')
                  : undefined
              }
              onConfirm={isGlobal ? undefined : () => void confirmFieldEdit()}
              onCancelEdit={isGlobal ? undefined : () => void cancelFieldEdit()}
              confirming={
                fieldSaving &&
                editing?.kind === 'field' &&
                editing.index === activeBlockIndex &&
                editing.field === 'status'
              }
              canConfirm={fieldHasChanges}
              editControl={
                <select
                  value={(drafts[activeBlockIndex] ?? toDraft(activeEntry.block)).status ?? ''}
                  onChange={(event) => {
                    const current = drafts[activeBlockIndex] ?? toDraft(activeEntry.block);
                    updateDraft(activeBlockIndex, {
                      ...current,
                      status:
                        event.target.value === 'ONGOING' || event.target.value === 'FINISHED'
                          ? event.target.value
                          : null,
                    });
                  }}
                  className={portfolioInlineInputClass}
                  autoFocus={
                    editing?.kind === 'field' &&
                    editing.index === activeBlockIndex &&
                    editing.field === 'status'
                  }
                  disabled={fieldSaving}
                >
                  <option value="">Not set</option>
                  <option value="ONGOING">Ongoing</option>
                  <option value="FINISHED">Finished</option>
                </select>
              }
            />
          ) : null}
        </div>
      </div>

      {activeEntry ? (
        <div
          key={activeEntry.block.id}
          role="tabpanel"
          aria-label={`Experience ${activeSlot + 1}`}
        >
          <ExperienceEntryFields
            block={activeEntry.block}
            draft={drafts[activeBlockIndex] ?? toDraft(activeEntry.block)}
            editing={
              isGlobal || (showFieldActions && editingIndex === activeBlockIndex)
            }
            editingField={
              isGlobal || editingIndex !== activeBlockIndex ? null : editingField
            }
            showFieldActions={showFieldActions}
            isGlobal={isGlobal}
            fieldSaving={fieldSaving}
            onStartFieldEdit={
              onBlockSave ? (field) => startFieldEdit(activeBlockIndex, field) : undefined
            }
            onConfirmField={() => void confirmFieldEdit()}
            onCancelField={() => void cancelFieldEdit()}
            fieldHasChanges={fieldHasChanges}
            onDraftChange={(next) => updateDraft(activeBlockIndex, next)}
            onRemove={undefined}
            linkUrlErrors={linkUrlErrors}
          />
        </div>
      ) : null}

      {actionsVisible && onAddBlock && !deleteMode ? (
        <div className="pt-3">
          <button
            type="button"
            disabled={fieldSaving}
            onClick={onAddBlock}
            className="text-sm font-semibold text-[#EA580C] hover:text-[#C2410C] disabled:opacity-50"
          >
            + Add experience
          </button>
        </div>
      ) : null}
    </div>
  );
}

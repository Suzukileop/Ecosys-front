'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash, faPenToSquare } from '@fortawesome/free-regular-svg-icons';
import { faCircleCheck, faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import { Avatar } from '@/components/ui/Avatar';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import {
  CONTACT_VISIBILITY_OPTIONS,
  type ContactVisibilityLevel,
} from '@/lib/contact-visibility';
import { type SpokenLanguageEntry } from '@/lib/spoken-languages';
import { resolveAvailabilityStatusLabel } from '@/lib/availability-status';
import type { ProfileEducationEntry, ProfileSkillEntry } from '@/types/profile';
import { PORTFOLIO_UPGRADE_PATH } from '@/components/portfolio/portfolio-pricing-upgrade-panel';

function PortfolioFieldIconButton({
  label,
  onClick,
  children,
  active = false,
  disabled = false,
  tone = 'neutral',
}: {
  label: string;
  onClick: () => void;
  children: ReactNode;
  active?: boolean;
  disabled?: boolean;
  tone?: 'neutral' | 'confirm' | 'cancel';
}) {
  const toneClass =
    tone === 'confirm'
      ? 'border-emerald-300 bg-emerald-50 text-emerald-700 hover:border-emerald-400 hover:bg-emerald-100 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-300'
      : tone === 'cancel'
        ? 'border-neutral-200 bg-white text-neutral-500 hover:border-neutral-300 hover:bg-neutral-50 hover:text-neutral-700 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400 dark:hover:border-neutral-600 dark:hover:bg-neutral-800 dark:hover:text-neutral-200'
        : active
          ? 'border-[#F97316]/40 bg-[#FFF7ED] text-[#EA580C] dark:border-[#F97316]/30 dark:bg-[#F97316]/10 dark:text-[#FB923C]'
          : 'border-neutral-200 bg-white text-neutral-500 hover:border-neutral-300 hover:bg-neutral-50 hover:text-neutral-700 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400 dark:hover:border-neutral-600 dark:hover:bg-neutral-800 dark:hover:text-neutral-200';

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

export function PortfolioFieldVisibilityMenu({
  value,
  onChange,
  menuPlacement = 'up',
  size = 'sm',
}: {
  value: ContactVisibilityLevel;
  onChange: (value: ContactVisibilityLevel) => void;
  menuPlacement?: 'up' | 'down';
  size?: 'sm' | 'md';
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [open]);

  const hidden = value === 'HIDDEN';
  const label = CONTACT_VISIBILITY_OPTIONS.find((option) => option.value === value)?.label ?? 'Public';
  const buttonSizeClass = size === 'md' ? 'h-10 w-10' : 'h-8 w-8';

  return (
    <div ref={rootRef} className="relative inline-flex shrink-0 items-center">
      <button
        type="button"
        title={`Visibility: ${label}`}
        aria-label={`Visibility: ${label}`}
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        className={`inline-flex shrink-0 items-center justify-center rounded-full border transition ${buttonSizeClass} ${
          open || hidden
            ? 'border-[#F97316]/40 bg-[#FFF7ED] text-[#EA580C] dark:border-[#F97316]/30 dark:bg-[#F97316]/10 dark:text-[#FB923C]'
            : 'border-neutral-300 bg-white text-neutral-700 hover:border-neutral-900 hover:bg-neutral-900 hover:text-white dark:border-white/25 dark:bg-transparent dark:text-white/80 dark:hover:border-white dark:hover:bg-white dark:hover:text-black'
        }`}
      >
        <FontAwesomeIcon icon={hidden ? faEyeSlash : faEye} className="h-3.5 w-3.5" fixedWidth />
      </button>
      {open ? (
        <div
          className={`absolute z-50 min-w-[9.5rem] overflow-hidden rounded-lg border border-neutral-200 bg-white py-1 shadow-lg dark:border-neutral-700 dark:bg-neutral-900 ${
            menuPlacement === 'down' ? 'right-0 top-full mt-1.5' : 'right-0 bottom-full mb-1.5'
          }`}
        >
          {CONTACT_VISIBILITY_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value);
                setOpen(false);
              }}
              className={`flex w-full items-center px-3 py-2 text-left text-xs font-medium transition ${
                option.value === value
                  ? 'bg-[#FFF7ED] text-[#EA580C] dark:bg-[#F97316]/10 dark:text-[#FB923C]'
                  : 'text-neutral-700 hover:bg-neutral-50 dark:text-neutral-200 dark:hover:bg-neutral-800'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

/** Avatar identity header for portfolio Information preview. */
export function PortfolioProfileHero({
  name,
  avatarUrl,
  isAvailable,
  availabilityLabel,
  aboutChromeOpen,
  aboutEditMode,
  onAboutEditModeChange,
  onAboutToggle,
  onAboutGlobalConfirm,
  aboutGlobalHasChanges = false,
  onAddEntry,
  addEntryLabel = 'Add entry',
  onDeleteEntry,
  deleteEntryLabel = 'Delete entry',
  deleteEntryDisabled = false,
  deleteEntryActive = false,
  hideAddWhenEditing: _hideAddWhenEditing = false,
  hideEditModeToggle = false,
  hideHeroActions = false,
  onEditSessionCancel,
  onEditSessionDone,
  visibility,
  onVisibilityChange,
  saving = false,
  hideBottomBorder: _hideBottomBorder = false,
  showIdentity = true,
  onPreview,
}: {
  name: string;
  avatarUrl?: string | null;
  isAvailable: boolean;
  availabilityLabel?: string | null;
  aboutChromeOpen?: boolean;
  aboutEditMode?: 'individual' | 'global';
  onAboutEditModeChange?: (mode: 'individual' | 'global') => void;
  onAboutToggle?: () => void;
  onAboutGlobalConfirm?: () => void;
  aboutGlobalHasChanges?: boolean;
  onAddEntry?: () => void;
  addEntryLabel?: string;
  onDeleteEntry?: () => void;
  deleteEntryLabel?: string;
  deleteEntryDisabled?: boolean;
  deleteEntryActive?: boolean;
  /** @deprecated Add/Delete are always hidden while Edit is open. Kept for call-site compat. */
  hideAddWhenEditing?: boolean;
  /** Hide Individual/Global toggle (e.g. while composing a new entry). */
  hideEditModeToggle?: boolean;
  /** Hide Visibility / Delete / Edit / Add (e.g. while adding a new entry). */
  hideHeroActions?: boolean;
  /** Replace the Edit pencil with Cancel / Done while an edit session is open. */
  onEditSessionCancel?: () => void;
  onEditSessionDone?: () => void;
  visibility?: ContactVisibilityLevel;
  onVisibilityChange?: (value: ContactVisibilityLevel) => void;
  saving?: boolean;
  /** @deprecated Header separator removed for all sections. Kept for call-site compat. */
  hideBottomBorder?: boolean;
  /** When false, only the action toolbar is shown (no avatar / name / plan). */
  showIdentity?: boolean;
  /** Outline "Preview" action next to Upgrade in the identity header. */
  onPreview?: () => void;
}) {
  const displayName = name.trim() || 'Your name';
  const showEditSessionActions = Boolean(
    aboutChromeOpen && onEditSessionCancel && onEditSessionDone && !hideHeroActions
  );
  const showAboutControls =
    onAboutToggle != null || Boolean(onAddEntry) || Boolean(onDeleteEntry) || showEditSessionActions;
  const showVisibility =
    Boolean(visibility && onVisibilityChange) && !aboutChromeOpen && !hideHeroActions;
  const showAdd = Boolean(onAddEntry) && !aboutChromeOpen;
  const showDelete = Boolean(onDeleteEntry) && !aboutChromeOpen && !hideHeroActions;
  const showEditButton =
    Boolean(onAboutToggle) && !hideHeroActions && !showEditSessionActions;
  const showEditModeToggle =
    Boolean(aboutChromeOpen && onAboutEditModeChange) && !hideEditModeToggle && !hideHeroActions;

  if (!showAboutControls && !showIdentity) {
    return null;
  }

  const actions = showAboutControls ? (
    <div className="relative z-30 flex shrink-0 flex-wrap items-center gap-2">
      {showEditModeToggle ? (
        <div className="inline-flex rounded-lg border border-neutral-200 p-0.5 dark:border-neutral-700">
          {(['individual', 'global'] as const).map((mode) => {
            const active = aboutEditMode === mode;
            return (
              <button
                key={mode}
                type="button"
                onClick={() => onAboutEditModeChange?.(mode)}
                className={`rounded-md px-2.5 py-1.5 text-xs font-semibold transition ${
                  active
                    ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                    : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100'
                }`}
              >
                {mode === 'individual' ? 'Individual' : 'Global'}
              </button>
            );
          })}
        </div>
      ) : null}

      {showEditModeToggle && aboutEditMode === 'global' ? (
        <PortfolioFieldIconButton
          label={aboutGlobalHasChanges ? 'Confirm all changes' : 'No changes to confirm'}
          tone={aboutGlobalHasChanges ? 'confirm' : 'neutral'}
          disabled={!aboutGlobalHasChanges || saving}
          onClick={() => onAboutGlobalConfirm?.()}
        >
          {saving ? (
            <LoadingSpinner size="sm" />
          ) : (
            <FontAwesomeIcon icon={faCircleCheck} className="h-4 w-4" fixedWidth />
          )}
        </PortfolioFieldIconButton>
      ) : null}

      {showVisibility ? (
        <PortfolioFieldVisibilityMenu
          value={visibility!}
          onChange={onVisibilityChange!}
          menuPlacement="down"
          size="md"
        />
      ) : null}

      {showDelete ? (
        <button
          type="button"
          onClick={onDeleteEntry}
          disabled={saving || deleteEntryDisabled}
          title={deleteEntryActive ? 'Cancel delete' : deleteEntryLabel}
          aria-label={deleteEntryActive ? 'Cancel delete' : deleteEntryLabel}
          aria-pressed={deleteEntryActive}
          className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition disabled:cursor-not-allowed disabled:opacity-50 ${
            deleteEntryActive
              ? 'border-red-300/80 bg-red-50/80 text-red-500 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-400'
              : 'border-neutral-200 bg-white text-neutral-400 hover:border-neutral-300 hover:bg-neutral-50 hover:text-neutral-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-500 dark:hover:border-neutral-600 dark:hover:bg-neutral-800 dark:hover:text-neutral-400'
          }`}
        >
          <FontAwesomeIcon icon={faTrash} className="h-3.5 w-3.5" fixedWidth aria-hidden />
        </button>
      ) : null}

      {showEditSessionActions ? (
        <div className="inline-flex items-center gap-2">
          <button
            type="button"
            onClick={onEditSessionCancel}
            disabled={saving}
            className="rounded-full border border-neutral-300 bg-white px-4 py-2.5 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-50 disabled:opacity-50 dark:border-neutral-600 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onEditSessionDone}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-full bg-[#F97316] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#EA580C] disabled:opacity-50 dark:text-neutral-950"
          >
            {saving ? <LoadingSpinner size="sm" /> : null}
            Done
          </button>
        </div>
      ) : null}

      {showEditButton ? (
        <button
          type="button"
          onClick={onAboutToggle}
          title={aboutChromeOpen ? 'Done' : 'Edit'}
          aria-label={aboutChromeOpen ? 'Done' : 'Edit'}
          aria-pressed={Boolean(aboutChromeOpen)}
          className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition ${
            aboutChromeOpen
              ? 'border-[#F97316]/50 bg-[#FFF7ED] text-[#EA580C] dark:border-[#F97316]/40 dark:bg-[#F97316]/10 dark:text-[#FB923C]'
              : 'border-neutral-300 bg-white text-neutral-700 hover:border-neutral-400 hover:bg-neutral-50 dark:border-neutral-600 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:border-neutral-500 dark:hover:bg-neutral-800'
          }`}
        >
          <FontAwesomeIcon icon={faPenToSquare} className="h-4 w-4" fixedWidth aria-hidden />
        </button>
      ) : null}

      {showAdd ? (
        <button
          type="button"
          onClick={onAddEntry}
          disabled={saving}
          title={addEntryLabel}
          aria-label={addEntryLabel}
          aria-pressed={hideHeroActions}
          className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition disabled:cursor-not-allowed disabled:opacity-50 ${
            hideHeroActions
              ? 'bg-[#EA580C] text-white dark:text-neutral-950'
              : 'bg-[#F97316] text-white hover:bg-[#EA580C] dark:text-neutral-950'
          }`}
        >
          <FontAwesomeIcon icon={faPlus} className="h-4 w-4" fixedWidth aria-hidden />
        </button>
      ) : null}
    </div>
  ) : null;

  if (!showIdentity) {
    return (
      <div className="flex items-center justify-end px-5 py-1.5 sm:px-7 sm:py-2">
        {actions}
      </div>
    );
  }

  const statusLabel = resolveAvailabilityStatusLabel(isAvailable, availabilityLabel) ?? 'Unavailable';
  const showHeaderCtas = !aboutChromeOpen && !hideHeroActions;

  return (
    <div className="relative">
      {/* No banner: the avatar floats half outside the card's top edge. */}
      <div className="px-5 pb-5 sm:px-7 sm:pb-6">
        <div className="-mt-12 flex flex-col items-center gap-5 text-center sm:-mt-14 sm:flex-row sm:items-end sm:justify-between sm:gap-6 sm:text-left">
          <div className="flex min-w-0 max-w-full flex-col items-center gap-3 sm:flex-row sm:items-end sm:gap-4">
            <div
              className="relative shrink-0 rounded-full bg-white p-1 dark:bg-[#0F0F0F]"
              title={statusLabel}
            >
              {avatarUrl?.trim() ? (
                <div className="h-24 w-24 overflow-hidden rounded-full sm:h-28 sm:w-28 [&_img]:!h-full [&_img]:!w-full">
                  <Avatar name={displayName} avatarUrl={avatarUrl} size="xl" tone="muted" />
                </div>
              ) : (
                <div
                  className="flex h-24 w-24 items-center justify-center rounded-full bg-[#0a0a0a] text-2xl font-bold tracking-wide text-[#F97316] sm:h-28 sm:w-28"
                  aria-hidden
                >
                  {displayName
                    .split(' ')
                    .filter(Boolean)
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2) || '?'}
                </div>
              )}
            </div>

            <div className="min-w-0 max-w-full sm:pb-1.5">
              <h2 className="truncate text-xl font-bold tracking-tight text-neutral-900 dark:text-white sm:text-2xl">
                {displayName}
              </h2>
              <p className="mt-2 flex items-center justify-center gap-2.5 text-[12px] font-medium uppercase tracking-[0.14em] text-neutral-600 dark:text-neutral-400 sm:justify-start">
                <span
                  className="h-1.5 w-1.5 shrink-0 animate-pulse rounded-full bg-emerald-500 [animation-duration:3s]"
                  aria-hidden
                />
                <span>Published</span>
                <span className="text-neutral-400 dark:text-neutral-600" aria-hidden>
                  /
                </span>
                <span>Free plan</span>
              </p>
            </div>
          </div>

          <div className="flex w-full flex-col items-center gap-3 sm:w-auto sm:shrink-0 sm:flex-row sm:flex-nowrap sm:gap-2 sm:pb-1.5">
            {showHeaderCtas ? (
              <div className={`grid w-full gap-2 sm:flex sm:w-auto ${onPreview ? 'grid-cols-2' : 'grid-cols-1'}`}>
                {onPreview ? (
                  <button
                    type="button"
                    onClick={onPreview}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-black/15 px-3.5 text-[0.9rem] font-medium text-[#222222] transition-colors duration-200 hover:border-black/30 hover:text-[#0A0A0A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/40 dark:border-white/15 dark:text-neutral-200 dark:hover:border-white/35 dark:hover:text-white sm:h-9"
                  >
                    <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12s3.75-7.5 9.75-7.5S21.75 12 21.75 12 18 19.5 12 19.5 2.25 12 2.25 12z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                    Preview
                  </button>
                ) : null}
                <Link
                  href={PORTFOLIO_UPGRADE_PATH}
                  className="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg bg-neutral-950 px-3.5 text-[0.9rem] font-medium text-white shadow-sm transition hover:bg-neutral-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/40 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200 sm:h-9"
                >
                  <svg className="h-3.5 w-3.5 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                    <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z" />
                  </svg>
                  Upgrade
                </Link>
              </div>
            ) : null}
            {actions}
          </div>
        </div>
      </div>
    </div>
  );
}

type PortfolioFooterMetaItem = { label: string; value: ReactNode };

/** Footer meta value that reads as plain text but opens a native picker. */
export function PortfolioFooterSelect({
  value,
  options,
  onChange,
  disabled = false,
  ariaLabel,
  emptyLabel = 'Not set',
}: {
  value: string;
  options: ReadonlyArray<{ value: string; label: string }>;
  onChange: (value: string) => void;
  disabled?: boolean;
  ariaLabel: string;
  emptyLabel?: string;
}) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      disabled={disabled}
      aria-label={ariaLabel}
      className="cursor-pointer appearance-none bg-transparent p-0 text-[11.5px] font-medium uppercase tracking-[0.14em] text-inherit outline-none transition-colors duration-300 [field-sizing:content] hover:text-[#FF5722] focus-visible:text-[#FF5722] disabled:cursor-wait disabled:opacity-60 dark:[color-scheme:dark]"
    >
      <option value="">{emptyLabel}</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

export function PortfolioEditorFooter({
  lastUpdatedLabel,
  leadingMetaLabel,
  metaItems,
  isEditing,
  saving,
  hasUnsavedChanges,
  onCancel,
  onEdit,
  hidePrimaryActions = false,
  hideTopBorder = false,
}: {
  lastUpdatedLabel: string;
  /** Optional meta shown to the left of “Last updated …”, e.g. “5 questions”. */
  leadingMetaLabel?: string | null;
  /** Editorial meta row (mono micro-caps) placed after “Last updated”; replaces the ✦ layout. */
  metaItems?: ReadonlyArray<PortfolioFooterMetaItem>;
  isEditing: boolean;
  saving: boolean;
  hasUnsavedChanges: boolean;
  onCancel: () => void;
  onEdit: () => void;
  hidePrimaryActions?: boolean;
  hideTopBorder?: boolean;
}) {
  return (
    <div
      className={`flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-7 ${
        hideTopBorder ? '' : 'border-t border-black/[0.08] dark:border-white/[0.08]'
      }`}
    >
      {metaItems ? (
        <dl className="flex flex-wrap items-center gap-x-10 gap-y-2 text-[11.5px] uppercase tracking-[0.14em]">
          {[{ label: 'Last updated', value: lastUpdatedLabel }, ...metaItems].map((item) => (
            <div key={item.label} className="flex items-center gap-2.5">
              <dt className="text-neutral-500">{item.label}</dt>
              <dd className="font-medium text-neutral-800 dark:text-neutral-200">{item.value}</dd>
            </div>
          ))}
        </dl>
      ) : (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-neutral-500">
          {leadingMetaLabel ? (
            <span className="inline-flex items-center gap-1.5">
              <span className="text-[#F97316]" aria-hidden>
                ✦
              </span>
              {leadingMetaLabel}
            </span>
          ) : null}
          <span className="inline-flex items-center gap-1.5">
            <span className="text-[#F97316]" aria-hidden>
              ✦
            </span>
            Last updated {lastUpdatedLabel}
          </span>
        </div>
      )}

      {hidePrimaryActions ? null : (
        <div className="flex justify-end gap-3">
          {isEditing ? (
            <>
              <button
                type="button"
                onClick={onCancel}
                disabled={saving}
                className="rounded-lg border border-neutral-300 px-5 py-2.5 text-sm font-semibold text-neutral-700 hover:bg-neutral-100 disabled:opacity-60 dark:border-neutral-600 dark:text-neutral-200 dark:hover:bg-neutral-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving || !hasUnsavedChanges}
                className="inline-flex items-center gap-2 rounded-lg bg-[#F97316] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#EA580C] disabled:opacity-60 dark:text-neutral-950"
              >
                {saving ? <LoadingSpinner size="sm" /> : null}
                Save changes
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={onEdit}
              className="inline-flex items-center gap-2 rounded-lg bg-[#F97316] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#EA580C] dark:text-neutral-950"
            >
              <FontAwesomeIcon icon={faPenToSquare} className="h-4 w-4" fixedWidth aria-hidden />
              Edit Profile
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export type PortfolioAboutFieldKey =
  | 'fullName'
  | 'username'
  | 'bio'
  | 'specialite'
  | 'specialtySet'
  | 'gender'
  | 'nationality'
  | 'yearsOfExperience'
  | 'spokenLanguages'
  | 'aboutSkills'
  | 'aboutStrengths'
  | 'aboutSystemsTools'
  | 'aboutInterests'
  | 'aboutEducation'
  | 'isAvailable'
  | 'availabilityLabel'
  | 'availabilityHours'
  | 'typicalResponseTime';

export type PortfolioAboutFieldValue = {
  fullName: string;
  username: string;
  bio: string;
  specialite: string;
  specialtySet: { specialties: string[]; specialtyTags: string[] };
  gender: string;
  nationality: string;
  yearsOfExperience: number | null;
  spokenLanguages: SpokenLanguageEntry[];
  aboutSkills: ProfileSkillEntry[];
  aboutStrengths: string[];
  aboutSystemsTools: string[];
  aboutInterests: string[];
  aboutEducation: ProfileEducationEntry[];
  isAvailable: boolean;
  availabilityLabel: string;
  availabilityHours: string;
  typicalResponseTime: string;
};

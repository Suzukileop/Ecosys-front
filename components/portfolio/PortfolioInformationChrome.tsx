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
import { useT } from '@/lib/i18n/I18nProvider';

/** The site's two buttons (News, Providers, search): a solid ink pill and an outlined pill. */
export const PORTFOLIO_PRIMARY_PILL =
  'inline-flex h-10 items-center justify-center gap-2 rounded-full bg-[color:var(--gn-primary,#0F1419)] px-5 text-[15px] font-semibold leading-5 text-[color:var(--gn-primary-ink,#FFFFFF)] transition-colors hover:bg-[color:var(--gn-primary-hover,#272C30)] disabled:opacity-60 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[color:var(--gn-ring)]';
export const PORTFOLIO_SECONDARY_PILL =
  'inline-flex h-10 items-center justify-center gap-2 rounded-full px-5 text-[15px] font-semibold leading-5 text-[color:var(--gn-ink,#0F1419)] shadow-[inset_0_0_0_1px_#CFD9DE] transition-colors hover:bg-[color:var(--gn-hover)] disabled:opacity-60 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[color:var(--gn-ring)] dark:shadow-[inset_0_0_0_1px_#536471]';

/** One glyph per visibility level, so the setting reads at a glance: a globe, two people, a lock. */
function VisibilityGlyph({ level, className = 'h-3.5 w-3.5' }: { level: ContactVisibilityLevel; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={`shrink-0 ${className}`} fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      {level === 'HIDDEN' ? (
        <>
          <rect x="5" y="11" width="14" height="9" rx="2" />
          <path d="M8 11V8a4 4 0 0 1 8 0v3" />
        </>
      ) : level === 'MEMBERS' ? (
        <>
          <circle cx="9" cy="8.5" r="3" />
          <path d="M3.5 19a5.5 5.5 0 0 1 11 0M16 5.8a3 3 0 0 1 0 5.4M17.5 14a5.5 5.5 0 0 1 3 5" />
        </>
      ) : (
        <>
          <circle cx="12" cy="12" r="8.5" />
          <path d="M3.5 12h17M12 3.5c2.3 2.4 3.5 5.2 3.5 8.5s-1.2 6.1-3.5 8.5c-2.3-2.4-3.5-5.2-3.5-8.5s1.2-6.1 3.5-8.5z" />
        </>
      )}
    </svg>
  );
}

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
      ? 'border-[#0F1419] bg-[#0F1419] text-white dark:border-[#EFF3F4] dark:bg-[#EFF3F4] dark:text-[#0F1419]'
      : tone === 'cancel'
        ? 'border-[#CFD9DE] bg-white text-[#536471] hover:border-[#0F1419] hover:text-[#0F1419] dark:border-[#536471] dark:bg-transparent dark:text-[#71767B] dark:hover:border-[#E7E9EA] dark:hover:text-[#E7E9EA]'
        : active
          ? 'border-[#0F1419] bg-[#0F1419] text-white dark:border-[#EFF3F4] dark:bg-[#EFF3F4] dark:text-[#0F1419]'
          : 'border-[#CFD9DE] bg-white text-[#536471] hover:border-[#0F1419] hover:text-[#0F1419] dark:border-[#536471] dark:bg-transparent dark:text-[#71767B] dark:hover:border-[#E7E9EA] dark:hover:text-[#E7E9EA]';

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
  variant = 'icon',
}: {
  value: ContactVisibilityLevel;
  onChange: (value: ContactVisibilityLevel) => void;
  menuPlacement?: 'up' | 'down';
  size?: 'sm' | 'md';
  /**
   * `text` — the level in words beside a label ("Public ▾", "Only me ▾"), as LinkedIn's "Visible to":
   * quiet secondary ink, the fill tone under the pointer, and it says what it does without a hover.
   * `icon` — the round eye button.
   */
  variant?: 'icon' | 'text';
}) {
  const t = useT();
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
  /* In words, "Hidden" reads as "the field is hidden"; it means only the owner sees it. */
  const optionLabel = (level: ContactVisibilityLevel, fallback: string) =>
    variant === 'text' && level === 'HIDDEN' ? t('Only me') : fallback;
  const label = optionLabel(
    value,
    CONTACT_VISIBILITY_OPTIONS.find((option) => option.value === value)?.label ?? 'Public'
  );
  const buttonSizeClass = size === 'md' ? 'h-10 w-10' : 'h-8 w-8';

  return (
    <div ref={rootRef} className="relative inline-flex shrink-0 items-center">
      {variant === 'text' ? (
      /* A privacy setting, so it is drawn as one: a small pill in the fill tone with the level's glyph
         and its name — not quiet secondary text that reads as decoration. */
      <button
        type="button"
        title={t('Who can see this: {label}', { label })}
        aria-label={t('Who can see this: {label}', { label })}
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        className={`inline-flex h-7 shrink-0 items-center gap-1.5 rounded-full px-2.5 text-[12px] font-semibold leading-4 text-[color:var(--gn-ink,#0F1419)] transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[color:var(--gn-ring)] ${
          open ? 'bg-[color:var(--gn-hover)]' : 'bg-[color:var(--gn-inset,#EFF3F4)] hover:bg-[color:var(--gn-hover)]'
        }`}
      >
        <VisibilityGlyph level={value} />
        {label}
        <svg aria-hidden viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className={`h-3 w-3 text-[color:var(--gn-ink2,#536471)] transition-transform duration-200 ${open ? 'rotate-180' : ''}`}>
          <path d="m4 6 4 4 4-4" />
        </svg>
      </button>
      ) : (
      <button
        type="button"
        title={t('Visibility: {label}', { label })}
        aria-label={t('Visibility: {label}', { label })}
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        className={`inline-flex shrink-0 items-center justify-center rounded-full border transition ${buttonSizeClass} ${
          open || hidden
            ? 'border-[#0F1419] bg-[#0F1419] text-white dark:border-[#EFF3F4] dark:bg-[#EFF3F4] dark:text-[#0F1419]'
            : 'border-[#CFD9DE] bg-white text-[#0F1419] hover:border-[#0F1419] hover:bg-[#0F1419] hover:text-white dark:border-[#536471] dark:bg-transparent dark:text-[#E7E9EA] dark:hover:border-[#EFF3F4] dark:hover:bg-[#EFF3F4] dark:hover:text-[#0F1419]'
        }`}
      >
        <FontAwesomeIcon icon={hidden ? faEyeSlash : faEye} className="h-3.5 w-3.5" fixedWidth />
      </button>
      )}
      {open ? (
        <div
          className={`absolute z-50 min-w-[11rem] overflow-hidden p-1.5 rounded-2xl bg-[#FEFEFE] shadow-[0_0_0_1px_#E1E8ED,0_8px_20px_-14px_rgba(15,20,25,0.18)] dark:bg-[#000000] dark:shadow-[0_0_0_1px_#2F3336] ${
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
              className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-[13px] transition-colors hover:bg-[color:var(--gn-hover)] ${
                option.value === value
                  ? 'font-semibold text-[color:var(--gn-ink,#0F1419)]'
                  : 'font-medium text-[color:var(--gn-ink2,#536471)]'
              }`}
            >
              <VisibilityGlyph level={option.value} />
              <span className="flex-1">{optionLabel(option.value, option.label)}</span>
              {option.value === value ? (
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="m5 12.5 4.5 4.5L19 7.5" />
                </svg>
              ) : null}
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
  /** "Preview" pill in the identity header — phones only: from md the rail's actions box has it. */
  onPreview?: () => void;
}) {
  const t = useT();
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
        <div className="inline-flex rounded-full bg-[color:var(--gn-hover)] p-0.5">
          {(['individual', 'global'] as const).map((mode) => {
            const active = aboutEditMode === mode;
            return (
              <button
                key={mode}
                type="button"
                onClick={() => onAboutEditModeChange?.(mode)}
                className={`rounded-full px-3 py-1.5 text-[13px] font-semibold transition ${
                  active
                    ? 'bg-[#0F1419] text-white dark:bg-[#EFF3F4] dark:text-[#0F1419]'
                    : 'text-[#536471] hover:text-[#0F1419] dark:text-[#71767B] dark:hover:text-[#E7E9EA]'
                }`}
              >
                {mode === 'individual' ? t('Individual') : t('Global')}
              </button>
            );
          })}
        </div>
      ) : null}

      {showEditModeToggle && aboutEditMode === 'global' ? (
        <PortfolioFieldIconButton
          label={aboutGlobalHasChanges ? t('Confirm all changes') : t('No changes to confirm')}
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
          title={deleteEntryActive ? t('Cancel delete') : deleteEntryLabel}
          aria-label={deleteEntryActive ? t('Cancel delete') : deleteEntryLabel}
          aria-pressed={deleteEntryActive}
          className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition disabled:cursor-not-allowed disabled:opacity-50 ${
            deleteEntryActive
              ? 'border-[#F4212E] bg-[#F4212E] text-white'
              : 'border-[#CFD9DE] bg-white text-[#536471] hover:border-[#0F1419] hover:text-[#0F1419] dark:border-[#536471] dark:bg-transparent dark:text-[#71767B] dark:hover:border-[#E7E9EA] dark:hover:text-[#E7E9EA]'
          }`}
        >
          <FontAwesomeIcon icon={faTrash} className="h-3.5 w-3.5" fixedWidth aria-hidden />
        </button>
      ) : null}

      {showEditSessionActions ? (
        <div className="inline-flex items-center gap-2">
          <button type="button" onClick={onEditSessionCancel} disabled={saving} className={PORTFOLIO_SECONDARY_PILL}>
            {t('Cancel')}
          </button>
          <button type="button" onClick={onEditSessionDone} disabled={saving} className={PORTFOLIO_PRIMARY_PILL}>
            {saving ? <LoadingSpinner size="sm" /> : null}
            {t('Done')}
          </button>
        </div>
      ) : null}

      {showEditButton ? (
        <button
          type="button"
          onClick={onAboutToggle}
          title={aboutChromeOpen ? t('Done') : t('Edit')}
          aria-label={aboutChromeOpen ? t('Done') : t('Edit')}
          aria-pressed={Boolean(aboutChromeOpen)}
          className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition ${
            aboutChromeOpen
              ? 'border-[#0F1419] bg-[#0F1419] text-white dark:border-[#EFF3F4] dark:bg-[#EFF3F4] dark:text-[#0F1419]'
              : 'border-[#CFD9DE] bg-white text-[#0F1419] hover:border-[#0F1419] hover:bg-[#0F1419] hover:text-white dark:border-[#536471] dark:bg-transparent dark:text-[#E7E9EA] dark:hover:border-[#EFF3F4] dark:hover:bg-[#EFF3F4] dark:hover:text-[#0F1419]'
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
              ? 'bg-[#272C30] text-white dark:bg-[#D7DBDC] dark:text-[#0F1419]'
              : 'bg-[#0F1419] text-white hover:bg-[#272C30] dark:bg-[#EFF3F4] dark:text-[#0F1419] dark:hover:bg-[#D7DBDC]'
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

  const statusLabel = resolveAvailabilityStatusLabel(isAvailable, availabilityLabel) ?? t('Unavailable');
  const showHeaderCtas = !aboutChromeOpen && !hideHeroActions;

  return (
    /* Its own flat block above the form block (the card tone, square under news-mono): the identity
       on the left — name, then where the portfolio lives — and the header's actions on the right. */
    <div className="relative bg-[color:var(--gn-surface)] p-5 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
        <div className="flex min-w-0 max-w-full items-center gap-4">
          <div className="relative shrink-0 rounded-full" title={statusLabel}>
            {avatarUrl?.trim() ? (
              <div className="h-14 w-14 overflow-hidden rounded-full sm:h-16 sm:w-16 [&_img]:!h-full [&_img]:!w-full">
                <Avatar name={displayName} avatarUrl={avatarUrl} size="xl" tone="muted" />
              </div>
            ) : (
              <div
                className="flex h-14 w-14 items-center justify-center rounded-full bg-[color:var(--gn-ink)] text-lg font-bold tracking-wide text-[color:var(--gn-surface)] sm:h-16 sm:w-16"
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

          <div className="min-w-0 flex-1">
            <h2 className="truncate text-[20px] font-extrabold leading-6 tracking-[-0.01em] text-[color:var(--gn-ink)]">
              {displayName}
            </h2>
            {/* What is true of every portfolio today: it is live (there is no draft state) and on the free
                plan (there is no paid one yet). Its address is shared from the rail's "Copy live link". */}
            <p className="mt-1 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-0.5 text-[14px] leading-5 text-[color:var(--gn-ink2)]">
              <span className="inline-flex shrink-0 items-center gap-1.5 font-semibold text-[color:var(--gn-ink)]">
                <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-[color:var(--gn-green)]" />
                {t('Live')}
              </span>
              <span aria-hidden>·</span>
              <span className="shrink-0">{t('Free plan')}</span>
            </p>
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {showHeaderCtas ? (
            <>
              {onPreview ? (
                <button type="button" onClick={onPreview} className={`${PORTFOLIO_PRIMARY_PILL} md:hidden`}>
                  {t('Preview')}
                </button>
              ) : null}
              <Link href={PORTFOLIO_UPGRADE_PATH} className={PORTFOLIO_SECONDARY_PILL}>
                {t('Upgrade')}
              </Link>
            </>
          ) : null}
          {actions}
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
  const t = useT();
  const selected = options.find((option) => option.value === value)?.label;
  /* What shows is plain text in the footer's own case — the value, or "Not set — Set" with "Set" as
     a link; the native select lies invisible over it, so a click anywhere on it opens the picker and
     keyboard / screen readers still get a real select. */
  return (
    <span className="relative inline-flex items-center">
      <span aria-hidden className={disabled ? 'opacity-60' : ''}>
        {selected ?? (
          <>
            <span className="font-normal text-[#536471] dark:text-[#8B98A5]">{t(emptyLabel)}</span>
            <span className="text-[#536471] dark:text-[#8B98A5]"> — </span>
            <span className="font-semibold text-[#0F1419] underline underline-offset-2 dark:text-[#E7E9EA]">{t('Set')}</span>
          </>
        )}
      </span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        aria-label={ariaLabel}
        className="absolute inset-0 h-full w-full cursor-pointer appearance-none opacity-0 disabled:cursor-wait dark:[color-scheme:dark]"
      >
        <option value="">{t(emptyLabel)}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {t(option.label)}
          </option>
        ))}
      </select>
    </span>
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
  flush = false,
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
  /** No card around the form (My Profile): no side padding, so the line starts with the fields. */
  flush?: boolean;
}) {
  const t = useT();
  return (
    <div
      className={`flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between ${flush ? 'px-4 sm:px-0' : 'px-5 sm:px-7'} ${
        hideTopBorder ? '' : ''
      }`}
    >
      {metaItems ? (
        /* One calm line: "Last updated today · Member since July 2026 · Response time Not set — Set". */
        <dl className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] leading-[18px] text-[color:var(--gn-ink2,#536471)]">
          {[{ label: t('Last updated'), value: lastUpdatedLabel }, ...metaItems].map((item, index) => (
            <div key={item.label} className="flex items-center gap-2">
              {index > 0 ? <span aria-hidden>·</span> : null}
              <dt>{t(item.label)}</dt>
              <dd className="text-[color:var(--gn-ink,#0F1419)]">{item.value}</dd>
            </div>
          ))}
        </dl>
      ) : (
        <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[13px] leading-[18px] text-[color:var(--gn-ink2,#536471)]">
          {leadingMetaLabel ? (
            <>
              <span>{leadingMetaLabel}</span>
              <span aria-hidden>·</span>
            </>
          ) : null}
          <span>{t('Last updated {lastUpdatedLabel}', { lastUpdatedLabel })}</span>
        </div>
      )}

      {hidePrimaryActions ? null : (
        <div className="flex justify-end gap-3">
          {isEditing ? (
            <>
              <button type="button" onClick={onCancel} disabled={saving} className={PORTFOLIO_SECONDARY_PILL}>
                {t('Cancel')}
              </button>
              <button type="submit" disabled={saving || !hasUnsavedChanges} className={PORTFOLIO_PRIMARY_PILL}>
                {saving ? <LoadingSpinner size="sm" /> : null}
                {t('Save changes')}
              </button>
            </>
          ) : (
            <button type="button" onClick={onEdit} className={PORTFOLIO_PRIMARY_PILL}>
              <FontAwesomeIcon icon={faPenToSquare} className="h-4 w-4" fixedWidth aria-hidden />
              {t('Edit Profile')}
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

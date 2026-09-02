'use client';

import { useEffect, useRef, useState, type ComponentProps, type ReactNode } from 'react';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash, faPenToSquare } from '@fortawesome/free-regular-svg-icons';
import { faCircleCheck, faPlus, faTrash, faXmark } from '@fortawesome/free-solid-svg-icons';
import { Avatar } from '@/components/ui/Avatar';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { AvailabilityHoursInput } from '@/components/ui/AvailabilityHoursInput';
import { CREATOR_GENDER_VALUES } from '@/lib/creator-gender';
import {
  NATIONALITY_SELECT_OPTIONS,
  nationalityFlag,
  nationalityLabel,
  normalizeNationalityCode,
} from '@/lib/countries';
import {
  CONTACT_VISIBILITY_OPTIONS,
  type ContactVisibilityLevel,
} from '@/lib/contact-visibility';
import {
  defaultSchedule,
  formatAvailabilityHours,
  parseAvailabilityHours,
  type AvailabilitySchedule,
} from '@/lib/availabilityHours';
import {
  DEFAULT_LANGUAGE_PROFICIENCY_LEVELS,
  SPOKEN_LANGUAGE_PRESETS,
  dedupeSpokenLanguageEntries,
  resolveSpokenLanguageLevelLabel,
  spokenLanguageEntriesEqual,
  spokenLanguageMatchKey,
  type SpokenLanguageEntry,
} from '@/lib/spoken-languages';
import { fetchLanguageProficiencyLevels } from '@/lib/reference-api';
import { TYPICAL_RESPONSE_TIME_OPTIONS } from '@/lib/typical-response-time';
import {
  AVAILABILITY_STATUS_OTHER_VALUE,
  availabilityStatusSelectOptions,
  isAvailabilityStatusPreset,
  normalizeAvailabilityStatusSelectValue,
  resolveAvailabilityStatusLabel,
} from '@/lib/availability-status';
import { SpecialtyMultiSelect } from '@/components/creator/studio/SpecialtyMultiSelect';
import { parseSpecialtyList, parseSpecialtyTags } from '@/lib/specialties';
import type { ProfileEducationEntry, ProfileSkillEntry } from '@/types/ecosystem';
import {
  createEmptyAboutSkillEntry,
  MAX_ABOUT_SKILLS,
  sameAboutSkills,
} from '@/lib/about-skills';
import { PortfolioLocationReadOnly } from '@/components/portfolio/PortfolioLocationChrome';
import { PORTFOLIO_UPGRADE_PATH } from '@/components/portfolio/portfolio-pricing-upgrade-panel';
import { brandCtaClass } from '@/components/landing/landingBrand';

const inlineInputClass =
  'w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-[15px] font-semibold text-neutral-900 outline-none transition focus:border-[#F97316] focus:ring-2 focus:ring-[#F97316]/20 dark:border-neutral-600 dark:bg-neutral-900 dark:text-white';

export function PortfolioFieldIconButton({
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

function PortfolioFieldVisibilityMenu({
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
            : 'border-neutral-200 bg-white text-neutral-500 hover:border-neutral-300 hover:bg-neutral-50 hover:text-neutral-700 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400 dark:hover:border-neutral-600 dark:hover:bg-neutral-800 dark:hover:text-neutral-200'
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

/** Flat field row with optional row actions (visibility + edit / confirm). */
export function PortfolioFlatField({
  label,
  value,
  emptyLabel = 'Not set',
  muted,
  children,
  className = '',
  valueSuffix,
  icon,
  editing = false,
  editControl,
  onEdit,
  onConfirm,
  onCancelEdit,
  confirming = false,
  canConfirm = true,
  showVisibility = false,
  visibility,
  onVisibilityChange,
}: {
  label: string;
  value?: string | null;
  emptyLabel?: string;
  muted?: boolean;
  children?: ReactNode;
  className?: string;
  valueSuffix?: string | null;
  icon?: ReactNode;
  editing?: boolean;
  editControl?: ReactNode;
  onEdit?: () => void;
  onConfirm?: () => void;
  onCancelEdit?: () => void;
  confirming?: boolean;
  canConfirm?: boolean;
  showVisibility?: boolean;
  visibility?: ContactVisibilityLevel;
  onVisibilityChange?: (value: ContactVisibilityLevel) => void;
}) {
  const display = value?.trim();
  const showVisibilityAction = Boolean(
    showVisibility && visibility && onVisibilityChange && (editing ? !onConfirm : true)
  );
  const showEditActions = Boolean(editing ? onConfirm : onEdit);
  const showActions = showVisibilityAction || showEditActions;

  const valueContent = editing ? (
    editControl
  ) : children ? (
    children
  ) : display ? (
    <p
      className={`text-[15px] font-semibold leading-relaxed whitespace-pre-wrap ${
        muted
          ? 'italic text-neutral-500 dark:text-neutral-400'
          : 'text-neutral-900 dark:text-white'
      }`}
    >
      {display}
      {valueSuffix ? (
        <span className="font-medium text-neutral-500 dark:text-neutral-400"> {valueSuffix}</span>
      ) : null}
    </p>
  ) : (
    <p className="text-[15px] italic text-neutral-500 dark:text-neutral-400">{emptyLabel}</p>
  );

  return (
    <div className={`flex items-center gap-4 py-6 ${className}`}>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2.5">
          {icon ? (
            <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400">
              {icon}
            </span>
          ) : null}
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-500 dark:text-neutral-500">
            {label}
          </p>
        </div>
        <div className="mt-2.5">{valueContent}</div>
      </div>
      {showActions ? (
        <div className="inline-flex h-8 shrink-0 items-center gap-1.5">
          {showVisibilityAction ? (
            <PortfolioFieldVisibilityMenu value={visibility!} onChange={onVisibilityChange!} />
          ) : null}
          {editing && onConfirm ? (
            <>
              <PortfolioFieldIconButton
                label={canConfirm ? `Confirm ${label}` : `No changes to ${label}`}
                tone={canConfirm ? 'confirm' : 'neutral'}
                disabled={!canConfirm || confirming}
                onClick={() => onConfirm()}
              >
                {confirming ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <FontAwesomeIcon icon={faCircleCheck} className="h-4 w-4" fixedWidth />
                )}
              </PortfolioFieldIconButton>
              <PortfolioFieldIconButton
                label={`Cancel ${label}`}
                tone="cancel"
                disabled={confirming}
                onClick={() => onCancelEdit?.()}
              >
                <FontAwesomeIcon icon={faXmark} className="h-3.5 w-3.5" fixedWidth />
              </PortfolioFieldIconButton>
            </>
          ) : onEdit ? (
            <PortfolioFieldIconButton label={`Edit ${label}`} onClick={onEdit}>
              <FontAwesomeIcon icon={faPenToSquare} className="h-3.5 w-3.5" fixedWidth />
            </PortfolioFieldIconButton>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

export function PortfolioLanguageChips({
  languages,
}: {
  languages: Array<string | SpokenLanguageEntry>;
}) {
  const normalized = languages.map((item) =>
    typeof item === 'string' ? { value: item, level: null } : item
  );
  if (normalized.length === 0) {
    return <p className="text-[15px] italic text-neutral-500 dark:text-neutral-400">Not set</p>;
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {normalized.map((language) => {
        const levelLabel = resolveSpokenLanguageLevelLabel(language.level);
        return (
          <span
            key={spokenLanguageMatchKey(language.value)}
            className="rounded-lg border border-neutral-200 bg-neutral-100 px-3.5 py-1.5 text-sm font-medium text-neutral-800 dark:border-neutral-700 dark:bg-[#141414] dark:text-neutral-100"
          >
            {language.value}
            {levelLabel ? (
              <span className="ml-1.5 text-xs font-semibold text-neutral-500 dark:text-neutral-400">
                · {levelLabel}
              </span>
            ) : null}
          </span>
        );
      })}
    </div>
  );
}

function PortfolioInlineLanguagesEditor({
  value,
  onChange,
}: {
  value: SpokenLanguageEntry[];
  onChange: (value: SpokenLanguageEntry[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [customDraft, setCustomDraft] = useState('');
  const [levelOptions, setLevelOptions] = useState(DEFAULT_LANGUAGE_PROFICIENCY_LEVELS);
  const rootRef = useRef<HTMLDivElement>(null);
  const selected = dedupeSpokenLanguageEntries(value);
  const selectedKeys = new Set(selected.map((item) => spokenLanguageMatchKey(item.value)));
  const customSelected = selected.filter(
    (language) =>
      !SPOKEN_LANGUAGE_PRESETS.some(
        (preset) => spokenLanguageMatchKey(preset) === spokenLanguageMatchKey(language.value)
      )
  );

  useEffect(() => {
    void fetchLanguageProficiencyLevels().then(setLevelOptions);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [open]);

  const sync = (next: SpokenLanguageEntry[]) => {
    onChange(dedupeSpokenLanguageEntries(next));
  };

  const toggle = (language: string) => {
    const key = spokenLanguageMatchKey(language);
    if (selectedKeys.has(key)) {
      sync(selected.filter((item) => spokenLanguageMatchKey(item.value) !== key));
      return;
    }
    sync([...selected, { value: language, level: null }]);
  };

  const addCustom = () => {
    const trimmed = customDraft.trim();
    if (!trimmed || selectedKeys.has(spokenLanguageMatchKey(trimmed))) return;
    sync([...selected, { value: trimmed, level: null }]);
    setCustomDraft('');
  };

  const updateLevel = (language: string, level: SpokenLanguageEntry['level']) => {
    const key = spokenLanguageMatchKey(language);
    sync(
      selected.map((item) =>
        spokenLanguageMatchKey(item.value) === key ? { ...item, level: level ?? null } : item
      )
    );
  };

  const summary =
    selected.length === 0
      ? 'Select languages'
      : selected.length <= 2
        ? selected
            .map((item) => {
              const levelLabel = resolveSpokenLanguageLevelLabel(item.level, levelOptions);
              return levelLabel ? `${item.value} (${levelLabel})` : item.value;
            })
            .join(', ')
        : `${selected
            .slice(0, 2)
            .map((item) => item.value)
            .join(', ')} +${selected.length - 2}`;

  return (
    <div ref={rootRef} className="relative w-full max-w-sm">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-haspopup="listbox"
        className={`${inlineInputClass} flex items-center justify-between gap-3 text-left`}
      >
        <span className={selected.length === 0 ? 'font-medium text-neutral-500' : undefined}>{summary}</span>
        <svg
          className={`h-4 w-4 shrink-0 text-neutral-400 transition ${open ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open ? (
        <div className="absolute left-0 right-0 z-20 mt-1.5 overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-lg dark:border-neutral-700 dark:bg-neutral-900">
          {selected.length > 0 ? (
            <div className="space-y-2 border-b border-neutral-200 p-2 dark:border-neutral-700">
              {selected.map((language) => (
                <div
                  key={spokenLanguageMatchKey(language.value)}
                  className="flex items-center gap-2 rounded-md bg-neutral-50 px-2 py-1.5 dark:bg-neutral-800/60"
                >
                  <span className="min-w-0 flex-1 truncate text-sm font-medium text-neutral-900 dark:text-neutral-100">
                    {language.value}
                  </span>
                  <select
                    value={language.level ?? ''}
                    onChange={(event) =>
                      updateLevel(
                        language.value,
                        event.target.value ? (event.target.value as SpokenLanguageEntry['level']) : null
                      )
                    }
                    className="max-w-[9rem] rounded-md border border-neutral-200 bg-white px-2 py-1 text-xs font-medium text-neutral-800 outline-none focus:border-[#F97316] dark:border-neutral-600 dark:bg-neutral-950 dark:text-neutral-100"
                  >
                    <option value="">Level</option>
                    {levelOptions.map((option) => (
                      <option key={option.code} value={option.code}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          ) : null}
          <div
            role="listbox"
            aria-multiselectable
            className="max-h-48 overflow-y-auto py-1 [scrollbar-color:theme(colors.neutral.300)_transparent] dark:[scrollbar-color:theme(colors.neutral.600)_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-neutral-300 hover:[&::-webkit-scrollbar-thumb]:bg-neutral-400 dark:[&::-webkit-scrollbar-thumb]:bg-neutral-600 dark:hover:[&::-webkit-scrollbar-thumb]:bg-neutral-500"
          >
            {[...SPOKEN_LANGUAGE_PRESETS, ...customSelected.map((item) => item.value)].map((language) => {
              const active = selectedKeys.has(spokenLanguageMatchKey(language));
              return (
                <button
                  key={spokenLanguageMatchKey(language)}
                  type="button"
                  role="option"
                  aria-selected={active}
                  onClick={() => toggle(language)}
                  className={`flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left text-sm font-medium transition ${
                    active
                      ? 'bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-white'
                      : 'text-neutral-700 hover:bg-neutral-50 dark:text-neutral-200 dark:hover:bg-neutral-800'
                  }`}
                >
                  <span>{language}</span>
                  {active ? (
                    <FontAwesomeIcon
                      icon={faCircleCheck}
                      className="h-3.5 w-3.5 shrink-0 text-neutral-500 dark:text-neutral-300"
                      fixedWidth
                    />
                  ) : null}
                </button>
              );
            })}
          </div>
          <div className="border-t border-neutral-200 p-2 dark:border-neutral-700">
            <div className="flex gap-1.5">
              <input
                type="text"
                value={customDraft}
                onChange={(event) => setCustomDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault();
                    addCustom();
                  }
                }}
                placeholder="Other language…"
                className="min-w-0 flex-1 rounded-md border border-neutral-200 bg-white px-2.5 py-1.5 text-sm text-neutral-900 outline-none focus:border-[#F97316] focus:ring-1 focus:ring-[#F97316]/30 dark:border-neutral-600 dark:bg-neutral-950 dark:text-white"
              />
              <button
                type="button"
                onClick={addCustom}
                disabled={!customDraft.trim()}
                className="shrink-0 rounded-md bg-[#F97316] px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-[#EA580C] disabled:opacity-40"
              >
                Add
              </button>
            </div>
          </div>
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
    <div className="relative z-30 flex shrink-0 flex-col items-end gap-2 sm:flex-row sm:items-center">
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
      <div className="flex items-center justify-end px-5 py-1.5 sm:px-6 sm:py-2">
        {actions}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4 px-5 py-5 sm:gap-5 sm:px-6 sm:py-6">
      <div
        className={`shrink-0 rounded-full p-[3px] ring-2 ring-offset-[5px] ring-offset-white dark:ring-offset-neutral-900 ${
          isAvailable
            ? 'ring-emerald-500 dark:ring-emerald-500/50'
            : 'ring-neutral-400 dark:ring-neutral-500'
        }`}
        title={resolveAvailabilityStatusLabel(isAvailable, availabilityLabel) ?? 'Unavailable'}
        aria-label={resolveAvailabilityStatusLabel(isAvailable, availabilityLabel) ?? 'Unavailable'}
      >
        {avatarUrl?.trim() ? (
          <div className="h-20 w-20 overflow-hidden rounded-full [&_img]:!h-20 [&_img]:!w-20">
            <Avatar name={displayName} avatarUrl={avatarUrl} size="xl" tone="muted" />
          </div>
        ) : (
          <div
            className="flex h-20 w-20 items-center justify-center rounded-full bg-[#0a0a0a] text-xl font-bold tracking-wide text-[#F97316]"
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
        <h2 className="truncate text-xl font-bold tracking-tight text-neutral-900 dark:text-white sm:text-2xl">
          {displayName}
        </h2>
        <div className="mt-1.5 flex items-center gap-2.5">
          <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-500">
            Page status
          </span>
          <span className="h-3 w-px shrink-0 bg-neutral-300 dark:bg-neutral-600" aria-hidden />
          <span className="inline-flex items-center gap-1.5 text-sm font-medium text-neutral-700 dark:text-neutral-200">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden />
            Published
          </span>
        </div>
        <div className="mt-2.5 flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">Free plan</span>
          <Link
            href={PORTFOLIO_UPGRADE_PATH}
            className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-semibold text-white shadow-sm transition hover:brightness-105 ${brandCtaClass}`}
          >
            <svg className="h-3 w-3 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z" />
            </svg>
            Upgrade
          </Link>
        </div>
      </div>

      {actions}
    </div>
  );
}

export function PortfolioEditorFooter({
  lastUpdatedLabel,
  leadingMetaLabel,
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
      className={`flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 ${
        hideTopBorder ? '' : 'border-t border-neutral-200/60 dark:border-white/[0.06]'
      }`}
    >
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

const aboutCardClass =
  'rounded-xl border border-neutral-200 bg-neutral-50/70 p-4 dark:border-neutral-700/40 dark:bg-[#141414]';

function PortfolioAboutSkillsBulletList({ items }: { items: ProfileSkillEntry[] }) {
  const filled = items.filter((item) => item.title.trim());
  if (filled.length === 0) {
    return <p className="text-[15px] italic text-neutral-500 dark:text-neutral-400">Not set</p>;
  }
  return (
    <ul className="space-y-3">
      {filled.map((item) => (
        <li
          key={item.id}
          className="flex items-start gap-2 text-sm text-neutral-800 dark:text-neutral-200"
        >
          <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[#F97316]" aria-hidden />
          <div className="min-w-0">
            <p className="font-medium">{item.title}</p>
            {item.description.trim() ? (
              <p className="mt-0.5 text-neutral-600 dark:text-neutral-400">{item.description}</p>
            ) : null}
          </div>
        </li>
      ))}
    </ul>
  );
}

function PortfolioAboutBulletList({ items }: { items: string[] }) {
  const filled = items.filter((item) => item.trim());
  if (filled.length === 0) {
    return <p className="text-[15px] italic text-neutral-500 dark:text-neutral-400">Not set</p>;
  }
  return (
    <ul className="space-y-1.5">
      {filled.map((item) => (
        <li
          key={item}
          className="flex items-start gap-2 text-sm text-neutral-800 dark:text-neutral-200"
        >
          <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[#F97316]" aria-hidden />
          {item}
        </li>
      ))}
    </ul>
  );
}

function PortfolioAboutEducationGrid({ entries }: { entries: ProfileEducationEntry[] }) {
  const filled = entries.filter(
    (item) => item.schoolYear.trim() || item.title.trim() || item.institution.trim()
  );
  if (filled.length === 0) {
    return <p className="text-[15px] italic text-neutral-500 dark:text-neutral-400">Not set</p>;
  }
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {filled.map((item) => (
        <div key={item.id} className={aboutCardClass}>
          {item.schoolYear.trim() ? (
            <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">{item.schoolYear}</p>
          ) : null}
          {item.title.trim() ? (
            <p className="mt-1 text-[15px] font-bold text-neutral-900 dark:text-white">{item.title}</p>
          ) : null}
          {item.institution.trim() ? (
            <p className="mt-0.5 text-sm text-neutral-600 dark:text-neutral-400">{item.institution}</p>
          ) : null}
        </div>
      ))}
    </div>
  );
}

function PortfolioInlineStringListEditor({
  value,
  onChange,
  maxItems = 12,
  placeholder = 'Add item…',
}: {
  value: string[];
  onChange: (value: string[]) => void;
  maxItems?: number;
  placeholder?: string;
}) {
  const [draft, setDraft] = useState('');

  const updateItem = (index: number, next: string) => {
    onChange(value.map((item, itemIndex) => (itemIndex === index ? next : item)));
  };

  const removeItem = (index: number) => {
    onChange(value.filter((_, itemIndex) => itemIndex !== index));
  };

  const moveItem = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= value.length) return;
    const next = [...value];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  const addItem = () => {
    const trimmed = draft.trim();
    if (!trimmed || value.length >= maxItems) return;
    onChange([...value, trimmed]);
    setDraft('');
  };

  return (
    <div className="w-full space-y-2">
      {value.map((item, index) => (
        <div key={`${index}-${item}`} className="flex items-center gap-2">
          <input
            type="text"
            value={item}
            onChange={(event) => updateItem(index, event.target.value)}
            className={inlineInputClass}
          />
          <button
            type="button"
            disabled={index === 0}
            onClick={() => moveItem(index, -1)}
            className="rounded-lg border border-neutral-200 px-2 py-1 text-xs disabled:opacity-40 dark:border-neutral-700"
            aria-label="Move up"
          >
            ↑
          </button>
          <button
            type="button"
            disabled={index === value.length - 1}
            onClick={() => moveItem(index, 1)}
            className="rounded-lg border border-neutral-200 px-2 py-1 text-xs disabled:opacity-40 dark:border-neutral-700"
            aria-label="Move down"
          >
            ↓
          </button>
          <button
            type="button"
            onClick={() => removeItem(index)}
            className="rounded-lg border border-red-200 px-2 py-1 text-xs text-red-700 dark:border-red-500/30 dark:text-red-400"
          >
            Remove
          </button>
        </div>
      ))}
      <div className="flex gap-2">
        <input
          type="text"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              addItem();
            }
          }}
          placeholder={placeholder}
          className={`${inlineInputClass} min-w-0 flex-1`}
          disabled={value.length >= maxItems}
        />
        <button
          type="button"
          onClick={addItem}
          disabled={!draft.trim() || value.length >= maxItems}
          className="shrink-0 rounded-md bg-[#F97316] px-3 py-2 text-xs font-semibold text-white hover:bg-[#EA580C] disabled:opacity-40"
        >
          Add
        </button>
      </div>
    </div>
  );
}

function PortfolioInlineEducationEditor({
  value,
  onChange,
  maxItems = 8,
}: {
  value: ProfileEducationEntry[];
  onChange: (value: ProfileEducationEntry[]) => void;
  maxItems?: number;
}) {
  const updateEntry = (index: number, patch: Partial<ProfileEducationEntry>) => {
    onChange(
      value.map((entry, entryIndex) =>
        entryIndex === index ? { ...entry, ...patch } : entry
      )
    );
  };

  const removeEntry = (index: number) => {
    onChange(value.filter((_, entryIndex) => entryIndex !== index));
  };

  const moveEntry = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= value.length) return;
    const next = [...value];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next.map((entry, entryIndex) => ({ ...entry, sortOrder: entryIndex })));
  };

  const addEntry = () => {
    if (value.length >= maxItems) return;
    onChange([
      ...value,
      {
        id: crypto.randomUUID(),
        sortOrder: value.length,
        schoolYear: '',
        title: '',
        institution: '',
      },
    ]);
  };

  return (
    <div className="w-full space-y-3">
      {value.map((entry, index) => (
        <div
          key={entry.id}
          className="space-y-2 rounded-xl border border-neutral-200 p-3 dark:border-neutral-700"
        >
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
              Entry {index + 1}
            </p>
            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={index === 0}
                onClick={() => moveEntry(index, -1)}
                className="rounded-lg border border-neutral-200 px-2 py-1 text-xs disabled:opacity-40 dark:border-neutral-700"
                aria-label="Move up"
              >
                ↑
              </button>
              <button
                type="button"
                disabled={index === value.length - 1}
                onClick={() => moveEntry(index, 1)}
                className="rounded-lg border border-neutral-200 px-2 py-1 text-xs disabled:opacity-40 dark:border-neutral-700"
                aria-label="Move down"
              >
                ↓
              </button>
              <button
                type="button"
                onClick={() => removeEntry(index)}
                className="rounded-lg border border-red-200 px-2 py-1 text-xs text-red-700 dark:border-red-500/30 dark:text-red-400"
              >
                Remove
              </button>
            </div>
          </div>
          <input
            type="text"
            value={entry.schoolYear}
            onChange={(event) => updateEntry(index, { schoolYear: event.target.value })}
            placeholder="School year"
            className={inlineInputClass}
          />
          <input
            type="text"
            value={entry.title}
            onChange={(event) => updateEntry(index, { title: event.target.value })}
            placeholder="Degree / title"
            className={inlineInputClass}
          />
          <input
            type="text"
            value={entry.institution}
            onChange={(event) => updateEntry(index, { institution: event.target.value })}
            placeholder="Institution"
            className={inlineInputClass}
          />
        </div>
      ))}
      <button
        type="button"
        onClick={addEntry}
        disabled={value.length >= maxItems}
        className="rounded-full border border-neutral-200 px-4 py-2 text-sm font-semibold text-neutral-700 hover:bg-neutral-50 disabled:opacity-50 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-900"
      >
        Add education entry
      </button>
    </div>
  );
}

function PortfolioInlineSkillsEditor({
  value,
  onChange,
  maxItems = MAX_ABOUT_SKILLS,
}: {
  value: ProfileSkillEntry[];
  onChange: (value: ProfileSkillEntry[]) => void;
  maxItems?: number;
}) {
  const updateEntry = (index: number, patch: Partial<ProfileSkillEntry>) => {
    onChange(value.map((entry, entryIndex) => (entryIndex === index ? { ...entry, ...patch } : entry)));
  };

  const removeEntry = (index: number) => {
    onChange(value.filter((_, entryIndex) => entryIndex !== index));
  };

  const moveEntry = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= value.length) return;
    const next = [...value];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next.map((entry, entryIndex) => ({ ...entry, sortOrder: entryIndex })));
  };

  const addEntry = () => {
    if (value.length >= maxItems) return;
    onChange([...value, createEmptyAboutSkillEntry(value.length)]);
  };

  return (
    <div className="w-full space-y-3">
      {value.map((entry, index) => (
        <div
          key={entry.id}
          className="space-y-2 rounded-xl border border-neutral-200 p-3 dark:border-neutral-700"
        >
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
              Skill {index + 1}
            </p>
            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={index === 0}
                onClick={() => moveEntry(index, -1)}
                className="rounded-lg border border-neutral-200 px-2 py-1 text-xs disabled:opacity-40 dark:border-neutral-700"
                aria-label="Move up"
              >
                ↑
              </button>
              <button
                type="button"
                disabled={index === value.length - 1}
                onClick={() => moveEntry(index, 1)}
                className="rounded-lg border border-neutral-200 px-2 py-1 text-xs disabled:opacity-40 dark:border-neutral-700"
                aria-label="Move down"
              >
                ↓
              </button>
              <button
                type="button"
                onClick={() => removeEntry(index)}
                className="rounded-lg border border-red-200 px-2 py-1 text-xs text-red-700 dark:border-red-500/30 dark:text-red-400"
              >
                Remove
              </button>
            </div>
          </div>
          <input
            type="text"
            value={entry.title}
            onChange={(event) => updateEntry(index, { title: event.target.value })}
            placeholder="Skill title"
            className={inlineInputClass}
          />
          <textarea
            value={entry.description}
            onChange={(event) => updateEntry(index, { description: event.target.value })}
            placeholder="Description (optional)"
            rows={2}
            className={inlineInputClass}
          />
        </div>
      ))}
      <button
        type="button"
        onClick={addEntry}
        disabled={value.length >= maxItems}
        className="rounded-full border border-neutral-200 px-4 py-2 text-sm font-semibold text-neutral-700 hover:bg-neutral-50 disabled:opacity-50 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-900"
      >
        Add skill
      </button>
    </div>
  );
}

function PortfolioAboutSkillsSection({
  entries,
  editing,
  editControl,
  onEdit,
  onConfirm,
  onCancelEdit,
  confirming = false,
  canConfirm = true,
  showVisibility = false,
  visibility,
  onVisibilityChange,
  className = '',
}: {
  entries: ProfileSkillEntry[];
  editing?: boolean;
  editControl?: ReactNode;
  onEdit?: () => void;
  onConfirm?: () => void;
  onCancelEdit?: () => void;
  confirming?: boolean;
  canConfirm?: boolean;
  showVisibility?: boolean;
  visibility?: ContactVisibilityLevel;
  onVisibilityChange?: (value: ContactVisibilityLevel) => void;
  className?: string;
}) {
  const showVisibilityAction = Boolean(
    showVisibility && visibility && onVisibilityChange && (editing ? !onConfirm : true)
  );
  const showEditActions = Boolean(editing ? onConfirm : onEdit);
  const showActions = showVisibilityAction || showEditActions;

  return (
    <div className={`py-5 ${className}`}>
      <div className="mb-3 flex items-center justify-between gap-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#F97316]">
          Skills
        </p>
        {showActions ? (
          <div className="inline-flex h-8 shrink-0 items-center gap-1.5">
            {showVisibilityAction ? (
              <PortfolioFieldVisibilityMenu value={visibility!} onChange={onVisibilityChange!} />
            ) : null}
            {editing && onConfirm ? (
              <>
                <PortfolioFieldIconButton
                  label={canConfirm ? 'Confirm Skills' : 'No changes to Skills'}
                  tone={canConfirm ? 'confirm' : 'neutral'}
                  disabled={!canConfirm || confirming}
                  onClick={() => onConfirm()}
                >
                  {confirming ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <FontAwesomeIcon icon={faCircleCheck} className="h-4 w-4" fixedWidth />
                  )}
                </PortfolioFieldIconButton>
                <PortfolioFieldIconButton
                  label="Cancel Skills"
                  tone="cancel"
                  disabled={confirming}
                  onClick={() => onCancelEdit?.()}
                >
                  <FontAwesomeIcon icon={faXmark} className="h-3.5 w-3.5" fixedWidth />
                </PortfolioFieldIconButton>
              </>
            ) : onEdit ? (
              <PortfolioFieldIconButton label="Edit Skills" onClick={onEdit}>
                <FontAwesomeIcon icon={faPenToSquare} className="h-3.5 w-3.5" fixedWidth />
              </PortfolioFieldIconButton>
            ) : null}
          </div>
        ) : null}
      </div>
      <div className={aboutCardClass}>
        {editing ? (
          editControl ?? <PortfolioInlineSkillsEditor value={entries} onChange={() => undefined} />
        ) : (
          <PortfolioAboutSkillsBulletList items={entries} />
        )}
      </div>
    </div>
  );
}

function PortfolioAboutCardSection({
  label,
  items,
  editing,
  editControl,
  onEdit,
  onConfirm,
  onCancelEdit,
  confirming = false,
  canConfirm = true,
  showVisibility = false,
  visibility,
  onVisibilityChange,
  className = '',
  maxItems = 12,
}: {
  label: string;
  items: string[];
  editing?: boolean;
  editControl?: ReactNode;
  onEdit?: () => void;
  onConfirm?: () => void;
  onCancelEdit?: () => void;
  confirming?: boolean;
  canConfirm?: boolean;
  showVisibility?: boolean;
  visibility?: ContactVisibilityLevel;
  onVisibilityChange?: (value: ContactVisibilityLevel) => void;
  className?: string;
  maxItems?: number;
}) {
  const showVisibilityAction = Boolean(
    showVisibility && visibility && onVisibilityChange && (editing ? !onConfirm : true)
  );
  const showEditActions = Boolean(editing ? onConfirm : onEdit);
  const showActions = showVisibilityAction || showEditActions;

  return (
    <div className={`py-5 ${className}`}>
      <div className="mb-3 flex items-center justify-between gap-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#F97316]">
          {label}
        </p>
        {showActions ? (
          <div className="inline-flex h-8 shrink-0 items-center gap-1.5">
            {showVisibilityAction ? (
              <PortfolioFieldVisibilityMenu value={visibility!} onChange={onVisibilityChange!} />
            ) : null}
            {editing && onConfirm ? (
              <>
                <PortfolioFieldIconButton
                  label={canConfirm ? `Confirm ${label}` : `No changes to ${label}`}
                  tone={canConfirm ? 'confirm' : 'neutral'}
                  disabled={!canConfirm || confirming}
                  onClick={() => onConfirm()}
                >
                  {confirming ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <FontAwesomeIcon icon={faCircleCheck} className="h-4 w-4" fixedWidth />
                  )}
                </PortfolioFieldIconButton>
                <PortfolioFieldIconButton
                  label={`Cancel ${label}`}
                  tone="cancel"
                  disabled={confirming}
                  onClick={() => onCancelEdit?.()}
                >
                  <FontAwesomeIcon icon={faXmark} className="h-3.5 w-3.5" fixedWidth />
                </PortfolioFieldIconButton>
              </>
            ) : onEdit ? (
              <PortfolioFieldIconButton label={`Edit ${label}`} onClick={onEdit}>
                <FontAwesomeIcon icon={faPenToSquare} className="h-3.5 w-3.5" fixedWidth />
              </PortfolioFieldIconButton>
            ) : null}
          </div>
        ) : null}
      </div>
      <div className={aboutCardClass}>
        {editing ? (
          editControl ?? (
            <PortfolioInlineStringListEditor value={items} onChange={() => undefined} maxItems={maxItems} />
          )
        ) : (
          <PortfolioAboutBulletList items={items} />
        )}
      </div>
    </div>
  );
}

function PortfolioAboutEducationSection({
  entries,
  editing,
  editControl,
  onEdit,
  onConfirm,
  onCancelEdit,
  confirming = false,
  canConfirm = true,
  showVisibility = false,
  visibility,
  onVisibilityChange,
}: {
  entries: ProfileEducationEntry[];
  editing?: boolean;
  editControl?: ReactNode;
  onEdit?: () => void;
  onConfirm?: () => void;
  onCancelEdit?: () => void;
  confirming?: boolean;
  canConfirm?: boolean;
  showVisibility?: boolean;
  visibility?: ContactVisibilityLevel;
  onVisibilityChange?: (value: ContactVisibilityLevel) => void;
}) {
  const showVisibilityAction = Boolean(
    showVisibility && visibility && onVisibilityChange && (editing ? !onConfirm : true)
  );
  const showEditActions = Boolean(editing ? onConfirm : onEdit);
  const showActions = showVisibilityAction || showEditActions;

  return (
    <div className="py-5">
      <div className="mb-3 flex items-center justify-between gap-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#F97316]">
          Education
        </p>
        {showActions ? (
          <div className="inline-flex h-8 shrink-0 items-center gap-1.5">
            {showVisibilityAction ? (
              <PortfolioFieldVisibilityMenu value={visibility!} onChange={onVisibilityChange!} />
            ) : null}
            {editing && onConfirm ? (
              <>
                <PortfolioFieldIconButton
                  label={canConfirm ? 'Confirm Education' : 'No changes to Education'}
                  tone={canConfirm ? 'confirm' : 'neutral'}
                  disabled={!canConfirm || confirming}
                  onClick={() => onConfirm()}
                >
                  {confirming ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <FontAwesomeIcon icon={faCircleCheck} className="h-4 w-4" fixedWidth />
                  )}
                </PortfolioFieldIconButton>
                <PortfolioFieldIconButton
                  label="Cancel Education"
                  tone="cancel"
                  disabled={confirming}
                  onClick={() => onCancelEdit?.()}
                >
                  <FontAwesomeIcon icon={faXmark} className="h-3.5 w-3.5" fixedWidth />
                </PortfolioFieldIconButton>
              </>
            ) : onEdit ? (
              <PortfolioFieldIconButton label="Edit Education" onClick={onEdit}>
                <FontAwesomeIcon icon={faPenToSquare} className="h-3.5 w-3.5" fixedWidth />
              </PortfolioFieldIconButton>
            ) : null}
          </div>
        ) : null}
      </div>
      {editing ? (
        editControl ?? <PortfolioInlineEducationEditor value={entries} onChange={() => undefined} />
      ) : (
        <PortfolioAboutEducationGrid entries={entries} />
      )}
    </div>
  );
}

export function PortfolioAboutReadOnly({
  fullName,
  username = '',
  bio,
  specialite,
  specialties = [],
  specialtyTags = [],
  gender,
  nationality = '',
  yearsOfExperience = null,
  languages,
  aboutSkills = [],
  aboutStrengths = [],
  aboutSystemsTools = [],
  aboutInterests = [],
  aboutEducation = [],
  isAvailable,
  availabilityLabel = '',
  availabilityHours,
  availabilityTimezone,
  rawAvailabilityHours,
  memberSince,
  responseTimeLabel,
  typicalResponseTime = '',
  locationCity = '',
  locationCountry = '',
  locationTimezone = '',
  hasCompleteLocation = false,
  detectingLocation = false,
  onDetectLocation,
  visibility,
  onVisibilityChange,
  onFieldSave,
  onGlobalSave,
  fieldSaving = false,
  actionsVisible = false,
  editMode = 'individual',
  onGlobalHasChangesChange,
  onRegisterGlobalConfirm,
  hideProviderFields = false,
  layout = 'generalInfo',
}: {
  fullName: string;
  username?: string;
  bio: string;
  specialite: string;
  specialties?: string[];
  specialtyTags?: string[];
  gender: string;
  nationality?: string;
  yearsOfExperience?: number | null;
  languages: SpokenLanguageEntry[];
  aboutSkills?: ProfileSkillEntry[];
  aboutStrengths?: string[];
  aboutSystemsTools?: string[];
  aboutInterests?: string[];
  aboutEducation?: ProfileEducationEntry[];
  isAvailable: boolean;
  availabilityLabel?: string;
  availabilityHours: string | null;
  availabilityTimezone?: string | null;
  rawAvailabilityHours?: string | null;
  memberSince: string | null;
  responseTimeLabel: string | null;
  typicalResponseTime?: string;
  /** Hide specialty, years, status, availability hours, typical response (RH / Recruiter). */
  hideProviderFields?: boolean;
  locationCity?: string;
  locationCountry?: string;
  locationTimezone?: string;
  hasCompleteLocation?: boolean;
  detectingLocation?: boolean;
  onDetectLocation?: () => void;
  visibility?: {
    gender: ContactVisibilityLevel;
    spokenLanguages: ContactVisibilityLevel;
    availability: ContactVisibilityLevel;
    responseTime: ContactVisibilityLevel;
    location?: ContactVisibilityLevel;
    yearsOfExperience?: ContactVisibilityLevel;
    aboutSkills?: ContactVisibilityLevel;
    aboutStrengths?: ContactVisibilityLevel;
    aboutSystemsTools?: ContactVisibilityLevel;
    aboutInterests?: ContactVisibilityLevel;
    aboutEducation?: ContactVisibilityLevel;
  };
  onVisibilityChange?: (
    key:
      | 'gender'
      | 'spokenLanguages'
      | 'availability'
      | 'responseTime'
      | 'location'
      | 'yearsOfExperience'
      | 'aboutSkills'
      | 'aboutStrengths'
      | 'aboutSystemsTools'
      | 'aboutInterests'
      | 'aboutEducation',
    value: ContactVisibilityLevel
  ) => void;
  onFieldSave?: (field: PortfolioAboutFieldKey, value: PortfolioAboutFieldValue[PortfolioAboutFieldKey]) => Promise<void>;
  onGlobalSave?: (values: PortfolioAboutFieldValue) => Promise<void>;
  fieldSaving?: boolean;
  actionsVisible?: boolean;
  editMode?: 'individual' | 'global';
  onGlobalHasChangesChange?: (hasChanges: boolean) => void;
  onRegisterGlobalConfirm?: (confirm: (() => Promise<void>) | null) => void;
  /** `generalInfo` — identity fields. `aboutDetails` — specialty, languages, years. */
  layout?: 'generalInfo' | 'aboutDetails';
}) {
  const isAboutDetails = layout === 'aboutDetails';
  const isGlobal = actionsVisible && editMode === 'global';
  const showFieldActions = actionsVisible && editMode === 'individual';

  const [editingField, setEditingField] = useState<PortfolioAboutFieldKey | null>(null);
  const [draftName, setDraftName] = useState(fullName);
  const [draftUsername, setDraftUsername] = useState(username);
  const [draftBio, setDraftBio] = useState(bio);
  const [draftSpecialties, setDraftSpecialties] = useState(() =>
    parseSpecialtyList(specialties, specialite)
  );
  const [draftSpecialtyTags, setDraftSpecialtyTags] = useState(() => parseSpecialtyTags(specialtyTags));
  const [draftGender, setDraftGender] = useState(gender);
  const [draftNationality, setDraftNationality] = useState(nationality);
  const [draftYearsOfExperience, setDraftYearsOfExperience] = useState(
    yearsOfExperience != null ? String(yearsOfExperience) : ''
  );
  const [draftLanguages, setDraftLanguages] = useState(languages);
  const [draftAboutSkills, setDraftAboutSkills] = useState(aboutSkills);
  const [draftAboutStrengths, setDraftAboutStrengths] = useState(aboutStrengths);
  const [draftAboutSystemsTools, setDraftAboutSystemsTools] = useState(aboutSystemsTools);
  const [draftAboutInterests, setDraftAboutInterests] = useState(aboutInterests);
  const [draftAboutEducation, setDraftAboutEducation] = useState(aboutEducation);
  const [draftAvailable, setDraftAvailable] = useState(isAvailable);
  const [draftAvailabilityLabel, setDraftAvailabilityLabel] = useState(() =>
    normalizeAvailabilityStatusSelectValue(availabilityLabel)
  );
  const [draftAvailabilityCustomMode, setDraftAvailabilityCustomMode] = useState(
    () => !isAvailabilityStatusPreset(availabilityLabel)
  );
  const [draftTypicalResponseTime, setDraftTypicalResponseTime] = useState(typicalResponseTime);
  const [draftSchedule, setDraftSchedule] = useState<AvailabilitySchedule>(() =>
    rawAvailabilityHours || availabilityHours
      ? parseAvailabilityHours(rawAvailabilityHours || availabilityHours || '')
      : defaultSchedule()
  );

  const resetDrafts = () => {
    setDraftName(fullName);
    setDraftUsername(username);
    setDraftBio(bio);
    setDraftSpecialties(parseSpecialtyList(specialties, specialite));
    setDraftSpecialtyTags(parseSpecialtyTags(specialtyTags));
    setDraftGender(gender);
    setDraftNationality(nationality);
    setDraftYearsOfExperience(yearsOfExperience != null ? String(yearsOfExperience) : '');
    setDraftLanguages(languages);
    setDraftAboutSkills(aboutSkills);
    setDraftAboutStrengths(aboutStrengths);
    setDraftAboutSystemsTools(aboutSystemsTools);
    setDraftAboutInterests(aboutInterests);
    setDraftAboutEducation(aboutEducation);
    setDraftAvailable(isAvailable);
    setDraftAvailabilityLabel(normalizeAvailabilityStatusSelectValue(availabilityLabel));
    setDraftAvailabilityCustomMode(!isAvailabilityStatusPreset(availabilityLabel));
    setDraftTypicalResponseTime(typicalResponseTime);
    setDraftSchedule(
      rawAvailabilityHours || availabilityHours
        ? parseAvailabilityHours(rawAvailabilityHours || availabilityHours || '')
        : defaultSchedule()
    );
  };

  useEffect(() => {
    if (!actionsVisible) {
      setEditingField(null);
      resetDrafts();
      return;
    }
    if (isGlobal) {
      setEditingField(null);
      resetDrafts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- sync when chrome/mode opens
  }, [actionsVisible, editMode]);

  useEffect(() => {
    if (editingField) return;
    if (isGlobal) return;
    resetDrafts();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- keep drafts in sync when not editing
  }, [fullName, username, bio, specialite, specialties, specialtyTags, gender, nationality, yearsOfExperience, languages, aboutSkills, aboutStrengths, aboutSystemsTools, aboutInterests, aboutEducation, isAvailable, availabilityLabel, rawAvailabilityHours, availabilityHours, typicalResponseTime]);

  const startEdit = (field: PortfolioAboutFieldKey) => {
    resetDrafts();
    setEditingField(field);
  };

  const cancelEdit = () => {
    if (fieldSaving) return;
    setEditingField(null);
    resetDrafts();
  };

  const sameLanguages = (left: SpokenLanguageEntry[], right: SpokenLanguageEntry[]) =>
    spokenLanguageEntriesEqual(left, right);

  const originalAvailabilityHours = formatAvailabilityHours(
    rawAvailabilityHours || availabilityHours
      ? parseAvailabilityHours(rawAvailabilityHours || availabilityHours || '')
      : defaultSchedule(),
    availabilityTimezone ?? undefined
  );
  const draftAvailabilityHours = formatAvailabilityHours(
    draftSchedule,
    availabilityTimezone ?? undefined
  );

  const sameList = (left: string[], right: string[]) =>
    left.length === right.length && left.every((item, index) => item === right[index]);

  const savedSpecialties = parseSpecialtyList(specialties, specialite);
  const savedTags = parseSpecialtyTags(specialtyTags);

  const fieldHasChanges = (() => {
    switch (editingField) {
      case 'fullName':
        return draftName.trim() !== fullName.trim();
      case 'username':
        return draftUsername.trim() !== username.trim();
      case 'bio':
        return draftBio.trim() !== bio.trim();
      case 'specialite':
      case 'specialtySet':
        return !sameList(draftSpecialties, savedSpecialties) || !sameList(draftSpecialtyTags, savedTags);
      case 'gender':
        return draftGender.trim() !== gender.trim();
      case 'nationality':
        return draftNationality.trim() !== nationality.trim();
      case 'yearsOfExperience': {
        const draft =
          draftYearsOfExperience.trim() === '' ? null : Number.parseInt(draftYearsOfExperience, 10);
        return (Number.isNaN(draft as number) ? null : draft) !== (yearsOfExperience ?? null);
      }
      case 'spokenLanguages':
        return !sameLanguages(draftLanguages, languages);
      case 'aboutSkills':
        return !sameAboutSkills(draftAboutSkills, aboutSkills);
      case 'aboutStrengths':
        return !sameList(draftAboutStrengths, aboutStrengths);
      case 'aboutSystemsTools':
        return !sameList(draftAboutSystemsTools, aboutSystemsTools);
      case 'aboutInterests':
        return !sameList(draftAboutInterests, aboutInterests);
      case 'aboutEducation':
        return JSON.stringify(draftAboutEducation) !== JSON.stringify(aboutEducation);
      case 'isAvailable':
        return draftAvailable !== isAvailable;
      case 'availabilityLabel':
        return (
          normalizeAvailabilityStatusSelectValue(draftAvailabilityLabel) !==
          normalizeAvailabilityStatusSelectValue(availabilityLabel)
        );
      case 'availabilityHours':
        return draftAvailabilityHours !== originalAvailabilityHours;
      case 'typicalResponseTime':
        return draftTypicalResponseTime !== (typicalResponseTime ?? '');
      default:
        return false;
    }
  })();

  const globalHasChanges =
    (isAboutDetails
      ? !hideProviderFields &&
        (!sameList(draftSpecialties, savedSpecialties) || !sameList(draftSpecialtyTags, savedTags))
      : draftName.trim() !== fullName.trim() ||
        draftUsername.trim() !== username.trim() ||
        draftBio.trim() !== bio.trim() ||
        draftGender.trim() !== gender.trim() ||
        draftNationality.trim() !== nationality.trim()) ||
    (isAboutDetails
      ? !hideProviderFields &&
          (() => {
            const draft =
              draftYearsOfExperience.trim() === ''
                ? null
                : Number.parseInt(draftYearsOfExperience, 10);
            const normalized = draft == null || Number.isNaN(draft) ? null : draft;
            return normalized !== (yearsOfExperience ?? null);
          })()
      : false) ||
    (isAboutDetails ? !sameLanguages(draftLanguages, languages) : false) ||
    (isAboutDetails ? !sameAboutSkills(draftAboutSkills, aboutSkills) : false) ||
    (isAboutDetails ? !sameList(draftAboutStrengths, aboutStrengths) : false) ||
    (isAboutDetails ? !sameList(draftAboutSystemsTools, aboutSystemsTools) : false) ||
    (isAboutDetails ? !sameList(draftAboutInterests, aboutInterests) : false) ||
    (isAboutDetails
      ? JSON.stringify(draftAboutEducation) !== JSON.stringify(aboutEducation)
      : false) ||
    (!isAboutDetails &&
      !hideProviderFields &&
      (draftAvailable !== isAvailable ||
        normalizeAvailabilityStatusSelectValue(draftAvailabilityLabel) !==
          normalizeAvailabilityStatusSelectValue(availabilityLabel) ||
        draftAvailabilityHours !== originalAvailabilityHours ||
        draftTypicalResponseTime !== (typicalResponseTime ?? '')));

  useEffect(() => {
    onGlobalHasChangesChange?.(isGlobal ? globalHasChanges : false);
  }, [globalHasChanges, isGlobal, onGlobalHasChangesChange]);

  const confirmEdit = async () => {
    if (!editingField || !onFieldSave || fieldSaving || !fieldHasChanges) return;
    try {
      switch (editingField) {
        case 'fullName':
          await onFieldSave('fullName', draftName.trim());
          break;
        case 'username':
          await onFieldSave('username', draftUsername.trim());
          break;
        case 'bio':
          await onFieldSave('bio', draftBio);
          break;
        case 'specialite':
        case 'specialtySet':
          await onFieldSave('specialtySet', {
            specialties: draftSpecialties,
            specialtyTags: draftSpecialtyTags,
          });
          break;
        case 'gender':
          await onFieldSave('gender', draftGender);
          break;
        case 'nationality':
          await onFieldSave('nationality', draftNationality);
          break;
        case 'yearsOfExperience': {
          const parsed =
            draftYearsOfExperience.trim() === ''
              ? null
              : Number.parseInt(draftYearsOfExperience, 10);
          await onFieldSave(
            'yearsOfExperience',
            parsed == null || Number.isNaN(parsed) ? null : parsed,
          );
          break;
        }
        case 'spokenLanguages':
          await onFieldSave('spokenLanguages', dedupeSpokenLanguageEntries(draftLanguages));
          break;
        case 'aboutSkills':
          await onFieldSave(
            'aboutSkills',
            draftAboutSkills
              .filter((item) => item.title.trim())
              .map((entry, index) => ({
                ...entry,
                sortOrder: index,
                title: entry.title.trim(),
                description: entry.description.trim(),
              }))
          );
          break;
        case 'aboutStrengths':
          await onFieldSave(
            'aboutStrengths',
            draftAboutStrengths.map((item) => item.trim()).filter(Boolean)
          );
          break;
        case 'aboutSystemsTools':
          await onFieldSave(
            'aboutSystemsTools',
            draftAboutSystemsTools.map((item) => item.trim()).filter(Boolean)
          );
          break;
        case 'aboutInterests':
          await onFieldSave(
            'aboutInterests',
            draftAboutInterests.map((item) => item.trim()).filter(Boolean)
          );
          break;
        case 'aboutEducation':
          await onFieldSave(
            'aboutEducation',
            draftAboutEducation.map((entry, index) => ({
              ...entry,
              sortOrder: index,
              schoolYear: entry.schoolYear.trim(),
              title: entry.title.trim(),
              institution: entry.institution.trim(),
            }))
          );
          break;
        case 'isAvailable':
          await onFieldSave('isAvailable', draftAvailable);
          break;
        case 'availabilityLabel':
          await onFieldSave(
            'availabilityLabel',
            normalizeAvailabilityStatusSelectValue(draftAvailabilityLabel)
          );
          break;
        case 'availabilityHours':
          await onFieldSave('availabilityHours', draftAvailabilityHours);
          break;
        case 'typicalResponseTime':
          await onFieldSave('typicalResponseTime', draftTypicalResponseTime);
          break;
      }
      setEditingField(null);
    } catch {
      // Parent surfaces the error; keep the field in edit mode.
    }
  };

  const confirmGlobal = async () => {
    if (!onGlobalSave || fieldSaving || !globalHasChanges) return;
    try {
      await onGlobalSave({
        fullName: draftName.trim(),
        username: draftUsername.trim(),
        bio: draftBio,
        specialite: draftSpecialties[0] ?? '',
        specialtySet: { specialties: draftSpecialties, specialtyTags: draftSpecialtyTags },
        gender: draftGender,
        nationality: draftNationality,
        yearsOfExperience: (() => {
          const parsed =
            draftYearsOfExperience.trim() === ''
              ? null
              : Number.parseInt(draftYearsOfExperience, 10);
          return parsed == null || Number.isNaN(parsed) ? null : parsed;
        })(),
        spokenLanguages: dedupeSpokenLanguageEntries(draftLanguages),
        aboutSkills: draftAboutSkills
          .filter((item) => item.title.trim())
          .map((entry, index) => ({
            ...entry,
            sortOrder: index,
            title: entry.title.trim(),
            description: entry.description.trim(),
          })),
        aboutStrengths: draftAboutStrengths.map((item) => item.trim()).filter(Boolean),
        aboutSystemsTools: draftAboutSystemsTools.map((item) => item.trim()).filter(Boolean),
        aboutInterests: draftAboutInterests.map((item) => item.trim()).filter(Boolean),
        aboutEducation: draftAboutEducation.map((entry, index) => ({
          ...entry,
          sortOrder: index,
          schoolYear: entry.schoolYear.trim(),
          title: entry.title.trim(),
          institution: entry.institution.trim(),
        })),
        isAvailable: draftAvailable,
        availabilityLabel: normalizeAvailabilityStatusSelectValue(draftAvailabilityLabel),
        availabilityHours: draftAvailabilityHours,
        typicalResponseTime: draftTypicalResponseTime,
      });
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

  const confirming = fieldSaving;
  const visibilityEnabled = actionsVisible;

  const fieldEditing = (field: PortfolioAboutFieldKey) =>
    isGlobal || (showFieldActions && editingField === field);

  const fieldOnEdit = (field: PortfolioAboutFieldKey) =>
    showFieldActions && onFieldSave ? () => startEdit(field) : undefined;

  const fieldOnConfirm = isGlobal ? undefined : () => void confirmEdit();
  const fieldOnCancel = isGlobal ? undefined : cancelEdit;

  return (
    <div className="divide-y divide-neutral-200/50 dark:divide-white/[0.06]">
      {isAboutDetails ? (
        <>
          {!hideProviderFields ? (
            <div className="grid gap-0 sm:grid-cols-2 sm:gap-x-6">
              <PortfolioFlatField
                label="Specialty"
                className="!pt-3 !pb-5"
                editing={fieldEditing('specialite')}
                onEdit={fieldOnEdit('specialite')}
                onConfirm={fieldOnConfirm}
                onCancelEdit={fieldOnCancel}
                confirming={confirming && (editingField === 'specialite' || editingField === 'specialtySet')}
                canConfirm={fieldHasChanges}
                editControl={
                  <SpecialtyMultiSelect
                    specialties={draftSpecialties}
                    tags={draftSpecialtyTags}
                    onSpecialtiesChange={setDraftSpecialties}
                    onTagsChange={setDraftSpecialtyTags}
                    disabled={confirming}
                    showTags={false}
                  />
                }
              >
                {savedSpecialties.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {savedSpecialties.map((item, index) => {
                      const isPrimary = index === 0;
                      return (
                        <span
                          key={item}
                          className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold sm:text-sm ${
                            isPrimary
                              ? 'border-orange-500 bg-orange-500 text-white'
                              : 'border-neutral-300 bg-transparent text-neutral-700 dark:border-neutral-700 dark:text-neutral-200'
                          }`}
                        >
                          {item}
                        </span>
                      );
                    })}
                  </div>
                ) : undefined}
              </PortfolioFlatField>
              <PortfolioFlatField
                label="Years of experience"
                className="!pt-3 !pb-5"
                value={
                  yearsOfExperience != null
                    ? yearsOfExperience === 1
                      ? '1 year'
                      : `${yearsOfExperience} years`
                    : ''
                }
                emptyLabel="Not set"
                editing={fieldEditing('yearsOfExperience')}
                onEdit={fieldOnEdit('yearsOfExperience')}
                onConfirm={fieldOnConfirm}
                onCancelEdit={fieldOnCancel}
                confirming={confirming && editingField === 'yearsOfExperience'}
                canConfirm={fieldHasChanges}
                showVisibility={visibilityEnabled && Boolean(visibility?.yearsOfExperience)}
                visibility={visibility?.yearsOfExperience}
                onVisibilityChange={
                  onVisibilityChange
                    ? (value) => onVisibilityChange('yearsOfExperience', value)
                    : undefined
                }
                editControl={
                  <input
                    type="number"
                    min={0}
                    max={80}
                    value={draftYearsOfExperience}
                    onChange={(event) => setDraftYearsOfExperience(event.target.value)}
                    className={inlineInputClass}
                    autoFocus={editingField === 'yearsOfExperience'}
                    disabled={confirming}
                    placeholder="e.g. 5"
                  />
                }
              />
            </div>
          ) : null}
          <PortfolioFlatField
            label="Working Languages"
            className={hideProviderFields ? '!pt-3 !pb-5' : '!py-5'}
            editing={fieldEditing('spokenLanguages')}
            onEdit={fieldOnEdit('spokenLanguages')}
            onConfirm={fieldOnConfirm}
            onCancelEdit={fieldOnCancel}
            confirming={confirming && editingField === 'spokenLanguages'}
            canConfirm={fieldHasChanges}
            showVisibility={visibilityEnabled}
            visibility={visibility?.spokenLanguages}
            onVisibilityChange={
              onVisibilityChange ? (value) => onVisibilityChange('spokenLanguages', value) : undefined
            }
            editControl={<PortfolioInlineLanguagesEditor value={draftLanguages} onChange={setDraftLanguages} />}
          >
            <PortfolioLanguageChips languages={languages} />
          </PortfolioFlatField>
          <PortfolioAboutEducationSection
            entries={aboutEducation}
            editing={fieldEditing('aboutEducation')}
            onEdit={fieldOnEdit('aboutEducation')}
            onConfirm={fieldOnConfirm}
            onCancelEdit={fieldOnCancel}
            confirming={confirming && editingField === 'aboutEducation'}
            canConfirm={fieldHasChanges}
            showVisibility={visibilityEnabled}
            visibility={visibility?.aboutEducation}
            onVisibilityChange={
              onVisibilityChange ? (value) => onVisibilityChange('aboutEducation', value) : undefined
            }
            editControl={
              <PortfolioInlineEducationEditor
                value={draftAboutEducation}
                onChange={setDraftAboutEducation}
              />
            }
          />
          <div className="grid gap-0 sm:grid-cols-2 sm:gap-x-6">
            <PortfolioAboutSkillsSection
              entries={aboutSkills}
              editing={fieldEditing('aboutSkills')}
              onEdit={fieldOnEdit('aboutSkills')}
              onConfirm={fieldOnConfirm}
              onCancelEdit={fieldOnCancel}
              confirming={confirming && editingField === 'aboutSkills'}
              canConfirm={fieldHasChanges}
              showVisibility={visibilityEnabled}
              visibility={visibility?.aboutSkills}
              onVisibilityChange={
                onVisibilityChange ? (value) => onVisibilityChange('aboutSkills', value) : undefined
              }
              editControl={
                <PortfolioInlineSkillsEditor
                  value={draftAboutSkills}
                  onChange={setDraftAboutSkills}
                />
              }
              className="sm:pr-3"
            />
            <PortfolioAboutCardSection
              label="Strengths"
              items={aboutStrengths}
              editing={fieldEditing('aboutStrengths')}
              onEdit={fieldOnEdit('aboutStrengths')}
              onConfirm={fieldOnConfirm}
              onCancelEdit={fieldOnCancel}
              confirming={confirming && editingField === 'aboutStrengths'}
              canConfirm={fieldHasChanges}
              showVisibility={visibilityEnabled}
              visibility={visibility?.aboutStrengths}
              onVisibilityChange={
                onVisibilityChange ? (value) => onVisibilityChange('aboutStrengths', value) : undefined
              }
              editControl={
                <PortfolioInlineStringListEditor
                  value={draftAboutStrengths}
                  onChange={setDraftAboutStrengths}
                  maxItems={12}
                  placeholder="Add strength…"
                />
              }
              className="sm:pl-3"
            />
            <PortfolioAboutCardSection
              label="Systems & Tools"
              items={aboutSystemsTools}
              editing={fieldEditing('aboutSystemsTools')}
              onEdit={fieldOnEdit('aboutSystemsTools')}
              onConfirm={fieldOnConfirm}
              onCancelEdit={fieldOnCancel}
              confirming={confirming && editingField === 'aboutSystemsTools'}
              canConfirm={fieldHasChanges}
              showVisibility={visibilityEnabled}
              visibility={visibility?.aboutSystemsTools}
              onVisibilityChange={
                onVisibilityChange
                  ? (value) => onVisibilityChange('aboutSystemsTools', value)
                  : undefined
              }
              editControl={
                <PortfolioInlineStringListEditor
                  value={draftAboutSystemsTools}
                  onChange={setDraftAboutSystemsTools}
                  maxItems={16}
                  placeholder="Add system or tool…"
                />
              }
              className="sm:pr-3"
            />
            <PortfolioAboutCardSection
              label="Interests"
              items={aboutInterests}
              editing={fieldEditing('aboutInterests')}
              onEdit={fieldOnEdit('aboutInterests')}
              onConfirm={fieldOnConfirm}
              onCancelEdit={fieldOnCancel}
              confirming={confirming && editingField === 'aboutInterests'}
              canConfirm={fieldHasChanges}
              showVisibility={visibilityEnabled}
              visibility={visibility?.aboutInterests}
              onVisibilityChange={
                onVisibilityChange ? (value) => onVisibilityChange('aboutInterests', value) : undefined
              }
              editControl={
                <PortfolioInlineStringListEditor
                  value={draftAboutInterests}
                  onChange={setDraftAboutInterests}
                  maxItems={12}
                  placeholder="Add interest…"
                />
              }
              className="sm:pl-3"
            />
          </div>
        </>
      ) : (
        <>
      <PortfolioFlatField
        label="Name"
        value={fullName}
        className="!pt-3 !pb-5"
        editing={fieldEditing('fullName')}
        onEdit={fieldOnEdit('fullName')}
        onConfirm={fieldOnConfirm}
        onCancelEdit={fieldOnCancel}
        confirming={confirming && editingField === 'fullName'}
        canConfirm={fieldHasChanges}
        editControl={
          <input
            type="text"
            value={draftName}
            onChange={(event) => setDraftName(event.target.value)}
            className={inlineInputClass}
            autoFocus={editingField === 'fullName'}
            disabled={confirming}
          />
        }
      />
      <PortfolioFlatField
        label="Username"
        value={username || null}
        emptyLabel="Not set"
        className="!py-5"
        editing={fieldEditing('username')}
        onEdit={fieldOnEdit('username')}
        onConfirm={fieldOnConfirm}
        onCancelEdit={fieldOnCancel}
        confirming={confirming && editingField === 'username'}
        canConfirm={fieldHasChanges}
        editControl={
          <div>
            <input
              type="text"
              value={draftUsername}
              onChange={(event) => setDraftUsername(event.target.value)}
              className={inlineInputClass}
              autoFocus={editingField === 'username'}
              disabled={confirming}
              spellCheck={false}
              autoComplete="username"
              placeholder="leopard"
            />
            <p className="mt-1.5 text-[11px] text-neutral-400 dark:text-neutral-500">
              Unique and case-sensitive — leopard and Leopard are different.
            </p>
          </div>
        }
      />
      <PortfolioFlatField
        label="Bio"
        value={bio}
        className="!py-5"
        editing={fieldEditing('bio')}
        onEdit={fieldOnEdit('bio')}
        onConfirm={fieldOnConfirm}
        onCancelEdit={fieldOnCancel}
        confirming={confirming && editingField === 'bio'}
        canConfirm={fieldHasChanges}
        editControl={
          <textarea
            value={draftBio}
            onChange={(event) => setDraftBio(event.target.value)}
            rows={3}
            className={`${inlineInputClass} resize-y font-medium leading-relaxed`}
            autoFocus={editingField === 'bio'}
            disabled={confirming}
          />
        }
      />
      <div className="grid items-start gap-x-8 sm:grid-cols-2">
        <PortfolioFlatField
          label="Gender"
          value={gender}
          emptyLabel="Not set"
          editing={fieldEditing('gender')}
          onEdit={fieldOnEdit('gender')}
          onConfirm={fieldOnConfirm}
          onCancelEdit={fieldOnCancel}
          confirming={confirming && editingField === 'gender'}
          canConfirm={fieldHasChanges}
          showVisibility={visibilityEnabled}
          visibility={visibility?.gender}
          onVisibilityChange={
            onVisibilityChange ? (value) => onVisibilityChange('gender', value) : undefined
          }
          editControl={
            <select
              value={draftGender}
              onChange={(event) => setDraftGender(event.target.value)}
              className={inlineInputClass}
              autoFocus={editingField === 'gender'}
              disabled={confirming}
            >
              <option value="">Not set</option>
              {CREATOR_GENDER_VALUES.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          }
        />
        <PortfolioFlatField
          label="Nationality"
          value={
            nationality
              ? `${nationalityFlag(nationality)} ${nationalityLabel(nationality)}`.trim()
              : ''
          }
          emptyLabel="Not set"
          editing={fieldEditing('nationality')}
          onEdit={fieldOnEdit('nationality')}
          onConfirm={fieldOnConfirm}
          onCancelEdit={fieldOnCancel}
          confirming={confirming && editingField === 'nationality'}
          canConfirm={fieldHasChanges}
          editControl={
            <select
              value={draftNationality}
              onChange={(event) => setDraftNationality(event.target.value)}
              className={`${inlineInputClass} dark:[color-scheme:dark]`}
              autoFocus={editingField === 'nationality'}
              disabled={confirming}
            >
              <option value="" className="bg-white text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100">
                Not set
              </option>
              {NATIONALITY_SELECT_OPTIONS.map((option) => (
                <option
                  key={option.code}
                  value={option.code}
                  className="bg-white text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100"
                >
                  {option.label}
                </option>
              ))}
            </select>
          }
        />
        {!hideProviderFields ? (
          <>
            <PortfolioFlatField
              label="Status"
              value={resolveAvailabilityStatusLabel(isAvailable, availabilityLabel)}
              emptyLabel="Available"
              editing={fieldEditing('availabilityLabel')}
              onEdit={fieldOnEdit('availabilityLabel')}
              onConfirm={fieldOnConfirm}
              onCancelEdit={fieldOnCancel}
              confirming={confirming && editingField === 'availabilityLabel'}
              canConfirm={fieldHasChanges}
              editControl={
                <div className="flex w-full min-w-0 flex-col gap-2 sm:flex-row sm:items-center">
                  <select
                    value={
                      draftAvailabilityCustomMode
                        ? AVAILABILITY_STATUS_OTHER_VALUE
                        : normalizeAvailabilityStatusSelectValue(draftAvailabilityLabel)
                    }
                    onChange={(event) => {
                      const next = event.target.value;
                      if (next === AVAILABILITY_STATUS_OTHER_VALUE) {
                        setDraftAvailabilityCustomMode(true);
                        if (isAvailabilityStatusPreset(draftAvailabilityLabel)) {
                          setDraftAvailabilityLabel('');
                        }
                        return;
                      }
                      setDraftAvailabilityCustomMode(false);
                      setDraftAvailabilityLabel(next);
                    }}
                    className={`${inlineInputClass} sm:max-w-[14rem]`}
                    autoFocus={editingField === 'availabilityLabel' && !draftAvailabilityCustomMode}
                    disabled={confirming}
                    aria-label="Availability status label"
                  >
                    {availabilityStatusSelectOptions().map((option) => (
                      <option key={option.value || 'available'} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {draftAvailabilityCustomMode ? (
                    <input
                      type="text"
                      value={draftAvailabilityLabel}
                      onChange={(event) => setDraftAvailabilityLabel(event.target.value)}
                      className={inlineInputClass}
                      autoFocus={editingField === 'availabilityLabel'}
                      disabled={confirming}
                      maxLength={80}
                      placeholder="Type your status…"
                      aria-label="Custom availability status"
                    />
                  ) : null}
                </div>
              }
            >
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  role="switch"
                  aria-checked={isAvailable}
                  aria-label={isAvailable ? 'Mark as unavailable' : 'Mark as available'}
                  disabled={!onFieldSave || fieldSaving || confirming}
                  onClick={() => {
                    if (!onFieldSave || fieldSaving || confirming) return;
                    void onFieldSave('isAvailable', !isAvailable);
                  }}
                  className={`relative h-7 w-12 shrink-0 rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
                    isAvailable ? 'bg-emerald-500' : 'bg-neutral-300 dark:bg-neutral-600'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform ${
                      isAvailable ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
                <span
                  className={`text-sm font-semibold ${
                    isAvailable
                      ? 'text-emerald-700 dark:text-emerald-300'
                      : 'text-neutral-500 dark:text-neutral-400'
                  }`}
                >
                  {resolveAvailabilityStatusLabel(isAvailable, availabilityLabel)}
                </span>
              </div>
            </PortfolioFlatField>
          </>
        ) : null}
      </div>
      {!hideProviderFields ? (
      <PortfolioFlatField
        label="Availability Hours"
        value={availabilityHours}
        valueSuffix={availabilityTimezone ? `(${availabilityTimezone})` : null}
        emptyLabel="Not set"
        editing={fieldEditing('availabilityHours')}
        onEdit={fieldOnEdit('availabilityHours')}
        onConfirm={fieldOnConfirm}
        onCancelEdit={fieldOnCancel}
        confirming={confirming && editingField === 'availabilityHours'}
        canConfirm={fieldHasChanges}
        showVisibility={visibilityEnabled}
        visibility={visibility?.availability}
        onVisibilityChange={
          onVisibilityChange ? (value) => onVisibilityChange('availability', value) : undefined
        }
        editControl={
          <AvailabilityHoursInput
            value={draftSchedule}
            onChange={setDraftSchedule}
            timezoneId={availabilityTimezone}
            disabled={confirming}
          />
        }
      />
      ) : null}
      <div className="grid items-start gap-x-8 sm:grid-cols-2">
        <PortfolioFlatField label="Member Since" value={memberSince} emptyLabel="Not available yet" />
        {!hideProviderFields ? (
        <PortfolioFlatField
          label="Typical Response Time"
          value={responseTimeLabel}
          emptyLabel="Choose a response time"
          muted={!responseTimeLabel}
          editing={fieldEditing('typicalResponseTime')}
          onEdit={fieldOnEdit('typicalResponseTime')}
          onConfirm={fieldOnConfirm}
          onCancelEdit={fieldOnCancel}
          confirming={confirming && editingField === 'typicalResponseTime'}
          canConfirm={fieldHasChanges}
          showVisibility={visibilityEnabled}
          visibility={visibility?.responseTime}
          onVisibilityChange={
            onVisibilityChange ? (value) => onVisibilityChange('responseTime', value) : undefined
          }
          editControl={
            <select
              value={draftTypicalResponseTime}
              onChange={(event) => setDraftTypicalResponseTime(event.target.value)}
              className={inlineInputClass}
              disabled={confirming}
            >
              <option value="">Not set</option>
              {TYPICAL_RESPONSE_TIME_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          }
        />
        ) : null}
      </div>
      <div className="py-6">
        <div className="mb-2.5 flex items-center justify-between gap-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-500 dark:text-neutral-500">
            Location
          </p>
          {visibilityEnabled && visibility?.location && onVisibilityChange ? (
            <PortfolioFieldVisibilityMenu
              value={visibility.location}
              onChange={(value) => onVisibilityChange('location', value)}
            />
          ) : null}
        </div>
        <PortfolioLocationReadOnly
          city={locationCity}
          country={locationCountry}
          timezone={locationTimezone}
          hasCompleteLocation={hasCompleteLocation}
          detectingLocation={detectingLocation}
          onDetectLocation={onDetectLocation}
        />
      </div>
        </>
      )}
    </div>
  );
}

export function PortfolioAboutPageReadOnly(
  props: Omit<ComponentProps<typeof PortfolioAboutReadOnly>, 'layout'>
) {
  return <PortfolioAboutReadOnly {...props} layout="aboutDetails" />;
}

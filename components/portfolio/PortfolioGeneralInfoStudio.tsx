'use client';

import { memo, useCallback, useEffect, useId, useMemo, useRef, useState, type ReactNode } from 'react';
import { AvailabilityHoursInput } from '@/components/ui/AvailabilityHoursInput';
import { PortfolioFieldVisibilityMenu } from '@/components/portfolio/PortfolioInformationChrome';
import { PortfolioLocationReadOnly } from '@/components/portfolio/PortfolioLocationChrome';
import {
  STUDIO_BLOCK_CLASS,
  STUDIO_FLOAT_IN_STYLE,
  STUDIO_GLASS_PANEL_CLASS,
  STUDIO_INLINE_TEXT_CLASS,
  STUDIO_STATIC_BOX_CLASS,
  StudioField,
  StudioSaveChrome,
  useInlineStudio,
  useStudioFold,
  type StudioChangeHandler,
} from '@/components/portfolio/PortfolioStudioKit';
import { SpecialtyMultiSelect } from '@/components/creator/studio/SpecialtyMultiSelect';
import { CREATOR_GENDER_VALUES } from '@/lib/creator-gender';
import { normalizeCreatorAppRole } from '@/lib/creator-app-role';
import { MAX_PROFILE_SPECIALTIES } from '@/lib/specialties';
import { NATIONALITY_SELECT_OPTIONS, nationalityFlag } from '@/lib/countries';
import { resolveAvailabilityStatusLabel } from '@/lib/availability-status';
import type { ContactVisibilityLevel } from '@/lib/contact-visibility';
import {
  defaultSchedule,
  formatAvailabilityHours,
  formatAvailabilityHoursLines,
  type AvailabilitySchedule,
} from '@/lib/availabilityHours';
import { useT } from '@/lib/i18n/I18nProvider';

export type PortfolioGeneralInfoDraft = {
  fullName: string;
  username: string;
  bio: string;
  gender: string;
  nationality: string;
  isAvailable: boolean;
  availability: AvailabilitySchedule | null;
  specialties: string[];
  yearsOfExperience: number | null;
};

type DraftKey = keyof PortfolioGeneralInfoDraft;
type TextKey = 'fullName' | 'username' | 'bio';
type ChoiceKey = 'gender' | 'nationality';
type ChangeHandler = StudioChangeHandler<PortfolioGeneralInfoDraft>;

type GeneralInfoVisibilityKey = 'gender' | 'availability' | 'location';

type ChoiceOption = { value: string; label: string };

/**
 * A block's visible title: the site's section line — a small ink square, then the name in small caps
 * (`gn-kicker`, as "■ PROFILES" on search and News) — the full width of the block's grid. Blocks are
 * set apart by space alone, no hairline between them.
 */
function BlockTitle({ id, children, className = 'col-span-full -mb-2' }: { id: string; children: ReactNode; className?: string }) {
  const t = useT();
  return (
    <h3 id={id} className={`gn-kicker flex items-center gap-2.5 ${className}`}>
      <span aria-hidden className="h-1.5 w-1.5 shrink-0 bg-[color:var(--gn-ink)]" />
      {children}
    </h3>
  );
}

const GENDER_OPTIONS: ChoiceOption[] = CREATOR_GENDER_VALUES.map((value) => ({ value, label: value }));
const NATIONALITY_OPTIONS: ChoiceOption[] = NATIONALITY_SELECT_OPTIONS.map((option) => ({
  value: option.code,
  label: `${nationalityFlag(option.code)}  ${option.label}`,
}));

function fieldSignature(key: DraftKey, value: PortfolioGeneralInfoDraft[DraftKey]): string {
  if (key === 'availability') {
    return value ? formatAvailabilityHours(value as AvailabilitySchedule) : '';
  }
  if (key === 'specialties') {
    return ((value as string[] | null) ?? []).join('|');
  }
  return String(value ?? '');
}

/** Years of experience: two digits (0–80, the API's range), "years" after it; Enter saves. */
const YearsField = memo(function YearsField({
  defaultValue,
  onChange,
  onCommit,
}: {
  defaultValue: number | null;
  onChange: ChangeHandler;
  onCommit: () => void;
}) {
  const t = useT();
  const id = useId();
  return (
    <StudioField label={t('Years of experience')} htmlFor={id}>
      <div className="flex items-center gap-2">
        <input
          id={id}
          type="text"
          inputMode="numeric"
          maxLength={2}
          defaultValue={defaultValue != null ? String(defaultValue) : ''}
          placeholder="0"
          onChange={(event) => {
            const digits = event.currentTarget.value.replace(/\D/g, '');
            onChange('yearsOfExperience', digits ? Math.min(80, Number.parseInt(digits, 10)) : null);
          }}
          onBlur={onCommit}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              onCommit();
            }
          }}
          className={`${STUDIO_INLINE_TEXT_CLASS} !w-[calc(3ch+1.5rem+2px)] tabular-nums`}
        />
        <span className="text-[14px] text-[#536471] dark:text-[#8B98A5]">{t('years')}</span>
      </div>
    </StudioField>
  );
});

const NO_TAGS: string[] = [];
const noopTags = () => {};

type SpecialtyCopy = { label: string; noun: string; placeholder: string };

function specialtyCopyForRole(appRole: unknown): SpecialtyCopy {
  switch (normalizeCreatorAppRole(appRole)) {
    case 'SELLER':
      return { label: 'What you sell', noun: 'categories', placeholder: 'e.g. Streetwear, Handmade jewelry' };
    case 'RH_RECRUITER':
      return { label: 'Looking for', noun: 'profiles', placeholder: 'e.g. Data Scientist, DevOps Engineer' };
    default:
      return { label: 'Specialty', noun: 'specialties', placeholder: 'e.g. Motion Designer, DevOps Engineer' };
  }
}

const SpecialtyField = memo(function SpecialtyField({
  defaultValue,
  appRole,
  onChange,
}: {
  defaultValue: string[];
  appRole: unknown;
  onChange: ChangeHandler;
}) {
  const t = useT();
  const [value, setValue] = useState(defaultValue);
  const copy = specialtyCopyForRole(appRole);
  return (
    <StudioField
      label={t(copy.label)}
      hint={t('Add 1 to {MAXPROFILESPECIALTIES} {noun}. Click a chip to place it first.', { MAXPROFILESPECIALTIES: MAX_PROFILE_SPECIALTIES, noun: copy.noun })}
    >
      <SpecialtyMultiSelect
        variant="studio"
        showHint={false}
        placeholder={t(copy.placeholder)}
        specialties={value}
        tags={NO_TAGS}
        showTags={false}
        onSpecialtiesChange={(next) => {
          setValue(next);
          onChange('specialties', next);
        }}
        onTagsChange={noopTags}
      />
    </StudioField>
  );
});

const InlineTextField = memo(function InlineTextField({
  name,
  label,
  defaultValue,
  placeholder,
  multiline = false,
  className,
  onChange,
  onCommit,
}: {
  name: TextKey;
  label: string;
  defaultValue: string;
  placeholder?: string;
  multiline?: boolean;
  className?: string;
  onChange: ChangeHandler;
  onCommit: () => void;
}) {
  const id = useId();
  return (
    <StudioField label={label} htmlFor={id} className={className}>
      {multiline ? (
        <textarea
          id={id}
          defaultValue={defaultValue}
          placeholder={placeholder}
          rows={1}
          onChange={(event) => onChange(name, event.currentTarget.value)}
          className={`${STUDIO_INLINE_TEXT_CLASS} min-h-[76px] resize-none leading-relaxed [field-sizing:content]`}
        />
      ) : (
        <input
          id={id}
          type="text"
          defaultValue={defaultValue}
          placeholder={placeholder}
          spellCheck={name === 'username' ? false : undefined}
          autoComplete="off"
          onChange={(event) => onChange(name, event.currentTarget.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              onCommit();
            }
          }}
          className={STUDIO_INLINE_TEXT_CLASS}
        />
      )}
    </StudioField>
  );
});

const ChoiceField = memo(function ChoiceField({
  name,
  label,
  defaultValue,
  options,
  placeholder = 'Select',
  searchable = false,
  align = 'start',
  aside,
  onChange,
}: {
  name: ChoiceKey;
  label: string;
  defaultValue: string;
  options: ChoiceOption[];
  placeholder?: string;
  searchable?: boolean;
  align?: 'start' | 'end';
  aside?: ReactNode;
  onChange: ChangeHandler;
}) {
  const t = useT();
  const id = useId();
  const [value, setValue] = useState(defaultValue);
  const [present, setPresent] = useState(false);
  const [visible, setVisible] = useState(false);
  const [query, setQuery] = useState('');
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const close = useCallback((refocus: boolean) => {
    setVisible(false);
    if (refocus) triggerRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) close(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close(true);
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [visible, close]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return options;
    return options.filter(
      (option) => option.label.toLowerCase().includes(needle) || option.value.toLowerCase().includes(needle),
    );
  }, [options, query]);

  const select = (next: string) => {
    setValue(next);
    onChange(name, next);
    close(true);
  };

  const selectedLabel = options.find((option) => option.value === value)?.label ?? value;

  return (
    <StudioField label={label} htmlFor={id} aside={aside}>
      <div ref={rootRef} className="relative">
        <button
          ref={triggerRef}
          id={id}
          type="button"
          aria-haspopup="listbox"
          aria-expanded={visible}
          onClick={() => {
            if (visible) {
              close(false);
              return;
            }
            setQuery('');
            setPresent(true);
            setVisible(true);
          }}
          className={`${STUDIO_INLINE_TEXT_CLASS} flex items-center justify-between gap-3 text-left`}
        >
          <span className={`truncate ${value ? '' : 'font-normal text-neutral-400 dark:text-neutral-600'}`}>
            {value ? t(selectedLabel) : placeholder}
          </span>
          <svg
            aria-hidden
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.75}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`h-4 w-4 shrink-0 text-neutral-500 transition-transform duration-300 dark:text-[#a1a1aa] ${visible ? 'rotate-180' : ''}`}
          >
            <path d="m4 6 4 4 4-4" />
          </svg>
        </button>

        {present ? (
          <div
            style={visible ? STUDIO_FLOAT_IN_STYLE : undefined}
            onTransitionEnd={(event) => {
              if (event.target === event.currentTarget && !visible) setPresent(false);
            }}
            className={`${STUDIO_GLASS_PANEL_CLASS} absolute top-full z-50 mt-3 w-full min-w-[15rem] transition-all duration-200 ease-out ${
              align === 'end' ? 'right-0' : 'left-0'
            } ${visible ? 'opacity-100' : 'pointer-events-none -translate-y-1 opacity-0'}`}
          >
            {searchable ? (
              <input
                type="text"
                autoFocus
                value={query}
                placeholder={t('Search…')}
                onChange={(event) => setQuery(event.currentTarget.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault();
                    if (filtered[0]) select(filtered[0].value);
                  }
                }}
                className="block w-full border-b border-black/[0.06] bg-transparent px-4 py-3 text-[11.5px] uppercase tracking-[0.14em] text-neutral-900 outline-hidden placeholder:text-neutral-400 dark:border-white/[0.06] dark:text-white dark:placeholder:text-neutral-600"
              />
            ) : null}
            <ul role="listbox" aria-label={label} className="max-h-64 overflow-y-auto p-1.5">
              {filtered.length === 0 ? (
                <li className="px-3 py-2 text-[0.85rem] text-neutral-500">{t('No match')}</li>
              ) : (
                filtered.map((option) => {
                  const selected = option.value === value;
                  return (
                    <li key={option.value} role="option" aria-selected={selected}>
                      <button
                        type="button"
                        onClick={() => select(option.value)}
                        className={`flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left text-[0.85rem] transition-colors duration-200 hover:bg-black/[0.04] dark:hover:bg-white/[0.06] ${
                          selected
                            ? 'font-semibold text-[#0F1419] dark:text-[#E7E9EA]'
                            : 'font-medium text-neutral-800 dark:text-neutral-200'
                        }`}
                      >
                        <span className="truncate">{t(option.label)}</span>
                        {selected ? <span aria-hidden className="h-1 w-1 shrink-0 rounded-full bg-current" /> : null}
                      </button>
                    </li>
                  );
                })
              )}
            </ul>
          </div>
        ) : null}
      </div>
    </StudioField>
  );
});

const StatusField = memo(function StatusField({
  defaultValue,
  availabilityLabel,
  onChange,
}: {
  defaultValue: boolean;
  availabilityLabel: string;
  onChange: ChangeHandler;
}) {
  const t = useT();
  const id = useId();
  const [on, setOn] = useState(defaultValue);
  return (
    <StudioField label={t('Status')} htmlFor={id}>
      <div className={`${STUDIO_STATIC_BOX_CLASS} gap-3`}>
        <button
          id={id}
          type="button"
          role="switch"
          aria-checked={on}
          onClick={() => {
            setOn(!on);
            onChange('isAvailable', !on);
          }}
          className={`relative inline-flex h-4 w-7 shrink-0 items-center rounded-full transition-colors duration-300 outline-hidden focus-visible:ring-2 focus-visible:ring-[color:var(--gn-ring)] ${
            on ? 'bg-[color:var(--gn-ink)]' : 'bg-black/[0.12] dark:bg-white/[0.14]'
          }`}
        >
          <span
            aria-hidden
            className={`inline-block h-3 w-3 rounded-full shadow-xs transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
              on ? 'translate-x-3.5 bg-[color:var(--gn-surface)]' : 'translate-x-0.5 bg-[color:var(--gn-inset)]'
            }`}
          />
        </button>
        <span className="truncate text-[15px] font-normal text-[color:var(--gn-ink)]">
          {resolveAvailabilityStatusLabel(on, availabilityLabel)}
        </span>
      </div>
    </StudioField>
  );
});

const AvailabilityField = memo(function AvailabilityField({
  defaultValue,
  timezone,
  aside,
  onChange,
}: {
  defaultValue: AvailabilitySchedule | null;
  timezone: string;
  aside?: ReactNode;
  onChange: ChangeHandler;
}) {
  const t = useT();
  const id = useId();
  const [schedule, setSchedule] = useState(defaultValue);
  const [open, setOpen] = useStudioFold();
  return (
    <StudioField label={t('Availability hours')} htmlFor={id} aside={aside}>
      <button
        id={id}
        type="button"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className={`${STUDIO_INLINE_TEXT_CLASS} flex items-center justify-between gap-3 text-left`}
      >
        <span className={`truncate ${schedule ? '' : 'font-normal text-neutral-400 dark:text-neutral-600'}`}>
          {schedule ? formatAvailabilityHoursLines(schedule).join(' · ') : t('Set your hours')}
        </span>
        {/* The selects' chevron: one way to open a field everywhere, not a pencil button inside it. */}
        <svg
          aria-hidden
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.75}
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`h-4 w-4 shrink-0 text-neutral-500 transition-transform duration-300 dark:text-[#a1a1aa] ${open ? 'rotate-180' : ''}`}
        >
          <path d="m4 6 4 4 4-4" />
        </svg>
      </button>
      {open ? (
        <div style={STUDIO_FLOAT_IN_STYLE} className="pb-3 pt-6">
          <AvailabilityHoursInput
            value={schedule ?? defaultSchedule()}
            timezoneId={timezone || null}
            variant="studio"
            onChange={(next) => {
              setSchedule(next);
              onChange('availability', next);
            }}
          />
        </div>
      ) : null}
    </StudioField>
  );
});

export function PortfolioGeneralInfoStudio({
  initial,
  availabilityLabel,
  hideProviderFields,
  showSpecialty = false,
  appRole,
  location,
  visibility,
  onVisibilityChange,
  onSave,
}: {
  initial: PortfolioGeneralInfoDraft;
  availabilityLabel: string;
  hideProviderFields: boolean;
  /** Roles without an About section (Seller, RH / Recruiter / Client) edit their specialty here. */
  showSpecialty?: boolean;
  /** Drives the specialty field's label and placeholder. */
  appRole?: unknown;
  location: {
    city: string;
    country: string;
    timezone: string;
    hasCompleteLocation: boolean;
    detectingLocation?: boolean;
    onDetectLocation?: () => void;
  };
  visibility: Record<GeneralInfoVisibilityKey, ContactVisibilityLevel>;
  onVisibilityChange: (key: GeneralInfoVisibilityKey, level: ContactVisibilityLevel) => void;
  onSave: (draft: PortfolioGeneralInfoDraft) => Promise<void>;
}) {
  const t = useT();
  const studio = useInlineStudio({ initial, onSave, signature: fieldSignature });
  const { baseline, change, commit } = studio;
  const titleId = useId();

  return (
    <>
      <div key={studio.revision}>
        <section className={STUDIO_BLOCK_CLASS} aria-labelledby={`${titleId}-identity`}>
          <BlockTitle id={`${titleId}-identity`}>{t('Identity')}</BlockTitle>
          <div className="grid grid-cols-1 items-start gap-y-6">
            <InlineTextField
              name="fullName"
              label={t('Name')}
              defaultValue={baseline.fullName}
              placeholder={t('Your full name')}
              onChange={change}
              onCommit={commit}
            />
            <InlineTextField
              name="username"
              label={t('Username')}
              defaultValue={baseline.username}
              placeholder="username"
              onChange={change}
              onCommit={commit}
            />
          </div>
          <InlineTextField
            name="bio"
            label={t('Bio')}
            multiline
            defaultValue={baseline.bio}
            placeholder={t('A few lines about you and your work')}
            onChange={change}
            onCommit={commit}
          />
          {showSpecialty ? <SpecialtyField defaultValue={baseline.specialties} appRole={appRole} onChange={change} /> : null}
          {showSpecialty ? <YearsField defaultValue={baseline.yearsOfExperience} onChange={change} onCommit={commit} /> : null}
        </section>

        <section className={STUDIO_BLOCK_CLASS} aria-labelledby={`${titleId}-details`}>
          <BlockTitle id={`${titleId}-details`}>{t('Details')}</BlockTitle>
          <StatusField defaultValue={baseline.isAvailable} availabilityLabel={availabilityLabel} onChange={change} />
          <ChoiceField
            name="gender"
            label={t('Gender')}
            defaultValue={baseline.gender}
            options={GENDER_OPTIONS}
            placeholder={t('Not specified')}
            onChange={change}
            aside={
              <PortfolioFieldVisibilityMenu
                value={visibility.gender}
                onChange={(level) => onVisibilityChange('gender', level)}
                menuPlacement="down"
                variant="text"
              />
            }
          />
          <ChoiceField
            name="nationality"
            label={t('Nationality')}
            defaultValue={baseline.nationality}
            options={NATIONALITY_OPTIONS}
            placeholder={t('Not specified')}
            searchable
            align="end"
            onChange={change}
          />
        </section>

        {!hideProviderFields ? (
          <section className={STUDIO_BLOCK_CLASS} aria-labelledby={`${titleId}-time`}>
            <BlockTitle id={`${titleId}-time`}>{t('Availability')}</BlockTitle>
            <AvailabilityField
              defaultValue={baseline.availability}
              timezone={location.timezone}
              onChange={change}
              aside={
                <PortfolioFieldVisibilityMenu
                  value={visibility.availability}
                  onChange={(level) => onVisibilityChange('availability', level)}
                  menuPlacement="down"
                  variant="text"
                />
              }
            />
          </section>
        ) : null}

        <section className={STUDIO_BLOCK_CLASS} aria-labelledby={`${titleId}-location`}>
          <div className="min-w-0">
            <div className="mb-2.5 flex items-center gap-3">
              <BlockTitle id={`${titleId}-location`} className="">
                {t('Location')}
              </BlockTitle>
              <PortfolioFieldVisibilityMenu
                value={visibility.location}
                onChange={(level) => onVisibilityChange('location', level)}
                menuPlacement="down"
                variant="text"
              />
            </div>
            <PortfolioLocationReadOnly {...location} />
          </div>
        </section>
      </div>

      <StudioSaveChrome studio={studio} />
    </>
  );
}

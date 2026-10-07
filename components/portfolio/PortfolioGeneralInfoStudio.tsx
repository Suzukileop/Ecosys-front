'use client';

import { memo, useCallback, useEffect, useId, useMemo, useRef, useState, type ReactNode } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPenToSquare } from '@fortawesome/free-regular-svg-icons';
import { faCheck } from '@fortawesome/free-solid-svg-icons';
import { AvailabilityHoursInput } from '@/components/ui/AvailabilityHoursInput';
import { PortfolioFieldVisibilityMenu } from '@/components/portfolio/PortfolioInformationChrome';
import { PortfolioLocationReadOnly } from '@/components/portfolio/PortfolioLocationChrome';
import {
  STUDIO_BLOCK_CLASS,
  STUDIO_FLOAT_IN_STYLE,
  STUDIO_GLASS_PANEL_CLASS,
  STUDIO_ICON_BUTTON_TONES,
  STUDIO_INLINE_TEXT_CLASS,
  STUDIO_LABEL_CLASS,
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

export type PortfolioGeneralInfoDraft = {
  fullName: string;
  username: string;
  bio: string;
  gender: string;
  nationality: string;
  isAvailable: boolean;
  availability: AvailabilitySchedule | null;
  specialties: string[];
};

type DraftKey = keyof PortfolioGeneralInfoDraft;
type TextKey = 'fullName' | 'username' | 'bio';
type ChoiceKey = 'gender' | 'nationality';
type ChangeHandler = StudioChangeHandler<PortfolioGeneralInfoDraft>;

type GeneralInfoVisibilityKey = 'gender' | 'availability' | 'location';

type ChoiceOption = { value: string; label: string };

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
  const [value, setValue] = useState(defaultValue);
  const copy = specialtyCopyForRole(appRole);
  return (
    <StudioField
      label={copy.label}
      hint={`Add 1 to ${MAX_PROFILE_SPECIALTIES} ${copy.noun}. Click a chip to place it first.`}
    >
      <SpecialtyMultiSelect
        variant="studio"
        showHint={false}
        placeholder={copy.placeholder}
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
          className={`${STUDIO_INLINE_TEXT_CLASS} resize-none leading-relaxed [field-sizing:content]`}
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
            {value ? selectedLabel : placeholder}
          </span>
          <svg
            aria-hidden
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.75}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`h-4 w-4 shrink-0 text-neutral-500 transition-transform duration-300 dark:text-white/50 ${visible ? 'rotate-180' : ''}`}
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
                placeholder="Search…"
                onChange={(event) => setQuery(event.currentTarget.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault();
                    if (filtered[0]) select(filtered[0].value);
                  }
                }}
                className="block w-full border-b border-black/[0.06] bg-transparent px-4 py-3 text-[11.5px] uppercase tracking-[0.14em] text-neutral-900 outline-none placeholder:text-neutral-400 dark:border-white/[0.06] dark:text-white dark:placeholder:text-neutral-600"
              />
            ) : null}
            <ul role="listbox" aria-label={label} className="max-h-64 overflow-y-auto p-1.5">
              {filtered.length === 0 ? (
                <li className="px-3 py-2 text-[0.85rem] text-neutral-500">No match</li>
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
                            ? 'font-semibold text-[#FF5722]'
                            : 'font-medium text-neutral-800 dark:text-neutral-200'
                        }`}
                      >
                        <span className="truncate">{option.label}</span>
                        {selected ? <span aria-hidden className="h-1 w-1 shrink-0 rounded-full bg-[#FF5722]" /> : null}
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
  const id = useId();
  const [on, setOn] = useState(defaultValue);
  return (
    <StudioField label="Status" htmlFor={id}>
      <div className="flex items-center gap-3 pb-3">
        <button
          id={id}
          type="button"
          role="switch"
          aria-checked={on}
          onClick={() => {
            setOn(!on);
            onChange('isAvailable', !on);
          }}
          className={`relative inline-flex h-4 w-7 shrink-0 items-center rounded-full transition-colors duration-300 outline-none focus-visible:ring-2 focus-visible:ring-[#FF5722]/40 ${
            on ? 'bg-emerald-500' : 'bg-black/[0.12] dark:bg-white/[0.14]'
          }`}
        >
          <span
            aria-hidden
            className={`inline-block h-3 w-3 rounded-full bg-white shadow-sm transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
              on ? 'translate-x-3.5' : 'translate-x-0.5'
            }`}
          />
        </button>
        <span className="truncate text-base font-normal text-black dark:text-neutral-100">
          {resolveAvailabilityStatusLabel(on, availabilityLabel)}
        </span>
      </div>
    </StudioField>
  );
});

/** Read-only: the timezone always follows the detected location. */
function TimezoneField({ timezone }: { timezone: string }) {
  const value = timezone.trim();
  return (
    <StudioField label="Timezone">
      <div className="pb-3">
        <p className={`truncate text-base ${value ? 'font-normal text-black dark:text-neutral-100' : 'font-normal text-neutral-400 dark:text-neutral-600'}`}>
          {value ? value.replace(/_/g, ' ') : 'Not detected yet'}
        </p>
        <p className="mt-1 text-[12px] text-neutral-500 dark:text-neutral-400">
          {value ? 'Detected from your location' : 'Detect your location below to set it'}
        </p>
      </div>
    </StudioField>
  );
}

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
  const id = useId();
  const [schedule, setSchedule] = useState(defaultValue);
  const [open, setOpen] = useStudioFold();
  return (
    <StudioField label="Availability hours" htmlFor={id} aside={aside} className={open ? 'sm:col-span-2' : ''}>
      <button
        id={id}
        type="button"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className={`${STUDIO_INLINE_TEXT_CLASS} group/edit flex items-center justify-between gap-3 text-left`}
      >
        <span className={`truncate ${schedule ? '' : 'font-normal text-neutral-400 dark:text-neutral-600'}`}>
          {schedule ? formatAvailabilityHoursLines(schedule).join(' · ') : 'Set your hours'}
        </span>
        <span
          aria-hidden
          className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-colors duration-200 ${
            open
              ? STUDIO_ICON_BUTTON_TONES.active
              : 'border-neutral-300 bg-white text-neutral-700 group-hover/edit:border-neutral-900 group-hover/edit:bg-neutral-900 group-hover/edit:text-white dark:border-white/25 dark:bg-transparent dark:text-white/80 dark:group-hover/edit:border-white dark:group-hover/edit:bg-white dark:group-hover/edit:text-black'
          }`}
        >
          <FontAwesomeIcon icon={open ? faCheck : faPenToSquare} className="h-3.5 w-3.5" fixedWidth />
        </span>
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
  const studio = useInlineStudio({ initial, onSave, signature: fieldSignature });
  const { baseline, change, commit } = studio;

  return (
    <>
      <div key={studio.revision}>
        <section className={STUDIO_BLOCK_CLASS} aria-label="Identity">
          <div className="grid grid-cols-1 items-start gap-x-8 gap-y-8 sm:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
            <InlineTextField
              name="fullName"
              label="Name"
              defaultValue={baseline.fullName}
              placeholder="Your full name"
              onChange={change}
              onCommit={commit}
            />
            <InlineTextField
              name="username"
              label="Username"
              defaultValue={baseline.username}
              placeholder="username"
              onChange={change}
              onCommit={commit}
            />
          </div>
          <InlineTextField
            name="bio"
            label="Bio"
            multiline
            defaultValue={baseline.bio}
            placeholder="A few lines about you and your work"
            onChange={change}
            onCommit={commit}
          />
          {showSpecialty ? <SpecialtyField defaultValue={baseline.specialties} appRole={appRole} onChange={change} /> : null}
        </section>

        <section className={`${STUDIO_BLOCK_CLASS} sm:grid-cols-2 lg:grid-cols-3`} aria-label="Status and identity details">
          <StatusField defaultValue={baseline.isAvailable} availabilityLabel={availabilityLabel} onChange={change} />
          <ChoiceField
            name="gender"
            label="Gender"
            defaultValue={baseline.gender}
            options={GENDER_OPTIONS}
            placeholder="Not specified"
            onChange={change}
            aside={
              <PortfolioFieldVisibilityMenu
                value={visibility.gender}
                onChange={(level) => onVisibilityChange('gender', level)}
                menuPlacement="down"
              />
            }
          />
          <ChoiceField
            name="nationality"
            label="Nationality"
            defaultValue={baseline.nationality}
            options={NATIONALITY_OPTIONS}
            placeholder="Not specified"
            searchable
            align="end"
            onChange={change}
          />
        </section>

        {!hideProviderFields ? (
          <section className={`${STUDIO_BLOCK_CLASS} sm:grid-cols-2`} aria-label="Time">
            <AvailabilityField
              defaultValue={baseline.availability}
              timezone={location.timezone}
              onChange={change}
              aside={
                <PortfolioFieldVisibilityMenu
                  value={visibility.availability}
                  onChange={(level) => onVisibilityChange('availability', level)}
                  menuPlacement="down"
                />
              }
            />
            <TimezoneField timezone={location.timezone} />
          </section>
        ) : null}

        <section className={STUDIO_BLOCK_CLASS} aria-label="Location">
          <div className="min-w-0">
            <div className="mb-2.5 flex items-center justify-between gap-3">
              <span className={STUDIO_LABEL_CLASS}>Location</span>
              <PortfolioFieldVisibilityMenu
                value={visibility.location}
                onChange={(level) => onVisibilityChange('location', level)}
                menuPlacement="down"
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

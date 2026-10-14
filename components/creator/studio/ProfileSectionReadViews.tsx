'use client';

import { localeTag } from '@/lib/i18n/active';
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPen, faPlus } from '@fortawesome/free-solid-svg-icons';
import { CONTACT_VISIBILITY_OPTIONS, type ContactVisibilityLevel, type ContactVisibilitySettings } from '@/lib/contact-visibility';
import { CREATOR_APP_ROLE_OPTIONS, normalizeCreatorAppRole } from '@/lib/creator-app-role';
import { nationalityLabel, normalizeNationalityCode } from '@/lib/countries';
import { formatPhoneDisplay } from '@/lib/phone';
import { resolveSpokenLanguageLevelLabel } from '@/lib/spoken-languages';
import { TYPICAL_RESPONSE_TIME_OPTIONS } from '@/lib/typical-response-time';
import { formatAvailabilityHoursLines, parseAvailabilityHours } from '@/lib/availabilityHours';
import { groupBySpecialty } from '@/lib/specialties';
import { CountryFlag } from '@/components/ui/CountryFlag';
import { CreatorToolLogo } from '@/components/creator/studio/CreatorToolLogo';
import { SocialPlatformIcon } from '@/components/marketplace/creator-profile-social-icons';
import { linkDisplayLabel, resolveLinkPlatform } from '@/components/marketplace/CreatorProfileContactSection';
import type { ProfileFormValues } from '@/components/creator/studio/profile-form-schema';
import type { ProfileDrawerSectionId } from '@/components/creator/studio/ProfileSectionEditors';
import { useT } from '@/lib/i18n/I18nProvider';

/*
 * My Profile, read mode — the News grammar applied to a profile.
 *
 * Every section reads the same way, top to bottom on ONE page (no tab that hides six facts behind a
 * click and leaves the screen empty under them):
 *  - a heading line: the section's name (17px bold) with its count, a quiet "N to complete" badge
 *    while fields are missing, then on the right who can see it and "Edit" in the brand orange —
 *    the only way into the section's drawer;
 *  - one square block in the module tone (#F7F9F9 / #16181C), no outline, edge to edge on phones,
 *    holding the section as a visitor sees it;
 *  - when the section is empty, the block holds one line saying why it is worth filling and an
 *    "Add" pill — compact, so seven empty sections never stack seven billboards.
 * Above them, a plain text menu of the sections stays pinned while the page scrolls and follows the
 * reading position; a tap scrolls to the section.
 */

const FOCUS_RING = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--gn-ring)]';

/** The section block: square, the module tone, edge to edge on phones (the page has a 16px gutter). */
const BLOCK_CLASS = 'gn-card -mx-4 rounded-none bg-[#F7F9F9] px-5 py-5 dark:bg-[#16181C] sm:mx-0 sm:p-6';

/** Secondary ink on the module tone: #8B98A5 in dark (#71767B falls under AA on #16181C). */
const INK2 = 'text-[#536471] dark:text-[#8B98A5]';
const INK = 'text-[color:var(--gn-ink)]';

/*
 * The one accent: the brand orange, on "Edit" only — kept quiet at rest (a softened orange, medium
 * weight: #E0663C on white, 3.4:1, over the 3:1 floor for a control; #E8714A on black) so it marks the
 * action without pulling the eye from the content, and full brand orange under the pointer.
 */
const ACCENT = 'text-[#E0663C] hover:text-[#D4400F] dark:text-[#E8714A] dark:hover:text-[#FF5722]';
const ACCENT_HOVER = 'hover:bg-[rgba(255,87,34,0.06)] dark:hover:bg-[rgba(255,87,34,0.1)]';

/** Chips on the block: the inset tone (white / #202327), 36px, full radius. */
const CHIP_CLASS = 'inline-flex h-9 max-w-full items-center gap-2 rounded-full bg-[color:var(--gn-inset)] text-[14px] font-medium';

const OUTLINE_PILL = `inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-full px-4 text-[14px] font-semibold leading-5 ${INK} shadow-[inset_0_0_0_1px_#CFD9DE] transition-colors hover:bg-[color:var(--gn-hover)] dark:shadow-[inset_0_0_0_1px_#536471] ${FOCUS_RING}`;

function visibilityLabel(level: ContactVisibilityLevel): string {
  return CONTACT_VISIBILITY_OPTIONS.find((option) => option.value === level)?.label ?? level;
}

type VisibilityKey = keyof ContactVisibilitySettings;

/** What each level means, in the owner's words — the picker's second line. */
const VISIBILITY_HINTS: Record<ContactVisibilityLevel, string> = {
  PUBLIC: 'Everyone, signed in or not',
  MEMBERS: 'Signed-in members only',
  HIDDEN: 'Only you',
};

/** Short trigger labels ("Members", not "Members only", so the pill stays small on phones). */
const VISIBILITY_SHORT: Record<ContactVisibilityLevel, string> = {
  PUBLIC: 'Public',
  MEMBERS: 'Members',
  HIDDEN: 'Hidden',
};

const GLOBE_D =
  'M21 12a9 9 0 0 1-9 9m9-9a9 9 0 0 0-9-9m9 9H3m9 9a9 9 0 0 1-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 0 1 9-9';
const MEMBERS_D =
  'M16 19v-1.5a3.5 3.5 0 0 0-3.5-3.5h-5A3.5 3.5 0 0 0 4 17.5V19m16 0v-1.5a3.5 3.5 0 0 0-2.5-3.35M15 4.15a3.5 3.5 0 0 1 0 6.7M13.5 7.5a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0z';
const HIDDEN_D =
  'M3 3l18 18M10.6 10.6a2 2 0 0 0 2.8 2.8M9.9 5.2A9.7 9.7 0 0 1 12 5c5 0 8.5 4.5 9.5 7a13.4 13.4 0 0 1-2.4 3.6M6.6 6.6C4.6 7.9 3.2 9.9 2.5 12c1 2.5 4.5 7 9.5 7 1.6 0 3-.4 4.3-1.1';
const LEVEL_D: Record<ContactVisibilityLevel, string> = { PUBLIC: GLOBE_D, MEMBERS: MEMBERS_D, HIDDEN: HIDDEN_D };

function LevelGlyph({ level, className = 'h-4 w-4' }: { level: ContactVisibilityLevel; className?: string }) {
  return (
    <svg className={`shrink-0 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d={LEVEL_D[level]} />
    </svg>
  );
}

/**
 * Who sees a block: a small pill (globe / people / crossed eye + the level) that opens a menu of the
 * three levels, each with what it means and a check on the current one. Public reads quiet (secondary
 * ink); Members and Hidden read in ink with an outline, because they change what visitors see.
 * The menu opens upward when the space under the pill is short. Without `onChange` (no owner action
 * available) it is a static label.
 */
function VisibilityPicker({
  level,
  subject,
  onChange,
}: {
  level: ContactVisibilityLevel;
  /** What is being set, for screen readers ("Experience", "Stack"…). */
  subject: string;
  onChange?: (next: ContactVisibilityLevel) => void;
}) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const [dropUp, setDropUp] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return undefined;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const emphasized = level !== 'PUBLIC';
  const pill = `inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full px-2.5 text-[13px] leading-4 ${
    emphasized
      ? `font-semibold ${INK} shadow-[inset_0_0_0_1px_#CFD9DE] dark:shadow-[inset_0_0_0_1px_#536471]`
      : `font-medium ${INK2}`
  }`;

  if (!onChange) {
    return (
      <span className={pill} title={VISIBILITY_HINTS[level]}>
        <LevelGlyph level={level} className="h-3.5 w-3.5" />
        {VISIBILITY_SHORT[level]}
      </span>
    );
  }

  return (
    <div ref={rootRef} className="relative shrink-0">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={t('{subject}: visible to {toLowerCase}. Change visibility', { subject, toLowerCase: visibilityLabel(level).toLowerCase() })}
        onClick={(event) => {
          if (!open) {
            const rect = event.currentTarget.getBoundingClientRect();
            setDropUp(window.innerHeight - rect.bottom < 220 && rect.top > 220);
          }
          setOpen((current) => !current);
        }}
        className={`${pill} transition-colors hover:bg-[color:var(--gn-hover)] ${open ? 'bg-[color:var(--gn-hover)]' : ''} ${FOCUS_RING}`}
      >
        <LevelGlyph level={level} className="h-3.5 w-3.5" />
        {VISIBILITY_SHORT[level]}
        <svg className={`h-3 w-3 shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
      {open ? (
        <div
          role="menu"
          aria-label={t('Who can see {subject}', { subject })}
          className={`absolute right-0 z-30 w-64 rounded-2xl bg-[#fff] p-1.5 shadow-[0_0_0_1px_#E1E8ED,0_12px_28px_-16px_rgba(15,20,25,0.25)] dark:bg-[#000] dark:shadow-[0_0_0_1px_#2F3336] ${
            dropUp ? 'bottom-full mb-1.5' : 'top-full mt-1.5'
          }`}
        >
          <p className={`px-3 pb-1 pt-2 text-[11px] font-semibold uppercase leading-4 tracking-[0.12em] ${INK2}`}>{t('Who can see this')}</p>
          {CONTACT_VISIBILITY_OPTIONS.map((option) => {
            const selected = option.value === level;
            return (
              <button
                key={option.value}
                type="button"
                role="menuitemradio"
                aria-checked={selected}
                onClick={() => {
                  setOpen(false);
                  if (!selected) onChange(option.value);
                }}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-[color:var(--gn-hover)] ${FOCUS_RING}`}
              >
                <LevelGlyph level={option.value} className={`h-5 w-5 ${INK}`} />
                <span className="min-w-0 flex-1">
                  <span className={`block text-[15px] leading-5 ${INK} ${selected ? 'font-bold' : 'font-medium'}`}>{t(option.label)}</span>
                  <span className={`block text-[13px] leading-4 ${INK2}`}>{VISIBILITY_HINTS[option.value]}</span>
                </span>
                {selected ? (
                  <svg className={`h-[18px] w-[18px] shrink-0 ${INK}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="m5 12.5 4.5 4.5L19 7.5" />
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

/** A field with no visibility setting of its own (nationality, member since): always shown. */
function AlwaysPublic() {
  const t = useT();
  return (
    <span className={`inline-flex h-8 shrink-0 items-center gap-1.5 px-2.5 text-[13px] leading-4 ${INK2}`} title={t('Always shown on your profile')}>
      <LevelGlyph level="PUBLIC" className="h-3.5 w-3.5" />
      {t('Always public')}
    </span>
  );
}

/**
 * One section: the kicker line, then the block. `filled` decides between the content and the compact
 * empty line; the Edit control only shows on a filled section (an empty one has its "Add" pill).
 */
function SectionBlock({
  id,
  title,
  count,
  incomplete = 0,
  visibilityControl,
  filled,
  onEdit,
  empty,
  children,
}: {
  id?: string;
  title: string;
  count?: number;
  /** Fields still to fill (General Info): "· 2 to complete" after the title. */
  incomplete?: number;
  /** The section's own visibility picker (Stack, Tools, FAQ, Link), shown beside Edit. */
  visibilityControl?: ReactNode;
  filled: boolean;
  onEdit: () => void;
  empty: { hint: string; actionLabel: string };
  children?: ReactNode;
}) {
  const t = useT();
  const headingId = `${id ?? title}-heading`.replace(/\s+/g, '-').toLowerCase();
  return (
    <section
      id={id}
      aria-labelledby={headingId}
      data-profile-section={id}
      className="scroll-mt-20 md:scroll-mt-[calc(var(--dash-header-h,64px)+4.5rem)]"
    >
      <div className="mb-3 flex min-h-10 items-center justify-between gap-3 px-1">
        <div className="flex min-w-0 items-center gap-2.5">
          {/* The section's name is the block's heading — 17px bold, the size Facebook gives its About
              groups: one step over the 15px values, so heading → value → label read as three levels. */}
          <h2 id={headingId} className={`flex min-w-0 items-baseline gap-2 text-[17px] font-bold leading-[22px] tracking-[-0.01em] ${INK}`}>
            <span className="truncate">{title}</span>
            {filled && count != null && count > 0 ? (
              <span className={`shrink-0 text-[15px] font-normal tabular-nums ${INK2}`}>{count}</span>
            ) : null}
          </h2>
          {filled && incomplete > 0 ? (
            <span className={`shrink-0 rounded-full bg-[color:var(--gn-surface)] px-2.5 py-0.5 text-[12px] font-semibold leading-4 tabular-nums ${INK2}`}>
              {t('{incomplete} to complete', { incomplete })}
            </span>
          ) : null}
        </div>
        {filled ? (
          <div className="flex shrink-0 items-center gap-1">
          {visibilityControl}
          <button
            type="button"
            onClick={onEdit}
            aria-label={t('Edit {title}', { title })}
            className={`-mr-2 inline-flex h-10 shrink-0 items-center gap-2 rounded-full px-3 text-[14px] font-medium leading-5 ${ACCENT} ${ACCENT_HOVER} transition-colors ${FOCUS_RING}`}
          >
            <FontAwesomeIcon icon={faPen} className="h-3 w-3" />
            {t('Edit')}
          </button>
          </div>
        ) : null}
      </div>
      <div className={BLOCK_CLASS}>
        {filled ? (
          children
        ) : (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className={`max-w-md text-[15px] leading-[22px] ${INK2}`}>{t(empty.hint)}</p>
            <button type="button" onClick={onEdit} className={`${OUTLINE_PILL} self-start sm:self-auto`}>
              <FontAwesomeIcon icon={faPlus} className="h-3 w-3" />
              {empty.actionLabel}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

function formatYears(years: number): string {
  return years === 1 ? '1 year' : `${years} years`;
}

function formatMemberSince(value: string | null | undefined): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString(localeTag(), { month: 'long', year: 'numeric' });
}

function StrokeGlyph({ d }: { d: string }) {
  return (
    <svg className={`h-5 w-5 shrink-0 ${INK2}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d={d} />
    </svg>
  );
}

const EMAIL_PATH =
  'M3 8l7.89 5.26a2 2 0 0 0 2.22 0L21 8M5 19h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2z';
const PHONE_PATH =
  'M3 5a2 2 0 0 1 2-2h2.28a1 1 0 0 1 .95.68l1.12 3.36a1 1 0 0 1-.5 1.2l-1.27.64a11.04 11.04 0 0 0 5.18 5.18l.64-1.27a1 1 0 0 1 1.2-.5l3.36 1.12a1 1 0 0 1 .68.95V19a2 2 0 0 1-2 2h-1C9.16 21 3 14.84 3 7V5z';
const PIN_PATH =
  'M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21zm0-9a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z';
const GLOBE_PATH =
  'M21 12a9 9 0 0 1-9 9m9-9a9 9 0 0 0-9-9m9 9H3m9 9a9 9 0 0 1-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 0 1 9-9';

/** A row of the Links / Contact blocks: 48px, a 20px glyph, the fill tone only under the pointer. */
const LIST_ROW = `-mx-2 flex min-h-12 min-w-0 items-center gap-3 px-2 text-[15px] leading-5 ${INK}`;

type SectionBodyProps = {
  values: ProfileFormValues;
  visibility: ContactVisibilitySettings;
  memberSince: string | null;
  typicalResponseTime: string;
  showProviderFields: boolean;
  /** Saves one visibility setting (My Profile). Without it, levels show as static labels. */
  onVisibilityChange?: (key: VisibilityKey, level: ContactVisibilityLevel) => void;
};

/* ── General Info ─────────────────────────────────────────────────────────── */

/**
 * A field of General Info. `visibilityKey`: the setting that decides who sees it (none for nationality
 * and member since, which are always shown). `missing`: not filled yet — "Not set · Add", counted.
 */
type Fact = { key: string; label: string; value: ReactNode; visibilityKey?: VisibilityKey; missing?: boolean };

const missingFact = (key: string, label: string, visibilityKey?: VisibilityKey): Fact => ({
  key,
  label,
  value: null,
  visibilityKey,
  missing: true,
});

function useGeneralInfoFacts({ values, memberSince, typicalResponseTime, showProviderFields }: SectionBodyProps) {
  const t = useT();
  return useMemo(() => {
    const facts: Fact[] = [];
    if (values.yearsOfExperience != null) {
      facts.push({ key: 'years', label: t('Experience'), value: formatYears(values.yearsOfExperience), visibilityKey: 'yearsOfExperience' });
    } else facts.push(missingFact('years', 'Experience', 'yearsOfExperience'));


    if (showProviderFields) {
      const hourLines = values.availabilityHours?.trim()
        ? formatAvailabilityHoursLines(parseAvailabilityHours(values.availabilityHours))
        : [];
      if (hourLines.length > 0) {
        facts.push({
          key: 'hours',
          label: t('Working hours'),
          visibilityKey: 'availability',
          value: (
            /* Days and hours on one line ("Mon–Fri · 09:00–18:00"), wrapping only when the row is narrow. */
            <span className="flex flex-wrap items-center gap-x-2">
              {hourLines.map((line, index) => (
                <span key={line} className="inline-flex items-center gap-x-2 whitespace-nowrap">
                  {index > 0 ? <span aria-hidden className={`font-normal ${INK2}`}>·</span> : null}
                  {line}
                </span>
              ))}
            </span>
          ),
        });
      } else facts.push(missingFact('hours', 'Working hours', 'availability'));
      const responseLabel = TYPICAL_RESPONSE_TIME_OPTIONS.find((option) => option.value === typicalResponseTime)?.label;
      if (responseLabel) facts.push({ key: 'response', label: t('Response time'), value: t(responseLabel), visibilityKey: 'responseTime' });
      else facts.push(missingFact('response', 'Response time', 'responseTime'));
    }

    if (values.gender?.trim()) {
      facts.push({ key: 'gender', label: t('Gender'), value: t(values.gender), visibilityKey: 'gender' });
    } else facts.push(missingFact('gender', 'Gender', 'gender'));

    /* The place itself is set from the profile header (detected or typed); only who sees it is set here. */
    const place = [values.locationCity?.trim(), values.locationCountry?.trim()].filter(Boolean).join(', ');
    if (place) facts.push({ key: 'location', label: t('Location'), value: place, visibilityKey: 'location' });

    const iso2 = normalizeNationalityCode(values.nationality);
    if (iso2) {
      /* A real flag image: the emoji flags render as two letters ("MG") on Windows. */
      facts.push({
        key: 'nationality',
        label: t('Nationality'),
        value: (
          <span className="inline-flex items-center gap-2">
            <CountryFlag iso2={iso2} size="sm" />
            {nationalityLabel(iso2) || iso2}
          </span>
        ),
      });
    } else facts.push(missingFact('nationality', 'Nationality'));

    const since = formatMemberSince(memberSince);
    if (since) facts.push({ key: 'memberSince', label: t('Member since'), value: since });
    return facts;
  }, [memberSince, showProviderFields, typicalResponseTime, values, t]);
}

/** A field not filled yet: a muted "Not set", then "Add", which opens the section's drawer. */
function NotSet({ onAdd }: { onAdd: () => void }) {
  const t = useT();
  return (
    <span className={`inline-flex items-center gap-1.5 font-normal ${INK2}`}>
      {t('Not set')}
      <span aria-hidden>·</span>
      <button type="button" onClick={onAdd} className={`font-semibold ${INK} underline-offset-4 hover:underline ${FOCUS_RING}`}>
        {t('Add')}
      </button>
    </span>
  );
}

/** The rows of the profile sheet: inside the block, a faint divider in the inset tone between rows. */
const SHEET_ROWS = 'divide-y divide-[#EFF3F4] dark:divide-[#202327]';

/**
 * One row of a profile sheet (General Info, Contact): the label, the value, and on the right who can
 * see it. From sm the label has its own 10rem column; on phones it sits over the value.
 */
function SheetRow({ label, value, control }: { label: string; value: ReactNode; control: ReactNode }) {
  return (
    /* Label 14px regular secondary, value 15px regular ink, who-sees-it 13px: three clear levels. Every
       cell sits on the same 32px first line, so a value that wraps (languages) keeps its label and its
       picker level with its first line instead of centring them on the whole block. */
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-x-4 gap-y-1 py-3.5 first:pt-0 last:pb-0 sm:grid-cols-[10rem_minmax(0,1fr)_auto]">
      <dt className={`col-start-1 text-[13px] leading-5 ${INK2} sm:flex sm:min-h-8 sm:items-center sm:text-[14px]`}>{label}</dt>
      <dd className={`col-start-1 min-w-0 text-[15px] font-normal leading-5 ${INK} sm:col-start-2 sm:row-start-1 sm:flex sm:min-h-8 sm:items-center`}>{value}</dd>
      <div className="col-start-2 row-span-2 row-start-1 flex min-h-8 items-center justify-self-end sm:col-start-3 sm:row-span-1">{control}</div>
    </div>
  );
}

function GeneralInfoBody({
  facts,
  visibility,
  onVisibilityChange,
  onEdit,
}: {
  facts: Fact[];
  visibility: ContactVisibilitySettings;
  onVisibilityChange?: (key: VisibilityKey, level: ContactVisibilityLevel) => void;
  onEdit: () => void;
}) {
  const t = useT();
  return (
    <dl className={SHEET_ROWS}>
      {facts.map((fact) => {
        const key = fact.visibilityKey;
        return (
          <SheetRow
            key={fact.key}
            label={t(fact.label)}
            value={fact.missing ? <NotSet onAdd={onEdit} /> : fact.value}
            control={
              key ? (
                <VisibilityPicker
                  level={visibility[key]}
                  subject={fact.label}
                  onChange={onVisibilityChange ? (level) => onVisibilityChange(key, level) : undefined}
                />
              ) : (
                <AlwaysPublic />
              )
            }
          />
        );
      })}
    </dl>
  );
}

/* ── Languages ───────────────────────────────────────────────────────────── */

/** The languages as chips: the name, then the level in secondary ink. */
function LanguagesBody({ languages }: { languages: { name: string; level: string | null }[] }) {
  const t = useT();
  return (
    <ul className="flex flex-wrap gap-2" aria-label={t('Languages')}>
      {languages.map((language) => (
        <li key={language.name} className={`${CHIP_CLASS} px-3.5 ${INK}`}>
          <span className="font-medium">{language.name}</span>
          {language.level ? <span className={`font-normal ${INK2}`}>{language.level}</span> : null}
        </li>
      ))}
    </ul>
  );
}

/* ── My Role ─────────────────────────────────────────────────────────────── */

function RoleBody({ role }: { role: ProfileFormValues['appRole'] }) {
  const t = useT();
  const option = CREATOR_APP_ROLE_OPTIONS.find((item) => item.value === normalizeCreatorAppRole(role)) ?? CREATOR_APP_ROLE_OPTIONS[0];
  const [summary, ...details] = Array.isArray(option.description) ? option.description : [option.description];
  return (
    <div className="max-w-2xl">
      <p className={`text-[17px] font-semibold leading-[22px] ${INK}`}>{t(option.label)}</p>
      <p className={`mt-1.5 text-[15px] leading-[22px] ${INK2}`}>{summary}</p>
      {details.length > 0 ? (
        <ul className="mt-4 space-y-2">
          {details.map((line) => (
            <li key={line} className={`flex gap-3 text-[15px] leading-[22px] ${INK}`}>
              <svg className="mt-[3px] h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="m5 12.5 4.5 4.5L19 7.5" />
              </svg>
              {line}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

/* ── Stack / Tools ───────────────────────────────────────────────────────── */

type SkillItem = { name: string; iconUrl: string | null; category: string | null };

function skillItems(values: ProfileFormValues, mode: 'stack' | 'tools'): SkillItem[] {
  return (mode === 'stack' ? values.stackItems : values.strengthsTools)
    .filter((item) => item.value.trim())
    .map((item) => ({ name: item.value.trim(), iconUrl: item.iconUrl ?? null, category: item.category || null }));
}

function SkillChip({ item }: { item: SkillItem }) {
  return (
    <span className={`${CHIP_CLASS} pl-2 pr-3.5 ${INK}`} title={item.name}>
      <CreatorToolLogo label={item.name} iconUrl={item.iconUrl} size={20} />
      <span className="min-w-0 truncate">{item.name}</span>
    </span>
  );
}

/** The stack as one cloud of chips; tools grouped by specialty, each group under a small label. */
function SkillsBody({ items, grouped, specialties }: { items: SkillItem[]; grouped: boolean; specialties: string[] }) {
  const groups = useMemo(
    () => (grouped ? groupBySpecialty(items, (item) => item.category, specialties) : [{ group: '', items }]),
    [grouped, items, specialties]
  );
  const showGroupLabels = groups.length > 1 || Boolean(groups[0]?.group && groups[0].group !== 'Other');
  return (
    <div className="space-y-5">
      {groups.map(({ group, items: groupItems }) => (
        <div key={group || 'all'}>
          {showGroupLabels && group ? <p className={`mb-2.5 text-[13px] leading-4 ${INK2}`}>{group}</p> : null}
          <div className="flex flex-wrap gap-2">
            {groupItems.map((item) => (
              <SkillChip key={`${group}-${item.name}`} item={item} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Links ───────────────────────────────────────────────────────────────── */

function LinksBody({ links }: { links: ProfileFormValues['profileLinks'] }) {
  const t = useT();
  return (
    <ul className="-my-1.5">
      {links.map((link, index) => {
        const platform = resolveLinkPlatform({ ...link, platform: link.platform ?? null });
        const label = linkDisplayLabel({ ...link, platform: link.platform ?? null }, platform);
        const isBrand = !['OTHER', 'WEBSITE', 'CTA'].includes(platform.toUpperCase());
        return (
          <li key={link.id}>
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              title={link.url}
              className={`${LIST_ROW} transition-colors hover:bg-[color:var(--gn-hover)] ${FOCUS_RING}`}
            >
              {isBrand ? <SocialPlatformIcon platform={platform} className="h-5 w-5 shrink-0" /> : <StrokeGlyph d={GLOBE_PATH} />}
              <span className="min-w-0 shrink-0 truncate font-normal max-sm:flex-1">{label}</span>
              <span className={`min-w-0 flex-1 truncate text-[14px] ${INK2} max-sm:hidden`}>{link.url.replace(/^https?:\/\//i, '')}</span>
              {index === 0 && links.length > 1 ? (
                <span className={`shrink-0 rounded-full bg-[color:var(--gn-inset)] px-2.5 py-0.5 text-[12px] font-semibold ${INK2}`}>{t('Main button')}</span>
              ) : null}
            </a>
          </li>
        );
      })}
    </ul>
  );
}

/* ── Contact ─────────────────────────────────────────────────────────────── */

/** Contact, by type: visibility is set per type (every email shares one setting), so each type is a row. */
type ContactGroup = {
  key: 'email' | 'phone' | 'address';
  label: string;
  d: string;
  entries: { id: string; value: string; href: string | null }[];
};

function contactGroups(values: ProfileFormValues): ContactGroup[] {
  const groups: ContactGroup[] = [
    {
      key: 'email',
      label: 'Email',
      d: EMAIL_PATH,
      entries: values.contactEmails
        .filter((entry) => entry.value.trim())
        .map((entry) => ({ id: entry.id, value: entry.value.trim(), href: `mailto:${entry.value.trim()}` })),
    },
    {
      key: 'phone',
      label: 'Phone',
      d: PHONE_PATH,
      entries: values.contactPhones
        .filter((entry) => formatPhoneDisplay(entry.value) || entry.value.trim())
        .map((entry) => ({
          id: entry.id,
          value: formatPhoneDisplay(entry.value) || entry.value.trim(),
          href: `tel:${entry.value.replace(/\s+/g, '')}`,
        })),
    },
    {
      key: 'address',
      label: 'Address',
      d: PIN_PATH,
      entries: values.contactAddresses
        .filter((entry) => entry.value.trim())
        .map((entry) => ({ id: entry.id, value: entry.value.trim(), href: null })),
    },
  ];
  return groups.filter((group) => group.entries.length > 0);
}

function ContactBody({
  groups,
  visibility,
  onVisibilityChange,
}: {
  groups: ContactGroup[];
  visibility: ContactVisibilitySettings;
  onVisibilityChange?: (key: VisibilityKey, level: ContactVisibilityLevel) => void;
}) {
  const t = useT();
  return (
    <dl className={SHEET_ROWS}>
      {groups.map((group) => (
        <SheetRow
          key={group.key}
          label={t(group.label)}
          value={
            <span className="flex flex-col gap-1">
              {group.entries.map((entry) => (
                <span key={entry.id} className="flex min-w-0 items-center gap-2.5">
                  <StrokeGlyph d={group.d} />
                  {entry.href ? (
                    <a href={entry.href} className={`min-w-0 truncate underline-offset-4 hover:underline ${FOCUS_RING}`}>
                      {entry.value}
                    </a>
                  ) : (
                    <span className="min-w-0 truncate">{entry.value}</span>
                  )}
                </span>
              ))}
            </span>
          }
          control={
            <VisibilityPicker
              level={visibility[group.key]}
              subject={t(group.label)}
              onChange={onVisibilityChange ? (level) => onVisibilityChange(group.key, level) : undefined}
            />
          }
        />
      ))}
    </dl>
  );
}

/* ── FAQ ─────────────────────────────────────────────────────────────────── */

/**
 * The FAQ as a plain list on the block: one question per row, the same faint divider as the General
 * Info sheet, no box around each question. A tap opens the answer under it; the chevron turns.
 */
function FaqBody({ items }: { items: ProfileFormValues['faqItems'] }) {
  return (
    <div className={SHEET_ROWS}>
      {items.map((item) => (
        <details key={item.id} className="group py-1 first:pt-0 last:pb-0">
          <summary
            className={`-mx-2 flex min-h-12 cursor-pointer list-none items-center justify-between gap-4 rounded-lg px-2 text-left transition-colors hover:bg-[color:var(--gn-hover)] [&::-webkit-details-marker]:hidden ${FOCUS_RING}`}
          >
            <span className={`text-[15px] font-semibold leading-5 ${INK}`}>{item.question}</span>
            <svg
              className={`h-4 w-4 shrink-0 ${INK2} transition-transform duration-200 group-open:rotate-180`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.2}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </summary>
          <p className={`whitespace-pre-line pb-3 pr-8 text-[15px] leading-[22px] ${INK2}`}>{item.answer}</p>
        </details>
      ))}
    </div>
  );
}

/* ── Sections ────────────────────────────────────────────────────────────── */

type SectionProps = SectionBodyProps & {
  section: ProfileDrawerSectionId;
  title: string;
  /** DOM id, for the chips' scroll targets. */
  anchorId?: string;
  onEdit: () => void;
};

function ProfileSection({ section, title, anchorId, onEdit, ...body }: SectionProps) {
  const t = useT();
  const facts = useGeneralInfoFacts(body);
  const { values, visibility, onVisibilityChange } = body;
  const common = { id: anchorId, title, onEdit };
  /* A whole section's picker (Stack, Tools, FAQ, Link). */
  const sectionPicker = (key: VisibilityKey) => (
    <VisibilityPicker
      level={visibility[key]}
      subject={title}
      onChange={onVisibilityChange ? (level) => onVisibilityChange(key, level) : undefined}
    />
  );

  switch (section) {
    case 'about': {
      /* Languages get a block of their own under General Info: a list of chips reads better on its
         own than squeezed into one row of the sheet. Both are edited in the General Info drawer. */
      const languages = values.spokenLanguages
        .filter((item) => item.value.trim())
        .map((item) => ({ name: item.value.trim(), level: resolveSpokenLanguageLevelLabel(item.level ?? null) }));
      return (
        <>
          <SectionBlock
            {...common}
            filled={facts.some((fact) => !fact.missing && fact.key !== 'memberSince')}
            incomplete={facts.filter((fact) => fact.missing).length}
            empty={{ hint: t('Years of experience, gender and nationality help clients get to know you.'), actionLabel: t('Add details') }}
          >
            <GeneralInfoBody
              facts={facts}
              visibility={visibility}
              onVisibilityChange={onVisibilityChange}
              onEdit={onEdit}
            />
          </SectionBlock>
          <SectionBlock
            title={t('Languages')}
            count={languages.length}
            visibilityControl={sectionPicker('spokenLanguages')}
            filled={languages.length > 0}
            onEdit={onEdit}
            empty={{ hint: t('The languages you work in, with your level — clients look for it.'), actionLabel: t('Add languages') }}
          >
            <LanguagesBody languages={languages} />
          </SectionBlock>
        </>
      );
    }
    case 'myRole':
      return (
        <SectionBlock {...common} filled visibilityControl={<AlwaysPublic />} empty={{ hint: '', actionLabel: '' }}>
          <RoleBody role={values.appRole} />
        </SectionBlock>
      );
    case 'strengths':
    case 'tools': {
      const mode = section === 'strengths' ? 'stack' : 'tools';
      const items = skillItems(values, mode);
      return (
        <SectionBlock
          {...common}
          count={items.length}
          visibilityControl={sectionPicker(mode === 'stack' ? 'profileStack' : 'strengthsTools')}
          filled={items.length > 0}
          empty={
            mode === 'stack'
              ? { hint: t('The technologies you work with — it helps clients find you.'), actionLabel: t('Add your stack') }
              : { hint: t('Clients often look for someone who already knows their software.'), actionLabel: t('Add tools') }
          }
        >
          <SkillsBody items={items} grouped={mode === 'tools'} specialties={values.specialties ?? []} />
        </SectionBlock>
      );
    }
    case 'links': {
      const links = values.profileLinks.filter((link) => link.url.trim());
      return (
        <SectionBlock
          {...common}
          count={links.length}
          visibilityControl={sectionPicker('links')}
          filled={links.length > 0}
          empty={{ hint: t('Your website and socials, one tap away from your profile.'), actionLabel: t('Add links') }}
        >
          <LinksBody links={links} />
        </SectionBlock>
      );
    }
    case 'contact': {
      const groups = contactGroups(values);
      return (
        <SectionBlock
          {...common}
          filled={groups.length > 0}
          empty={{ hint: t('An email, a phone or an address — and you choose who can see each one.'), actionLabel: t('Add contact details') }}
        >
          <ContactBody groups={groups} visibility={visibility} onVisibilityChange={onVisibilityChange} />
        </SectionBlock>
      );
    }
    case 'faq': {
      const items = values.faqItems.filter((item) => item.question.trim() && item.answer.trim());
      return (
        <SectionBlock
          {...common}
          count={items.length}
          visibilityControl={sectionPicker('faq')}
          filled={items.length > 0}
          empty={{ hint: t('A short FAQ answers the questions clients ask before an order.'), actionLabel: t('Add a question') }}
        >
          <FaqBody items={items} />
        </SectionBlock>
      );
    }
  }
}

type ProfileSectionReadViewProps = SectionBodyProps & {
  section: ProfileDrawerSectionId;
  /** Section name as the tab row shows it ("Stack", "Link"…). */
  title: string;
  onEdit: () => void;
};

/** One section on its own (fallback when the page mixes drawer sections with inline ones). */
export function ProfileSectionReadView(props: ProfileSectionReadViewProps) {
  return <ProfileSection {...props} />;
}

const anchorIdOf = (section: ProfileDrawerSectionId) => `profile-section-${section}`;

/**
 * Every section on one page, in order, under the pinned section chips. The chip of the section being
 * read is solid ink (an observer follows the reading position); a tap scrolls to its section.
 * Pinned at the top of the screen on phones (the navbar slides away there while reading down), under
 * the navbar from md.
 */
export function ProfileSectionsOverview({
  sections,
  onEdit,
  ...body
}: SectionBodyProps & {
  sections: { id: ProfileDrawerSectionId; label: string }[];
  onEdit: (section: ProfileDrawerSectionId) => void;
}) {
  const t = useT();
  const [active, setActive] = useState<ProfileDrawerSectionId | null>(sections[0]?.id ?? null);
  const chipsRef = useRef<HTMLDivElement>(null);
  /* While a tap's smooth scroll runs, the observer would light up every chip it passes: hold it. */
  const lockUntil = useRef(0);

  /*
   * Reading position: the last section whose top has passed 30% of the viewport (the first one at the
   * top of the page, the last one once the page is scrolled to its end). Measured on scroll, one
   * frame at a time; held while a tap's smooth scroll runs.
   */
  useEffect(() => {
    let frame = 0;
    const evaluate = () => {
      frame = 0;
      if (sections.length === 0 || performance.now() < lockUntil.current) return;
      const line = window.innerHeight * 0.3;
      let current = sections[0].id;
      for (const section of sections) {
        const node = document.getElementById(anchorIdOf(section.id));
        if (node && node.getBoundingClientRect().top <= line) current = section.id;
      }
      const atEnd = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
      if (atEnd && window.scrollY > 0) current = sections[sections.length - 1].id;
      setActive(current);
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(evaluate);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [sections]);

  /* Keep the active item in view inside the swipeable row — the row only, never the page. */
  useEffect(() => {
    const row = chipsRef.current;
    const item = active ? row?.querySelector<HTMLElement>(`[data-chip="${active}"]`) : null;
    if (!row || !item) return;
    const left = item.offsetLeft - row.offsetLeft;
    if (left < row.scrollLeft || left + item.offsetWidth > row.scrollLeft + row.clientWidth) {
      row.scrollTo({ left: Math.max(0, left - 16), behavior: 'smooth' });
    }
  }, [active]);

  /* `at`: the click's timeStamp, on the same clock as performance.now(). */
  const goTo = (id: ProfileDrawerSectionId, at: number) => {
    setActive(id);
    lockUntil.current = at + 900;
    document.getElementById(anchorIdOf(id))?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="flex flex-col gap-8 sm:gap-10">
      {/* The section menu, kept plain: text tabs on the page ground, one hairline under the row and,
          on it, a 2px ink bar under the section being read (bold ink; the others secondary ink).
          `bg-[#fff]`, not `bg-[#FFFFFF]`: the News scope repaints the latter in the card grey. */}
      <nav
        aria-label={t('Profile sections')}
        className="sticky top-0 z-20 -mx-4 border-b border-[#EFF3F4] bg-[#fff] px-4 dark:border-[#2F3336] dark:bg-[#000] sm:mx-0 sm:px-0 md:top-[var(--dash-header-h,64px)]"
      >
        <div ref={chipsRef} className="relative flex gap-7 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {sections.map((section) => {
            const isActive = active === section.id;
            return (
              <button
                key={section.id}
                type="button"
                data-chip={section.id}
                aria-current={isActive ? 'true' : undefined}
                onClick={(event) => goTo(section.id, event.timeStamp)}
                data-pf-no-color-transition
                className={`relative inline-flex h-12 shrink-0 items-center whitespace-nowrap text-[15px] leading-5 transition-colors ${FOCUS_RING} ${
                  isActive
                    ? 'font-semibold text-[color:var(--gn-ink)]'
                    : 'font-semibold text-[#536471] hover:text-[color:var(--gn-ink)] dark:text-[#8B98A5]'
                }`}
              >
                {t(section.label)}
                {isActive ? (
                  <span aria-hidden className="absolute inset-x-0 bottom-0 h-[2px] rounded-full bg-[color:var(--gn-ink)]" />
                ) : null}
              </button>
            );
          })}
        </div>
      </nav>

      {sections.map((section) => (
        <ProfileSection
          key={section.id}
          section={section.id}
          title={t(section.label)}
          anchorId={anchorIdOf(section.id)}
          onEdit={() => onEdit(section.id)}
          {...body}
        />
      ))}
    </div>
  );
}

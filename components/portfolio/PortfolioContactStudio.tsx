'use client';

import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { z } from 'zod';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faLocationDot, faLock, faPhone } from '@fortawesome/free-solid-svg-icons';
import { CountryFlag } from '@/components/ui/CountryFlag';
import { COUNTRY_DIAL_CODES, type CountryDialCode } from '@/lib/countryDialCodes';
import type { ContactVisibilityLevel } from '@/lib/contact-visibility';
import { formatPhoneNumber, parsePhoneNumber, toStoredPhoneNumber } from '@/lib/phone';
import type { PortfolioContactKind, PortfolioContactLists } from '@/components/portfolio/PortfolioContactChrome';
import { PortfolioSectionVisibilityMenu } from '@/components/portfolio/portfolio-section-shared';
import {
  STUDIO_BARE_INPUT_CLASS,
  STUDIO_EMPTY_CLASS,
  STUDIO_FLOAT_IN_STYLE,
  STUDIO_GLASS_PANEL_CLASS,
  STUDIO_ROW_RULE,
  STUDIO_SECONDARY_CLASS,
  STUDIO_VALUE_CLASS,
  StudioIconAction,
  StudioRemoveButton,
  StudioSaveChrome,
  StudioSectionHeader,
  StudioUnderline,
  useInlineStudio,
  type StudioChangeHandler,
} from '@/components/portfolio/PortfolioStudioKit';

type ContactEntry = { id: string; value: string };
type ContactRow = ContactEntry & { key: string; locked?: boolean };
type ContactDraft = { emails: ContactRow[]; phones: ContactRow[]; addresses: ContactRow[] };
type ContactListKey = keyof ContactDraft;
type RowChangeHandler = (key: string, value: string) => void;

const MAX_CONTACT_ENTRIES = 8;
const MAX_CONTACT_LENGTH = 300;
const emailSchema = z.string().email();

const GROUPS: Array<{ kind: PortfolioContactKind; listKey: ContactListKey }> = [
  { kind: 'email', listKey: 'emails' },
  { kind: 'phone', listKey: 'phones' },
  { kind: 'address', listKey: 'addresses' },
];

const KIND_COPY = {
  email: {
    title: 'Email',
    noun: 'email',
    icon: faEnvelope,
    placeholder: 'contact@yourbrand.com',
    empty: 'No email yet — add where clients can write to you.',
  },
  phone: {
    title: 'Phone',
    noun: 'phone',
    icon: faPhone,
    placeholder: '6 12 34 56 78',
    empty: 'No phone yet — add a number clients can call.',
  },
  address: {
    title: 'Address',
    noun: 'address',
    icon: faLocationDot,
    placeholder: 'e.g. 12 rue de Rivoli, Paris, France',
    empty: 'No address yet — add where you are based.',
  },
} as const;

let rowSeq = 0;
const nextRowKey = () => `contact-${++rowSeq}`;

function cleanValue(kind: PortfolioContactKind, value: string): string {
  return kind === 'phone' ? toStoredPhoneNumber(value) : value.trim();
}

function entryError(kind: PortfolioContactKind, value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (trimmed.length > MAX_CONTACT_LENGTH) return `Keep it under ${MAX_CONTACT_LENGTH} characters.`;
  if (kind === 'email') return emailSchema.safeParse(trimmed).success ? null : 'Enter a valid email address.';
  if (kind === 'phone') {
    const { nationalNumber } = parsePhoneNumber(trimmed);
    if (!nationalNumber) return null;
    if (nationalNumber.length < 4 || nationalNumber.length > 15) return 'Enter a valid phone number.';
  }
  return null;
}

function cleanRows(kind: PortfolioContactKind, rows: ContactRow[]): ContactEntry[] {
  return rows
    .map((row) => ({ id: row.id, value: cleanValue(kind, row.value) }))
    .filter((entry) => entry.value);
}

const KIND_BY_LIST: Record<ContactListKey, PortfolioContactKind> = {
  emails: 'email',
  phones: 'phone',
  addresses: 'address',
};

function contactSignature(key: ContactListKey, value: ContactDraft[ContactListKey]): string {
  return JSON.stringify(cleanRows(KIND_BY_LIST[key], value).map((entry) => entry.value));
}

function toRows(entries: ContactEntry[], lockFirst = false): ContactRow[] {
  return entries
    .filter((entry) => entry.value.trim())
    .slice(0, MAX_CONTACT_ENTRIES)
    .map((entry, index) => ({
      id: entry.id,
      value: entry.value,
      key: entry.id || nextRowKey(),
      locked: lockFirst && index === 0 ? true : undefined,
    }));
}

function PhoneField({
  value,
  label,
  invalid,
  autoFocus,
  onChange,
  onBlur,
}: {
  value: string;
  label: string;
  invalid: boolean;
  autoFocus: boolean;
  onChange: (value: string) => void;
  onBlur: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const rootRef = useRef<HTMLDivElement>(null);
  const parsed = useMemo(() => parsePhoneNumber(value), [value]);

  useEffect(() => {
    if (!open) return;
    const close = () => {
      setOpen(false);
      setQuery('');
    };
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) close();
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const countries = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return COUNTRY_DIAL_CODES;
    return COUNTRY_DIAL_CODES.filter(
      (country) =>
        country.name.toLowerCase().includes(q) || country.dial.includes(q) || country.iso2.toLowerCase().includes(q)
    );
  }, [query]);

  const selectCountry = (country: CountryDialCode) => {
    onChange(formatPhoneNumber(country, parsed.nationalNumber));
    setOpen(false);
    setQuery('');
  };

  return (
    <div ref={rootRef} className="relative flex items-end gap-3">
      <button
        type="button"
        aria-label={`Country code, ${parsed.country.name}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className="inline-flex shrink-0 items-center gap-1.5 pb-1.5 text-[14px] tabular-nums text-neutral-600 transition-colors duration-200 hover:text-black dark:text-neutral-300 dark:hover:text-white"
      >
        <CountryFlag iso2={parsed.country.iso2} size="sm" />
        {parsed.country.dial}
        <svg
          aria-hidden
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.75}
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`h-3 w-3 text-neutral-400 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
        >
          <path d="m4 6 4 4 4-4" />
        </svg>
      </button>
      <StudioUnderline quiet className="flex-1">
        <input
          type="tel"
          inputMode="tel"
          value={parsed.nationalNumber}
          placeholder={KIND_COPY.phone.placeholder}
          aria-label={label}
          aria-invalid={invalid ? true : undefined}
          autoFocus={autoFocus}
          autoComplete="off"
          onChange={(event) => onChange(formatPhoneNumber(parsed.country, event.currentTarget.value))}
          onBlur={onBlur}
          className={`${STUDIO_BARE_INPUT_CLASS} ${STUDIO_VALUE_CLASS} tabular-nums ${
            invalid ? '!text-red-600 dark:!text-red-400' : ''
          }`}
        />
      </StudioUnderline>
      {open ? (
        <div
          style={STUDIO_FLOAT_IN_STYLE}
          className={`${STUDIO_GLASS_PANEL_CLASS} absolute left-0 top-full z-50 mt-2 w-72 p-1.5`}
        >
          <input
            type="search"
            value={query}
            autoFocus
            placeholder="Search country or code"
            aria-label="Search country or code"
            onChange={(event) => setQuery(event.currentTarget.value)}
            className="mb-1 w-full rounded-lg bg-black/[0.03] px-3 py-2 text-[14px] text-black outline-none placeholder:text-neutral-400 dark:bg-white/[0.05] dark:text-neutral-100 dark:placeholder:text-neutral-500"
          />
          <ul role="listbox" aria-label="Country code" className="max-h-60 overflow-y-auto">
            {countries.map((country) => {
              const selected = country.iso2 === parsed.country.iso2;
              return (
                <li key={country.iso2} role="option" aria-selected={selected}>
                  <button
                    type="button"
                    onClick={() => selectCountry(country)}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-[14px] transition-colors duration-200 hover:bg-black/[0.04] dark:hover:bg-white/[0.06] ${
                      selected ? 'font-semibold text-black dark:text-white' : 'text-neutral-600 dark:text-neutral-300'
                    }`}
                  >
                    <CountryFlag iso2={country.iso2} size="sm" />
                    <span className="min-w-0 flex-1 truncate">{country.name}</span>
                    <span className="shrink-0 tabular-nums text-neutral-400">{country.dial}</span>
                  </button>
                </li>
              );
            })}
            {countries.length === 0 ? (
              <li className={`px-3 py-4 text-center text-[14px] ${STUDIO_EMPTY_CLASS}`}>No country found</li>
            ) : null}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

const ContactRowView = memo(function ContactRowView({
  kind,
  row,
  index,
  autoFocus,
  onChange,
  onRemove,
}: {
  kind: PortfolioContactKind;
  row: ContactRow;
  index: number;
  autoFocus: boolean;
  onChange: RowChangeHandler;
  onRemove: (key: string) => void;
}) {
  const copy = KIND_COPY[kind];
  const [touched, setTouched] = useState(!autoFocus);
  const invalid = entryError(kind, row.value);
  const error = touched ? invalid : null;
  const label = `${copy.title} ${index + 1}`;
  const inputClass = `${STUDIO_BARE_INPUT_CLASS} ${STUDIO_VALUE_CLASS} ${
    error ? '!text-red-600 dark:!text-red-400' : ''
  }`;

  return (
    <li
      className={`group/row grid grid-cols-[2.25rem_minmax(0,1fr)_auto] items-start gap-x-4 py-5 first:pt-1 ${STUDIO_ROW_RULE}`}
    >
      <span
        aria-hidden
        className="mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-full bg-black/[0.04] text-neutral-500 dark:bg-white/[0.06] dark:text-neutral-400"
      >
        <FontAwesomeIcon icon={copy.icon} className="h-3.5 w-3.5" fixedWidth />
      </span>

      <div className="min-w-0 pt-1.5">
        {row.locked ? (
          <>
            <p className={`truncate pb-1.5 ${STUDIO_VALUE_CLASS}`}>{row.value.trim()}</p>
            <p className={`mt-0.5 inline-flex items-center gap-1.5 text-[13px] ${STUDIO_SECONDARY_CLASS}`}>
              <FontAwesomeIcon icon={faLock} className="h-2.5 w-2.5" />
              Primary · account email
            </p>
          </>
        ) : kind === 'phone' ? (
          <PhoneField
            value={row.value}
            label={label}
            invalid={Boolean(error)}
            autoFocus={autoFocus}
            onChange={(value) => onChange(row.key, value)}
            onBlur={() => setTouched(true)}
          />
        ) : kind === 'address' ? (
          <StudioUnderline quiet>
            <textarea
              rows={1}
              value={row.value}
              maxLength={MAX_CONTACT_LENGTH}
              placeholder={copy.placeholder}
              aria-label={label}
              aria-invalid={error ? true : undefined}
              autoFocus={autoFocus}
              onChange={(event) => onChange(row.key, event.currentTarget.value)}
              onBlur={() => setTouched(true)}
              className={`${inputClass} resize-none [field-sizing:content]`}
            />
          </StudioUnderline>
        ) : (
          <StudioUnderline quiet>
            <input
              type="email"
              inputMode="email"
              value={row.value}
              maxLength={MAX_CONTACT_LENGTH}
              placeholder={copy.placeholder}
              aria-label={label}
              aria-invalid={error ? true : undefined}
              autoFocus={autoFocus}
              autoComplete="off"
              onChange={(event) => onChange(row.key, event.currentTarget.value)}
              onBlur={() => setTouched(true)}
              className={`${inputClass} truncate`}
            />
          </StudioUnderline>
        )}
        {error ? <p className="mt-1 text-[13px] text-red-600 dark:text-red-400">{error}</p> : null}
      </div>

      <div className="flex h-9 items-center">
        {row.locked ? null : (
          <StudioRemoveButton label={`Remove ${copy.noun} ${index + 1}`} onClick={() => onRemove(row.key)} />
        )}
      </div>
    </li>
  );
});

function ContactGroup({
  kind,
  rows,
  freshKey,
  visibility,
  onVisibilityChange,
  onAdd,
  onChange,
  onRemove,
}: {
  kind: PortfolioContactKind;
  rows: ContactRow[];
  freshKey: string | null;
  visibility: ContactVisibilityLevel;
  onVisibilityChange: (level: ContactVisibilityLevel) => void;
  onAdd: () => void;
  onChange: RowChangeHandler;
  onRemove: (key: string) => void;
}) {
  const copy = KIND_COPY[kind];
  const full = rows.length >= MAX_CONTACT_ENTRIES;

  return (
    <section aria-label={copy.title}>
      <StudioSectionHeader label={`${copy.title} · ${String(rows.length).padStart(2, '0')}`}>
        <span className={STUDIO_SECONDARY_CLASS}>
          {rows.length} of {MAX_CONTACT_ENTRIES}
        </span>
        <PortfolioSectionVisibilityMenu value={visibility} onChange={onVisibilityChange} />
        <StudioIconAction icon="add" label={`Add ${copy.noun}`} onClick={onAdd} disabled={full} />
      </StudioSectionHeader>

      {rows.length === 0 ? (
        <button
          type="button"
          onClick={onAdd}
          className={`py-4 text-left ${STUDIO_EMPTY_CLASS} transition-colors hover:text-[#FF5722]`}
        >
          {copy.empty}
        </button>
      ) : (
        <ul style={STUDIO_FLOAT_IN_STYLE}>
          {rows.map((row, index) => (
            <ContactRowView
              key={row.key}
              kind={kind}
              row={row}
              index={index}
              autoFocus={row.key === freshKey}
              onChange={onChange}
              onRemove={onRemove}
            />
          ))}
        </ul>
      )}
    </section>
  );
}

function ContactBody({
  getDraft,
  change,
  visibility,
  onVisibilityChange,
}: {
  getDraft: () => ContactDraft;
  change: StudioChangeHandler<ContactDraft>;
  visibility: Record<PortfolioContactKind, ContactVisibilityLevel>;
  onVisibilityChange: (key: PortfolioContactKind, level: ContactVisibilityLevel) => void;
}) {
  const [lists, setLists] = useState(getDraft);
  const [freshKey, setFreshKey] = useState<string | null>(null);

  const commit = useCallback(
    (listKey: ContactListKey, next: ContactRow[]) => {
      setLists((current) => ({ ...current, [listKey]: next }));
      change(listKey, next);
    },
    [change]
  );

  const handlers = useMemo(() => {
    const build = (listKey: ContactListKey) => ({
      change: (key: string, value: string) =>
        commit(
          listKey,
          getDraft()[listKey].map((row) => (row.key === key && !row.locked ? { ...row, value } : row))
        ),
      remove: (key: string) =>
        commit(
          listKey,
          getDraft()[listKey].filter((row) => row.key !== key || row.locked)
        ),
      add: () => {
        const current = getDraft()[listKey];
        if (current.length >= MAX_CONTACT_ENTRIES) return;
        const row: ContactRow = { id: '', value: '', key: nextRowKey() };
        setFreshKey(row.key);
        commit(listKey, [...current, row]);
      },
    });
    return { emails: build('emails'), phones: build('phones'), addresses: build('addresses') };
  }, [commit, getDraft]);

  return (
    <div className="space-y-14 pb-10 pt-3">
      {GROUPS.map(({ kind, listKey }) => (
        <ContactGroup
          key={kind}
          kind={kind}
          rows={lists[listKey]}
          freshKey={freshKey}
          visibility={visibility[kind]}
          onVisibilityChange={(level) => onVisibilityChange(kind, level)}
          onAdd={handlers[listKey].add}
          onChange={handlers[listKey].change}
          onRemove={handlers[listKey].remove}
        />
      ))}
    </div>
  );
}

/** Contact details edited inline (emails, phones, addresses), saved through the floating bar. */
export function PortfolioContactStudio({
  emails,
  phones,
  addresses,
  visibility,
  onVisibilityChange,
  onSave,
}: {
  emails: Array<{ id: string; value: string }>;
  phones: Array<{ id: string; value: string }>;
  addresses: Array<{ id: string; value: string }>;
  visibility: { email: ContactVisibilityLevel; phone: ContactVisibilityLevel; address: ContactVisibilityLevel };
  onVisibilityChange: (key: 'email' | 'phone' | 'address', level: ContactVisibilityLevel) => void;
  onSave: (next: PortfolioContactLists) => Promise<void>;
}) {
  const [initial] = useState<ContactDraft>(() => ({
    emails: toRows(emails, Boolean(emails[0]?.value.trim())),
    phones: toRows(phones),
    addresses: toRows(addresses),
  }));

  const save = useCallback(
    async (draft: ContactDraft) => {
      for (const { kind, listKey } of GROUPS) {
        const rows = draft[listKey];
        for (let index = 0; index < rows.length; index += 1) {
          const error = entryError(kind, rows[index].value);
          if (error) throw new Error(`${KIND_COPY[kind].title} ${index + 1}: ${error}`);
        }
      }
      const next: PortfolioContactLists = {
        emails: cleanRows('email', draft.emails),
        phones: cleanRows('phone', draft.phones),
        addresses: cleanRows('address', draft.addresses),
      };
      const seen = new Set<string>();
      for (const entry of next.emails) {
        const normalized = entry.value.toLowerCase();
        if (seen.has(normalized)) throw new Error(`${entry.value} is listed twice.`);
        seen.add(normalized);
      }
      await onSave(next);
    },
    [onSave]
  );

  const { revision, change, getDraft, dirtyCount, saving, toast, discard, commit } = useInlineStudio({
    initial,
    onSave: save,
    signature: contactSignature,
  });

  return (
    <>
      <ContactBody
        key={revision}
        getDraft={getDraft}
        change={change}
        visibility={visibility}
        onVisibilityChange={onVisibilityChange}
      />
      <StudioSaveChrome studio={{ dirtyCount, saving, toast, discard, commit }} />
    </>
  );
}

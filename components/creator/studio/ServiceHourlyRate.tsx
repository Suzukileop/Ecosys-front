'use client';

import { useState } from 'react';
import { CurrencyPicker } from '@/components/ui/CurrencyPicker';
import { getApiErrorMessage } from '@/lib/api-error';
import { CURRENCIES } from '@/lib/currencies';
import { updateCreatorProfile } from '@/lib/creator-profile-api';
import { formatHourlyRate, normalizeServiceCurrency } from '@/lib/profile-services';
import { useT } from '@/lib/i18n/I18nProvider';

const MAX_HOURLY_RATE_CENTS = 100_000_000;

const INK = 'text-[#0F1419] dark:text-[#E7E9EA]';
const INK2 = 'text-[#536471] dark:text-[#71767B]';

/* The page's one button shape: pills (as the directory's Discuss / Your profile). */
const primaryButtonClass =
  'inline-flex h-9 items-center justify-center rounded-full bg-[#0F1419] px-4 text-[14px] font-bold text-white transition-colors hover:bg-[#272C30] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#0F1419]/40 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-[#EFF3F4] dark:text-[#0F1419] dark:hover:bg-[#D7DBDC]';
const secondaryButtonClass = `inline-flex h-9 items-center justify-center rounded-full px-4 text-[14px] font-bold shadow-[inset_0_0_0_1px_#CFD9DE] transition-colors hover:bg-[rgba(15,20,25,0.06)] disabled:cursor-not-allowed disabled:opacity-40 dark:shadow-[inset_0_0_0_1px_#536471] dark:hover:bg-[rgba(231,233,234,0.1)] ${INK}`;

function PencilIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16v4Z" />
      <path d="m13.5 6.5 4 4" />
    </svg>
  );
}

function amountInputFromCents(cents: number | null | undefined): string {
  if (cents == null || cents <= 0) return '';
  return String(Number((cents / 100).toFixed(2)));
}

function centsFromAmountInput(raw: string): number | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const parsed = Number(trimmed.replace(',', '.'));
  if (!Number.isFinite(parsed) || parsed <= 0) return null;
  return Math.round(parsed * 100);
}

/**
 * The provider's hourly rate on My services — a profile setting, not a listing, so it reads as one
 * line under the page title (Upwork's "$100.00/hr ✎"): "Hourly rate · 100 € / hour · Edit". Edit
 * swaps the line for an inline form: amount + currency (every ISO currency, searchable), Save /
 * Cancel / Remove. Shown on the public profile and the provider card.
 */
export function ServiceHourlyRate({
  hourlyRateCents,
  hourlyRateCurrency,
  onSaved,
  className = '',
}: {
  hourlyRateCents: number | null;
  hourlyRateCurrency: string | null;
  onSaved: (cents: number | null, currency: string | null) => void;
  className?: string;
}) {
  const t = useT();
  const [editing, setEditing] = useState(false);
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('EUR');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const current = formatHourlyRate(hourlyRateCents, hourlyRateCurrency);
  /* Every ISO 4217 currency A → Z (searchable); a stored code outside the list is kept selectable. */
  const currencyOptions = CURRENCIES.some((option) => option.code === currency)
    ? CURRENCIES
    : [...CURRENCIES, { code: currency, name: currency }].sort((a, b) => a.code.localeCompare(b.code));

  const startEdit = () => {
    setAmount(amountInputFromCents(hourlyRateCents));
    setCurrency(normalizeServiceCurrency(hourlyRateCurrency));
    setError(null);
    setEditing(true);
  };

  const save = async (cents: number | null) => {
    setSaving(true);
    setError(null);
    try {
      const profile = await updateCreatorProfile({ hourlyRateCents: cents ?? 0, hourlyRateCurrency: currency });
      onSaved(profile.hourlyRateCents ?? null, profile.hourlyRateCurrency ?? null);
      setEditing(false);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const submit = () => {
    const cents = centsFromAmountInput(amount);
    if (cents == null) {
      setError(t('Enter an hourly rate above 0.'));
      return;
    }
    if (cents > MAX_HOURLY_RATE_CENTS) {
      setError(t('That rate is too high.'));
      return;
    }
    void save(cents);
  };

  return (
    <section aria-label={t('Hourly rate')} className={className}>
      {editing ? (
        <form
          className="flex flex-wrap items-center gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            submit();
          }}
        >
          <span className={`mr-1 text-[15px] leading-5 ${INK2}`}>{t('Hourly rate')}</span>
          {/* One pill field: the amount, a divider, then the currency picker. */}
          <div className="flex h-9 items-center rounded-full bg-[#EFF3F4] transition-[background-color,box-shadow] focus-within:bg-white focus-within:shadow-[inset_0_0_0_1.5px_#0F1419] dark:bg-[#202327] dark:focus-within:bg-black dark:focus-within:shadow-[inset_0_0_0_1.5px_#E7E9EA]">
            <input
              autoFocus
              type="text"
              inputMode="decimal"
              aria-label={t('Hourly rate amount')}
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              placeholder="25"
              className={`h-full w-24 rounded-l-full bg-transparent pl-4 pr-2 text-[15px] tabular-nums outline-hidden placeholder:text-[#536471] dark:placeholder:text-[#71767B] ${INK}`}
            />
            <span aria-hidden className="h-5 w-px bg-[#CFD9DE] dark:bg-[#3E4144]" />
            <CurrencyPicker value={currency} options={currencyOptions} onChange={setCurrency} />
          </div>
          <span className={`text-[14px] ${INK2}`}>{t('/ hour')}</span>
          <button type="submit" disabled={saving} className={`${primaryButtonClass} ml-1`}>
            {saving ? t('Saving…') : t('Save')}
          </button>
          <button type="button" disabled={saving} onClick={() => setEditing(false)} className={secondaryButtonClass}>
            {t('Cancel')}
          </button>
          {hourlyRateCents ? (
            <button
              type="button"
              disabled={saving}
              onClick={() => void save(null)}
              className="inline-flex h-9 items-center rounded-full px-3 text-[14px] font-semibold text-[#F4212E] transition-colors hover:bg-[rgba(244,33,46,0.08)] disabled:opacity-40"
            >
              {t('Remove')}
            </button>
          ) : null}
        </form>
      ) : (
        <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[15px] leading-5">
          <span className={INK2}>{t('Hourly rate')}</span>
          <span aria-hidden className={INK2}>
            ·
          </span>
          {current ? (
            <span className={`font-bold tabular-nums ${INK}`}>{current}</span>
          ) : (
            <span className={INK2}>{t('Not set')}</span>
          )}
          <span aria-hidden className={INK2}>
            ·
          </span>
          <button
            type="button"
            onClick={startEdit}
            className={`inline-flex items-center gap-1 font-semibold underline-offset-4 hover:underline focus-visible:underline focus-visible:outline-hidden ${INK}`}
          >
            <PencilIcon className="h-3.5 w-3.5" />
            {current ? t('Edit') : t('Set your rate')}
          </button>
        </p>
      )}
      {error ? (
        <p role="alert" className="mt-1.5 text-[13px] text-[#F4212E]">
          {error}
        </p>
      ) : null}
    </section>
  );
}

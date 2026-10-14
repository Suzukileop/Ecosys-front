import { localeTag, tr, trPlural } from '@/lib/i18n/active';
import type { ProfileServiceItem } from '@/types/profile';
import { formatMoney } from '@/lib/money';
import { msg } from '@/lib/i18n/config';

export type ServicePricingType = 'FIXED' | 'FROM' | 'QUOTE' | 'FREE';
export type ServiceStatus = 'ACTIVE' | 'PAUSED' | 'ARCHIVED';
export type ServiceDeliveryUnit = 'DAYS' | 'WEEKS';
export type ServiceCurrencyPreset = 'EUR' | 'USD' | 'OTHER';
export type ServiceBillingPeriod = 'DAY' | 'MONTH' | 'YEAR';

export const SERVICE_BILLING_PERIOD_OPTIONS: { value: ServiceBillingPeriod; label: string }[] = [
  { value: 'DAY', label: msg('Per day') },
  { value: 'MONTH', label: msg('Per month') },
  { value: 'YEAR', label: msg('Per year') },
];

export function normalizeBillingPeriod(raw: string | null | undefined): ServiceBillingPeriod | null {
  const key = (raw ?? '').trim().toUpperCase();
  if (key === 'DAY' || key === 'MONTH' || key === 'YEAR') return key;
  return null;
}

/** Suffix shown after a price, e.g. "/ month" — null when the service has no period. */
export function formatBillingPeriodSuffix(service: { billingPeriod?: string | null }): string | null {
  switch (normalizeBillingPeriod(service.billingPeriod)) {
    case 'DAY':
      return tr('/ day');
    case 'MONTH':
      return tr('/ month');
    case 'YEAR':
      return tr('/ year');
    default:
      return null;
  }
}

export const SERVICE_PRICING_OPTIONS: { value: ServicePricingType; label: string }[] = [
  { value: 'FIXED', label: msg('Fixed price') },
  { value: 'FROM', label: msg('Starting at') },
  { value: 'QUOTE', label: msg('Quote on request') },
  { value: 'FREE', label: msg('Free') },
];

/** Pricing types that need an amount (and currency) from the creator. */
export function servicePricingNeedsAmount(type: ServicePricingType | string | null | undefined): boolean {
  return type !== 'QUOTE' && type !== 'FREE';
}

/** Price to persist for a pricing type — QUOTE has none, FREE is always 0. */
export function servicePriceCentsForPricing(
  type: ServicePricingType | string | null | undefined,
  cents: number | null | undefined
): number | null {
  if (type === 'QUOTE') return null;
  if (type === 'FREE') return 0;
  return cents ?? null;
}

export const SERVICE_STATUS_OPTIONS: { value: ServiceStatus; label: string }[] = [
  { value: 'ACTIVE', label: msg('Active') },
  { value: 'PAUSED', label: msg('Paused') },
  { value: 'ARCHIVED', label: msg('Archived') },
];

export const SERVICE_CURRENCY_PRESETS: { value: ServiceCurrencyPreset; label: string; code: string }[] = [
  { value: 'EUR', label: msg('EUR (Euro)'), code: 'EUR' },
  { value: 'USD', label: msg('USD (Dollar)'), code: 'USD' },
  { value: 'OTHER', label: msg('Other'), code: '' },
];

export const SERVICE_DELIVERY_UNIT_OPTIONS: { value: ServiceDeliveryUnit; label: string }[] = [
  { value: 'DAYS', label: msg('Days') },
  { value: 'WEEKS', label: msg('Weeks') },
];

export const MAX_PROFILE_SERVICES = 8;
/** Matches the backend's hard limit (ProfileExtensionsSupport.MAX_SERVICE_DESC). */
export const SERVICE_DESCRIPTION_SOFT_LIMIT = 500;
/** "What's included" deliverables per service (backend: MAX_SERVICE_TASKS / MAX_SERVICE_TASK). */
export const MAX_SERVICE_INCLUDES = 12;
export const SERVICE_INCLUDE_MAX_LENGTH = 120;
const DEFAULT_SERVICE_CURRENCY = 'EUR';

function normalizeServicePricingType(
  raw: string | null | undefined,
  basePriceCents?: number | null
): ServicePricingType {
  const key = (raw ?? '').trim().toUpperCase().replace(/[-\s]/g, '_');
  if (key === 'FIXED' || key === 'FIXE' || key === 'FIXED_PRICE') return 'FIXED';
  if (key === 'FROM' || key === 'A_PARTIR_DE' || key === 'STARTING_AT' || key === 'STARTING') return 'FROM';
  if (key === 'QUOTE' || key === 'SUR_DEVIS' || key === 'ON_REQUEST' || key === 'DEVIS') return 'QUOTE';
  if (key === 'FREE' || key === 'GRATUIT' || key === 'FREE_OF_CHARGE') return 'FREE';
  return basePriceCents != null ? 'FIXED' : 'QUOTE';
}

export function normalizeServiceStatus(raw: string | null | undefined): ServiceStatus {
  const key = (raw ?? '').trim().toUpperCase().replace(/[-\s]/g, '_');
  if (key === 'PAUSED' || key === 'EN_PAUSE' || key === 'PAUSE') return 'PAUSED';
  if (key === 'ARCHIVED' || key === 'ARCHIVE' || key === 'ARCHIVÉ') return 'ARCHIVED';
  return 'ACTIVE';
}

export function normalizeServiceCurrency(raw: string | null | undefined): string {
  const code = (raw ?? '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
  return code || DEFAULT_SERVICE_CURRENCY;
}

export function currencyPresetFromCode(code: string | null | undefined): ServiceCurrencyPreset {
  const codeRaw = (code ?? '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (!codeRaw) return 'OTHER';
  if (codeRaw === 'EUR' || codeRaw === 'USD') return codeRaw;
  return 'OTHER';
}

function formatCurrencySymbol(currency: string | null | undefined): string {
  const code = normalizeServiceCurrency(currency);
  switch (code) {
    case 'MGA':
      return 'Ar';
    case 'EUR':
      return '€';
    case 'USD':
      return '$';
    default:
      return code;
  }
}

function formatServiceAmount(
  cents: number | null | undefined,
  currency?: string | null
): string {
  if (cents == null || Number.isNaN(cents)) return '';
  return formatMoney(cents, normalizeServiceCurrency(currency));
}

export function formatServicePrice(service: {
  pricingType?: string | null;
  basePriceCents?: number | null;
  currency?: string | null;
  billingPeriod?: string | null;
}): string {
  const type = normalizeServicePricingType(service.pricingType, service.basePriceCents);
  if (type === 'QUOTE') return tr('On request');
  if (type === 'FREE') return tr('Free');
  const cents = service.basePriceCents;
  if (cents == null || Number.isNaN(cents)) return tr('On request');
  if (cents === 0) return type === 'FROM' ? tr('Starting at {amount}', { amount: tr('Free') }) : tr('Free');
  const suffix = formatBillingPeriodSuffix(service);
  const amount = `${formatServiceAmount(cents, service.currency)}${suffix ? ` ${suffix}` : ''}`;
  return type === 'FROM' ? tr('Starting at {amount}', { amount }) : amount;
}

/** A provider's hourly rate figure, "25 €" — null when no rate is set. */
export function formatHourlyRateAmount(
  cents: number | null | undefined,
  currency: string | null | undefined
): string | null {
  if (cents == null || Number.isNaN(cents) || cents <= 0) return null;
  return formatServiceAmount(cents, currency);
}

/** A provider's hourly rate, "25 € / hour" — null when no rate is set. */
export function formatHourlyRate(
  cents: number | null | undefined,
  currency: string | null | undefined
): string | null {
  const amount = formatHourlyRateAmount(cents, currency);
  return amount ? tr('{amount} / hour', { amount }) : null;
}

export type ServicePriceParts = {
  /** `quote` = price on request, `free` = 0, `amount` = a real figure. */
  kind: 'free' | 'quote' | 'amount';
  /** "Starting at" pricing flag — the figure is a floor, not a fixed price. */
  isFrom: boolean;
  /** The figure alone ("100", "49.90"); empty unless `kind === 'amount'`. */
  amount: string;
  /** Currency glyph ("€", "$", "Ar" or the raw code). */
  symbol: string;
  /** "$100" puts the glyph first; everything else reads "100 €". */
  symbolFirst: boolean;
  /** The service's own billing period suffix ("/ month"), null when it has none. */
  period: string | null;
  /** The figure with its glyph ("100 €") — for places that cannot style the parts apart. */
  text: string;
};

/**
 * A service's price split into the pieces a pricing layout styles separately (big figure, small
 * glyph, small period). Mirrors `formatServicePrice` — same type/currency/period rules — but
 * keeps them apart instead of returning one string.
 */
/** What a provider card shows as its price: the cheapest priced ACTIVE service ("From 100 € / month"),
 *  else "Free" when one is free, else "On request" when one is quoted, else null (no services).
 *  Prices are compared in the most used currency only — never across currencies. */
export type ServiceStartingPrice = { text: string; period: string | null; from: boolean };

export function getStartingPrice(
  services:
    | readonly {
        status?: string | null;
        pricingType?: string | null;
        basePriceCents?: number | null;
        currency?: string | null;
        billingPeriod?: string | null;
      }[]
    | null
    | undefined
): ServiceStartingPrice | null {
  const active = (services ?? []).filter((service) => {
    const status = (service.status ?? 'ACTIVE').trim().toUpperCase();
    return status === '' || status === 'ACTIVE';
  });
  if (active.length === 0) return null;
  const parts = active.map((service) => ({ service, parts: getServicePriceParts(service) }));
  const priced = parts.filter((entry) => entry.parts.kind === 'amount');
  if (priced.length > 0) {
    const byCurrency = new Map<string, typeof priced>();
    for (const entry of priced) {
      const key = (entry.service.currency ?? '').trim().toUpperCase();
      byCurrency.set(key, [...(byCurrency.get(key) ?? []), entry]);
    }
    const pool = [...byCurrency.values()].sort((a, b) => b.length - a.length)[0];
    const cheapest = pool.reduce((min, entry) =>
      (entry.service.basePriceCents ?? Infinity) < (min.service.basePriceCents ?? Infinity) ? entry : min
    );
    return {
      text: cheapest.parts.text,
      period: cheapest.parts.period,
      from: priced.length > 1 || cheapest.parts.isFrom,
    };
  }
  if (parts.some((entry) => entry.parts.kind === 'free')) return { text: tr('Free'), period: null, from: false };
  return { text: tr('On request'), period: null, from: false };
}

export function getServicePriceParts(service: {
  pricingType?: string | null;
  basePriceCents?: number | null;
  currency?: string | null;
  billingPeriod?: string | null;
}): ServicePriceParts {
  const type = normalizeServicePricingType(service.pricingType, service.basePriceCents);
  const cents = service.basePriceCents;
  const symbol = formatCurrencySymbol(service.currency);
  /* The app's money format puts the symbol first for every currency ("€100", "Ar 3,000"). */
  const symbolFirst = true;
  const base = { isFrom: type === 'FROM', symbol, symbolFirst, period: formatBillingPeriodSuffix(service) };
  if (type === 'QUOTE' || cents == null || Number.isNaN(cents)) {
    return { ...base, kind: 'quote', amount: '', text: tr('On request'), period: null };
  }
  if (type === 'FREE' || cents === 0) {
    return { ...base, kind: 'free', amount: '', text: tr('Free'), period: null };
  }
  const whole = cents % 100 === 0;
  const amount = new Intl.NumberFormat(localeTag(), {
    minimumFractionDigits: whole ? 0 : 2,
    maximumFractionDigits: whole ? 0 : 2,
  }).format(cents / 100);
  return { ...base, kind: 'amount', amount, text: formatMoney(cents, normalizeServiceCurrency(service.currency)) };
}

function normalizeDeliveryUnit(raw: string | null | undefined): ServiceDeliveryUnit | null {
  const key = (raw ?? '').trim().toUpperCase();
  if (!key) return null;
  if (key === 'DAY' || key === 'DAYS' || key === 'JOUR' || key === 'JOURS') return 'DAYS';
  if (key === 'WEEK' || key === 'WEEKS' || key === 'SEMAINE' || key === 'SEMAINES') return 'WEEKS';
  return null;
}

function parseLegacyDeadline(deadline: string | null | undefined): {
  value: number;
  unit: ServiceDeliveryUnit;
} | null {
  const raw = deadline?.trim().toLowerCase();
  if (!raw) return null;
  const match = raw.match(/^(\d+)\s*(day|days|jour|jours|week|weeks|semaine|semaines)?$/i);
  if (!match) return null;
  const value = Number(match[1]);
  if (!Number.isFinite(value) || value < 1) return null;
  const unitRaw = match[2]?.toLowerCase() ?? 'days';
  const unit: ServiceDeliveryUnit =
    unitRaw.startsWith('week') || unitRaw.startsWith('semaine') ? 'WEEKS' : 'DAYS';
  return { value, unit };
}

/** Default wording around a delivery time; `{time}` becomes "3 days" / "1 week". */
export const DEFAULT_SERVICE_DELIVERY_TEMPLATE = msg('{time} delivery');

/** "{time} delivery" with the time filled in. A template without `{time}` is put in front of it. */
export function applyServiceDeliveryTemplate(time: string, template?: string | null): string {
  const custom = template?.trim();
  /* The default wording follows the viewer's language; a creator's own wording is kept as written. */
  const pattern = !custom || custom === DEFAULT_SERVICE_DELIVERY_TEMPLATE ? tr(DEFAULT_SERVICE_DELIVERY_TEMPLATE) : custom;
  return pattern.includes('{time}') ? pattern.split('{time}').join(time) : `${pattern} ${time}`;
}

export function formatServiceDelivery(
  service: {
    deadline?: string | null;
    deliveryValue?: number | null;
    deliveryUnit?: string | null;
  },
  template?: string | null
): string | null {
  const unit = normalizeDeliveryUnit(service.deliveryUnit);
  if (service.deliveryValue != null && service.deliveryValue > 0) {
    const resolvedUnit = unit ?? 'DAYS';
    const time =
      resolvedUnit === 'WEEKS'
        ? trPlural(service.deliveryValue, '{count} week', '{count} weeks')
        : trPlural(service.deliveryValue, '{count} day', '{count} days');
    return applyServiceDeliveryTemplate(time, template);
  }
  const legacy = parseLegacyDeadline(service.deadline);
  if (legacy) {
    return formatServiceDelivery(
      {
        deliveryValue: legacy.value,
        deliveryUnit: legacy.unit,
      },
      template
    );
  }
  const fallback = service.deadline?.trim();
  return fallback || null;
}

export function serviceStatusLabel(status: string | null | undefined): string {
  const normalized = normalizeServiceStatus(status);
  return tr(SERVICE_STATUS_OPTIONS.find((item) => item.value === normalized)?.label ?? 'Active');
}

function isActiveService(service: Pick<ProfileServiceItem, 'status'>): boolean {
  return normalizeServiceStatus(service.status) === 'ACTIVE';
}

export function filterActiveServices<T extends Pick<ProfileServiceItem, 'status'>>(services: T[]): T[] {
  return services.filter(isActiveService);
}

export function solidCoverHueFromTitle(title: string): number {
  let hash = 0;
  for (let i = 0; i < title.length; i += 1) {
    hash = (hash + title.charCodeAt(i) * 17) % 360;
  }
  return hash;
}

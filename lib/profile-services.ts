import type { ProfileServiceItem } from '@/types/ecosystem';

export type ServicePricingType = 'FIXED' | 'FROM' | 'QUOTE';
export type ServiceStatus = 'ACTIVE' | 'PAUSED' | 'ARCHIVED';
export type ServiceDeliveryUnit = 'DAYS' | 'WEEKS';
export type ServiceCurrencyPreset = 'EUR' | 'USD' | 'OTHER';

export const SERVICE_PRICING_OPTIONS: { value: ServicePricingType; label: string }[] = [
  { value: 'FIXED', label: 'Fixed price' },
  { value: 'FROM', label: 'Starting at' },
  { value: 'QUOTE', label: 'Quote on request' },
];

export const SERVICE_STATUS_OPTIONS: { value: ServiceStatus; label: string }[] = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'PAUSED', label: 'Paused' },
  { value: 'ARCHIVED', label: 'Archived' },
];

export const SERVICE_CURRENCY_PRESETS: { value: ServiceCurrencyPreset; label: string; code: string }[] = [
  { value: 'EUR', label: 'EUR (Euro)', code: 'EUR' },
  { value: 'USD', label: 'USD (Dollar)', code: 'USD' },
  { value: 'OTHER', label: 'Other', code: '' },
];

export const SERVICE_DELIVERY_UNIT_OPTIONS: { value: ServiceDeliveryUnit; label: string }[] = [
  { value: 'DAYS', label: 'Days' },
  { value: 'WEEKS', label: 'Weeks' },
];

export const MAX_PROFILE_SERVICES = 8;
export const SERVICE_DESCRIPTION_SOFT_LIMIT = 180;
export const DEFAULT_SERVICE_CURRENCY = 'EUR';

export function normalizeServicePricingType(
  raw: string | null | undefined,
  basePriceCents?: number | null
): ServicePricingType {
  const key = (raw ?? '').trim().toUpperCase().replace(/[-\s]/g, '_');
  if (key === 'FIXED' || key === 'FIXE' || key === 'FIXED_PRICE') return 'FIXED';
  if (key === 'FROM' || key === 'A_PARTIR_DE' || key === 'STARTING_AT' || key === 'STARTING') return 'FROM';
  if (key === 'QUOTE' || key === 'SUR_DEVIS' || key === 'ON_REQUEST' || key === 'DEVIS') return 'QUOTE';
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

export function formatCurrencySymbol(currency: string | null | undefined): string {
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

export function formatServiceAmount(
  cents: number | null | undefined,
  currency?: string | null
): string {
  if (cents == null || Number.isNaN(cents)) return '';
  const amount = (cents / 100).toFixed(cents % 100 === 0 ? 0 : 2);
  const symbol = formatCurrencySymbol(currency);
  if (symbol === 'Ar' || symbol === '$' || symbol === '€') {
    return symbol === '$' ? `$${amount}` : `${amount} ${symbol}`;
  }
  return `${amount} ${symbol}`;
}

export function formatServicePrice(service: {
  pricingType?: string | null;
  basePriceCents?: number | null;
  currency?: string | null;
}): string {
  const type = normalizeServicePricingType(service.pricingType, service.basePriceCents);
  if (type === 'QUOTE') return 'On request';
  const cents = service.basePriceCents;
  if (cents == null || Number.isNaN(cents)) return 'On request';
  if (cents === 0) return type === 'FROM' ? 'Starting at Free' : 'Free';
  const amount = formatServiceAmount(cents, service.currency);
  return type === 'FROM' ? `Starting at ${amount}` : amount;
}

export function normalizeDeliveryUnit(raw: string | null | undefined): ServiceDeliveryUnit | null {
  const key = (raw ?? '').trim().toUpperCase();
  if (!key) return null;
  if (key === 'DAY' || key === 'DAYS' || key === 'JOUR' || key === 'JOURS') return 'DAYS';
  if (key === 'WEEK' || key === 'WEEKS' || key === 'SEMAINE' || key === 'SEMAINES') return 'WEEKS';
  return null;
}

export function parseLegacyDeadline(deadline: string | null | undefined): {
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

export function formatServiceDelivery(service: {
  deadline?: string | null;
  deliveryValue?: number | null;
  deliveryUnit?: string | null;
}): string | null {
  const unit = normalizeDeliveryUnit(service.deliveryUnit);
  if (service.deliveryValue != null && service.deliveryValue > 0) {
    const resolvedUnit = unit ?? 'DAYS';
    const plural = service.deliveryValue === 1 ? false : true;
    if (resolvedUnit === 'WEEKS') {
      return `${service.deliveryValue} week${plural ? 's' : ''} delivery`;
    }
    return `${service.deliveryValue} day${plural ? 's' : ''} delivery`;
  }
  const legacy = parseLegacyDeadline(service.deadline);
  if (legacy) {
    return formatServiceDelivery({
      deliveryValue: legacy.value,
      deliveryUnit: legacy.unit,
    });
  }
  const fallback = service.deadline?.trim();
  return fallback || null;
}

export function serviceStatusLabel(status: string | null | undefined): string {
  const normalized = normalizeServiceStatus(status);
  return SERVICE_STATUS_OPTIONS.find((item) => item.value === normalized)?.label ?? 'Active';
}

export function isActiveService(service: Pick<ProfileServiceItem, 'status'>): boolean {
  return normalizeServiceStatus(service.status) === 'ACTIVE';
}

export function filterActiveServices<T extends Pick<ProfileServiceItem, 'status'>>(services: T[]): T[] {
  return services.filter(isActiveService);
}

export function countActiveServices(services: Array<Pick<ProfileServiceItem, 'status'>> | null | undefined): number {
  if (!services?.length) return 0;
  return filterActiveServices(services).length;
}

export function solidCoverHueFromTitle(title: string): number {
  let hash = 0;
  for (let i = 0; i < title.length; i += 1) {
    hash = (hash + title.charCodeAt(i) * 17) % 360;
  }
  return hash;
}

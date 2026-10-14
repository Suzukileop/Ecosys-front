import { localeTag } from '@/lib/i18n/active';
/**
 * The app's one money format — products, services and hourly rates alike: the currency's narrow
 * symbol before the amount, thousands grouped, cents only when there are some ("€66", "€6,499.95",
 * "Ar 3,000"). An unknown code falls back to "3000 XYZ".
 */
export function formatMoney(cents: number, currency: string | null | undefined = 'EUR'): string {
  const code = (currency ?? '').trim().toUpperCase() || 'EUR';
  const whole = Math.round(cents) % 100 === 0;
  const amount = cents / 100;
  try {
    return new Intl.NumberFormat(localeTag(), {
      style: 'currency',
      currency: code,
      currencyDisplay: 'narrowSymbol',
      minimumFractionDigits: whole ? 0 : 2,
      maximumFractionDigits: whole ? 0 : 2,
    }).format(amount);
  } catch {
    return `${amount.toFixed(whole ? 0 : 2)} ${code}`;
  }
}

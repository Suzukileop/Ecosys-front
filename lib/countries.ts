/** ISO 3166-1 alpha-2 codes used for citizenship / nationality. */
export const NATIONALITY_CODES = [
  'AD', 'AE', 'AF', 'AG', 'AI', 'AL', 'AM', 'AO', 'AQ', 'AR', 'AS', 'AT', 'AU', 'AW', 'AX', 'AZ',
  'BA', 'BB', 'BD', 'BE', 'BF', 'BG', 'BH', 'BI', 'BJ', 'BL', 'BM', 'BN', 'BO', 'BQ', 'BR', 'BS',
  'BT', 'BV', 'BW', 'BY', 'BZ', 'CA', 'CC', 'CD', 'CF', 'CG', 'CH', 'CI', 'CK', 'CL', 'CM', 'CN',
  'CO', 'CR', 'CU', 'CV', 'CW', 'CX', 'CY', 'CZ', 'DE', 'DJ', 'DK', 'DM', 'DO', 'DZ', 'EC', 'EE',
  'EG', 'EH', 'ER', 'ES', 'ET', 'FI', 'FJ', 'FK', 'FM', 'FO', 'FR', 'GA', 'GB', 'GD', 'GE', 'GF',
  'GG', 'GH', 'GI', 'GL', 'GM', 'GN', 'GP', 'GQ', 'GR', 'GS', 'GT', 'GU', 'GW', 'GY', 'HK', 'HM',
  'HN', 'HR', 'HT', 'HU', 'ID', 'IE', 'IL', 'IM', 'IN', 'IO', 'IQ', 'IR', 'IS', 'IT', 'JE', 'JM',
  'JO', 'JP', 'KE', 'KG', 'KH', 'KI', 'KM', 'KN', 'KP', 'KR', 'KW', 'KY', 'KZ', 'LA', 'LB', 'LC',
  'LI', 'LK', 'LR', 'LS', 'LT', 'LU', 'LV', 'LY', 'MA', 'MC', 'MD', 'ME', 'MF', 'MG', 'MH', 'MK',
  'ML', 'MM', 'MN', 'MO', 'MP', 'MQ', 'MR', 'MS', 'MT', 'MU', 'MV', 'MW', 'MX', 'MY', 'MZ', 'NA',
  'NC', 'NE', 'NF', 'NG', 'NI', 'NL', 'NO', 'NP', 'NR', 'NU', 'NZ', 'OM', 'PA', 'PE', 'PF', 'PG',
  'PH', 'PK', 'PL', 'PM', 'PN', 'PR', 'PS', 'PT', 'PW', 'PY', 'QA', 'RE', 'RO', 'RS', 'RU', 'RW',
  'SA', 'SB', 'SC', 'SD', 'SE', 'SG', 'SH', 'SI', 'SJ', 'SK', 'SL', 'SM', 'SN', 'SO', 'SR', 'SS',
  'ST', 'SV', 'SX', 'SY', 'SZ', 'TC', 'TD', 'TF', 'TG', 'TH', 'TJ', 'TK', 'TL', 'TM', 'TN', 'TO',
  'TR', 'TT', 'TV', 'TW', 'TZ', 'UA', 'UG', 'UM', 'US', 'UY', 'UZ', 'VA', 'VC', 'VE', 'VG', 'VI',
  'VN', 'VU', 'WF', 'WS', 'YE', 'YT', 'ZA', 'ZM', 'ZW',
] as const;

export type NationalityCode = (typeof NATIONALITY_CODES)[number];

const CODE_SET = new Set<string>(NATIONALITY_CODES);

export function normalizeNationalityCode(raw: unknown): NationalityCode | null {
  if (raw == null) return null;
  const code = String(raw).trim().toUpperCase();
  return CODE_SET.has(code) ? (code as NationalityCode) : null;
}

export function nationalityLabel(code: string | null | undefined, locale = 'en'): string {
  const normalized = normalizeNationalityCode(code);
  if (!normalized) return '';
  try {
    return new Intl.DisplayNames([locale], { type: 'region' }).of(normalized) ?? normalized;
  } catch {
    return normalized;
  }
}

/** Regional indicator flag emoji for ISO 3166-1 alpha-2 (e.g. FR → 🇫🇷). */
export function nationalityFlag(code: string | null | undefined): string {
  const normalized = normalizeNationalityCode(code);
  if (!normalized) return '';
  return [...normalized].map((char) => String.fromCodePoint(127397 + char.charCodeAt(0))).join('');
}

export function formatDistanceAwayKm(km: number | null | undefined): string | null {
  if (km == null || Number.isNaN(km)) return null;
  if (km < 1) return 'Less than 1 km away';
  if (km < 10) return `${km.toFixed(1)} km away`;
  return `${Math.round(km)} km away`;
}

export function nationalityOptions(locale = 'en'): { code: NationalityCode; label: string }[] {
  return NATIONALITY_CODES.map((code) => ({ code, label: nationalityLabel(code, locale) || code })).sort((a, b) =>
    a.label.localeCompare(b.label, locale)
  );
}

export const NATIONALITY_SELECT_OPTIONS = nationalityOptions('en');

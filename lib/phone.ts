import { COUNTRY_DIAL_CODES, DIAL_CODES_BY_LENGTH, findCountryByIso, type CountryDialCode } from './countryDialCodes';

type ParsedPhone = {
  country: CountryDialCode;
  nationalNumber: string;
};

function getDefaultCountry(): CountryDialCode {
  return findCountryByIso('FR') ?? COUNTRY_DIAL_CODES[0];
}

export function parsePhoneNumber(raw: string | null | undefined): ParsedPhone {
  const trimmed = raw?.trim() ?? '';
  if (!trimmed) {
    return { country: getDefaultCountry(), nationalNumber: '' };
  }

  const digits = trimmed.replace(/[^\d+]/g, '');
  const withPlus = digits.startsWith('+') ? digits : `+${digits}`;

  for (const country of DIAL_CODES_BY_LENGTH) {
    if (withPlus.startsWith(country.dial)) {
      return {
        country,
        nationalNumber: withPlus.slice(country.dial.length).replace(/\D/g, ''),
      };
    }
  }

  return {
    country: getDefaultCountry(),
    nationalNumber: withPlus.replace(/\D/g, ''),
  };
}

export function formatPhoneNumber(country: CountryDialCode, nationalNumber: string): string {
  const digits = nationalNumber.replace(/\D/g, '');
  // Keep dial-only values (e.g. "+261") so country selection persists before digits are typed.
  return `${country.dial}${digits}`;
}

/** Empty / dial-only drafts → ""; otherwise E.164-style "+dialdigits". */
export function toStoredPhoneNumber(raw: string | null | undefined): string {
  const trimmed = raw?.trim() ?? '';
  if (!trimmed) return '';
  const { country, nationalNumber } = parsePhoneNumber(trimmed);
  if (!nationalNumber) return '';
  return formatPhoneNumber(country, nationalNumber);
}

/** How a few countries write their national number (group sizes, used only when the digit
 *  count matches); anything else falls back to pairs from the end. */
const NATIONAL_NUMBER_GROUPS: Record<string, number[][]> = {
  '+33': [[1, 2, 2, 2, 2]], // France — 6 12 34 56 78
  '+32': [[3, 2, 2, 2], [1, 3, 2, 2]], // Belgium — 470 12 34 56 / 2 123 45 67
  '+41': [[2, 3, 2, 2]], // Switzerland — 78 123 45 67
  '+261': [[2, 2, 3, 2]], // Madagascar — 34 12 345 67
  '+1': [[3, 3, 4]], // North America — 415 555 0123
  '+44': [[4, 6]], // United Kingdom — 7700 900123
  '+49': [[4, 7], [3, 7], [3, 8]], // Germany — 1512 3456789
  '+212': [[3, 2, 2, 2]], // Morocco — 612 34 56 78
  '+225': [[2, 2, 2, 2, 2]], // Côte d'Ivoire — 07 12 34 56 78
};

function groupNationalNumber(dial: string, digits: string): string {
  const pattern = NATIONAL_NUMBER_GROUPS[dial]?.find(
    (groups) => groups.reduce((sum, size) => sum + size, 0) === digits.length
  );
  if (pattern) {
    const parts: string[] = [];
    let index = 0;
    for (const size of pattern) {
      parts.push(digits.slice(index, index + size));
      index += size;
    }
    return parts.join(' ');
  }
  if (digits.length <= 4) return digits;
  // Pairs from the end, a leading single digit when the count is odd: 6 12 34 56 78.
  const head = digits.length % 2 === 1 ? [digits.slice(0, 1)] : [];
  const rest = digits.slice(head.length).match(/\d{2}/g) ?? [];
  return [...head, ...rest].join(' ');
}

export function formatPhoneDisplay(raw: string | null | undefined): string {
  const trimmed = raw?.trim();
  if (!trimmed) return '';
  const { country, nationalNumber } = parsePhoneNumber(trimmed);
  if (!nationalNumber) {
    // Dial-only draft (country chosen, no local digits yet) — don't show bare "+261" as a phone.
    if (trimmed === country.dial || trimmed === country.dial.replace('+', '')) return '';
    return trimmed;
  }
  return `${country.dial} ${groupNationalNumber(country.dial, nationalNumber)}`;
}

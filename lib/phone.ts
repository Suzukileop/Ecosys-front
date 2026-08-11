import { COUNTRY_DIAL_CODES, DIAL_CODES_BY_LENGTH, findCountryByIso, type CountryDialCode } from './countryDialCodes';

export type ParsedPhone = {
  country: CountryDialCode;
  nationalNumber: string;
};

export function getDefaultCountry(): CountryDialCode {
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

export function formatPhoneDisplay(raw: string | null | undefined): string {
  const trimmed = raw?.trim();
  if (!trimmed) return '';
  const { country, nationalNumber } = parsePhoneNumber(trimmed);
  if (!nationalNumber) {
    // Dial-only draft (country chosen, no local digits yet) — don't show bare "+261" as a phone.
    if (trimmed === country.dial || trimmed === country.dial.replace('+', '')) return '';
    return trimmed;
  }
  return `${country.dial} ${nationalNumber}`;
}

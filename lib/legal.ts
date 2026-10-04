/**
 * Single source of truth for the legal pages (/terms, /privacy). Fields set to `null` are still
 * unknown — see LEGAL_TODO.md at the repo root — and the pages fall back to neutral wording for them.
 */
export const LEGAL = {
  serviceName: 'Skraft',
  /** Skraft is currently run by an individual, not a registered company. */
  operator: {
    kind: 'individual' as const,
    name: null as string | null,
    country: null as string | null,
    address: null as string | null,
  },
  contactEmail: 'leopardjuliocesar8@gmail.com',
  minimumAge: 13,
  /** Age under which a parent or guardian must agree to these terms on the user's behalf. */
  parentalConsentUntil: 16,
  lastUpdated: '2026-10-03',
} as const;

export function formatLegalDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

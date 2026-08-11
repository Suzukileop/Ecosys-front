/** Manual typical-response presets (must match backend CreatorResponseTimeService). */
export const TYPICAL_RESPONSE_TIME_OPTIONS = [
  {
    value: 'WITHIN_1_HOUR',
    label: 'Usually within 1 hour',
  },
  {
    value: 'FEW_HOURS',
    label: 'Usually within a few hours',
  },
  {
    value: 'WITHIN_DAY',
    label: 'Usually within a day',
  },
  {
    value: 'WITHIN_2_3_DAYS',
    label: 'Usually within 2-3 days',
  },
] as const;

export type TypicalResponseTimeCode = (typeof TYPICAL_RESPONSE_TIME_OPTIONS)[number]['value'];

export function typicalResponseTimeLabel(code: string | null | undefined): string | null {
  if (!code?.trim()) return null;
  return TYPICAL_RESPONSE_TIME_OPTIONS.find((option) => option.value === code)?.label ?? null;
}

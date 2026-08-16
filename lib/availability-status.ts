/** Preset labels when the creator is available (empty → default "Available"). */
export const AVAILABILITY_STATUS_OPTIONS = [
  { value: '', label: 'Available' },
  { value: 'Open to work', label: 'Open to work' },
  { value: 'Available for hire', label: 'Available for hire' },
  { value: 'Open for projects', label: 'Open for projects' },
  { value: 'Taking new clients', label: 'Taking new clients' },
  { value: 'Limited availability', label: 'Limited availability' },
] as const;

/** Select sentinel: free-text custom label. */
export const AVAILABILITY_STATUS_OTHER_VALUE = '__other__';

export type AvailabilityStatusOptionValue =
  (typeof AVAILABILITY_STATUS_OPTIONS)[number]['value'];

/** Fixed select options (presets + Other). */
export function availabilityStatusSelectOptions(): { value: string; label: string }[] {
  return [
    ...AVAILABILITY_STATUS_OPTIONS.map((option) => ({
      value: option.value,
      label: option.label,
    })),
    { value: AVAILABILITY_STATUS_OTHER_VALUE, label: 'Other' },
  ];
}

/** Whether a label matches a preset (including default Available). */
export function isAvailabilityStatusPreset(label?: string | null): boolean {
  const trimmed = label?.trim() ?? '';
  if (!trimmed || trimmed.toLowerCase() === 'available') return true;
  return AVAILABILITY_STATUS_OPTIONS.some(
    (option) => option.value.toLowerCase() === trimmed.toLowerCase()
  );
}

/**
 * Select value for the dropdown: preset value, '' for Available, or Other sentinel
 * when the stored label is custom.
 */
export function availabilityStatusSelectMode(label?: string | null): string {
  const trimmed = label?.trim() ?? '';
  if (!trimmed || trimmed.toLowerCase() === 'available') return '';
  const match = AVAILABILITY_STATUS_OPTIONS.find(
    (option) => option.value.toLowerCase() === trimmed.toLowerCase()
  );
  return match ? match.value : AVAILABILITY_STATUS_OTHER_VALUE;
}

/** Normalize a stored label for compare/save ('' for default Available). */
export function normalizeAvailabilityStatusSelectValue(label?: string | null): string {
  const trimmed = label?.trim() ?? '';
  if (!trimmed || trimmed.toLowerCase() === 'available') return '';
  const match = AVAILABILITY_STATUS_OPTIONS.find(
    (option) => option.value.toLowerCase() === trimmed.toLowerCase()
  );
  return match ? match.value : trimmed;
}

/** Resolve the public status line under the creator name. */
export function resolveAvailabilityStatusLabel(
  isAvailable: boolean | null | undefined,
  availabilityLabel?: string | null
): string | null {
  if (isAvailable == null) return null;
  if (!isAvailable) return 'Unavailable';
  const custom = availabilityLabel?.trim();
  return custom || 'Available';
}

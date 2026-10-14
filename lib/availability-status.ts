import { tr } from '@/lib/i18n/active';

/** Resolve the public status line under the creator name. */
export function resolveAvailabilityStatusLabel(
  isAvailable: boolean | null | undefined,
  availabilityLabel?: string | null
): string | null {
  if (isAvailable == null) return null;
  if (!isAvailable) return tr('Unavailable');
  const custom = availabilityLabel?.trim();
  return custom || tr('Available');
}

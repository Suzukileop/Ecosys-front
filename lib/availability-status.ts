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

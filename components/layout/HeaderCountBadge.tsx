const MAX_VISIBLE_COUNT = 99;

/** Red unread counter pinned to the top-right corner of a 36px header icon. */
export function HeaderCountBadge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span
      aria-hidden
      className="pointer-events-none absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#E5352B] px-1 text-[11px] font-semibold leading-none tabular-nums text-white ring-2 ring-white dark:ring-[#0A0A0A]"
    >
      {count > MAX_VISIBLE_COUNT ? `${MAX_VISIBLE_COUNT}+` : count}
    </span>
  );
}

const MAX_VISIBLE_COUNT = 99;

/** Unread counter pinned to the top-right corner of a 36px header icon — the brand orange pill,
 *  the one accent kept in the black / white X palette so new activity stands out. */
export function HeaderCountBadge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span
      aria-hidden
      className="pointer-events-none absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#FF5722] px-1 text-[11px] font-bold leading-none tabular-nums text-white ring-2 ring-white dark:ring-black"
    >
      {count > MAX_VISIBLE_COUNT ? `${MAX_VISIBLE_COUNT}+` : count}
    </span>
  );
}

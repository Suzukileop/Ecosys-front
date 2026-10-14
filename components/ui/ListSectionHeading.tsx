import type { ReactNode } from 'react';

/**
 * The heading above a list (providers, products, services, a shop's products) — set like My Profile's
 * section headings and News's "Latest": the list's name in 17px bold ink, then its count and what
 * narrows it in 15px regular secondary ink ("Products 12 · Digital"). One size step over the 15px
 * values below it, so the page reads heading → content without small caps.
 *
 * Needs the News token scope (`--gn-ink`, `--gn-ink2`), which every list page carries.
 */
export function ListSectionHeading({
  id,
  title,
  count,
  details = [],
  as: Tag = 'h2',
  live = false,
}: {
  id?: string;
  title: ReactNode;
  count?: number | null;
  /** What narrows the list ("Digital", "DevOps"); empty values are skipped. */
  details?: (string | null | undefined | false)[];
  as?: 'h2' | 'p';
  /** Announce changes (the count follows the filters). */
  live?: boolean;
}) {
  const detail = details.filter(Boolean).join(' · ');
  return (
    <Tag
      id={id}
      aria-live={live ? 'polite' : undefined}
      className="flex min-w-0 items-baseline gap-2 text-[17px] font-bold leading-[22px] tracking-[-0.01em] text-[color:var(--gn-ink)]"
    >
      <span className="shrink-0">{title}</span>
      {count != null ? (
        <span className="shrink-0 text-[15px] font-normal tracking-normal tabular-nums text-[color:var(--gn-ink2)]">{count}</span>
      ) : null}
      {detail ? (
        <span className="min-w-0 truncate text-[15px] font-normal tracking-normal text-[color:var(--gn-ink2)]">· {detail}</span>
      ) : null}
    </Tag>
  );
}

/**
 * A day boundary: a centred 12px medium label in secondary ink ("Today", "Mon, Sep 29"), on a soft
 * pill one tone off its column so it reads as a chapter mark in the thread rather than one more grey
 * timestamp among the bubbles' own. No rules (no hairlines), no small caps.
 */
export function DateSeparator({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-center pb-1 pt-7" role="separator" aria-label={label}>
      <span className="rounded-full bg-[color:var(--xm-chip)] px-3 py-1 text-[12px] font-medium leading-4 text-[color:var(--gn-ink2)]">{label}</span>
    </div>
  );
}

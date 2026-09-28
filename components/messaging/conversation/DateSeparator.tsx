/**
 * A day boundary is a structural mark, not a label: micro-caps at the section's
 * faint ink, flanked by two short hairlines. Nothing here competes with a message.
 */
export function DateSeparator({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-center gap-4 py-7" role="separator" aria-label={label}>
      <span className="h-px w-10 max-w-[15%] shrink bg-[var(--msg-hairline-strong)]" aria-hidden />
      <span className="msg-micro shrink-0 text-[var(--msg-ink-faint)]">{label}</span>
      <span className="h-px w-10 max-w-[15%] shrink bg-[var(--msg-hairline-strong)]" aria-hidden />
    </div>
  );
}

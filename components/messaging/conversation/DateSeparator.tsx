export function DateSeparator({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-center gap-2 py-3" role="separator" aria-label={label}>
      <span className="h-px w-8 max-w-[15%] shrink bg-[var(--cw-border,#E2E5E9)]" aria-hidden />
      <span className="shrink-0 text-[10px] font-semibold tracking-[0.08em] text-[var(--cw-text-muted,#9AA1AA)]">
        {label}
      </span>
      <span className="h-px w-8 max-w-[15%] shrink bg-[var(--cw-border,#E2E5E9)]" aria-hidden />
    </div>
  );
}

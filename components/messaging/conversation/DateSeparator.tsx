export function DateSeparator({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-center gap-2 py-3" role="separator" aria-label={label}>
      <span className="h-px w-8 max-w-[15%] shrink bg-[var(--cw-border,#E2E5E9)]" aria-hidden />
      <span className="shrink-0 text-[13px] font-semibold tracking-[0.06em] text-[var(--cw-text-secondary,#4B5563)]">
        {label}
      </span>
      <span className="h-px w-8 max-w-[15%] shrink bg-[var(--cw-border,#E2E5E9)]" aria-hidden />
    </div>
  );
}

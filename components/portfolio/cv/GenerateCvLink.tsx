/** Opens the CV generator (template picker + PDF export) in a new tab. */
export function GenerateCvLink({ iconsOnly = false }: { iconsOnly?: boolean }) {
  const icon = (
    <svg
      viewBox="0 0 24 24"
      className="h-[18px] w-[18px] shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M14 3.5H7.5a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2V8L14 3.5Z" />
      <path d="M14 3.5V8h4.5M12 11.5v5M9.5 14l2.5 2.5 2.5-2.5" />
    </svg>
  );

  if (iconsOnly) {
    return (
      <a
        href="/cv"
        target="_blank"
        rel="noopener"
        title="Generate CV"
        aria-label="Generate CV"
        className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#111111] text-white transition-opacity hover:opacity-85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5722]/40 dark:bg-white dark:text-[#111111]"
      >
        {icon}
      </a>
    );
  }

  return (
    <a
      href="/cv"
      target="_blank"
      rel="noopener"
      className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#111111] px-4 text-[15px] font-medium text-white transition-opacity hover:opacity-85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5722]/40 dark:bg-white dark:text-[#111111]"
    >
      {icon}
      Generate CV
    </a>
  );
}

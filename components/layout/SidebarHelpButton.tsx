'use client';

type SidebarHelpButtonProps = {
  collapsed: boolean;
};

/**
 * Help control in the sidebar footer. Expanded shows a labelled pill;
 * collapsed keeps a single icon square in the visible rail.
 */
export function SidebarHelpButton({ collapsed }: SidebarHelpButtonProps) {
  if (collapsed) {
    return (
      <button
        type="button"
        title="Help"
        aria-label="Help"
        className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-200 text-base transition-colors hover:bg-neutral-300 dark:bg-neutral-800 dark:hover:bg-neutral-700"
      >
        <span aria-hidden>💬</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      className="flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-neutral-200 px-3 text-sm font-semibold text-black transition hover:bg-neutral-300 dark:bg-neutral-800 dark:text-white dark:hover:bg-neutral-700"
    >
      <span aria-hidden className="text-base leading-none">
        💬
      </span>
      <span className="truncate">Help</span>
    </button>
  );
}

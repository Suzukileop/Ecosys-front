'use client';

import { enterBrowserFullscreen, exitBrowserFullscreen } from '@/lib/browser-fullscreen';

type SidebarFocusButtonProps = {
  collapsed: boolean;
  showExpandedContent: boolean;
  active: boolean;
  onActiveChange: (active: boolean) => void;
};

function FocusEnterIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V6a2 2 0 012-2h2M4 16v2a2 2 0 002 2h2M16 4h2a2 2 0 012 2v2M16 20h2a2 2 0 002-2v-2" />
      <circle cx="12" cy="12" r="2.5" />
    </svg>
  );
}

function FocusExitIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 9L5 5M5 5v3M5 5h3M15 9l4-4m0 0v3m0-3h-3M9 15l-4 4m0 0h3m-3 0v-3M15 15l4 4m0 0h-3m3 0v-3"
      />
    </svg>
  );
}

export function SidebarFocusButton({
  collapsed,
  showExpandedContent,
  active,
  onActiveChange,
}: SidebarFocusButtonProps) {
  const toggleFocus = async () => {
    try {
      if (active || document.fullscreenElement) {
        await exitBrowserFullscreen();
        onActiveChange(false);
        return;
      }
      await enterBrowserFullscreen();
      onActiveChange(true);
    } catch {
      onActiveChange(Boolean(document.fullscreenElement));
    }
  };

  const label = active ? 'Exit focus' : 'Focus';
  const title = active
    ? 'Exit focus — leave fullscreen'
    : 'Focus — enter fullscreen';

  if (collapsed) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <button
          type="button"
          onClick={() => void toggleFocus()}
          title={title}
          aria-label={label}
          aria-pressed={active}
          className={`flex h-8 w-8 items-center justify-center rounded-lg border shadow-sm transition ${
            active
              ? 'border-[#F97316]/40 bg-[#FFF7ED] text-[#EA580C] dark:border-[#F97316]/30 dark:bg-[#F97316]/10 dark:text-[#FB923C]'
              : 'border-neutral-200 bg-white text-neutral-500 hover:border-neutral-300 hover:text-[#F97316] dark:border-neutral-700 dark:bg-neutral-900 dark:hover:text-[#FB923C]'
          }`}
        >
          {active ? <FocusExitIcon className="h-4 w-4" /> : <FocusEnterIcon className="h-4 w-4" />}
        </button>
      </div>
    );
  }

  if (!showExpandedContent) {
    return <div className="h-full w-full rounded-full bg-neutral-200/70 dark:bg-neutral-800/80" aria-hidden />;
  }

  return (
    <button
      type="button"
      onClick={() => void toggleFocus()}
      title={title}
      aria-label={label}
      aria-pressed={active}
      className={`flex h-10 w-full items-center gap-2.5 rounded-full px-3.5 text-sm font-medium shadow-sm transition ${
        active
          ? 'bg-[#FFF7ED] text-[#EA580C] ring-1 ring-[#F97316]/30 dark:bg-[#F97316]/10 dark:text-[#FB923C] dark:ring-[#F97316]/25'
          : 'bg-white text-neutral-700 ring-1 ring-neutral-200 hover:text-[#EA580C] dark:bg-neutral-700 dark:text-neutral-200 dark:ring-neutral-600 dark:hover:text-[#FB923C]'
      }`}
    >
      {active ? <FocusExitIcon className="h-4 w-4 shrink-0" /> : <FocusEnterIcon className="h-4 w-4 shrink-0" />}
      <span className="truncate">{label}</span>
    </button>
  );
}

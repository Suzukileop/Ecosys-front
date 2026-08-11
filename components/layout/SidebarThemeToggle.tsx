'use client';

import { useTheme } from '@/components/landing/ThemeProvider';

type SidebarThemeToggleProps = {
  collapsed: boolean;
  showExpandedContent: boolean;
};

function SunIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
      />
    </svg>
  );
}

function MoonIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
      />
    </svg>
  );
}

export function SidebarThemeToggle({ collapsed, showExpandedContent }: SidebarThemeToggleProps) {
  const { theme, setTheme, toggle } = useTheme();
  const isDark = theme === 'dark';

  if (collapsed) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <button
          type="button"
          onClick={toggle}
          title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-200 bg-white text-neutral-500 shadow-sm transition hover:border-neutral-300 hover:text-[#F97316] dark:border-neutral-700 dark:bg-neutral-900 dark:hover:text-[#FB923C]"
        >
          {isDark ? <MoonIcon className="h-4 w-4" /> : <SunIcon className="h-4 w-4 text-[#F97316]" />}
        </button>
      </div>
    );
  }

  if (!showExpandedContent) {
    return <div className="h-full w-full rounded-full bg-neutral-200/70 dark:bg-neutral-800/80" aria-hidden />;
  }

  return (
    <div className="flex h-10 w-full rounded-xl border border-neutral-200/80 bg-white p-1 dark:border-neutral-700 dark:bg-neutral-900">
      <button
        type="button"
        onClick={() => setTheme('light')}
        aria-pressed={!isDark}
        className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition ${
          !isDark
            ? 'bg-neutral-100 text-neutral-900 dark:bg-neutral-700 dark:text-white'
            : 'text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200'
        }`}
      >
        <SunIcon className="h-3.5 w-3.5" />
        Light
      </button>
      <button
        type="button"
        onClick={() => setTheme('dark')}
        aria-pressed={isDark}
        className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition ${
          isDark
            ? 'bg-neutral-800 text-white'
            : 'text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200'
        }`}
      >
        <MoonIcon className="h-3.5 w-3.5" />
        Dark
      </button>
    </div>
  );
}

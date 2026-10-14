'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { LOCALE_NAMES, LOCALES, localeDir, type Locale } from '@/lib/i18n/config';
import { useLocale, useT } from '@/lib/i18n/I18nProvider';

/**
 * A globe and the current language's own name; opens the list of languages, each under its own name.
 * `tone="dark"` for dark surfaces (the landing footer).
 */
export function LanguageSwitcher({
  tone = 'light',
  placement = 'top',
  className = '',
}: {
  tone?: 'light' | 'dark';
  /** Where the list opens: above (a footer) or below (a header) the button. */
  placement?: 'top' | 'bottom';
  className?: string;
}) {
  const t = useT();
  const { locale, setLocale, switching } = useLocale();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('pointerdown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const pick = (next: Locale) => {
    setOpen(false);
    setLocale(next);
  };

  const dark = tone === 'dark';

  return (
    <div ref={rootRef} className={`relative inline-flex ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={t('Language: {language}', { language: LOCALE_NAMES[locale].native })}
        className={`inline-flex h-9 items-center gap-2 rounded-full px-3 text-[13px] font-medium normal-case tracking-normal transition-colors focus-visible:outline-none focus-visible:ring-2 ${
          dark
            ? 'text-white/80 hover:bg-white/10 hover:text-white focus-visible:ring-white/40'
            : 'text-[color:var(--gn-ink,#0F1419)] hover:bg-black/[0.05] focus-visible:ring-black/20 dark:hover:bg-white/10 dark:focus-visible:ring-white/30'
        } ${switching ? 'opacity-60' : ''}`}
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} aria-hidden>
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z" />
        </svg>
        <span lang={locale} dir={localeDir(locale)}>
          {LOCALE_NAMES[locale].native}
        </span>
        <svg className={`h-3 w-3 transition-transform ${open ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open ? (
        <ul
          id={listId}
          role="listbox"
          aria-label={t('Language')}
          className={`absolute end-0 z-50 w-52 rounded-xl p-1.5 normal-case tracking-normal shadow-[0_16px_40px_-16px_rgba(0,0,0,0.35)] ${
            placement === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'
          } ${
            dark
              ? 'bg-[#1A1A1A] ring-1 ring-white/10'
              : 'bg-white ring-1 ring-black/[0.08] dark:bg-[#16181C] dark:ring-white/10'
          }`}
        >
          {LOCALES.map((option) => {
            const active = option === locale;
            return (
              <li key={option} role="option" aria-selected={active}>
                <button
                  type="button"
                  onClick={() => pick(option)}
                  lang={option}
                  className={`flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-start text-[14px] transition-colors ${
                    dark
                      ? `text-white ${active ? 'bg-white/10' : 'hover:bg-white/[0.06]'}`
                      : `text-[#0F1419] dark:text-[#E7E9EA] ${active ? 'bg-black/[0.05] dark:bg-white/10' : 'hover:bg-black/[0.04] dark:hover:bg-white/[0.06]'}`
                  }`}
                >
                  <span dir={localeDir(option)} className={active ? 'font-semibold' : ''}>
                    {LOCALE_NAMES[option].native}
                  </span>
                  {active ? (
                    <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" d="m5 12.5 4.5 4.5L19 7.5" />
                    </svg>
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}

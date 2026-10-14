'use client';

import { useT } from '@/lib/i18n/I18nProvider';
/**
 * Opens the CV generator (template picker + PDF export) in a new tab — one row of My Portfolio's
 * "Your page" rail box: glyph, label, and the new-tab arrow on the right (the rail rows' anatomy).
 */
export function GenerateCvLink({ className = '' }: { className?: string }) {
  const t = useT();
  return (
    <a href="/cv" target="_blank" rel="noopener" className={className}>
      <svg
        viewBox="0 0 24 24"
        className="h-5 w-5 shrink-0"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M14 3.5H7.5a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2V8L14 3.5Z" />
        <path d="M14 3.5V8h4.5M12 11.5v5M9.5 14l2.5 2.5 2.5-2.5" />
      </svg>
      <span className="min-w-0 flex-1 truncate">{t('Generate CV')}</span>
      <span aria-hidden className="shrink-0 text-[13px] text-[color:var(--gn-ink2)]">
        ↗
      </span>
    </a>
  );
}

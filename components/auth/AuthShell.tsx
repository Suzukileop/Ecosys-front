'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { useT } from '@/lib/i18n/I18nProvider';

type AuthShellProps = {
  title: string;
  subtitle: string;
  /** "Don't have an account? Sign up" style switch, shown top-right. */
  switchPrompt: string;
  switchLabel: string;
  switchHref: string;
  children: ReactNode;
};

/**
 * Split auth layout: a quiet form column and a brand panel, in the landing's language — the
 * wordmark with its orange dot, pill buttons, and a brand column: the Skraft line set very large
 * on a full-bleed anthracite column, opened by an orange quote mark and signed with the name under it. The panel is decorative, so it only appears from `lg` up; below that the
 * form owns the screen.
 */
export function AuthShell({
  title,
  subtitle,
  switchPrompt,
  switchLabel,
  switchHref,
  children,
}: AuthShellProps) {
  const t = useT();
  return (
    <div className="min-h-[100dvh] bg-white dark:bg-[#0A0A0A] lg:grid lg:h-[100dvh] lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:overflow-hidden">
      <div className="flex min-h-[100dvh] flex-col lg:min-h-0 lg:overflow-y-auto">
        <header className="flex shrink-0 items-center justify-between gap-4 px-6 py-5 sm:px-10 lg:px-14">
          <Link
            href="/"
            className="inline-flex items-end text-[18px] font-semibold tracking-[-0.03em] text-[#111111] transition-opacity hover:opacity-70 dark:text-white"
          >
            Skraft
            <span aria-hidden className="mb-[5px] ml-0.5 h-[5px] w-[5px] rounded-full bg-[#FF5722]" />
          </Link>
          <p className="text-[14px] text-neutral-500 dark:text-neutral-400">
            <span className="hidden sm:inline">{switchPrompt} </span>
            <Link
              href={switchHref}
              className="font-medium text-[#111111] underline-offset-4 transition-colors hover:underline dark:text-white"
            >
              {switchLabel}
            </Link>
          </p>
        </header>

        <main className="flex flex-1 items-center justify-center px-6 py-10 sm:px-10 lg:px-14">
          <div className="w-full max-w-[400px]">
            <h1 className="text-[34px] font-medium leading-[1.1] tracking-[-0.03em] text-[#111111] dark:text-white sm:text-[40px]">
              {title}
            </h1>
            <p className="mt-3 text-[16px] leading-relaxed text-neutral-500 dark:text-neutral-400">{subtitle}</p>
            <div className="mt-9">{children}</div>
          </div>
        </main>

        <footer className="flex shrink-0 flex-wrap items-center justify-between gap-3 px-6 py-5 text-[13px] text-neutral-400 dark:text-neutral-500 sm:px-10 lg:px-14">
          <span>© {new Date().getFullYear()} Skraft</span>
          <nav className="flex items-center gap-5">
            <Link href="/terms" className="transition-colors hover:text-[#111111] dark:hover:text-white">
              Terms
            </Link>
            <Link href="/privacy" className="transition-colors hover:text-[#111111] dark:hover:text-white">
              Privacy
            </Link>
          </nav>
        </footer>
      </div>

      <aside className="relative hidden bg-[#1A1A1A] text-white lg:block">
        <div className="flex h-full flex-col items-start justify-center px-12 text-left xl:px-16">
          <span aria-hidden className="block h-[0.45em] text-[clamp(4rem,6vw,6rem)] font-medium leading-[0.85] text-[#FF5722]">
            &ldquo;
          </span>
          <p className="mt-8 max-w-[16ch] text-[clamp(2.75rem,4.4vw,4.75rem)] font-medium leading-[1.04] tracking-[-0.04em] text-white [text-wrap:balance]">
            {t.rich('The way you present yourself {rest}', {
              rest: <span className="block text-white/40">{t('speaks before you do.')}</span>,
            })}
          </p>
          <p aria-hidden className="mt-12 text-[28px] font-semibold tracking-[-0.04em] text-white">
            Skraft
          </p>
        </div>
      </aside>
    </div>
  );
}

import Image from 'next/image';
import Link from 'next/link';
import type { ReactNode } from 'react';

type AuthShellProps = {
  title: string;
  subtitle: string;
  /** "Don't have an account? Sign up" style switch, shown top-right. */
  switchPrompt: string;
  switchLabel: string;
  switchHref: string;
  image: { src: string; alt: string };
  children: ReactNode;
};

/**
 * Split auth layout: a quiet form column and an editorial photo panel. The photo is decorative,
 * so it only appears from `lg` up; below that the form owns the screen.
 */
export function AuthShell({
  title,
  subtitle,
  switchPrompt,
  switchLabel,
  switchHref,
  image,
  children,
}: AuthShellProps) {
  return (
    <div className="min-h-[100dvh] bg-white dark:bg-[#0A0A0A] lg:grid lg:h-[100dvh] lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:overflow-hidden">
      <div className="flex min-h-[100dvh] flex-col lg:min-h-0 lg:overflow-y-auto">
        <header className="flex shrink-0 items-center justify-between gap-4 px-6 py-5 sm:px-10 lg:px-14">
          <Link
            href="/"
            className="text-[17px] font-bold tracking-[-0.02em] text-[#111111] transition-opacity hover:opacity-70 dark:text-white"
          >
            Skraft
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
            <h1 className="text-[32px] font-semibold leading-[1.1] tracking-[-0.03em] text-[#111111] dark:text-white sm:text-[36px]">
              {title}
            </h1>
            <p className="mt-3 text-[15px] leading-relaxed text-neutral-500 dark:text-neutral-400">{subtitle}</p>
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

      <aside className="relative hidden p-3 lg:block">
        <div className="relative h-full overflow-hidden rounded-[20px] bg-[#EFEBE6] dark:bg-[#161616]">
          <Image
            src={image.src}
            alt={image.alt}
            fill
            priority
            sizes="(min-width: 1024px) 52vw, 0px"
            className="object-cover"
          />
        </div>
      </aside>
    </div>
  );
}

'use client';

import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBriefcase, faCube, faHandshake } from '@fortawesome/free-solid-svg-icons';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { useAuth } from '@/context/AuthContext';

type Shortcut = {
  id: 'service' | 'portfolio' | 'produit';
  label: string;
  href: string;
  icon: IconDefinition;
};

/** Service | Portfolio | Produit — Portfolio centered, Produit beside it. */
const SHORTCUTS: Shortcut[] = [
  {
    id: 'service',
    label: 'Service',
    href: '/marketplace/my-services',
    icon: faHandshake,
  },
  {
    id: 'portfolio',
    label: 'Portfolio',
    href: '/dashboard/portfolio',
    icon: faBriefcase,
  },
  {
    id: 'produit',
    label: 'Produit',
    href: '/marketplace/my-products?create=1',
    icon: faCube,
  },
];

type NewsCreateShortcutsProps = {
  className?: string;
};

/** Quick-create tiles above the News feed — always all three for creators. */
export function NewsCreateShortcuts({ className = '' }: NewsCreateShortcutsProps) {
  const { hasRole } = useAuth();

  if (!hasRole('ROLE_CREATOR')) return null;

  return (
    <div
      className={`grid w-full grid-cols-3 gap-3 sm:gap-4 ${className}`}
      aria-label="Create shortcuts"
    >
      {SHORTCUTS.map((item) => (
        <Link
          key={item.id}
          href={item.href}
          className="group relative flex min-h-[7.5rem] flex-col items-center justify-center gap-2.5 rounded-2xl border border-neutral-200 bg-neutral-100 px-3 py-5 text-center shadow-sm transition hover:bg-neutral-50 hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900 dark:hover:bg-neutral-800/80 sm:min-h-[8.25rem]"
        >
          <FontAwesomeIcon
            icon={item.icon}
            className="text-[1.65rem] text-neutral-600 transition group-hover:text-orange-500 dark:text-neutral-300 dark:group-hover:text-orange-400"
            aria-hidden
          />
          <span className="text-sm font-semibold tracking-tight text-neutral-800 sm:text-base dark:text-neutral-100">
            {item.label}
          </span>
          <span
            className="mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-full bg-orange-500 text-lg font-bold leading-none text-white shadow-sm transition group-hover:bg-orange-600"
            aria-hidden
          >
            +
          </span>
          <span className="sr-only">Create {item.label}</span>
        </Link>
      ))}
    </div>
  );
}

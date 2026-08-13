'use client';

import { type ReactNode } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { SidebarThemeToggle } from '@/components/layout/SidebarThemeToggle';
import { brandSolidBg, DASHBOARD_SIDEBAR_BG } from '@/components/landing/landingBrand';
import { dashboardNavItems } from '@/components/layout/dashboard/navConfig';

/** Expanded rail width — matches `w-64` / Tailwind 16rem. */
const SIDEBAR_EXPANDED_WIDTH = '16rem';
const SIDEBAR_COLLAPSED_WIDTH = '4.5rem';
const SIDEBAR_EASE = 'duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]';

type DashboardSidebarProps = {
  collapsed: boolean;
  onToggle: () => void;
};

function isActive(pathname: string, href: string) {
  if (href === '/dashboard') {
    return pathname === '/dashboard';
  }
  if (href === '/dashboard/home') {
    return pathname === '/dashboard/home' || pathname.startsWith('/dashboard/home/');
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

function SidebarCollapseIcon({ collapsed }: { collapsed: boolean }) {
  return (
    <svg
      className={`h-5 w-5 transition-transform ${SIDEBAR_EASE} ${collapsed ? 'rotate-180' : ''}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
    </svg>
  );
}

const navItemBaseClass =
  'flex h-10 w-full items-center gap-2.5 rounded-xl px-3 text-sm transition-colors';
const navItemInactiveClass =
  'font-medium text-neutral-500 hover:bg-neutral-100/80 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-900 dark:hover:text-neutral-100';
const navItemActiveClass = 'font-semibold text-orange-600 dark:text-orange-400';
const navItemComingSoonClass =
  'font-medium text-neutral-400 hover:bg-neutral-100/60 dark:text-neutral-600 dark:hover:bg-neutral-900/40';
const collapseButtonClass =
  'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-900 dark:hover:text-neutral-200';

/**
 * Label lives in a clipped flex column so its width can collapse without
 * shifting the icon row vertically or horizontally.
 */
function SidebarLabel({
  show,
  children,
  className = '',
}: {
  show: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`min-w-0 overflow-hidden whitespace-nowrap transition-[max-width,opacity] ${SIDEBAR_EASE} ${
        show ? 'max-w-[12rem] opacity-100' : 'max-w-0 opacity-0'
      } ${className}`}
      aria-hidden={!show}
    >
      {children}
    </span>
  );
}

export function DashboardSidebar({ collapsed, onToggle }: DashboardSidebarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams.toString();
  const { hasRole } = useAuth();

  const visibleItems = dashboardNavItems.filter((item) => {
    const isAgentOnly = hasRole('ROLE_AGENT') && !hasRole('ROLE_ADMIN');
    if (isAgentOnly) {
      return item.href === '/dashboard' || item.href === '/dashboard/agent';
    }
    return !item.roles || item.roles.some((role) => hasRole(role));
  });

  return (
    <aside
      className={`sticky top-0 flex h-screen shrink-0 flex-col overflow-hidden border-r border-neutral-100 ${DASHBOARD_SIDEBAR_BG} transition-[width] ${SIDEBAR_EASE} dark:border-neutral-800`}
      style={{ width: collapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_EXPANDED_WIDTH }}
      data-collapsed={collapsed ? 'true' : 'false'}
    >
      {/*
        Keep a fixed expanded layout and clip with the animating rail width.
        Icons stay on the same X/Y — labels are only clipped, not reflowed.
      */}
      <div className="flex h-full w-64 shrink-0 flex-col" style={{ width: SIDEBAR_EXPANDED_WIDTH }}>
        <div
          className={`relative flex h-[4.5rem] w-full shrink-0 items-center px-3 transition-[width] ${SIDEBAR_EASE}`}
          style={{ width: collapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_EXPANDED_WIDTH }}
        >
          <Link
            href="/dashboard"
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-sm font-bold text-white transition-opacity ${SIDEBAR_EASE} ${brandSolidBg} ${
              collapsed ? 'pointer-events-none absolute opacity-0' : 'opacity-100'
            }`}
            title="NoProbleme"
            tabIndex={collapsed ? -1 : undefined}
            aria-hidden={collapsed}
          >
            NP
          </Link>
          <button
            type="button"
            onClick={onToggle}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-expanded={!collapsed}
            className={`${collapseButtonClass} ${collapsed ? 'mx-auto' : 'ml-auto'}`}
          >
            <SidebarCollapseIcon collapsed={collapsed} />
          </button>
        </div>

        {/* Vertically centered like before; fixed row heights avoid jump during width animation. */}
        <nav
          className="flex min-h-0 flex-1 flex-col justify-center gap-8 overflow-x-hidden overflow-y-auto px-3 py-2"
          aria-label="Main navigation"
        >
          {visibleItems.map((item) => {
            const active = item.activeWhen
              ? item.activeWhen(pathname, search)
              : isActive(pathname, item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                title={collapsed ? item.label : undefined}
                className={`${navItemBaseClass} ${
                  active
                    ? navItemActiveClass
                    : item.comingSoon
                      ? navItemComingSoonClass
                      : navItemInactiveClass
                }`}
              >
                <span className="flex h-5 w-5 shrink-0 items-center justify-center">{item.icon}</span>
                <SidebarLabel show={!collapsed} className="flex flex-1 items-center gap-2">
                  <span className="min-w-0 flex-1 truncate">{item.label}</span>
                  {item.badge ? (
                    <span className="shrink-0 rounded-full bg-white/80 px-2 py-0.5 text-[10px] font-semibold text-orange-600 dark:bg-orange-500/20 dark:text-orange-300">
                      {item.badge}
                    </span>
                  ) : null}
                </SidebarLabel>
              </Link>
            );
          })}
        </nav>

        <div className="shrink-0 border-t border-neutral-100 px-3 pt-3 pb-4 dark:border-neutral-800">
          <SidebarThemeToggle collapsed={collapsed} />
        </div>
      </div>
    </aside>
  );
}

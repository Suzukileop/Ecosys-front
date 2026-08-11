'use client';

import { useEffect, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { SidebarThemeToggle } from '@/components/layout/SidebarThemeToggle';
import { brandSolidBg, DASHBOARD_SIDEBAR_BG } from '@/components/landing/landingBrand';
import { dashboardNavItems } from '@/components/layout/dashboard/navConfig';

const SIDEBAR_TRANSITION_MS = 300;
const SIDEBAR_GUTTER = 'px-3';

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
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d={collapsed ? 'M9 5l7 7-7 7' : 'M15 19l-7-7 7-7'}
      />
    </svg>
  );
}

const navItemBaseClass =
  'flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm transition-colors';
const navItemInactiveClass =
  'font-medium text-neutral-500 hover:bg-neutral-100/80 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-900 dark:hover:text-neutral-100';
const navItemActiveClass =
  'font-semibold text-orange-600 dark:text-orange-400';
const navItemComingSoonClass =
  'font-medium text-neutral-400 hover:bg-neutral-100/60 dark:text-neutral-600 dark:hover:bg-neutral-900/40';
const collapseButtonClass =
  'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-900 dark:hover:text-neutral-200';

function SidebarLabelPanel({
  show,
  children,
  className = '',
}: {
  show: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`min-w-0 flex-1 overflow-hidden transition-opacity duration-300 ease-in-out ${
        show ? 'opacity-100' : 'pointer-events-none opacity-0'
      } ${className}`}
    >
      {children}
    </div>
  );
}

export function DashboardSidebar({ collapsed, onToggle }: DashboardSidebarProps) {
  const pathname = usePathname();
  const { hasRole } = useAuth();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    'My Store': true,
  });
  const [showExpandedContent, setShowExpandedContent] = useState(!collapsed);

  useEffect(() => {
    if (collapsed) {
      setShowExpandedContent(false);
      return;
    }

    const timer = window.setTimeout(() => setShowExpandedContent(true), SIDEBAR_TRANSITION_MS);
    return () => window.clearTimeout(timer);
  }, [collapsed]);

  const visibleItems = dashboardNavItems.filter((item) => {
    const isAgentOnly = hasRole('ROLE_AGENT') && !hasRole('ROLE_ADMIN');
    if (isAgentOnly) {
      return item.href === '/dashboard' || item.href === '/dashboard/home' || item.href === '/dashboard/agent';
    }
    return !item.roles || item.roles.some((role) => hasRole(role));
  });

  return (
    <aside
      className={`sticky top-0 flex h-screen shrink-0 flex-col overflow-hidden border-r border-neutral-100 ${DASHBOARD_SIDEBAR_BG} transition-[width] duration-300 ease-in-out dark:border-neutral-800 ${
        collapsed ? 'w-[4.5rem]' : 'w-64'
      }`}
    >
      <div
        className={`flex h-[4.5rem] shrink-0 items-center ${
          collapsed ? 'justify-center' : `${SIDEBAR_GUTTER} justify-between`
        }`}
      >
        {!collapsed && (
          <Link href="/dashboard" className="shrink-0" title="NoProbleme">
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-sm font-bold text-white ${brandSolidBg}`}
            >
              NP
            </div>
          </Link>
        )}
        <button
          type="button"
          onClick={onToggle}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className={collapseButtonClass}
        >
          <SidebarCollapseIcon collapsed={collapsed} />
        </button>
      </div>

      <nav
        className={`flex min-h-0 flex-1 flex-col justify-center gap-7 overflow-x-hidden overflow-y-auto py-2 ${SIDEBAR_GUTTER}`}
        aria-label="Main navigation"
      >
        {visibleItems.map((item) => {
          const visibleChildren =
            item.children?.filter(
              (child) => !child.roles || child.roles.some((role) => hasRole(role))
            ) ?? [];
          const childActive = visibleChildren.some((child) => isActive(pathname, child.href));
          const active = item.activeWhen
            ? item.activeWhen(pathname) || childActive
            : childActive || isActive(pathname, item.href);
          const hasChildren = visibleChildren.length > 1;
          const isExpanded = expanded[item.label] ?? false;

          if (hasChildren && showExpandedContent) {
            return (
              <div key={item.href} className="space-y-1">
                <button
                  type="button"
                  onClick={() => setExpanded((prev) => ({ ...prev, [item.label]: !isExpanded }))}
                  className={`${navItemBaseClass} ${active ? navItemActiveClass : navItemInactiveClass}`}
                >
                  <span className="shrink-0">{item.icon}</span>
                  <span className="min-w-0 flex-1 truncate text-left">{item.label}</span>
                  {item.badge ? (
                    <span className="shrink-0 rounded-full bg-white/80 px-2 py-0.5 text-[10px] font-semibold text-orange-600 dark:bg-orange-500/20 dark:text-orange-300">
                      {item.badge}
                    </span>
                  ) : null}
                  <svg
                    className={`h-4 w-4 shrink-0 opacity-50 transition ${isExpanded ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {isExpanded && (
                  <div className="ml-4 space-y-1 border-l border-neutral-200 pl-3 dark:border-neutral-700">
                    {visibleChildren.map((child) => {
                      const childIsActive = isActive(pathname, child.href);
                      return (
                        <Link
                          key={child.href}
                          href={child.href}
                          className={`${navItemBaseClass} text-sm ${
                            childIsActive ? navItemActiveClass : navItemInactiveClass
                          }`}
                        >
                          <span className="min-w-0 flex-1 truncate">{child.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              title={!showExpandedContent ? item.label : undefined}
              className={`${navItemBaseClass} ${
                collapsed ? 'justify-center px-0' : ''
              } ${
                active
                  ? navItemActiveClass
                  : item.comingSoon
                    ? navItemComingSoonClass
                    : navItemInactiveClass
              }`}
            >
              <span className="shrink-0">{item.icon}</span>
              <SidebarLabelPanel show={showExpandedContent} className="flex items-center gap-2">
                <span className="min-w-0 flex-1 truncate">{item.label}</span>
                {item.badge ? (
                  <span className="shrink-0 rounded-full bg-white/80 px-2 py-0.5 text-[10px] font-semibold text-orange-600 dark:bg-orange-500/20 dark:text-orange-300">
                    {item.badge}
                  </span>
                ) : null}
              </SidebarLabelPanel>
            </Link>
          );
        })}
      </nav>

      <div className={`${SIDEBAR_GUTTER} shrink-0 border-t border-neutral-100 pt-3 pb-4 dark:border-neutral-800`}>
        <SidebarThemeToggle collapsed={collapsed} showExpandedContent={showExpandedContent} />
      </div>
    </aside>
  );
}

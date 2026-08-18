'use client';

import { type ReactNode, useState } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { SidebarUserProfile } from '@/components/layout/SidebarUserProfile';
import { DashboardHeaderSearch } from '@/components/layout/DashboardHeaderSearch';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { DASHBOARD_SIDEBAR_BG } from '@/components/landing/landingBrand';
import { dashboardNavItems } from '@/components/layout/dashboard/navConfig';
import { useCreatorAppRole } from '@/hooks/useCreatorAppRole';
import type { CreatorAppRole } from '@/lib/creator-app-role';
import type { Role } from '@/types/auth';

function matchesRoles(required: Role[] | undefined, hasRole: (role: Role) => boolean) {
  return !required || required.some((role) => hasRole(role));
}

function matchesAppRoles(
  required: CreatorAppRole[] | undefined,
  appRole: CreatorAppRole | null,
  appRoleReady: boolean
) {
  if (!required || required.length === 0) return true;
  if (!appRoleReady) return false;
  return appRole != null && required.includes(appRole);
}

function isHiddenForAppRole(
  hidden: CreatorAppRole[] | undefined,
  appRole: CreatorAppRole | null,
  appRoleReady: boolean
) {
  if (!hidden || hidden.length === 0) return false;
  // While the creator role loads, keep gated items hidden to avoid a forbidden-menu flash.
  if (!appRoleReady) return true;
  // Non-creators (null role) keep full explore access.
  if (appRole == null) return false;
  return hidden.includes(appRole);
}

/** Expanded rail width — matches `w-72` / Tailwind 18rem. */
const SIDEBAR_EXPANDED_WIDTH = '18rem';
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

function NavChevron({ open, show }: { open: boolean; show: boolean }) {
  return (
    <svg
      className={`h-4 w-4 shrink-0 transition-[transform,opacity] ${SIDEBAR_EASE} ${
        open ? 'rotate-180' : ''
      } ${show ? 'opacity-100' : 'opacity-0'}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );
}

function SidebarToggleIcon() {
  return (
    <svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.25}
      aria-hidden
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

const navItemBaseClass =
  'relative flex h-12 items-center rounded-xl text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/40';
const navItemExpandedClass = 'w-full gap-2.5 px-3';
/** Square hit/highlight area centered in the 4.5rem collapsed rail (nav has px-3). */
const navItemCollapsedClass = 'w-12 justify-center gap-0 px-0';
const navItemInactiveClass =
  'font-medium text-black hover:bg-neutral-200/80 dark:text-neutral-200 dark:hover:bg-neutral-800';
const navItemActiveClass =
  'font-semibold bg-neutral-200 text-black dark:bg-neutral-800 dark:text-white';
const navItemComingSoonClass =
  'font-medium text-black/50 hover:bg-neutral-200 dark:text-white/50 dark:hover:bg-neutral-800';
const navChildInactiveClass =
  'font-medium text-black hover:bg-neutral-200 dark:text-white dark:hover:bg-neutral-800';
const navChildActiveClass =
  'font-semibold bg-neutral-200 text-black dark:bg-neutral-800 dark:text-white';
const collapseButtonClass =
  'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-black transition hover:bg-neutral-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/40 dark:text-white dark:hover:bg-neutral-800';

function navItemLayoutClass(collapsed: boolean) {
  return collapsed ? navItemCollapsedClass : navItemExpandedClass;
}

/**
 * Label clips horizontally — never leaves the document flow vertically.
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
        show ? 'max-w-[14rem] opacity-100' : 'pointer-events-none max-w-0 opacity-0'
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
  const { hasRole, logout } = useAuth();
  const { appRole, ready: appRoleReady } = useCreatorAppRole();
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  const [logoutBusy, setLogoutBusy] = useState(false);

  const visibleItems = dashboardNavItems.filter((item) => {
    const isAgentOnly = hasRole('ROLE_AGENT') && !hasRole('ROLE_ADMIN');
    if (isAgentOnly) {
      return item.href === '/dashboard' || item.href === '/dashboard/agent';
    }
    if (!matchesRoles(item.roles, hasRole)) return false;
    if (!matchesAppRoles(item.appRoles, appRole, appRoleReady)) return false;
    if (isHiddenForAppRole(item.hiddenForAppRoles, appRole, appRoleReady)) return false;

    if (item.children?.length) {
      const visibleChildren = item.children.filter(
        (child) =>
          matchesRoles(child.roles, hasRole) &&
          matchesAppRoles(child.appRoles, appRole, appRoleReady) &&
          !isHiddenForAppRole(child.hiddenForAppRoles, appRole, appRoleReady)
      );
      return visibleChildren.length > 0;
    }

    return true;
  });

  const handleConfirmLogout = () => {
    setLogoutBusy(true);
    void logout()
      .then(() => {
        window.location.assign('/login');
      })
      .finally(() => {
        setLogoutBusy(false);
      });
  };

  return (
    <>
    <aside
      className={`sticky top-0 flex h-screen shrink-0 flex-col overflow-hidden border-r border-neutral-200 ${DASHBOARD_SIDEBAR_BG} transition-[width] ${SIDEBAR_EASE} dark:border-neutral-800`}
      style={{ width: collapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_EXPANDED_WIDTH }}
      data-collapsed={collapsed ? 'true' : 'false'}
    >
      {/*
        Fixed expanded layout clipped by the animating rail width.
        Icons keep the same X/Y — only labels are clipped, no vertical reflow.
      */}
      <div className="flex h-full shrink-0 flex-col" style={{ width: SIDEBAR_EXPANDED_WIDTH }}>
        <div className="relative flex h-[4.5rem] w-full shrink-0 items-center px-3">
          <button
            type="button"
            onClick={onToggle}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-expanded={!collapsed}
            className={collapseButtonClass}
          >
            <SidebarToggleIcon />
          </button>
          <SidebarLabel show={!collapsed} className="ml-2 text-base font-bold tracking-tight text-neutral-900 dark:text-white">
            Noproble
          </SidebarLabel>
        </div>

        <SidebarUserProfile collapsed={collapsed} />

        <div className="mb-2 mt-5 shrink-0 px-3">
          <hr className="border-neutral-200 dark:border-neutral-800" />
        </div>

        <div className="mb-3 shrink-0 px-3">
          <DashboardHeaderSearch variant="sidebar" collapsed={collapsed} />
        </div>

        <nav
          className="flex min-h-0 flex-1 flex-col justify-start gap-6 overflow-x-hidden overflow-y-auto px-3 pb-2 pt-3"
          aria-label="Main navigation"
        >
          {visibleItems.map((item) => {
            const visibleChildren = (item.children ?? []).filter(
              (child) =>
                matchesRoles(child.roles, hasRole) &&
                matchesAppRoles(child.appRoles, appRole, appRoleReady) &&
                !isHiddenForAppRole(child.hiddenForAppRoles, appRole, appRoleReady)
            );
            const childActive = visibleChildren.some((child) =>
              child.activeWhen ? child.activeWhen(pathname, search) : isActive(pathname, child.href)
            );
            const active = item.activeWhen
              ? item.activeWhen(pathname, search)
              : visibleChildren.length > 0
                ? childActive
                : isActive(pathname, item.href);
            const collapsedTarget =
              visibleChildren.find((child) =>
                child.activeWhen ? child.activeWhen(pathname, search) : isActive(pathname, child.href)
              )?.href ??
              visibleChildren[0]?.href ??
              item.href;

            const groupKey = `${item.label}-${item.href}`;
            const groupOpen = openGroups[groupKey] ?? childActive;
            const showChildren = groupOpen && !collapsed;

            if (visibleChildren.length === 0) {
              return (
                <div key={groupKey} className="flex flex-col">
                  <Link
                    href={item.href}
                    title={collapsed ? item.label : undefined}
                    className={`${navItemBaseClass} ${navItemLayoutClass(collapsed)} ${
                      active
                        ? navItemActiveClass
                        : item.comingSoon
                          ? navItemComingSoonClass
                          : navItemInactiveClass
                    }`}
                  >
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center">{item.icon}</span>
                    {!collapsed ? (
                      <SidebarLabel show className="flex flex-1 items-center gap-2">
                        <span className="min-w-0 flex-1 truncate">{item.label}</span>
                        {item.badge ? (
                          <span className="shrink-0 rounded-full bg-white/80 px-2 py-0.5 text-[10px] font-semibold text-orange-600 dark:bg-orange-500/20 dark:text-orange-300">
                            {item.badge}
                          </span>
                        ) : null}
                      </SidebarLabel>
                    ) : null}
                  </Link>
                </div>
              );
            }

            return (
              <div key={groupKey} className="flex flex-col">
                {collapsed ? (
                  <Link
                    href={collapsedTarget}
                    title={item.label}
                    className={`${navItemBaseClass} ${navItemLayoutClass(true)} ${
                      active ? navItemActiveClass : navItemInactiveClass
                    }`}
                  >
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center">{item.icon}</span>
                  </Link>
                ) : (
                  <button
                    type="button"
                    aria-expanded={groupOpen}
                    onClick={() =>
                      setOpenGroups((prev) => ({
                        ...prev,
                        [groupKey]: !(prev[groupKey] ?? childActive),
                      }))
                    }
                    className={`${navItemBaseClass} ${navItemLayoutClass(false)} ${navItemInactiveClass}`}
                  >
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center">{item.icon}</span>
                    <SidebarLabel show className="flex min-w-0 flex-1 items-center">
                      <span className="min-w-0 flex-1 truncate text-left">{item.label}</span>
                    </SidebarLabel>
                    <NavChevron open={groupOpen} show />
                  </button>
                )}

                <div
                  className={`grid transition-[grid-template-rows,opacity] ${SIDEBAR_EASE} ${
                    showChildren ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="relative mt-1 flex flex-col gap-1.5">
                      <span
                        aria-hidden
                        className="pointer-events-none absolute bottom-5 top-[-0.625rem] w-px bg-neutral-300 dark:bg-neutral-600"
                        style={{ left: '1.375rem' }}
                      />
                      {visibleChildren.map((child) => {
                        const childIsActive = child.activeWhen
                          ? child.activeWhen(pathname, search)
                          : isActive(pathname, child.href);
                        return (
                          <div key={child.href} className="relative">
                            <span
                              aria-hidden
                              className="pointer-events-none absolute top-1/2 h-px w-[1.125rem] -translate-y-1/2 bg-neutral-300 dark:bg-neutral-600"
                              style={{ left: '1.375rem' }}
                            />
                            <Link
                              href={child.href}
                              tabIndex={showChildren ? undefined : -1}
                              className={`ml-10 flex h-10 items-center gap-2.5 rounded-lg px-2 text-sm transition-colors ${
                                childIsActive ? navChildActiveClass : navChildInactiveClass
                              }`}
                            >
                              <span
                                className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                                  childIsActive ? 'bg-black dark:bg-white' : 'bg-neutral-400 dark:bg-neutral-500'
                                }`}
                                aria-hidden
                              />
                              {child.icon ? (
                                <span className="flex h-4 w-4 shrink-0 items-center justify-center">
                                  {child.icon}
                                </span>
                              ) : null}
                              <span className="min-w-0 truncate">{child.label}</span>
                            </Link>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </nav>

        <div className="shrink-0 border-t border-neutral-200 px-3 pt-3 pb-4 dark:border-neutral-800">
          <button
            type="button"
            onClick={() => setLogoutConfirmOpen(true)}
            title="Log out"
            aria-label="Log out"
            className={`mb-2 flex h-10 items-center rounded-xl text-sm font-semibold text-black transition hover:bg-neutral-200 hover:text-[#EA580C] dark:text-white dark:hover:bg-neutral-800 ${
              collapsed ? 'w-10 justify-center gap-0 px-0' : 'w-full gap-2.5 px-3'
            }`}
          >
            <svg
              className="h-5 w-5 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            {!collapsed ? <SidebarLabel show>Log out</SidebarLabel> : null}
          </button>
        </div>
      </div>
    </aside>
    <ConfirmDialog
      open={logoutConfirmOpen}
      title="Log out?"
      description="You will be signed out of your account on this device."
      confirmLabel="Log out"
      cancelLabel="Cancel"
      tone="neutral"
      busy={logoutBusy}
      onConfirm={handleConfirmLogout}
      onCancel={() => {
        if (!logoutBusy) setLogoutConfirmOpen(false);
      }}
    />
    </>
  );
}

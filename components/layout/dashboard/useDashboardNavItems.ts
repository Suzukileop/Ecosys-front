'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCreatorAppRole } from '@/hooks/useCreatorAppRole';
import { dashboardNavItems, type DashboardNavChild, type DashboardNavItem } from '@/components/layout/dashboard/navConfig';
import type { CreatorAppRole } from '@/lib/creator-app-role';
import type { Role } from '@/types/auth';

/**
 * The one place that decides *which* nav entries a given account may see and which of them is
 * active. Both navigation surfaces read it — the left rail and the top bar — so the two can never
 * disagree about the active item, and the role gating below only ever has to be corrected once.
 */

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

export function isNavActive(pathname: string, href: string) {
  if (href === '/dashboard') {
    return pathname === '/dashboard';
  }
  if (href === '/dashboard/home') {
    return pathname === '/dashboard/home' || pathname.startsWith('/dashboard/home/');
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export type ResolvedNavItem = {
  item: DashboardNavItem;
  /** Children this account may see; empty for a leaf entry. */
  children: DashboardNavChild[];
  /** True when the entry itself, or any of its visible children, matches the route. */
  active: boolean;
  /** True when the match comes from a child rather than the entry itself. */
  childActive: boolean;
  /** Where a single click should land when the group is not expanded. */
  target: string;
  key: string;
};

export function useDashboardNavItems(): ResolvedNavItem[] {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams.toString();
  const { hasRole } = useAuth();
  const { appRole, ready: appRoleReady } = useCreatorAppRole();

  const childVisible = (child: DashboardNavChild) =>
    matchesRoles(child.roles, hasRole) &&
    matchesAppRoles(child.appRoles, appRole, appRoleReady) &&
    !isHiddenForAppRole(child.hiddenForAppRoles, appRole, appRoleReady);

  return dashboardNavItems
    .filter((item) => {
      const isAgentOnly = hasRole('ROLE_AGENT') && !hasRole('ROLE_ADMIN');
      if (isAgentOnly) {
        return item.href === '/dashboard' || item.href === '/dashboard/agent';
      }
      if (!matchesRoles(item.roles, hasRole)) return false;
      if (!matchesAppRoles(item.appRoles, appRole, appRoleReady)) return false;
      if (isHiddenForAppRole(item.hiddenForAppRoles, appRole, appRoleReady)) return false;
      if (item.children?.length) return item.children.filter(childVisible).length > 0;
      return true;
    })
    .map((item) => {
      const children = (item.children ?? []).filter(childVisible);
      const childActive = children.some((child) =>
        child.activeWhen ? child.activeWhen(pathname, search) : isNavActive(pathname, child.href)
      );
      const active = item.activeWhen
        ? item.activeWhen(pathname, search)
        : children.length > 0
          ? childActive
          : isNavActive(pathname, item.href);
      const target =
        children.find((child) =>
          child.activeWhen ? child.activeWhen(pathname, search) : isNavActive(pathname, child.href)
        )?.href ??
        children[0]?.href ??
        item.href;

      return { item, children, active, childActive, target, key: `${item.label}-${item.href}` };
    });
}

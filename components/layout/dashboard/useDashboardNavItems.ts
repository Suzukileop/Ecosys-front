'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCreatorAppRole } from '@/hooks/useCreatorAppRole';
import { dashboardNavItems, type DashboardNavChild, type DashboardNavItem } from '@/components/layout/dashboard/navConfig';
import type { CreatorAppRole } from '@/lib/creator-app-role';
import { isPathWithin } from '@/lib/routes';
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
  return isPathWithin(pathname, href);
}

type ResolvedNavItem = {
  item: DashboardNavItem;
  /** Children this account may see — empty for a leaf entry *and* for a group left with one. */
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
      if (!matchesRoles(item.roles, hasRole)) return false;
      if (!matchesAppRoles(item.appRoles, appRole, appRoleReady)) return false;
      if (isHiddenForAppRole(item.hiddenForAppRoles, appRole, appRoleReady)) return false;
      if (item.children?.length) return item.children.filter(childVisible).length > 0;
      return true;
    })
    .map((item) => {
      const visibleChildren = (item.children ?? []).filter(childVisible);
      const childActive = visibleChildren.some((child) =>
        child.activeWhen ? child.activeWhen(pathname, search) : isNavActive(pathname, child.href)
      );
      const active = item.activeWhen
        ? item.activeWhen(pathname, search)
        : visibleChildren.length > 0
          ? childActive
          : isNavActive(pathname, item.href);
      const target =
        visibleChildren.find((child) =>
          child.activeWhen ? child.activeWhen(pathname, search) : isNavActive(pathname, child.href)
        )?.href ??
        visibleChildren[0]?.href ??
        item.href;

      /*
       * A menu of one is not a menu. Both Providers and Products declare an ungated "Explore"
       * child plus a role-gated management child, so an account that cannot see the second one
       * would otherwise get a dropdown that opens onto a single row repeating the entry above it.
       * Collapsing here rather than in either nav surface keeps the top bar and the mobile sheet
       * agreeing, which is this hook's whole reason to exist — and `target` is already resolved,
       * so the collapsed entry still points at the right place.
       */
      const children = visibleChildren.length > 1 ? visibleChildren : [];

      return { item, children, active, childActive, target, key: `${item.label}-${item.href}` };
    });
}

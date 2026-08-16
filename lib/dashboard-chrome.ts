/** Coordinates exclusive open state between dashboard sidebar and conversation details. */

export const MESSAGING_DETAILS_OPEN_EVENT = 'messaging-details-open';
export const DASHBOARD_SIDEBAR_EXPAND_EVENT = 'dashboard-sidebar-expand';

export function notifyMessagingDetailsOpen(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(MESSAGING_DETAILS_OPEN_EVENT));
}

export function notifyDashboardSidebarExpand(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(DASHBOARD_SIDEBAR_EXPAND_EVENT));
}

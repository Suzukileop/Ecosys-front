/** Coordinates exclusive open state between dashboard sidebar and conversation details. */

export const MESSAGING_DETAILS_OPEN_EVENT = 'messaging-details-open';
export const DASHBOARD_SIDEBAR_EXPAND_EVENT = 'dashboard-sidebar-expand';

function dispatchDeferred(eventName: string): void {
  if (typeof window === 'undefined') return;
  // Defer so listeners never setState during another component's render/updater.
  queueMicrotask(() => {
    window.dispatchEvent(new CustomEvent(eventName));
  });
}

export function notifyMessagingDetailsOpen(): void {
  dispatchDeferred(MESSAGING_DETAILS_OPEN_EVENT);
}

export function notifyDashboardSidebarExpand(): void {
  dispatchDeferred(DASHBOARD_SIDEBAR_EXPAND_EVENT);
}

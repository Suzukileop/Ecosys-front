/** Coordinates exclusive open state between dashboard sidebar and conversation details. */

export const MESSAGING_DETAILS_OPEN_EVENT = 'messaging-details-open';
export const DASHBOARD_SIDEBAR_EXPAND_EVENT = 'dashboard-sidebar-expand';

const SIDEBAR_COLLAPSED_STORAGE_KEY = 'noproble.dashboard.sidebar-collapsed';

const sidebarCollapsedListeners = new Set<() => void>();

function readSidebarCollapsed(): boolean {
  try {
    return window.localStorage.getItem(SIDEBAR_COLLAPSED_STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

function writeSidebarCollapsed(collapsed: boolean) {
  try {
    window.localStorage.setItem(SIDEBAR_COLLAPSED_STORAGE_KEY, collapsed ? '1' : '0');
  } catch {
    /* ignore quota / private mode */
  }
}

function emitSidebarCollapsedChange() {
  sidebarCollapsedListeners.forEach((listener) => listener());
}

/** SSR snapshot — expanded rail matches server markup. */
export function getSidebarCollapsedServerSnapshot(): boolean {
  return false;
}

export function getSidebarCollapsedSnapshot(): boolean {
  return readSidebarCollapsed();
}

export function subscribeSidebarCollapsed(onStoreChange: () => void): () => void {
  sidebarCollapsedListeners.add(onStoreChange);
  return () => {
    sidebarCollapsedListeners.delete(onStoreChange);
  };
}

export function setSidebarCollapsed(collapsed: boolean): void {
  writeSidebarCollapsed(collapsed);
  emitSidebarCollapsedChange();
}

export function toggleSidebarCollapsedStore(): boolean {
  const next = !readSidebarCollapsed();
  setSidebarCollapsed(next);
  return next;
}

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

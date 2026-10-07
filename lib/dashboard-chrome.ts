/** Coordinates exclusive open state between dashboard sidebar and conversation details / portfolio settings. */

export const MESSAGING_DETAILS_OPEN_EVENT = 'messaging-details-open';
export const PORTFOLIO_SETTINGS_OPEN_EVENT = 'portfolio-settings-open';
export const DASHBOARD_SIDEBAR_EXPAND_EVENT = 'dashboard-sidebar-expand';

const SIDEBAR_COLLAPSED_STORAGE_KEY = 'noproble.dashboard.sidebar-collapsed';

const sidebarCollapsedListeners = new Set<() => void>();

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

export function setSidebarCollapsed(collapsed: boolean): void {
  writeSidebarCollapsed(collapsed);
  emitSidebarCollapsedChange();
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

export function notifyPortfolioSettingsOpen(): void {
  dispatchDeferred(PORTFOLIO_SETTINGS_OPEN_EVENT);
}

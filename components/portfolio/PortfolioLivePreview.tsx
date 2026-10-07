'use client';

import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react';
import dynamic from 'next/dynamic';
import { APP_GROUND } from '@/components/landing/landingBrand';
import { usePortfolioSettings } from '@/components/portfolio/use-portfolio-settings';
import { buildCreatorPortfolioPath } from '@/lib/portfolio-url';
import { enterBrowserFullscreen, exitBrowserFullscreen, getBrowserFullscreenElement } from '@/lib/browser-fullscreen';
import {
  DASHBOARD_SIDEBAR_EXPAND_EVENT,
  notifyPortfolioSettingsOpen,
} from '@/lib/dashboard-chrome';
import {
  EMPTY_PORTFOLIO_STUDIO_PREVIEW_META,
  isPortfolioStudioPreviewMessage,
  PORTFOLIO_STUDIO_PREVIEW_SOURCE,
  previewAnchorForSettingsSection,
  withPortfolioStudioEmbed,
  type PortfolioStudioPreviewMeta,
} from '@/lib/portfolio-studio-preview';

const loadSettingsPanel = () => import('@/components/portfolio/PortfolioSettingsModal');

const PortfolioSettingsModal = dynamic(() => loadSettingsPanel().then((m) => m.PortfolioSettingsModal), {
  ssr: false,
});

type PreviewDevice = 'mobile' | 'tablet' | 'desktop';

const STROKE = 1.25;
const MOBILE_PREVIEW_WIDTH = 390;
const TABLET_PREVIEW_WIDTH = 768;
const PREVIEW_MIN_WIDTH = 320;
const PREVIEW_WIDTH_SNAPS = [320, 360, 375, 390, 400, 414, 430, 768, 834, 1024, 1280, 1440];

function ExternalLinkIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={STROKE} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
    </svg>
  );
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={STROKE} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

function RefreshIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={STROKE} aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
      />
    </svg>
  );
}

function FocusEnterIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={STROKE} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 9V5h4M20 9V5h-4M4 15v4h4M20 15v4h-4" />
    </svg>
  );
}

function FocusExitIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={STROKE} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H5v4M15 5h4v4M9 19H5v-4M15 19h4v-4" />
    </svg>
  );
}

function GearIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={STROKE} aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
      />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function MobileDeviceIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={STROKE} aria-hidden>
      <rect x="8" y="3.5" width="8" height="17" rx="1.5" />
      <path strokeLinecap="round" d="M11 17.5h2" />
    </svg>
  );
}

function TabletDeviceIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={STROKE} aria-hidden>
      <rect x="5" y="3.5" width="14" height="17" rx="1.5" />
      <path strokeLinecap="round" d="M11 17.5h2" />
    </svg>
  );
}

function DesktopDeviceIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={STROKE} aria-hidden>
      <rect x="3" y="4" width="18" height="12" rx="1.5" />
      <path strokeLinecap="round" d="M8 20h8M12 16v4" />
    </svg>
  );
}

const chromeFocusRing =
  'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-black/20 dark:focus-visible:ring-white/30';
const chromeIconClass = `group relative inline-flex h-9 w-9 items-center justify-center rounded-md transition-colors duration-200 ${chromeFocusRing}`;
const chromeIconIdle =
  'text-[#222222]/70 hover:text-[#0A0A0A] dark:text-white/55 dark:hover:text-white';
const chromeIconPressed = 'text-[#0A0A0A] dark:text-white';

function ChromeIcon({
  label,
  children,
  href,
  onClick,
  pressed,
  expanded,
  controls,
}: {
  label: string;
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  pressed?: boolean;
  expanded?: boolean;
  controls?: string;
}) {
  const tip = (
    <span
      role="tooltip"
      className="pointer-events-none absolute left-1/2 top-full z-40 mt-2 -translate-x-1/2 whitespace-nowrap rounded-md bg-neutral-950 px-2 py-1 text-[10px] font-medium tracking-wide text-white opacity-0 shadow-[0_8px_20px_rgba(0,0,0,0.28)] transition duration-150 group-hover:opacity-100 group-focus-visible:opacity-100"
    >
      {label}
    </span>
  );
  const className = `${chromeIconClass} ${pressed ? chromeIconPressed : chromeIconIdle}`;

  if (href) {
    return (
      <a href={href} target="_blank" rel="noreferrer" aria-label={label} className={className}>
        {children}
        {tip}
      </a>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={pressed}
      aria-expanded={expanded}
      aria-controls={controls}
      className={className}
    >
      {children}
      {tip}
    </button>
  );
}

const DEVICE_CYCLE: readonly PreviewDevice[] = ['desktop', 'tablet', 'mobile'];

const DEVICE_META: Record<
  PreviewDevice,
  { label: string; Icon: (props: { className?: string }) => ReactNode }
> = {
  desktop: { label: 'Desktop', Icon: DesktopDeviceIcon },
  tablet: { label: 'Tablet', Icon: TabletDeviceIcon },
  mobile: { label: 'Mobile', Icon: MobileDeviceIcon },
};

function DeviceCycleButton({
  device,
  onSelect,
}: {
  device: PreviewDevice;
  onSelect: (device: PreviewDevice) => void;
}) {
  const next = DEVICE_CYCLE[(DEVICE_CYCLE.indexOf(device) + 1) % DEVICE_CYCLE.length];
  const current = DEVICE_META[device];

  return (
    <button
      type="button"
      onClick={() => onSelect(next)}
      aria-label={`${current.label} preview — switch to ${DEVICE_META[next].label}`}
      title={`Switch to ${DEVICE_META[next].label}`}
      className={`inline-flex h-9 w-9 items-center justify-center rounded-md text-[#222222] transition-transform duration-200 active:scale-90 dark:text-white ${chromeFocusRing}`}
    >
      <span className="relative block h-5 w-5">
        {DEVICE_CYCLE.map((key) => {
          const { Icon } = DEVICE_META[key];
          const shown = key === device;
          return (
            <span
              key={key}
              aria-hidden
              className={`absolute inset-0 transition-[opacity,transform] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                shown ? 'scale-100 opacity-100' : 'scale-75 opacity-0'
              }`}
            >
              <Icon className="h-5 w-5" />
            </span>
          );
        })}
      </span>
    </button>
  );
}

/** Derive device preset from the current preview width. */
function resolvePreviewDevice(width: number | null): PreviewDevice {
  if (width == null) return 'desktop';
  if (width <= 480) return 'mobile';
  if (width <= 900) return 'tablet';
  return 'desktop';
}

function snapPreviewWidth(width: number, container: number): number | null {
  if (!Number.isFinite(container) || container <= PREVIEW_MIN_WIDTH) return null;
  if (width >= container - 12) return null;
  const clamped = Math.min(container, Math.max(PREVIEW_MIN_WIDTH, width));
  let best = clamped;
  let bestDist = 28;
  for (const snap of PREVIEW_WIDTH_SNAPS) {
    if (snap >= container - 12) continue;
    const dist = Math.abs(snap - clamped);
    if (dist < bestDist) {
      best = snap;
      bestDist = dist;
    }
  }
  return Math.round(best);
}

function PreviewResizeHandle({
  side,
  active,
  onPointerDown,
  onReset,
}: {
  side: 'left' | 'right';
  active: boolean;
  onPointerDown: (side: 'left' | 'right', event: ReactPointerEvent<HTMLButtonElement>) => void;
  onReset: () => void;
}) {
  return (
    <div
      className={`pointer-events-none absolute inset-y-0 z-20 flex w-3 items-center justify-center ${
        side === 'left' ? 'left-0' : 'right-0'
      }`}
    >
      <button
        type="button"
        aria-label={side === 'left' ? 'Resize preview from the left' : 'Resize preview from the right'}
        title="Drag to resize · double-click for full width"
        className="pointer-events-auto flex h-11 w-3 touch-none cursor-ew-resize items-center justify-center border-0 bg-transparent p-0"
        onPointerDown={(event) => onPointerDown(side, event)}
        onDoubleClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          onReset();
        }}
      >
        <span
          className={`h-11 w-1 rounded-full transition-[background-color,opacity] duration-150 ${
            active
              ? 'bg-neutral-900 opacity-100 dark:bg-white'
              : 'bg-neutral-900/25 opacity-70 hover:opacity-100 dark:bg-white/25'
          }`}
        />
      </button>
    </div>
  );
}

export function PortfolioLivePreview({
  creatorId,
  username,
}: {
  creatorId: string;
  username?: string | null;
}) {
  const [frameKey, setFrameKey] = useState(0);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsMounted, setSettingsMounted] = useState(false);
  if (settingsOpen && !settingsMounted) setSettingsMounted(true);
  const [focusActive, setFocusActive] = useState(false);
  const [previewMeta, setPreviewMeta] = useState<PortfolioStudioPreviewMeta>(
    EMPTY_PORTFOLIO_STUDIO_PREVIEW_META
  );
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const previewRootRef = useRef<HTMLDivElement>(null);
  const previewColumnRef = useRef<HTMLDivElement>(null);
  const iframeReadyRef = useRef(false);
  const pendingPreviewAnchorRef = useRef<string | null>(null);
  const containerWidthRef = useRef(0);
  const previewWidthRef = useRef<number | null>(null);
  const dragRef = useRef<{
    side: 'left' | 'right';
    startX: number;
    startWidth: number;
    container: number;
  } | null>(null);
  const dragStopRef = useRef<(() => void) | null>(null);

  const [previewWidth, setPreviewWidth] = useState<number | null>(null);
  const [resizingPreview, setResizingPreview] = useState(false);
  previewWidthRef.current = previewWidth;

  const path = buildCreatorPortfolioPath(creatorId, username);
  const embedPath = withPortfolioStudioEmbed(path);

  const {
    settings,
    hydrated,
    persistStatus,
    updateSection,
    resetSettings,
    resetBuiltinTheme,
    setThemeId,
    updateNavigation,
    updateGlobal,
    flushPendingSave,
    saveCustomTheme,
    renameCustomTheme,
    duplicateTheme,
    deleteCustomTheme,
    setColorMode,
    patchGlobalPalette,
    setGlobalPalettePair,
    undoSettings,
    redoSettings,
    canUndo,
    canRedo,
  } = usePortfolioSettings(creatorId, { canEdit: true });

  const hydratedRef = useRef(hydrated);
  const settingsRef = useRef(settings);
  hydratedRef.current = hydrated;
  settingsRef.current = settings;

  const setColorModeRef = useRef(setColorMode);
  setColorModeRef.current = setColorMode;

  const postSettingsToPreview = useCallback(() => {
    const target = iframeRef.current?.contentWindow;
    if (!target || !iframeReadyRef.current || !hydratedRef.current) return;
    target.postMessage(
      {
        source: PORTFOLIO_STUDIO_PREVIEW_SOURCE,
        type: 'apply-settings',
        settings: settingsRef.current,
      },
      window.location.origin
    );
  }, []);

  const postScrollToPreview = useCallback((sectionId: string) => {
    const target = iframeRef.current?.contentWindow;
    if (!target || !iframeReadyRef.current) {
      pendingPreviewAnchorRef.current = sectionId;
      return;
    }
    pendingPreviewAnchorRef.current = null;
    target.postMessage(
      {
        source: PORTFOLIO_STUDIO_PREVIEW_SOURCE,
        type: 'scroll-to-section',
        sectionId,
      },
      window.location.origin
    );
  }, []);

  const focusPreviewSection = useCallback(
    (sectionId: string) => {
      const anchor = previewAnchorForSettingsSection(sectionId);
      if (!anchor) return;
      postScrollToPreview(anchor);
    },
    [postScrollToPreview]
  );

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (!isPortfolioStudioPreviewMessage(event.data)) return;
      if (event.data.type === 'ready' || event.data.type === 'meta') {
        setPreviewMeta(event.data.meta);
        if (event.data.type === 'ready') {
          iframeReadyRef.current = true;
          postSettingsToPreview();
          const pending = pendingPreviewAnchorRef.current;
          if (pending) {
            pendingPreviewAnchorRef.current = null;
            iframeRef.current?.contentWindow?.postMessage(
              {
                source: PORTFOLIO_STUDIO_PREVIEW_SOURCE,
                type: 'scroll-to-section',
                sectionId: pending,
              },
              window.location.origin
            );
          }
        }
        return;
      }
      if (event.data.type === 'color-mode-change') {
        setColorModeRef.current(event.data.mode === 'light' ? 'light' : 'dark');
      }
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [postSettingsToPreview]);

  useEffect(() => {
    postSettingsToPreview();
  }, [postSettingsToPreview, settings, hydrated]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const isComma = event.key === ',' || event.code === 'Comma';
      if (!isComma || !(event.metaKey || event.ctrlKey)) return;
      const target = event.target as HTMLElement | null;
      const tag = target?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || target?.isContentEditable) return;
      event.preventDefault();
      setSettingsOpen((open) => {
        if (open) flushPendingSave();
        return !open;
      });
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [flushPendingSave]);

  const closeSettings = useCallback(() => {
    flushPendingSave();
    setSettingsOpen(false);
  }, [flushPendingSave]);

  // The settings panel stays out of the first load, then downloads while the browser is idle
  // so opening it is instant.
  useEffect(() => {
    if (typeof window.requestIdleCallback === 'function') {
      const id = window.requestIdleCallback(() => void loadSettingsPanel());
      return () => window.cancelIdleCallback(id);
    }
    const id = window.setTimeout(() => void loadSettingsPanel(), 2000);
    return () => window.clearTimeout(id);
  }, []);

  // Exclusive-open with the main dashboard sidebar — opening Settings collapses it,
  // and expanding it back closes Settings, so only one is ever open at a time.
  useEffect(() => {
    if (settingsOpen) notifyPortfolioSettingsOpen();
  }, [settingsOpen]);

  useEffect(() => {
    const onSidebarExpand = () => closeSettings();
    window.addEventListener(DASHBOARD_SIDEBAR_EXPAND_EVENT, onSidebarExpand);
    return () => window.removeEventListener(DASHBOARD_SIDEBAR_EXPAND_EVENT, onSidebarExpand);
  }, [closeSettings]);

  const refreshPreview = useCallback(() => {
    iframeReadyRef.current = false;
    setFrameKey((key) => key + 1);
  }, []);

  useEffect(() => {
    const sync = () => setFocusActive(getBrowserFullscreenElement() === previewRootRef.current);
    sync();
    document.addEventListener('fullscreenchange', sync);
    document.addEventListener('webkitfullscreenchange', sync);
    return () => {
      document.removeEventListener('fullscreenchange', sync);
      document.removeEventListener('webkitfullscreenchange', sync);
    };
  }, []);

  const toggleFocus = useCallback(async () => {
    const root = previewRootRef.current;
    if (!root) return;
    try {
      if (getBrowserFullscreenElement() === root) {
        await exitBrowserFullscreen();
        return;
      }
      if (getBrowserFullscreenElement()) {
        await exitBrowserFullscreen();
      }
      await enterBrowserFullscreen(root);
    } catch {
      setFocusActive(getBrowserFullscreenElement() === root);
    }
  }, []);

  useEffect(() => {
    const column = previewColumnRef.current;
    if (!column) return;
    const observer = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width ?? 0;
      if (width < 50) return;
      containerWidthRef.current = width;
      setPreviewWidth((current) => {
        if (current == null) return current;
        if (width <= PREVIEW_MIN_WIDTH) return null;
        if (current >= width - 8) return null;
        return Math.min(current, Math.floor(width));
      });
    });
    observer.observe(column);
    return () => observer.disconnect();
  }, []);

  useEffect(() => () => dragStopRef.current?.(), []);

  const resetPreviewWidth = useCallback(() => {
    setPreviewWidth(null);
  }, []);

  const setPreviewDevice = useCallback((device: PreviewDevice) => {
    const container = containerWidthRef.current;
    if (device === 'desktop') {
      setPreviewWidth(null);
      return;
    }
    const target = device === 'mobile' ? MOBILE_PREVIEW_WIDTH : TABLET_PREVIEW_WIDTH;
    if (!container) {
      setPreviewWidth(target);
      return;
    }
    setPreviewWidth(Math.min(target, Math.max(PREVIEW_MIN_WIDTH, Math.floor(container))));
  }, []);

  const onPreviewResizePointerDown = useCallback(
    (side: 'left' | 'right', event: ReactPointerEvent<HTMLButtonElement>) => {
      if (event.button !== 0) return;
      event.preventDefault();
      event.stopPropagation();
      const container = containerWidthRef.current;
      if (!container) return;
      const startWidth = previewWidthRef.current ?? container;
      dragRef.current = { side, startX: event.clientX, startWidth, container };
      setResizingPreview(true);
      const previousCursor = document.body.style.cursor;
      const previousSelect = document.body.style.userSelect;
      document.body.style.cursor = 'ew-resize';
      document.body.style.userSelect = 'none';

      const onMove = (moveEvent: PointerEvent) => {
        const drag = dragRef.current;
        if (!drag) return;
        const delta = moveEvent.clientX - drag.startX;
        const signed = drag.side === 'right' ? delta : -delta;
        const next = Math.min(drag.container, Math.max(PREVIEW_MIN_WIDTH, drag.startWidth + signed * 2));
        setPreviewWidth(next >= drag.container - 8 ? null : Math.round(next));
      };

      const stop = (upEvent?: PointerEvent) => {
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', stop);
        window.removeEventListener('pointercancel', stop);
        dragStopRef.current = null;
        document.body.style.cursor = previousCursor;
        document.body.style.userSelect = previousSelect;
        setResizingPreview(false);
        const drag = dragRef.current;
        dragRef.current = null;
        if (!drag || !upEvent) return;
        const delta = upEvent.clientX - drag.startX;
        const signed = drag.side === 'right' ? delta : -delta;
        const next = Math.min(drag.container, Math.max(PREVIEW_MIN_WIDTH, drag.startWidth + signed * 2));
        setPreviewWidth(snapPreviewWidth(next, drag.container));
      };

      dragStopRef.current = () => stop();
      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', stop);
      window.addEventListener('pointercancel', stop);
    },
    []
  );

  const activeDevice = resolvePreviewDevice(previewWidth);
  const previewFrameWidth = previewWidth == null ? '100%' : `${previewWidth}px`;

  const dockTop = 'calc(var(--dash-header-h, 3.85rem) + var(--portfolio-workspace-nav-h, 0px))';
  const dockHeight =
    'calc(100dvh - var(--dash-header-h, 3.85rem) - var(--portfolio-workspace-nav-h, 0px) - 0.5rem)';

  return (
    <div
      ref={previewRootRef}
      className={`portfolio-live-preview relative max-w-full min-w-0 ${
        focusActive
          ? `flex h-full flex-col overflow-x-clip ${APP_GROUND} dark:bg-black`
          : `sticky z-20 flex flex-col gap-2 overflow-x-clip ${APP_GROUND} px-0 pb-2 dark:bg-black sm:px-4`
      }`}
      style={focusActive ? undefined : { top: dockTop, height: dockHeight }}
    >
      {/* Floating chrome — above the canvas, never part of the previewed page. */}
      <div className="portfolio-live-preview-chrome grid min-w-0 shrink-0 grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 px-3 py-0 sm:px-0.5">
        <p className="min-w-0 truncate text-[0.9rem] font-medium normal-case tracking-normal text-[#222222]/70 dark:text-white/55">
          Live preview
        </p>

        <DeviceCycleButton device={activeDevice} onSelect={setPreviewDevice} />

        <div className="flex min-w-0 shrink-0 items-center justify-end gap-0.5">
          <ChromeIcon label="Refresh" onClick={refreshPreview}>
            <RefreshIcon className="h-5 w-5" />
          </ChromeIcon>
          <ChromeIcon
            label={focusActive ? 'Exit focus' : 'Focus'}
            pressed={focusActive}
            onClick={() => void toggleFocus()}
          >
            {focusActive ? (
              <FocusExitIcon className="h-5 w-5" />
            ) : (
              <FocusEnterIcon className="h-5 w-5" />
            )}
          </ChromeIcon>
          <span className="hidden sm:contents">
            <ChromeIcon label="Open" href={path}>
              <ExternalLinkIcon className="h-5 w-5" />
            </ChromeIcon>
          </span>
          <ChromeIcon
            label={settingsOpen ? 'Close' : 'Settings'}
            pressed={settingsOpen}
            expanded={settingsOpen}
            controls="portfolio-studio-settings"
            onClick={() => setSettingsOpen((open) => !open)}
          >
            {settingsOpen ? (
              <CloseIcon className="h-5 w-5" />
            ) : (
              <GearIcon className="h-5 w-5" />
            )}
          </ChromeIcon>
        </div>
      </div>

      {/* Physical screen — rounded device frame on mineral ground. */}
      <div
        className={`portfolio-live-preview-frame relative min-h-0 flex-1 bg-[#FFFFFF] dark:bg-black ${
          settingsOpen || focusActive
            ? ''
            : 'overflow-hidden'
        } ${focusActive ? '' : 'border border-black/[0.16] dark:border-white/[0.18]'}`}
      >
        <div
          className="portfolio-live-preview-stage flex h-full min-h-0 min-w-0 w-full max-w-full gap-0 bg-transparent max-lg:overflow-hidden"
        >
          <div
            ref={previewColumnRef}
            className={`relative min-w-0 max-w-full flex-1 overflow-hidden transition-[flex-grow] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
              previewWidth != null ? 'bg-[#FFFFFF] dark:bg-black' : ''
            } ${settingsOpen && !focusActive ? 'lg:border-r lg:border-black/[0.1] dark:lg:border-white/[0.12]' : ''}`}
          >
            <div className="flex h-full w-full items-stretch justify-center">
              <div
                className="relative h-full max-w-full will-change-[width]"
                style={{
                  width: previewFrameWidth,
                  transition: resizingPreview ? 'none' : 'width 180ms cubic-bezier(0.22, 1, 0.36, 1)',
                }}
              >
                <iframe
                  key={frameKey}
                  ref={iframeRef}
                  title="Portfolio live preview"
                  src={embedPath}
                  className={`absolute inset-0 h-full w-full border-0 bg-white ${
                    resizingPreview ? 'pointer-events-none' : ''
                  }`}
                />
                <PreviewResizeHandle
                  side="left"
                  active={resizingPreview}
                  onPointerDown={onPreviewResizePointerDown}
                  onReset={resetPreviewWidth}
                />
                <PreviewResizeHandle
                  side="right"
                  active={resizingPreview}
                  onPointerDown={onPreviewResizePointerDown}
                  onReset={resetPreviewWidth}
                />
              </div>
            </div>
          </div>

          <aside
            id="portfolio-studio-settings"
            role="complementary"
            aria-label="Portfolio settings"
            aria-hidden={!settingsOpen}
            data-open={settingsOpen ? 'true' : 'false'}
            className={`portfolio-studio-settings-pane flex h-full min-w-0 shrink-0 flex-col bg-transparent transition-[width,min-width] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] max-lg:absolute max-lg:inset-y-0 max-lg:right-0 max-lg:z-20 ${
              settingsOpen
                ? 'w-full overflow-hidden lg:w-[min(31%,25rem)] lg:max-w-[25rem]'
                : 'pointer-events-none w-0 overflow-hidden'
            }`}
          >
            <div
              className={`h-full w-full min-w-0 overflow-visible transition-opacity duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                settingsOpen ? 'opacity-100 delay-75' : 'invisible opacity-0'
              }`}
            >
              {settingsMounted ? (
                <PortfolioSettingsModal
                  variant="dock"
                  open={settingsOpen}
                  onClose={closeSettings}
                  settings={settings}
                  persistStatus={persistStatus}
                  onChange={updateSection}
                  onThemeChange={setThemeId}
                  onNavigationChange={updateNavigation}
                  onGlobalChange={updateGlobal}
                  onColorModeChange={setColorMode}
                  onGlobalPaletteChange={patchGlobalPalette}
                  onGlobalPalettePairChange={setGlobalPalettePair}
                  onSaveCustomTheme={saveCustomTheme}
                  onRenameCustomTheme={renameCustomTheme}
                  onDuplicateTheme={duplicateTheme}
                  onResetBuiltinTheme={resetBuiltinTheme}
                  onDeleteCustomTheme={deleteCustomTheme}
                  onReset={resetSettings}
                  onUndo={undoSettings}
                  onRedo={redoSettings}
                  canUndo={canUndo}
                  canRedo={canRedo}
                  availableTools={previewMeta.availableTools}
                  availableWorks={previewMeta.availableWorks}
                  availableServices={previewMeta.availableServices}
                  navSocialLinkOptions={previewMeta.navSocialLinkOptions}
                  sectionLinkOptions={previewMeta.sectionLinkOptions}
                  profileAvatarUrl={previewMeta.profileAvatarUrl}
                  onPreviewSectionFocus={focusPreviewSection}
                />
              ) : null}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

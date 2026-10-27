'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react';
import dynamic from 'next/dynamic';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowPointer, faChevronLeft } from '@fortawesome/free-solid-svg-icons';
import {
  getVisiblePortfolioSettingsSections,
  PortfolioStudioSectionList,
  readStoredPortfolioSettingsSection,
  storePortfolioSettingsSection,
} from '@/components/portfolio/PortfolioStudioSectionList';
import type { PortfolioSettingsSectionId } from '@/components/portfolio/portfolio-settings-types';
import { usePortfolioSettings } from '@/components/portfolio/use-portfolio-settings';
import { PortfolioDesignPreviewProvider } from '@/components/portfolio/PortfolioDesignLivePreview';
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
import { useT } from '@/lib/i18n/I18nProvider';
import { msg } from '@/lib/i18n/config';

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

function LinkIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={STROKE} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 14a4.5 4.5 0 006.4 0l3-3a4.5 4.5 0 00-6.4-6.4l-1 1M14 10a4.5 4.5 0 00-6.4 0l-3 3a4.5 4.5 0 006.4 6.4l1-1" />
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
  'focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#0F1419]/30 dark:focus-visible:ring-[#E7E9EA]/30';
const chromeIconClass = `group relative inline-flex h-10 w-10 items-center justify-center rounded-full transition-colors duration-200 ${chromeFocusRing}`;
const chromeIconIdle =
  'text-[#536471] hover:bg-[rgba(15,20,25,0.06)] hover:text-[#0F1419] dark:text-[#71767B] dark:hover:bg-[rgba(231,233,234,0.1)] dark:hover:text-[#E7E9EA]';
const chromeIconPressed = 'bg-[rgba(15,20,25,0.06)] text-[#0F1419] dark:bg-[rgba(231,233,234,0.1)] dark:text-[#E7E9EA]';

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
      className="pointer-events-none absolute left-1/2 top-full z-40 mt-2 -translate-x-1/2 whitespace-nowrap rounded-md bg-[#0F1419] px-2 py-1 text-[12px] font-medium leading-4 text-white opacity-0 shadow-[0_8px_20px_rgba(0,0,0,0.28)] dark:bg-[#EFF3F4] dark:text-[#0F1419] transition duration-150 group-hover:opacity-100 group-focus-visible:opacity-100"
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
  desktop: { label: msg('Desktop'), Icon: DesktopDeviceIcon },
  tablet: { label: msg('Tablet'), Icon: TabletDeviceIcon },
  mobile: { label: msg('Mobile'), Icon: MobileDeviceIcon },
};

function DeviceSwitcher({
  device,
  onSelect,
}: {
  device: PreviewDevice;
  onSelect: (device: PreviewDevice) => void;
}) {
  const t = useT();
  return (
    <div
      role="group"
      aria-label={t('Preview device')}
      className="portfolio-preview-device-switcher flex h-9 items-center gap-0.5 rounded-[10px] border border-neutral-200 bg-neutral-100 p-0.5 dark:border-neutral-800 dark:bg-neutral-900"
    >
      {DEVICE_CYCLE.map((key) => {
        const { Icon, label } = DEVICE_META[key];
        const active = key === device;
        return (
          <button
            key={key}
            type="button"
            onClick={() => onSelect(key)}
            aria-label={t('{label} preview', { label })}
            aria-pressed={active}
            title={t('{label} preview', { label })}
            className={`inline-flex h-7 w-8 items-center justify-center rounded-[7px] transition-colors ${chromeFocusRing} ${
              active
                ? 'bg-white text-neutral-950 shadow-sm dark:bg-neutral-700 dark:text-white'
                : 'text-neutral-500 hover:text-neutral-950 dark:text-neutral-500 dark:hover:text-neutral-100'
            }`}
          >
            <Icon className="h-[17px] w-[17px]" />
          </button>
        );
      })}
    </div>
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
  const t = useT();
  return (
    <div
      className={`portfolio-preview-resize-handle pointer-events-none absolute inset-y-0 z-20 flex w-3 items-center justify-center ${
        side === 'left' ? 'left-0' : 'right-0'
      }`}
    >
      <button
        type="button"
        aria-label={side === 'left' ? t('Resize preview from the left') : t('Resize preview from the right')}
        title={t('Drag to resize · double-click for full width')}
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
              ? 'bg-[#0F1419] opacity-100 dark:bg-[#E7E9EA]'
              : 'bg-[#0F1419]/25 opacity-70 hover:opacity-100 dark:bg-[#E7E9EA]/25'
          }`}
        />
      </button>
    </div>
  );
}

export function PortfolioLivePreview({
  creatorId,
  username,
  onExit,
  closing = false,
}: {
  creatorId: string;
  username?: string | null;
  /**
   * Immersive mode (My Portfolio): the preview covers the whole screen — the site's navbar included —
   * rising in on open; the chrome's "Editor" button, and Escape, call this to leave.
   */
  onExit?: () => void;
  /** The immersive preview is leaving: it plays its exit before the parent unmounts it. */
  closing?: boolean;
}) {
  const t = useT();
  const immersive = onExit != null;
  const [linkCopied, setLinkCopied] = useState(false);
  /*
   * The pro-editor shell (section rail · settings · preview) shares one open section: the compact rail,
   * the adjacent controls and clicks inside the preview all update the same selection.
   */
  const [studioSection, setStudioSectionState] = useState<PortfolioSettingsSectionId>(() =>
    readStoredPortfolioSettingsSection()
  );
  const setStudioSection = useCallback((sectionId: PortfolioSettingsSectionId) => {
    setStudioSectionState(sectionId);
    storePortfolioSettingsSection(sectionId);
  }, []);
  /** Whether the page should outline / pick sections when direct preview editing is enabled. */
  const inspectRef = useRef(false);
  const [frameKey, setFrameKey] = useState(0);
  const [settingsOpen, setSettingsOpen] = useState(true);
  const [inspectEnabled, setInspectEnabled] = useState(false);
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
  const [previewContainerWidth, setPreviewContainerWidth] = useState(0);
  const [resizingPreview, setResizingPreview] = useState(false);
  previewWidthRef.current = previewWidth;

  // Smaller workspaces open on the canvas. Their settings remain one tap away in the persistent
  // section rail, instead of consuming the whole viewport before the user has chosen a section.
  useEffect(() => {
    if (window.matchMedia('(max-width: 1199px)').matches) setSettingsOpen(false);
  }, []);

  const path = buildCreatorPortfolioPath(creatorId, username);
  const embedPath = withPortfolioStudioEmbed(path);

  const {
    settings,
    hydrated,
    persistStatus,
    updateSection,
    resetSettings,
    updateNavigation,
    updateGlobal,
    flushPendingSave,
    setColorMode,
    patchGlobalPalette,
    setGlobalPalettePair,
    undoSettings,
    redoSettings,
    canUndo,
    canRedo,
  } = usePortfolioSettings(creatorId, { canEdit: true });

  /* Design pickers render each design for real from this portfolio, wearing these settings. */
  const designPreviewSource = useMemo(() => ({ portfolioPath: path, settings, availableSkills: previewMeta.availableSkills, availableGallery: previewMeta.availableGallery, profileAvatarUrl: previewMeta.profileAvatarUrl }), [path, settings, previewMeta.availableSkills, previewMeta.availableGallery, previewMeta.profileAvatarUrl]);
  const studioSections = useMemo(
    () =>
      getVisiblePortfolioSettingsSections({
        presenceKind: settings.global.presenceKind,
        sectionOrder: settings.global.sectionOrder,
      }),
    [settings.global.presenceKind, settings.global.sectionOrder]
  );

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

  /* Direct preview editing has its own switch: the settings panel may be folded while section
     picking remains enabled. Re-sent whenever the page (re)loads. */
  const postInspectToPreview = useCallback(() => {
    const target = iframeRef.current?.contentWindow;
    if (!target || !iframeReadyRef.current) return;
    target.postMessage(
      {
        source: PORTFOLIO_STUDIO_PREVIEW_SOURCE,
        type: 'set-inspect',
        enabled: inspectRef.current,
        sectionId: previewAnchorForSettingsSection(studioSection),
      },
      window.location.origin
    );
  }, [studioSection]);
  useEffect(() => {
    inspectRef.current = inspectEnabled;
    postInspectToPreview();
  }, [inspectEnabled, studioSection, postInspectToPreview]);

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
          postInspectToPreview();
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
        return;
      }
      if (event.data.type === 'select-section') {
        // A section clicked in the preview: open its settings (it is already on screen — no scroll).
        setStudioSection(event.data.sectionId as PortfolioSettingsSectionId);
        setSettingsOpen(true);
      }
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [postSettingsToPreview, postInspectToPreview, setStudioSection]);

  useEffect(() => {
    postSettingsToPreview();
  }, [postSettingsToPreview, settings, hydrated]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const tag = target?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || target?.isContentEditable) return;

      if (settingsOpen && !event.metaKey && !event.ctrlKey && (event.key === 'ArrowDown' || event.key === 'ArrowUp')) {
        const current = Math.max(0, studioSections.findIndex((section) => section.id === studioSection));
        const delta = event.key === 'ArrowDown' ? 1 : -1;
        const next = studioSections[(current + delta + studioSections.length) % studioSections.length];
        if (!next) return;
        event.preventDefault();
        setStudioSection(next.id);
        focusPreviewSection(next.id);
        return;
      }

      const isComma = event.key === ',' || event.code === 'Comma';
      if (!isComma || !(event.metaKey || event.ctrlKey)) return;
      event.preventDefault();
      setSettingsOpen((open) => {
        if (open) flushPendingSave();
        return !open;
      });
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [flushPendingSave, focusPreviewSection, settingsOpen, studioSection, studioSections, setStudioSection]);

  const closeSettings = useCallback(() => {
    flushPendingSave();
    setSettingsOpen(false);
  }, [flushPendingSave]);

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
      setPreviewContainerWidth(width);
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

  const copyLiveLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}${path}`);
      setLinkCopied(true);
      window.setTimeout(() => setLinkCopied(false), 2000);
    } catch {
      /* ignore */
    }
  }, [path]);

  /* Immersive: the page behind does not scroll, and Escape goes back to the editor — unless it is
     closing the settings dock or the browser's full screen first. */
  useEffect(() => {
    if (!immersive) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || event.defaultPrevented) return;
      if (getBrowserFullscreenElement()) return;
      if (settingsOpen) {
        closeSettings();
        return;
      }
      onExit?.();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [immersive, onExit, settingsOpen, closeSettings]);

  const activeDevice = resolvePreviewDevice((previewWidth ?? previewContainerWidth) || null);
  const previewFrameWidth = previewWidth == null ? '100%' : `${previewWidth}px`;

  const dockTop = 'calc(var(--dash-header-h, 3.85rem) + var(--portfolio-workspace-nav-h, 0px))';
  const dockHeight =
    'calc(100dvh - var(--dash-header-h, 3.85rem) - var(--portfolio-workspace-nav-h, 0px) - 0.5rem)';

  return (
    <div
      ref={previewRootRef}
      className={`portfolio-live-preview dark max-w-full min-w-0 ${
        focusActive
          ? `relative flex h-full flex-col overflow-x-clip bg-white dark:bg-black`
          : immersive
            ? /* Full screen: no frame and no margin — the bar on top, the page under it, edge to edge. */
              `fixed inset-0 z-[230] flex flex-col overflow-x-clip bg-white dark:bg-black ${
                closing ? 'pf-preview-exit' : 'pf-preview-enter'
              }`
            : `relative sticky z-20 flex flex-col overflow-x-clip bg-white px-0 pb-2 pt-px dark:bg-black sm:px-4`
      }`}
      style={{ colorScheme: 'dark', backgroundColor: '#000000', ...(focusActive || immersive ? {} : { top: dockTop, height: dockHeight }) }}
    >
      {/* Floating chrome — above the canvas, never part of the previewed page. Docked, it sits
          inside the same hairline frame as the screen: both use a 1px outline and the screen is
          offset by 1px, so their shared edge collapses into a single separator line. */}
      <div
        style={{ backgroundColor: '#000000', color: '#E7E9EA', borderColor: '#1F2226' }}
        className={`portfolio-live-preview-chrome grid min-w-0 shrink-0 grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 ${
          focusActive
            ? 'px-3 py-0 sm:px-0.5'
            : immersive
              ? /* One plain bar, closed off from the page by a single hairline. */
                'h-14 border-b border-[#EBEFF1] px-3 dark:border-[#1F2226] sm:px-4'
              : 'px-3 py-1.5 outline-solid outline-1 outline-[#EBEFF1] dark:outline-[#1F2226]'
        }`}
      >
        {immersive ? (
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={onExit}
              title={t('Back to the editor (Esc)')}
              aria-label={t('Back to the editor (Esc)')}
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[14px] font-semibold text-[#0F1419] transition-colors hover:bg-[rgba(15,20,25,0.06)] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#0F1419]/35 dark:text-[#E7E9EA] dark:hover:bg-[rgba(231,233,234,0.1)] dark:focus-visible:ring-[#E7E9EA]/45"
            >
              <FontAwesomeIcon icon={faChevronLeft} className="h-3.5 w-3.5" fixedWidth aria-hidden />
            </button>
            <p className="hidden min-w-0 truncate text-[15px] font-bold normal-case tracking-normal text-[#0F1419] dark:text-[#E7E9EA] sm:block">
              {t('Live preview')}
            </p>
          </div>
        ) : (
          <p className="min-w-0 truncate text-[15px] font-bold normal-case tracking-normal text-[#0F1419] dark:text-[#E7E9EA]">
            {t('Live preview')}
          </p>
        )}

        <DeviceSwitcher device={activeDevice} onSelect={setPreviewDevice} />

        <div className="flex min-w-0 shrink-0 items-center justify-end gap-0.5">
          <ChromeIcon
            label={inspectEnabled ? t('Disable click to edit') : t('Enable click to edit')}
            pressed={inspectEnabled}
            onClick={() => setInspectEnabled((enabled) => !enabled)}
          >
            <FontAwesomeIcon icon={faArrowPointer} className="h-[17px] w-[17px]" fixedWidth aria-hidden />
          </ChromeIcon>
          <span className="hidden sm:contents">
            <ChromeIcon label={t('Refresh')} onClick={refreshPreview}>
              <RefreshIcon className="h-5 w-5" />
            </ChromeIcon>
          </span>
          <ChromeIcon
            label={focusActive ? t('Exit focus') : t('Focus')}
            pressed={focusActive}
            onClick={() => void toggleFocus()}
          >
            {focusActive ? (
              <FocusExitIcon className="h-5 w-5" />
            ) : (
              <FocusEnterIcon className="h-5 w-5" />
            )}
          </ChromeIcon>
          {immersive ? (
            <ChromeIcon label={linkCopied ? t('Link copied') : t('Copy live link')} pressed={linkCopied} onClick={() => void copyLiveLink()}>
              <LinkIcon className="h-5 w-5" />
            </ChromeIcon>
          ) : null}
          <span className="hidden sm:contents">
            <ChromeIcon label={t('Open')} href={path}>
              <ExternalLinkIcon className="h-5 w-5" />
            </ChromeIcon>
          </span>
        </div>
      </div>

      {/* Physical screen — the finest frame (outline, so the iframe never paints over it). */}
      <div
        className={`portfolio-live-preview-frame relative min-h-0 flex-1 bg-[#FFFFFF] dark:bg-black ${
          settingsOpen || focusActive
            ? ''
            : 'overflow-hidden'
        } ${
          focusActive
            ? 'border-t border-[#EBEFF1] dark:border-[#1F2226]'
            : immersive
              ? ''
              : 'mt-px outline-solid outline-1 outline-[#EBEFF1] dark:outline-[#1F2226]'
        }`}
      >
        <div
          className="portfolio-live-preview-stage relative flex h-full min-h-0 min-w-0 w-full max-w-full gap-0 bg-transparent max-lg:overflow-hidden"
        >
          {/* Pro-editor shell: a compact section rail, its settings immediately beside it, then the
              uninterrupted canvas. Navigation and controls stay on the same side of the screen. */}
          <aside
            aria-label={t('Sections')}
            className="portfolio-studio-sections-rail h-full min-h-0 w-[84px] min-w-0 shrink-0 overflow-hidden border-r border-neutral-200 bg-neutral-100 dark:border-neutral-900 dark:bg-[#050505] sm:w-[96px] xl:w-[112px]"
          >
            <div className="portfolio-studio-sections-rail-inner h-full min-h-0 w-[84px] sm:w-[96px] xl:w-[112px]">
              <PortfolioStudioSectionList
                sections={studioSections}
                activeId={studioSection}
                onSelect={(sectionId) => {
                  setStudioSection(sectionId);
                  setSettingsOpen(true);
                  focusPreviewSection(sectionId);
                }}
                variant="toolbar"
              />
            </div>
          </aside>

          {settingsOpen ? (
            <button
              type="button"
              aria-label={t('Close settings')}
              onClick={closeSettings}
              className="portfolio-studio-settings-scrim absolute inset-0 z-10 hidden bg-black/40 backdrop-blur-[1px] max-lg:block"
            />
          ) : null}

          <aside
            id="portfolio-studio-settings"
            role="complementary"
            aria-label={t('Portfolio settings')}
            data-open={settingsOpen ? 'true' : 'false'}
            className={`portfolio-studio-settings-pane relative z-20 flex h-full min-w-0 shrink-0 flex-col overflow-visible border-r border-neutral-200 bg-white transition-[width] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] dark:border-neutral-800 dark:bg-[#121212] ${
              settingsOpen
                ? 'w-[calc(100%_-_84px)] sm:w-[min(calc(100%_-_96px),25.5rem)] xl:w-[410px]'
                : 'pointer-events-none w-0 border-r-0'
            }`}
          >
            <div
              aria-hidden={!settingsOpen}
              className={`h-full w-full min-w-0 overflow-hidden transition-opacity duration-300 ${
                settingsOpen ? 'opacity-100 delay-75' : 'invisible opacity-0'
              }`}
            >
              <PortfolioDesignPreviewProvider value={designPreviewSource}>
                <PortfolioSettingsModal
                  variant="dock"
                  directDockNavigation
                  open={settingsOpen}
                  onClose={closeSettings}
                  settings={settings}
                  persistStatus={persistStatus}
                  onChange={updateSection}
                  onNavigationChange={updateNavigation}
                  onGlobalChange={updateGlobal}
                  onColorModeChange={setColorMode}
                  onGlobalPaletteChange={patchGlobalPalette}
                  onGlobalPalettePairChange={setGlobalPalettePair}
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
                  activeSectionId={studioSection}
                  onActiveSectionChange={setStudioSection}
                />
              </PortfolioDesignPreviewProvider>
            </div>
            <button
              type="button"
              onClick={() => setSettingsOpen((open) => !open)}
              aria-label={settingsOpen ? t('Collapse settings') : t('Expand settings')}
              aria-expanded={settingsOpen}
              aria-controls="portfolio-studio-settings"
              title={settingsOpen ? t('Collapse settings') : t('Expand settings')}
              className={`portfolio-studio-settings-toggle pointer-events-auto absolute top-1/2 z-40 flex h-9 w-4 -translate-y-1/2 items-center justify-center border border-neutral-200 bg-white text-neutral-400 shadow-sm transition-[right,transform,background-color,color] hover:bg-neutral-100 hover:text-neutral-950 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-600 dark:hover:bg-neutral-900 dark:hover:text-neutral-100 ${
                settingsOpen
                  ? 'right-1 rounded-md sm:right-0 sm:translate-x-full sm:rounded-l-none sm:rounded-r-md sm:border-l-0'
                  : 'right-0 translate-x-full rounded-r-md border-l-0'
              }`}
            >
              <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth={2.25} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d={settingsOpen ? 'm15 6-6 6 6 6' : 'm9 6 6 6-6 6'} />
              </svg>
            </button>
          </aside>

          <div
            ref={previewColumnRef}
            className={`relative min-w-0 max-w-full flex-1 overflow-hidden transition-[flex-grow] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
              previewWidth != null ? 'bg-[#FFFFFF] dark:bg-black' : ''
            }`}
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
                  title={t('Portfolio live preview')}
                  src={embedPath}
                  className={`absolute inset-0 h-full w-full border-0 bg-white ${
                    resizingPreview ? 'pointer-events-none' : ''
                  }`}
                />
                <PreviewResizeHandle
                  side="right"
                  active={resizingPreview}
                  onPointerDown={onPreviewResizePointerDown}
                  onReset={resetPreviewWidth}
                />
              </div>
            </div>
            {inspectEnabled ? (
              <div className="pointer-events-none absolute inset-x-0 bottom-5 z-10 hidden justify-center sm:flex">
                <div className="flex items-center gap-3 rounded-full border border-[#2B3442] bg-[#11151B]/94 px-5 py-2 text-[12px] font-medium text-[#8D96A5] shadow-[0_10px_35px_rgba(0,0,0,0.28)] backdrop-blur-md">
                  <span>↑↓ {t('Change section')}</span>
                  <span className="h-4 w-px bg-[#343D4A]" aria-hidden />
                  <span className="font-semibold text-[#DDE2EA]">{t('Click the preview to edit')}</span>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

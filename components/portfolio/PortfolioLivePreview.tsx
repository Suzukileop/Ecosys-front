'use client';

import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDesktop, faGear, faMobileScreen } from '@fortawesome/free-solid-svg-icons';
import { PortfolioSettingsModal } from '@/components/portfolio/PortfolioSettingsModal';
import { usePortfolioSettings } from '@/components/portfolio/use-portfolio-settings';
import { buildCreatorPortfolioPath, buildCreatorPortfolioUrl } from '@/lib/portfolio-url';
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

function ExternalLinkIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
      />
    </svg>
  );
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

function CopyLinkIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M13.5 6.5H17a3.5 3.5 0 010 7h-1.5M10.5 17.5H7a3.5 3.5 0 010-7h1.5"
      />
    </svg>
  );
}

const toolbarIconClass =
  'inline-flex items-center justify-center bg-black/[0.04] text-neutral-500 transition duration-200 hover:bg-neutral-950 hover:text-white dark:bg-white/[0.03] dark:text-neutral-400 dark:hover:bg-white dark:hover:text-neutral-950';

function ToolbarIcon({
  label,
  children,
  href,
  onClick,
  pressed,
  expanded,
  controls,
  matchHistory,
}: {
  label: string;
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  pressed?: boolean;
  expanded?: boolean;
  controls?: string;
  matchHistory?: boolean;
}) {
  const tooltip = (
    <span
      role="tooltip"
      className="pointer-events-none absolute left-1/2 top-full z-40 mt-2 -translate-x-1/2 whitespace-nowrap rounded-md bg-neutral-950 px-2 py-1 text-[10px] font-medium tracking-wide text-white opacity-0 shadow-[0_8px_20px_rgba(0,0,0,0.28)] transition duration-150 group-hover:opacity-100 group-focus-visible:opacity-100"
    >
      {label}
    </span>
  );

  const className = `group relative ${toolbarIconClass} ${
    matchHistory ? 'h-9 w-9 rounded-full' : 'h-8 w-8 rounded-md'
  } ${pressed ? 'bg-neutral-950 text-white dark:bg-white dark:text-neutral-950' : ''}`;

  if (href) {
    return (
      <a href={href} target="_blank" rel="noreferrer" aria-label={label} className={className}>
        {children}
        {tooltip}
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
      {tooltip}
    </button>
  );
}

function RefreshIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden>
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
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 9V5h4M20 9V5h-4M4 15v4h4M20 15v4h-4" />
    </svg>
  );
}

function FocusExitIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H5v4M15 5h4v4M9 19H5v-4M15 19h4v-4" />
    </svg>
  );
}

function DevicePreviewIcon({ mobile, className }: { mobile: boolean; className?: string }) {
  return (
    <FontAwesomeIcon
      icon={mobile ? faDesktop : faMobileScreen}
      className={className}
      fixedWidth
    />
  );
}

const MOBILE_PREVIEW_WIDTH = 400;
const PREVIEW_MIN_WIDTH = 320;
const PREVIEW_WIDTH_SNAPS = [320, 360, 375, 400, 414, 430, 768, 834, 1024, 1280, 1440];

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
              ? 'bg-neutral-700 opacity-100 dark:bg-white'
              : 'bg-neutral-400/80 opacity-70 hover:opacity-100 dark:bg-neutral-500'
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
  const [copied, setCopied] = useState(false);
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
  const shareUrl = buildCreatorPortfolioUrl(creatorId, username);

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

  const copyShareUrl = useCallback(async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  }, [shareUrl]);

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

  const toggleDevicePreview = useCallback(() => {
    const container = containerWidthRef.current;
    setPreviewWidth((current) => {
      const isMobile = current != null && current <= 480;
      if (isMobile) return null;
      if (!container) return MOBILE_PREVIEW_WIDTH;
      return Math.min(MOBILE_PREVIEW_WIDTH, Math.max(PREVIEW_MIN_WIDTH, Math.floor(container)));
    });
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

  const mobilePreviewActive = previewWidth != null && previewWidth <= 480;
  const previewFrameWidth = previewWidth == null ? '100%' : `${previewWidth}px`;

  const previewEdgeGutter = 'px-4 sm:px-5';
  const frameBorder = 'border-neutral-200 dark:border-neutral-800';

  return (
    <div
      ref={previewRootRef}
      className={`portfolio-live-preview ${
        focusActive ? 'flex h-full flex-col bg-neutral-950' : `${previewEdgeGutter} pb-4 sm:pb-5`
      }`}
    >
      <div
        className={`portfolio-live-preview-chrome rounded-t-xl border border-b-0 bg-white dark:bg-neutral-950 ${frameBorder} ${
          focusActive ? 'rounded-none border-x-0 border-t-0' : ''
        }`}
      >
        <div
          className={`grid grid-cols-[1fr_auto_1fr] items-center gap-3 border-b border-neutral-200 bg-neutral-50 py-2 dark:border-neutral-800 dark:bg-neutral-900 ${previewEdgeGutter}`}
        >
        <p className="text-sm font-semibold leading-none text-slate-900 dark:text-white">Live Preview</p>
        <ToolbarIcon
          label={mobilePreviewActive ? 'Desktop preview' : 'Mobile preview'}
          pressed={mobilePreviewActive}
          onClick={toggleDevicePreview}
        >
          <DevicePreviewIcon mobile={mobilePreviewActive} className="h-4 w-4" />
        </ToolbarIcon>
        <div className="flex shrink-0 items-center justify-end gap-1">
          <ToolbarIcon label="Refresh" onClick={refreshPreview}>
            <RefreshIcon className="h-3.5 w-3.5" />
          </ToolbarIcon>
          <ToolbarIcon
            label={focusActive ? 'Exit focus' : 'Focus'}
            pressed={focusActive}
            onClick={() => void toggleFocus()}
          >
            {focusActive ? (
              <FocusExitIcon className="h-3.5 w-3.5" />
            ) : (
              <FocusEnterIcon className="h-3.5 w-3.5" />
            )}
          </ToolbarIcon>
          <ToolbarIcon label={copied ? 'Copied' : 'Copy URL'} onClick={() => void copyShareUrl()}>
            <CopyLinkIcon className="h-3.5 w-3.5" />
          </ToolbarIcon>
          <ToolbarIcon label="Open" href={path}>
            <ExternalLinkIcon className="h-3.5 w-3.5" />
          </ToolbarIcon>
          <ToolbarIcon
            label={settingsOpen ? 'Close' : 'Settings'}
            pressed={settingsOpen}
            expanded={settingsOpen}
            controls="portfolio-studio-settings"
            matchHistory={settingsOpen}
            onClick={() => setSettingsOpen((open) => !open)}
          >
            {settingsOpen ? (
              <CloseIcon className="h-4 w-4" />
            ) : (
              <FontAwesomeIcon icon={faGear} className="h-3.5 w-3.5" fixedWidth />
            )}
          </ToolbarIcon>
        </div>
        </div>
      </div>

      <div
        className={`portfolio-live-preview-frame relative border-x border-b ${frameBorder} ${
          settingsOpen || focusActive ? '' : 'overflow-hidden rounded-b-xl'
        } ${focusActive ? 'min-h-0 flex-1 border-x-0 border-b-0' : ''}`}
      >
      <div
        className={`portfolio-live-preview-stage flex w-full bg-transparent max-lg:overflow-hidden transition-[gap] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          focusActive ? 'h-full min-h-0' : 'h-[calc(100dvh-10rem)] min-h-[32rem]'
        } ${settingsOpen ? 'max-lg:gap-0 lg:gap-3' : 'gap-0'}`}
      >
        <div
          ref={previewColumnRef}
          className={`relative min-w-0 flex-1 overflow-hidden transition-[flex-grow] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            previewWidth != null ? 'bg-neutral-100 dark:bg-neutral-900' : ''
          }`}
        >
          <div className="flex h-full w-full items-stretch justify-center">
            <div
              className="relative h-full max-w-full"
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
          className={`portfolio-studio-settings-pane flex h-full shrink-0 flex-col bg-transparent transition-[width,min-width] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] max-lg:absolute max-lg:inset-y-0 max-lg:right-0 max-lg:z-20 ${
            settingsOpen
              ? 'w-full overflow-hidden max-lg:shadow-[-24px_0_48px_rgba(0,0,0,0.35)] lg:w-[28%] lg:min-w-[22rem] lg:max-w-none'
              : 'pointer-events-none w-0 min-w-0 overflow-hidden'
          }`}
        >
          <div
            className={`h-full w-full min-w-0 overflow-visible transition-opacity duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
              settingsOpen ? 'opacity-100 delay-75' : 'invisible opacity-0'
            }`}
          >
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
              onPreviewSectionFocus={focusPreviewSection}
            />
          </div>
        </aside>
      </div>
      </div>
    </div>
  );
}

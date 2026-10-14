'use client';

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import type { PortfolioSettings } from '@/components/portfolio/portfolio-settings-types';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useT } from '@/lib/i18n/I18nProvider';
import { PORTFOLIO_STUDIO_PREVIEW_SOURCE } from '@/lib/portfolio-studio-preview';
import { DESIGN_PREVIEW_VIEWPORT_WIDTH, isDesignPreviewMessage } from '@/lib/portfolio-design-preview';

/**
 * What a design picker needs to show real previews: the creator's portfolio path (each card loads
 * it in a small iframe) and the studio's current, unsaved settings (posted to every card, so a
 * preview wears the creator's own palette, fonts and options). Provided by the studio's live
 * preview; a picker rendered without it falls back to its wireframe thumbnails.
 */
type DesignPreviewSource = {
  portfolioPath: string;
  settings: PortfolioSettings;
};

const DesignPreviewSourceContext = createContext<DesignPreviewSource | null>(null);

export const PortfolioDesignPreviewProvider = DesignPreviewSourceContext.Provider;

export function usePortfolioDesignPreviewSource(): DesignPreviewSource | null {
  return useContext(DesignPreviewSourceContext);
}

/** Before the page reports its height: a footer-ish placeholder ratio. */
const FALLBACK_FRAME_HEIGHT = 640;
/** Very tall designs are cropped from the bottom so one card never fills the whole panel. */
const MAX_FRAME_HEIGHT = 1100;
/** Settings edits stream in on every keystroke; previews follow a beat later. */
const SETTINGS_POST_DELAY_MS = 300;
/** The page first paints with its saved settings, then crossfades (≈0.6s) to the studio's: stay
 *  behind the loader until that has settled, so the card never flashes the wrong colors. */
const REVEAL_DELAY_MS = 750;
/** Past this, a preview that hasn't answered is reported as unavailable instead of spinning forever. */
const LOAD_TIMEOUT_MS = 25000;

/**
 * One design, rendered for real: the page at `src` is laid out at a laptop width and scaled down
 * to the card's width, so viewport units, breakpoints and scroll-triggered motion all behave as on
 * the live site. Loads only once scrolled near, and is inert (no pointer, no focus, hidden from
 * assistive tech) — the surrounding card button does the picking.
 */
export function PortfolioDesignLivePreview({ src, settings }: { src: string; settings: PortfolioSettings }) {
  const t = useT();
  const wrapRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLIFrameElement>(null);
  const readyRef = useRef(false);
  const settingsRef = useRef(settings);
  const [near, setNear] = useState(false);
  const [width, setWidth] = useState(0);
  const [ready, setReady] = useState(false);
  const [height, setHeight] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const resize = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    resize.observe(wrap);
    const intersect = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setNear(true);
        intersect.disconnect();
      },
      { rootMargin: '240px 0px' }
    );
    intersect.observe(wrap);
    return () => {
      resize.disconnect();
      intersect.disconnect();
    };
  }, []);

  const postSettings = useCallback(() => {
    const target = frameRef.current?.contentWindow;
    if (!target || !readyRef.current) return;
    target.postMessage(
      { source: PORTFOLIO_STUDIO_PREVIEW_SOURCE, type: 'apply-settings', settings: settingsRef.current },
      window.location.origin
    );
  }, []);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.source !== frameRef.current?.contentWindow) return;
      if (!isDesignPreviewMessage(event.data)) return;
      if (event.data.type === 'design-preview-ready') {
        readyRef.current = true;
        setReady(true);
        postSettings();
        return;
      }
      if (event.data.height > 0) setHeight(event.data.height);
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [postSettings]);

  useEffect(() => {
    settingsRef.current = settings;
    if (!readyRef.current) return;
    const timer = window.setTimeout(postSettings, SETTINGS_POST_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [settings, postSettings]);

  const measured = height != null;
  useEffect(() => {
    if (!ready || !measured || revealed) return;
    const timer = window.setTimeout(() => setRevealed(true), REVEAL_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [ready, measured, revealed]);

  const scale = width > 0 ? width / DESIGN_PREVIEW_VIEWPORT_WIDTH : 0;
  const mounted = near && scale > 0;
  useEffect(() => {
    if (!mounted || revealed) return;
    const timer = window.setTimeout(() => setFailed(true), LOAD_TIMEOUT_MS);
    return () => window.clearTimeout(timer);
  }, [mounted, revealed]);

  // The iframe's own height is its viewport height, and some designs size themselves in `vh`:
  // growing the frame to fit them grows them again. Capping the frame (it is cropped there anyway)
  // bounds that loop.
  const frameHeight = Math.min(height ?? FALLBACK_FRAME_HEIGHT, MAX_FRAME_HEIGHT);
  const shownHeight = frameHeight;
  const loaded = revealed;

  return (
    <div
      ref={wrapRef}
      aria-hidden
      className="relative w-full overflow-hidden bg-[color:color-mix(in_srgb,var(--pf-palette-texte-fort,#fff)_4%,transparent)]"
      style={{ height: scale > 0 ? Math.round(shownHeight * scale) : 150 }}
    >
      {mounted ? (
        <iframe
          ref={frameRef}
          src={src}
          title=""
          tabIndex={-1}
          scrolling="no"
          className={`pointer-events-none absolute left-0 top-0 origin-top-left border-0 transition-opacity duration-300 ${
            loaded ? 'opacity-100' : 'opacity-0'
          }`}
          style={{
            width: DESIGN_PREVIEW_VIEWPORT_WIDTH,
            height: frameHeight,
            transform: `scale(${scale})`,
          }}
        />
      ) : null}
      {loaded ? null : (
        <span className="absolute inset-0 flex flex-col items-center justify-center gap-2.5 text-[color:var(--pf-palette-texte-muted,#a3a3a3)]">
          <span className="absolute inset-0 animate-pulse bg-[color:color-mix(in_srgb,var(--pf-palette-texte-fort,#fff)_5%,transparent)]" />
          {failed ? (
            <span className="relative text-xs font-medium">{t('Preview unavailable')}</span>
          ) : (
            <>
              <span className="relative">
                <LoadingSpinner size="sm" />
              </span>
              <span className="relative text-xs font-medium">{t('Loading preview…')}</span>
            </>
          )}
        </span>
      )}
    </div>
  );
}

/**
 * Live catalogue card: the design itself (the real section, scaled down, with the creator's
 * settings and placeholder content) full width, its name below — one per row so each preview is
 * big enough to read. `cardClassName` / `labelClassName` are the picker's own card chrome
 * (tinted card, accent label when selected — e.g. `.pf-footer-design-card`); the design in use
 * also gets an accent ring around its preview and a "Current" tag.
 */
export function PortfolioDesignLivePreviewCard({
  active,
  label,
  src,
  settings,
  onClick,
  cardClassName,
  labelClassName,
}: {
  active: boolean;
  label: string;
  src: string;
  settings: PortfolioSettings;
  onClick: () => void;
  cardClassName: string;
  labelClassName: string;
}) {
  const t = useT();
  return (
    <button
      type="button"
      aria-pressed={active}
      aria-label={label}
      title={label}
      data-active={active ? 'true' : 'false'}
      onClick={onClick}
      className={`${cardClassName} block w-full rounded-2xl p-1.5 text-left`}
    >
      <span className="relative block overflow-hidden rounded-xl">
        <PortfolioDesignLivePreview src={src} settings={settings} />
        <span
          aria-hidden
          className={`pointer-events-none absolute inset-0 rounded-xl ring-inset ${
            active
              ? 'ring-2 ring-[color:var(--pf-palette-principal,#f97316)]'
              : 'ring-1 ring-[color:var(--pf-palette-bordure)]'
          }`}
        />
      </span>
      <span className="flex items-center justify-between gap-3 px-1.5 pb-1 pt-2.5">
        <span className={`${labelClassName} text-sm font-semibold leading-none tracking-tight`}>{label}</span>
        {active ? (
          <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[color:var(--pf-palette-principal,#f97316)]">
            {t('Current')}
          </span>
        ) : null}
      </span>
    </button>
  );
}

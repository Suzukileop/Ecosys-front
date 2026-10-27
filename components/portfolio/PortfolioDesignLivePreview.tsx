'use client';
import {DesignCatalogueCard} from './portfolio-design-catalogue-card';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { PortfolioSettings } from '@/components/portfolio/portfolio-settings-types';
import { useT, useLocale } from '@/lib/i18n/I18nProvider';
import { PORTFOLIO_STUDIO_PREVIEW_SOURCE } from '@/lib/portfolio-studio-preview';
import { DESIGN_PREVIEW_VIEWPORT_WIDTH, isDesignPreviewMessage } from '@/lib/portfolio-design-preview';
import { enqueuePortfolioPreview } from '@/lib/portfolio-preview-load-queue';
import { capturePortfolioPreview, readPortfolioPreview } from '@/lib/portfolio-preview-cache';

/**
 * What a design picker needs to show real previews: the creator's portfolio path (each card loads
 * it in a small iframe) and the studio's current, unsaved settings (posted to every card, so a
 * preview wears the creator's own palette, fonts and options). Provided by the studio's live
 * preview; a picker rendered without it falls back to its wireframe thumbnails.
 */
type DesignPreviewSource = {
  portfolioPath: string;
  profileAvatarUrl?: string | null;
  availableGallery?: import('@/types/profile').ProfileGalleryItem[];
  availableSkills?: { id: string; title: string }[];
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

/**
 * One design, rendered for real: the page at `src` is laid out at a laptop width and scaled down
 * to the card's width, so viewport units, breakpoints and scroll-triggered motion all behave as on
 * the live site. Loads only once scrolled near, and is inert (no pointer, no focus, hidden from
 * assistive tech) — the surrounding card button does the picking.
 */
export function PortfolioDesignLivePreview({
  src: sourceSrc,
  settings,
  fill = false,
  loadMargin = '240px 0px',
  skeleton,
  animateSkeleton = true,
  backgroundColor,
  eagerWhenNear = true,
}: {
  src: string;
  settings: PortfolioSettings;
  /** Fill a catalogue card with a fixed large preview frame instead of sizing the card from the section height. */
  fill?: boolean;
  /** How close the card must be before its iframe mounts. Smaller margins reduce concurrent previews. */
  loadMargin?: string;
  /** Optional design-specific silhouette shown until the real preview confirms that it rendered. */
  skeleton?: ReactNode;
  /** Keep an opaque custom skeleton steady; pulsing the whole canvas causes a gray veil. */
  animateSkeleton?: boolean;
  /** Opaque section canvas, including fractional-pixel edges below the scaled iframe. */
  backgroundColor?: string;
  /** IntersectionObserver already gates automatic catalogue loads; avoid a second lazy delay. */
  eagerWhenNear?: boolean;
}) {
  const {locale}=useLocale();
  // Locale is part of the iframe identity AND the snapshot key: translated UI must
  // never reuse a rendered miniature from the previous language.
  const src=sourceSrc+(sourceSrc.includes('?')?'&':'?')+'previewLocale='+locale;
  const wrapRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLIFrameElement>(null);
  const readyRef = useRef(false);
  const settingsRef = useRef(settings);
  const requestRef = useRef(0);
  const releaseLoadRef = useRef<(() => void) | null>(null);
  const lastPostedSettingsRef = useRef<string | null>(null);
  const captureTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const settingsKey = useMemo(() => JSON.stringify(settings), [settings]);
  const [cachedSnapshot] = useState(() => readPortfolioPreview(src, JSON.stringify(settings)));
  const useSnapshot = cachedSnapshot?.src === src && cachedSnapshot.settingsKey === settingsKey;
  const [near, setNear] = useState(false);
  const [loadGranted, setLoadGranted] = useState(false);
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState<number | null>(null);
  const [revealedSrc, setRevealedSrc] = useState('');
  useEffect(()=>{readyRef.current=false;lastPostedSettingsRef.current=null;},[src]);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    // A cached catalogue can be hidden between visits. Keep its last width so its
    // iframe stays mounted instead of being discarded when display:none reports zero.
    const resize = new ResizeObserver(([entry]) => {
      if (entry.contentRect.width > 0) setWidth(entry.contentRect.width);
    });
    resize.observe(wrap);
    const intersect = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setNear(true);
        intersect.disconnect();
      },
      { rootMargin: loadMargin }
    );
    intersect.observe(wrap);
    return () => {
      resize.disconnect();
      intersect.disconnect();
    };
  }, [loadMargin]);

  useEffect(() => {
    if (!near || useSnapshot) return;
    return enqueuePortfolioPreview(release => {
      releaseLoadRef.current = release;
      setLoadGranted(true);
    });
  }, [near, src, useSnapshot]);

  const postSettings = useCallback(() => {
    const target = frameRef.current?.contentWindow;
    if (!target || !readyRef.current) return;
    const serialized = JSON.stringify(settingsRef.current);
    if (serialized === lastPostedSettingsRef.current) return;
    lastPostedSettingsRef.current = serialized;
    target.postMessage(
      { source: PORTFOLIO_STUDIO_PREVIEW_SOURCE, type: 'apply-settings', settings: settingsRef.current, previewRequestId: ++requestRef.current },
      window.location.origin
    );
  }, []);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.source !== frameRef.current?.contentWindow) return;
      if (event.data?.source === PORTFOLIO_STUDIO_PREVIEW_SOURCE && event.data.type === 'design-preview-applied' && event.data.previewRequestId === requestRef.current) {
        setRevealedSrc(src);
        releaseLoadRef.current?.();
        const appliedKey = lastPostedSettingsRef.current;
        if (captureTimerRef.current) clearTimeout(captureTimerRef.current);
        captureTimerRef.current = setTimeout(() => {
          const frame = frameRef.current;
          if (frame && appliedKey && appliedKey === JSON.stringify(settingsRef.current)) {
            capturePortfolioPreview(frame, src, appliedKey);
          }
        }, 350);
        return;
      }
      if (!isDesignPreviewMessage(event.data)) return;
      if (event.data.type === 'design-preview-ready') {
        readyRef.current = true;
        lastPostedSettingsRef.current = null;
        postSettings();
        return;
      }
      if (event.data.height > 0) {
        setHeight(event.data.height);
        // The real section is already rendered. Do not keep it hidden just because the optional
        // settings acknowledgement was delayed or lost.
        setRevealedSrc(src);
        releaseLoadRef.current?.();
      }
    };
    window.addEventListener('message', onMessage);
    return () => {
      window.removeEventListener('message', onMessage);
      if (captureTimerRef.current) clearTimeout(captureTimerRef.current);
    };
  }, [postSettings, src]);

  useEffect(() => {
    settingsRef.current = settings;
    if (!readyRef.current || useSnapshot) return;
    const timer = window.setTimeout(postSettings, SETTINGS_POST_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [settings, postSettings, useSnapshot]);


  const scale = width > 0 ? width / DESIGN_PREVIEW_VIEWPORT_WIDTH : 0;
  const mounted = (useSnapshot ? near : loadGranted) && scale > 0;
  // The iframe's own height is its viewport height, and some designs size themselves in `vh`:
  // growing the frame to fit them grows them again. Capping the frame (it is cropped there anyway)
  // bounds that loop.
  const frameHeight = Math.min((useSnapshot ? cachedSnapshot.height : height) ?? FALLBACK_FRAME_HEIGHT, MAX_FRAME_HEIGHT);
  const shownHeight = frameHeight;
  const loaded = (useSnapshot && near) || revealedSrc === src;

  return (
    <div
      ref={wrapRef}
      aria-hidden
      className="relative w-full overflow-hidden bg-[color:color-mix(in_srgb,var(--pf-palette-texte-fort,#fff)_4%,transparent)]"
      style={{ height: fill ? '100%' : scale > 0 ? Math.ceil(shownHeight * scale) : 150, backgroundColor }}
    >
      {mounted ? (
        <iframe
          key={`${src}:${useSnapshot ? 'cached' : 'live'}`}
          ref={frameRef}
          src={useSnapshot ? undefined : src}
          srcDoc={useSnapshot ? cachedSnapshot.html : undefined}
          sandbox={useSnapshot ? 'allow-same-origin' : undefined}
          title=""
          tabIndex={-1}
          scrolling="no"
          onError={() => releaseLoadRef.current?.()}
          loading={eagerWhenNear ? 'eager' : 'lazy'}
          className={`pointer-events-none absolute left-0 top-0 origin-top-left border-0 transition-opacity duration-300 ${
            loaded ? 'opacity-100' : 'opacity-0'
          }`}
          style={{
            width: DESIGN_PREVIEW_VIEWPORT_WIDTH,
            height: frameHeight,
            transform: `scale(${scale})`,
            backgroundColor,
            display: 'block',
            border: 0,
            outline: 'none',
            boxShadow: 'none',
          }}
        />
      ) : null}
      {loaded ? null : (
        <span className="absolute inset-0 overflow-hidden bg-[color:color-mix(in_srgb,var(--pf-palette-texte-fort,#fff)_4%,transparent)]">
          <span className={`absolute inset-0${animateSkeleton ? ' animate-pulse' : ''}`}>
            {skeleton ?? (
              <>
                <span className="absolute left-[8%] top-[19%] h-[7%] w-[19%] rounded-sm bg-[color:color-mix(in_srgb,var(--pf-palette-texte-fort,#fff)_13%,transparent)]" />
                <span className="absolute left-[8%] top-[35%] h-[12%] w-[67%] rounded-sm bg-[color:color-mix(in_srgb,var(--pf-palette-texte-fort,#fff)_18%,transparent)]" />
                <span className="absolute left-[8%] top-[52%] h-[12%] w-[51%] rounded-sm bg-[color:color-mix(in_srgb,var(--pf-palette-texte-fort,#fff)_12%,transparent)]" />
                <span className="absolute bottom-[17%] left-[8%] h-[6%] w-[29%] rounded-sm bg-[color:color-mix(in_srgb,var(--pf-palette-texte-fort,#fff)_9%,transparent)]" />
              </>
            )}
          </span>
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
 * can also get an accent ring around its preview and a "Current" tag. Pickers that already use
 * their outer card as the selected state can disable both to avoid duplicate selection chrome.
 */
export function PortfolioDesignLivePreviewCard({
  active,
  label,
  src,
  settings,
  onClick,
  cardClassName,
  labelClassName,
  showPreviewRing = true,
  showCurrentBadge = true,
  flush = false,
  thumbnail,
  previewImageSrc,
  onCustomize,
  autoLoad = false,
}: {
  active: boolean;
  label: string;
  src: string;
  settings: PortfolioSettings;
  onClick: () => void;
  cardClassName: string;
  labelClassName: string;
  showPreviewRing?: boolean;
  showCurrentBadge?: boolean;
  flush?: boolean;
  thumbnail?: ReactNode;
  /** Static catalogue experiment: no portfolio iframe, including on hover. */
  previewImageSrc?: string;
  onCustomize?: () => void;
  /** Load when near the visible catalogue area, independently of hover and selection. */
  autoLoad?: boolean;
}) {
  const t = useT();
  const [engaged, setEngaged] = useState(false);
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stopHover = () => { if (hoverTimer.current) clearTimeout(hoverTimer.current); setEngaged(false); };
  useEffect(() => () => { if (hoverTimer.current) clearTimeout(hoverTimer.current); }, []);
  if(onCustomize)return <DesignCatalogueCard label={label} selected={active} onSelect={onClick} onCustomize={onCustomize}>
    <span className="block" onPointerEnter={()=>{hoverTimer.current=setTimeout(()=>setEngaged(true),180);}} onPointerLeave={stopHover}>
      {autoLoad||active||engaged?<PortfolioDesignLivePreview key={src} src={src} settings={settings} skeleton={thumbnail} loadMargin={autoLoad ? '120px 0px' : undefined} eagerWhenNear={autoLoad}/>:<span aria-hidden className="flex aspect-[2/1] w-full items-center justify-center overflow-hidden bg-neutral-900/5 p-4">{thumbnail}</span>}
    </span>
  </DesignCatalogueCard>;
  return (
    <button
      type="button"
      aria-pressed={active}
      aria-label={label}
      title={label}
      data-active={active ? 'true' : 'false'}
      onClick={onClick}
      onPointerEnter={() => { hoverTimer.current = setTimeout(() => setEngaged(true), 180); }}
      onPointerLeave={stopHover}
      onFocus={() => setEngaged(true)}
      onBlur={stopHover}
      className={`${cardClassName} block w-full rounded-2xl text-left ${flush ? 'p-0' : 'p-1.5'}`}
    >
      <span className="relative block overflow-hidden rounded-xl">
        {previewImageSrc ? (
          // Small, already optimized static catalogue asset: no additional image proxy.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={previewImageSrc} alt="" width={800} height={400} decoding="async" className="block aspect-[2/1] w-full object-cover" />
        ) : autoLoad || active || engaged ? <PortfolioDesignLivePreview key={src} src={src} settings={settings} skeleton={thumbnail} loadMargin={autoLoad ? '120px 0px' : undefined} eagerWhenNear={autoLoad} /> : (
          <span aria-hidden className="flex aspect-[2/1] w-full items-center justify-center overflow-hidden bg-neutral-900/5 p-4">{thumbnail}</span>
        )}
        {showPreviewRing ? (
          <span
            aria-hidden
            className={`pointer-events-none absolute inset-0 rounded-xl ring-inset ${
              active
                ? 'ring-2 ring-[color:var(--pf-palette-principal,#f97316)]'
                : 'ring-1 ring-[color:var(--pf-palette-bordure)]'
            }`}
          />
        ) : null}
      </span>
      <span className="flex items-center justify-between gap-3 px-1.5 pb-1 pt-2.5">
        <span className={`${labelClassName} text-sm font-semibold leading-none tracking-tight`}>{label}</span>
        {active && showCurrentBadge ? (
          <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[color:var(--pf-palette-principal,#f97316)]">
            {t('Current')}
          </span>
        ) : null}
      </span>
    </button>
  );
}

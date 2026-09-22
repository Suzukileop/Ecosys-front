'use client';

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { PortfolioServiceItem } from '@/components/portfolio/PortfolioServicesChrome';
import {
  handleServicesOrderCtaClick,
  useServicesOrderCtaNav,
} from '@/components/portfolio/portfolio-section-primitives';
import type { PortfolioServicesPresentationSettings } from '@/components/portfolio/portfolio-services-settings';

type BillingCycle = 'monthly' | 'yearly';

/**
 * Design-local mirror of the settings the coordinator wires onto
 * `PortfolioServicesPresentationSettings.pricingToggle` (see the `settingsTypeCode`
 * wiring snippet). Kept here too — self-contained, like every other design file in
 * this codebase — and read defensively via `readPricingToggleSettings` so this file
 * compiles cleanly whether or not that field has landed on the shared type yet.
 */
type PricingToggleSettings = {
  /** Which visible row (0-indexed) gets the full color-inversion treatment. */
  popularIndex: number;
  /** Small label on the popular row's badge. Empty hides the badge. */
  popularBadgeLabel: string;
  /** Suffix after the monthly price, e.g. "/ month". */
  periodMonthlyLabel: string;
  /** Suffix after the yearly price, e.g. "/ year". */
  periodYearlyLabel: string;
  /**
   * There is no separate yearly price on a service (only `basePriceCents`), so
   * Yearly is derived: monthly x 12 x (1 - discount / 100).
   */
  yearlyDiscountPercent: number;
  /** CTA pill label on every row. */
  ctaLabel: string;
  /** Toggle position on first paint. */
  defaultBilling: BillingCycle;
};

const DEFAULT_PRICING_TOGGLE_SETTINGS: PricingToggleSettings = {
  popularIndex: 0,
  popularBadgeLabel: 'Most popular',
  periodMonthlyLabel: '/ month',
  periodYearlyLabel: '/ year',
  yearlyDiscountPercent: 15,
  ctaLabel: 'Get Started',
  defaultBilling: 'monthly',
};

function mergePricingToggleSettings(
  base: PricingToggleSettings,
  patch: unknown
): PricingToggleSettings {
  if (!patch || typeof patch !== 'object') return base;
  const record = patch as Record<string, unknown>;
  const popularIndex =
    typeof record.popularIndex === 'number' && Number.isFinite(record.popularIndex)
      ? Math.max(0, Math.round(record.popularIndex))
      : base.popularIndex;
  const popularBadgeLabel =
    typeof record.popularBadgeLabel === 'string'
      ? record.popularBadgeLabel.trim().slice(0, 40)
      : base.popularBadgeLabel;
  const periodMonthlyLabel =
    typeof record.periodMonthlyLabel === 'string' && record.periodMonthlyLabel.trim()
      ? record.periodMonthlyLabel.trim().slice(0, 24)
      : base.periodMonthlyLabel;
  const periodYearlyLabel =
    typeof record.periodYearlyLabel === 'string' && record.periodYearlyLabel.trim()
      ? record.periodYearlyLabel.trim().slice(0, 24)
      : base.periodYearlyLabel;
  const yearlyDiscountPercent =
    typeof record.yearlyDiscountPercent === 'number' && Number.isFinite(record.yearlyDiscountPercent)
      ? Math.min(90, Math.max(0, Math.round(record.yearlyDiscountPercent)))
      : base.yearlyDiscountPercent;
  const ctaLabel =
    typeof record.ctaLabel === 'string' && record.ctaLabel.trim()
      ? record.ctaLabel.trim().slice(0, 32)
      : base.ctaLabel;
  const defaultBilling =
    record.defaultBilling === 'monthly' || record.defaultBilling === 'yearly'
      ? record.defaultBilling
      : base.defaultBilling;
  return {
    popularIndex,
    popularBadgeLabel,
    periodMonthlyLabel,
    periodYearlyLabel,
    yearlyDiscountPercent,
    ctaLabel,
    defaultBilling,
  };
}

function readPricingToggleSettings(
  presentation: PortfolioServicesPresentationSettings
): PricingToggleSettings {
  const raw = (presentation as { pricingToggle?: unknown }).pricingToggle;
  return mergePricingToggleSettings(DEFAULT_PRICING_TOGGLE_SETTINGS, raw);
}

function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** Nearest scrollable ancestor — this app can render inside a nested overflow-y:auto
 *  "pages" container (Studio preview), and a hardcoded window scroller silently never
 *  fires there. Same helper duplicated per-file throughout this codebase on purpose. */
function getScrollParent(el: HTMLElement | null): HTMLElement | null {
  let node = el?.parentElement ?? null;
  while (node && node !== document.body) {
    const { overflowY } = getComputedStyle(node);
    if (
      (overflowY === 'auto' || overflowY === 'scroll' || overflowY === 'overlay') &&
      node.scrollHeight > node.clientHeight + 1
    ) {
      return node;
    }
    node = node.parentElement;
  }
  return null;
}

/** True only for a genuine fine-pointer desktop — gates 3D tilt, sibling focus-blur
 *  and the magnetic CTA. Below 768px, or on any touch/coarse-pointer device, every
 *  row renders at rest: opacity 1, no transform, no blur. */
function usePricingToggleFinePointerDesktop(minWidthPx = 768) {
  const query = `(min-width: ${minWidthPx}px) and (hover: hover) and (pointer: fine)`;
  return useSyncExternalStore(
    (onStoreChange) => {
      if (typeof window === 'undefined') return () => {};
      const mq = window.matchMedia(query);
      mq.addEventListener('change', onStoreChange);
      return () => mq.removeEventListener('change', onStoreChange);
    },
    () => (typeof window === 'undefined' ? false : window.matchMedia(query).matches),
    () => false
  );
}

/** Mirrors PortfolioServicesChrome's private formatPrice/isFreePrice (not exported
 *  there) so this file stays self-contained without editing a shared file. */
function isFreePriceLocal(cents: number | null | undefined): boolean {
  return cents != null && !Number.isNaN(cents) && cents === 0;
}

function formatPriceLocal(cents: number | null | undefined): string {
  if (cents == null || Number.isNaN(cents)) return '';
  if (cents === 0) return 'Free';
  return `${(cents / 100).toFixed(2)} €`;
}

/** No `priceYearly` field exists on a service — Yearly is derived from the single
 *  `basePriceCents` and the design's own `yearlyDiscountPercent` setting. */
function deriveYearlyCents(
  monthlyCents: number | null | undefined,
  discountPercent: number
): number | null {
  if (monthlyCents == null || Number.isNaN(monthlyCents)) return null;
  if (monthlyCents === 0) return 0;
  const factor = Math.min(Math.max(discountPercent, 0), 90) / 100;
  return Math.round(monthlyCents * 12 * (1 - factor));
}

function isValidHex(value: string): boolean {
  return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(value.trim());
}

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '').trim();
  const full = clean.length === 3 ? clean.split('').map((c) => c + c).join('') : clean;
  const num = parseInt(full, 16);
  if (Number.isNaN(num) || full.length !== 6) return [249, 115, 22];
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

/** Simple YIQ-brightness contrast pick — white or near-black ink on an accent fill. */
function contrastInkFor(hex: string): string {
  const [r, g, b] = hexToRgb(hex);
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 150 ? '#0a0a0a' : '#ffffff';
}

function withAlpha(hex: string, alpha: number): string {
  const [r, g, b] = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

type PricingTokens = {
  bg: string;
  ink: string;
  muted: string;
  border: string;
  cardBg: string;
  toggleTrackBg: string;
  toggleTrackBorder: string;
};

function pricingTokens(isLight: boolean): PricingTokens {
  return isLight
    ? {
        bg: '#ffffff',
        ink: '#0a0a0a',
        muted: 'rgba(10,10,10,0.56)',
        border: 'rgba(10,10,10,0.1)',
        cardBg: 'rgba(10,10,10,0.025)',
        toggleTrackBg: 'rgba(10,10,10,0.04)',
        toggleTrackBorder: 'rgba(10,10,10,0.12)',
      }
    : {
        bg: '#000000',
        ink: '#ffffff',
        muted: 'rgba(255,255,255,0.56)',
        border: 'rgba(255,255,255,0.14)',
        cardBg: 'rgba(255,255,255,0.035)',
        toggleTrackBg: 'rgba(255,255,255,0.06)',
        toggleTrackBorder: 'rgba(255,255,255,0.16)',
      };
}

/** Ultra-refined "Monthly / Yearly" switch — a pill thumb that slides with a soft
 *  GSAP spring instead of snapping or sliding linearly. */
function BillingSwitch({
  billing,
  onChange,
  tokens,
  accent,
  accentInk,
}: {
  billing: BillingCycle;
  onChange: (next: BillingCycle) => void;
  tokens: PricingTokens;
  accent: string;
  accentInk: string;
}) {
  const thumbRef = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    const el = thumbRef.current;
    if (!el) return;
    const xPercent = billing === 'yearly' ? 100 : 0;
    if (prefersReducedMotion()) {
      gsap.set(el, { xPercent });
      return;
    }
    gsap.to(el, { xPercent, duration: 0.6, ease: 'elastic.out(1, 0.6)', overwrite: 'auto' });
  }, [billing]);

  return (
    <div
      role="group"
      aria-label="Billing period"
      className="relative inline-flex rounded-full p-1"
      style={{ backgroundColor: tokens.toggleTrackBg, border: `1px solid ${tokens.toggleTrackBorder}` }}
      data-pf-no-color-transition=""
    >
      <span
        ref={thumbRef}
        aria-hidden
        className="absolute rounded-full will-change-transform"
        style={{
          backgroundColor: accent,
          top: '0.25rem',
          bottom: '0.25rem',
          left: '0.25rem',
          width: 'calc(50% - 0.25rem)',
        }}
        data-pf-no-color-transition=""
      />
      {(['monthly', 'yearly'] as const).map((cycle) => {
        const active = billing === cycle;
        return (
          <button
            key={cycle}
            type="button"
            onClick={() => onChange(cycle)}
            aria-pressed={active}
            className="relative z-[1] min-w-[6.5rem] rounded-full px-5 py-2.5 text-sm font-semibold transition-colors duration-300"
            style={{ color: active ? accentInk : tokens.muted }}
            data-pf-no-color-transition=""
          >
            {cycle === 'monthly' ? 'Monthly' : 'Yearly'}
          </button>
        );
      })}
    </div>
  );
}

/** The massive price figure — never snaps between Monthly/Yearly. The outgoing value
 *  fades out sliding down, the incoming one surges in from above (fade + translate). */
function PriceSwap({ text, ink }: { text: string; ink: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [rendered, setRendered] = useState(text);
  const prevTextRef = useRef(text);

  useLayoutEffect(() => {
    if (prevTextRef.current === text) return;
    prevTextRef.current = text;
    const el = ref.current;
    if (!el || prefersReducedMotion()) {
      setRendered(text);
      return undefined;
    }
    gsap.killTweensOf(el);
    const tl = gsap.timeline({ overwrite: 'auto' });
    tl.to(el, { y: 10, opacity: 0, duration: 0.22, ease: 'power2.in' })
      .call(() => setRendered(text))
      .fromTo(el, { y: -10, opacity: 0 }, { y: 0, opacity: 1, duration: 0.36, ease: 'power3.out' });
    return () => {
      tl.kill();
    };
  }, [text]);

  return (
    <span
      ref={ref}
      className="inline-block font-sans font-black leading-none tracking-tight will-change-transform"
      style={{ color: ink, fontSize: 'clamp(2.4rem, 4.2vw, 3.5rem)' }}
      data-pf-no-color-transition=""
    >
      {rendered}
    </span>
  );
}

function PricingRow({
  item,
  index,
  isPopular,
  tokens,
  accent,
  accentInk,
  billing,
  settings,
  canHoverTilt,
  registerRow,
  onFocusRow,
  onBlurRow,
}: {
  item: PortfolioServiceItem;
  index: number;
  isPopular: boolean;
  tokens: PricingTokens;
  accent: string;
  accentInk: string;
  billing: BillingCycle;
  settings: PricingToggleSettings;
  canHoverTilt: boolean;
  registerRow: (index: number, el: HTMLDivElement | null) => void;
  onFocusRow: (index: number) => void;
  onBlurRow: () => void;
}) {
  const rowRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLAnchorElement>(null);
  const { href, onNavigate } = useServicesOrderCtaNav();

  useEffect(() => {
    registerRow(index, rowRef.current);
    return () => registerRow(index, null);
  }, [index, registerRow]);

  // 3D tilt (row) + magnetic pull (CTA) — fine-pointer desktop only, raw
  // addEventListener + gsap.quickTo (not gsap.to per move — quickTo is the
  // performant primitive for continuous pointer-follow tweens in this codebase).
  useEffect(() => {
    const row = rowRef.current;
    const cta = ctaRef.current;
    if (!row || !canHoverTilt) return undefined;

    let detach = () => {};
    try {
      gsap.set(row, { transformPerspective: 1000 });
      const rotateX = gsap.quickTo(row, 'rotationX', { duration: 0.7, ease: 'power3' });
      const rotateY = gsap.quickTo(row, 'rotationY', { duration: 0.7, ease: 'power3' });
      const ctaX = cta ? gsap.quickTo(cta, 'x', { duration: 0.45, ease: 'power3' }) : null;
      const ctaY = cta ? gsap.quickTo(cta, 'y', { duration: 0.45, ease: 'power3' }) : null;

      const onRowMove = (event: PointerEvent) => {
        const rect = row.getBoundingClientRect();
        const px = (event.clientX - rect.left) / rect.width - 0.5;
        const py = (event.clientY - rect.top) / rect.height - 0.5;
        rotateX(py * -3);
        rotateY(px * 3);
      };
      const onRowEnter = () => onFocusRow(index);
      const onRowLeave = () => {
        rotateX(0);
        rotateY(0);
        onBlurRow();
      };
      const onCtaMove = (event: PointerEvent) => {
        if (!cta || !ctaX || !ctaY) return;
        const rect = cta.getBoundingClientRect();
        ctaX((event.clientX - (rect.left + rect.width / 2)) * 0.4);
        ctaY((event.clientY - (rect.top + rect.height / 2)) * 0.4);
      };
      const onCtaLeave = () => {
        if (!cta) return;
        gsap.to(cta, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.4)', overwrite: 'auto' });
      };

      row.addEventListener('pointermove', onRowMove);
      row.addEventListener('pointerenter', onRowEnter);
      row.addEventListener('pointerleave', onRowLeave);
      cta?.addEventListener('pointermove', onCtaMove);
      cta?.addEventListener('pointerleave', onCtaLeave);

      detach = () => {
        row.removeEventListener('pointermove', onRowMove);
        row.removeEventListener('pointerenter', onRowEnter);
        row.removeEventListener('pointerleave', onRowLeave);
        cta?.removeEventListener('pointermove', onCtaMove);
        cta?.removeEventListener('pointerleave', onCtaLeave);
      };
    } catch (error) {
      console.error('[ServicesPricingToggle] tilt/magnetic setup failed', error);
    }
    return () => detach();
  }, [canHoverTilt, index, onFocusRow, onBlurRow]);

  const features = item.tasks.map((task) => task.value.trim()).filter(Boolean);
  const activeCents =
    billing === 'yearly'
      ? deriveYearlyCents(item.basePriceCents, settings.yearlyDiscountPercent)
      : item.basePriceCents;
  const priceText = activeCents == null ? 'Custom quote' : formatPriceLocal(activeCents);
  const showPeriodSuffix = activeCents != null && !isFreePriceLocal(activeCents);
  const periodLabel = billing === 'yearly' ? settings.periodYearlyLabel : settings.periodMonthlyLabel;

  const ink = isPopular ? accentInk : tokens.ink;
  const muted = isPopular ? withAlpha(accentInk, 0.72) : tokens.muted;
  const featureOpacity = isPopular ? 0.72 : 0.5;

  return (
    <div
      ref={rowRef}
      className="relative rounded-[1.75rem] px-6 py-8 will-change-transform sm:px-8 sm:py-9 md:rounded-[2rem] md:px-10 md:py-10"
      style={{
        backgroundColor: isPopular ? accent : tokens.cardBg,
        border: isPopular ? 'none' : `1px solid ${tokens.border}`,
        boxShadow: isPopular ? '0 28px 64px -30px rgba(0,0,0,0.5)' : 'none',
      }}
      data-pf-no-color-transition=""
    >
      <div className="grid grid-cols-1 gap-7 md:grid-cols-[minmax(200px,1fr)_minmax(0,1.55fr)_minmax(150px,auto)] md:items-center md:gap-10 lg:gap-14">
        <div>
          {isPopular && settings.popularBadgeLabel.trim() ? (
            <span
              className="mb-3 inline-block rounded-full px-3 py-1 text-[0.65rem] font-bold uppercase tracking-[0.14em]"
              style={{ backgroundColor: withAlpha(ink, 0.14), color: ink }}
            >
              {settings.popularBadgeLabel}
            </span>
          ) : null}
          <h3 className="font-sans text-lg font-extrabold tracking-tight sm:text-xl" style={{ color: ink }}>
            {item.title}
          </h3>
          {item.description.trim() ? (
            <p className="mt-1.5 max-w-xs text-sm leading-relaxed" style={{ color: muted }}>
              {item.description}
            </p>
          ) : null}
          <div className="mt-5 flex items-baseline gap-1.5">
            <PriceSwap text={priceText} ink={ink} />
            {showPeriodSuffix ? (
              <span className="text-[0.7rem] font-normal tracking-[0.04em]" style={{ color: muted }}>
                {periodLabel}
              </span>
            ) : null}
          </div>
        </div>

        {features.length > 0 ? (
          <ul className="space-y-3.5">
            {features.map((feature, featureIndex) => (
              <li
                key={`${item.id}-feature-${featureIndex}`}
                className="text-sm font-medium leading-[1.7]"
                style={{ color: ink, opacity: featureOpacity }}
              >
                {feature}
              </li>
            ))}
          </ul>
        ) : (
          <div aria-hidden />
        )}

        <div className="flex md:justify-end">
          <a
            ref={ctaRef}
            href={href}
            onClick={(event) => handleServicesOrderCtaClick(event, href, onNavigate)}
            className="inline-flex min-h-[48px] w-full items-center justify-center whitespace-nowrap rounded-full px-7 text-sm font-semibold will-change-transform md:w-auto"
            style={{ border: `1.5px solid ${withAlpha(ink, 0.4)}`, color: ink }}
            data-pf-no-color-transition=""
          >
            {settings.ctaLabel}
          </a>
        </div>
      </div>
    </div>
  );
}

/**
 * Services "Pricing Toggle" — borderless horizontal pricing rows (title+price /
 * iconless features / CTA, three internal columns) with a spring Monthly/Yearly
 * switch up top, one fully color-inverted "popular" row, GSAP 3D tilt + sibling
 * focus-blur on hover, and a magnetic CTA pill. Collapses to a single vertical
 * flow (price header, then features, then a full-width CTA) below 768px, where
 * tilt/blur/magnetic are switched off entirely.
 */
export function ServicesPricingToggleSection({
  services,
  presentation,
}: {
  services: PortfolioServiceItem[];
  presentation: PortfolioServicesPresentationSettings;
}) {
  const settings = readPricingToggleSettings(presentation);
  const items = useMemo(
    () => services.filter((service) => service.title?.trim()),
    [services]
  );

  const isLight = presentation.activeColorMode === 'light';
  const tokens = pricingTokens(isLight);
  const accentRaw = presentation.ctaColor || presentation.cardAccentColor;
  const accent = isValidHex(accentRaw) ? accentRaw : '#f97316';
  const accentInk = contrastInkFor(accent);

  const popularIndex =
    items.length > 0 ? Math.min(Math.max(settings.popularIndex, 0), items.length - 1) : 0;

  const [billing, setBilling] = useState<BillingCycle>(settings.defaultBilling);
  const canHoverTilt = usePricingToggleFinePointerDesktop();

  const rootRef = useRef<HTMLDivElement>(null);
  const toggleWrapRef = useRef<HTMLDivElement>(null);
  const rowRefs = useRef<(HTMLDivElement | null)[]>([]);

  const registerRow = useCallback((index: number, el: HTMLDivElement | null) => {
    rowRefs.current[index] = el;
  }, []);

  const handleFocusRow = useCallback((index: number) => {
    rowRefs.current.forEach((row, i) => {
      if (!row) return;
      gsap.to(row, {
        opacity: i === index ? 1 : 0.12,
        filter: i === index ? 'blur(0px)' : 'blur(2px)',
        duration: 0.5,
        ease: 'power2.out',
        overwrite: 'auto',
      });
    });
  }, []);

  const handleBlurRow = useCallback(() => {
    rowRefs.current.forEach((row) => {
      if (!row) return;
      gsap.to(row, { opacity: 1, filter: 'blur(0px)', duration: 0.5, ease: 'power2.out', overwrite: 'auto' });
    });
  }, []);

  // Entrance — toggle + rows fade/slide up once, on scroll into view.
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || items.length === 0) return undefined;

    gsap.registerPlugin(ScrollTrigger);
    const scroller = getScrollParent(root) ?? undefined;
    const toggle = toggleWrapRef.current;
    const rows = rowRefs.current.filter((el): el is HTMLDivElement => Boolean(el));

    const ctx = gsap.context(() => {
      if (prefersReducedMotion()) {
        if (toggle) gsap.set(toggle, { opacity: 1, y: 0 });
        if (rows.length) gsap.set(rows, { opacity: 1, y: 0 });
        return;
      }
      if (toggle) gsap.set(toggle, { opacity: 0, y: 16 });
      if (rows.length) gsap.set(rows, { opacity: 0, y: 24 });

      const tl = gsap.timeline({
        scrollTrigger: { trigger: root, scroller, start: 'top 82%', once: true },
      });
      if (toggle) tl.to(toggle, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }, 0);
      if (rows.length) {
        tl.to(
          rows,
          { opacity: 1, y: 0, duration: 0.7, stagger: 0.09, ease: 'power3.out' },
          toggle ? 0.15 : 0
        );
      }
    }, root);

    const refreshId = window.setTimeout(() => {
      try {
        ScrollTrigger.refresh();
      } catch (error) {
        console.error('[ScrollTrigger] deferred refresh() failed', error);
      }
    }, 90);

    return () => {
      window.clearTimeout(refreshId);
      ctx.revert();
    };
  }, [items.length]);

  if (services.length === 0 || items.length === 0) return null;

  return (
    <div
      ref={rootRef}
      className="relative left-1/2 w-screen -translate-x-1/2 px-5 py-20 sm:px-8 md:py-24"
      style={{ backgroundColor: tokens.bg }}
      data-pf-no-color-transition=""
    >
      <div className="mx-auto flex max-w-5xl flex-col items-center">
        <div ref={toggleWrapRef} className="mb-12 md:mb-16">
          <BillingSwitch
            billing={billing}
            onChange={setBilling}
            tokens={tokens}
            accent={accent}
            accentInk={accentInk}
          />
        </div>

        <div className="flex w-full flex-col gap-5 sm:gap-6">
          {items.map((item, index) => (
            <PricingRow
              key={item.id}
              item={item}
              index={index}
              isPopular={index === popularIndex}
              tokens={tokens}
              accent={accent}
              accentInk={accentInk}
              billing={billing}
              settings={settings}
              canHoverTilt={canHoverTilt}
              registerRow={registerRow}
              onFocusRow={handleFocusRow}
              onBlurRow={handleBlurRow}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export function isServicesPricingToggleDesign(
  presentation: Pick<PortfolioServicesPresentationSettings, 'sectionDesign'> | undefined
): boolean {
  return (presentation?.sectionDesign as string | undefined) === 'services-pricing-toggle';
}

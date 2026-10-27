'use client';

import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type FocusEvent as ReactFocusEvent,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
  type RefObject,
} from 'react';
import type { PortfolioHeroData } from '@/components/portfolio/portfolio-hero-types';
import {
  heroImageGrayscaleClass,
  resolveHeroAvailabilityValue,
  resolveHeroBannerTools,
  resolveHeroSpecialtyValue,
} from '@/components/portfolio/portfolio-hero-banner-settings';
import {
  DEFAULT_HERO_PALETTE,
  mergeHeroPalette,
  resolveHeroPaletteColor,
} from '@/components/portfolio/portfolio-hero-palette-settings';
import { DEFAULT_AVAILABILITY_UNAVAILABLE_LABEL } from '@/components/portfolio/portfolio-hero-settings';
import { portfolioHeroContentShellClass } from '@/components/portfolio/portfolio-editorial-layout';
import { useT } from '@/lib/i18n/I18nProvider';

const MAX_INDEX_ROWS = 4;
const MAX_SOCIAL_LINKS = 3;
/** Cursor preview frame size (px) — 4:5, like a print. */
const PREVIEW_W = 232;
const PREVIEW_H = 290;
/** Space between the cursor and the print hanging to its left. */
const PREVIEW_GAP = 56;
/** Keep the edge crop deliberate but legible: it should feel typeset, never accidentally hidden. */
const NAME_CROP_EM = 0.9;

const FALLBACK_BIO =
  'Designer and developer building precise, quiet interfaces for studios and independent brands.';

const SOCIAL_NAMES: Record<string, string> = {
  behance: 'Behance',
  dribbble: 'Dribbble',
  facebook: 'Facebook',
  github: 'GitHub',
  instagram: 'Instagram',
  linkedin: 'LinkedIn',
  medium: 'Medium',
  pinterest: 'Pinterest',
  threads: 'Threads',
  tiktok: 'TikTok',
  twitter: 'X',
  vimeo: 'Vimeo',
  x: 'X',
  youtube: 'YouTube',
};

/** A clean platform name for a credits link: known platform, else the site name from the URL. */
function socialName(link: { platform: string; url: string; label: string }): string {
  const fromPlatform = SOCIAL_NAMES[link.platform.trim().toLowerCase()];
  if (fromPlatform) return fromPlatform;
  // Free-form labels/URLs ("tiktokcom", "web.facebook.com/…"): match a known name anywhere.
  const haystack = `${link.platform} ${link.label} ${link.url}`.toLowerCase();
  const known = Object.keys(SOCIAL_NAMES).find((key) => key.length > 2 && haystack.includes(key));
  if (known) return SOCIAL_NAMES[known];
  try {
    const host = new URL(link.url.trim()).hostname.replace(/^(www|web|m)\./, '');
    const site = host.split('.')[0] ?? '';
    if (SOCIAL_NAMES[site]) return SOCIAL_NAMES[site];
    if (site) return site.charAt(0).toUpperCase() + site.slice(1);
  } catch {
    // Not an absolute URL: fall back to the stored label.
  }
  return link.label.trim() || link.platform;
}

type IndexRow = {
  id: string;
  title: string;
  href: string | null;
  imageUrl: string | null;
};

function colophonScrollParent(el: HTMLElement | null): HTMLElement | undefined {
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
  return undefined;
}

function motionAllowed(profile: PortfolioHeroData['motionProfile']): boolean {
  if (profile === 'none') return false;
  return !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Sizes `text` so its widest line spans exactly the width of `box`, and reports how many
 * lines it sets on (1 on wide screens; one per word where CSS stacks the words).
 * Measured at 100px with line-height 1 and scaled, so em-based tracking stays proportional.
 */
function useFitToWidth(
  boxRef: RefObject<HTMLElement | null>,
  textRef: RefObject<HTMLElement | null>,
  text: string
): { size: number; lines: number } | null {
  const [fit, setFit] = useState<{ size: number; lines: number } | null>(null);

  useLayoutEffect(() => {
    const box = boxRef.current;
    const el = textRef.current;
    if (!box || !el) return;
    let alive = true;
    const measure = () => {
      if (!alive) return;
      const previous = el.style.fontSize;
      el.style.fontSize = '100px';
      const rect = el.getBoundingClientRect();
      el.style.fontSize = previous;
      const width = box.clientWidth;
      if (rect.width <= 0 || width <= 0) return;
      const size = Math.floor((width / rect.width) * 10000) / 100;
      const lines = Math.max(1, Math.round(rect.height / 100));
      setFit((current) => (current?.size === size && current.lines === lines ? current : { size, lines }));
    };
    measure();
    // ResizeObserver already batches per frame; measuring in its callback (not via rAF) also keeps
    // working in background tabs, where requestAnimationFrame is paused.
    const observer = new ResizeObserver(measure);
    observer.observe(box);
    void document.fonts?.ready?.then(measure);
    return () => {
      alive = false;
      observer.disconnect();
    };
  }, [boxRef, textRef, text]);

  return fit;
}

/**
 * Colophon — a dense Swiss information grid with one extreme of scale: everything is small
 * and exact (credits strip, indented bio, numbered project index) except the name, fitted
 * edge to edge and cropped by the bottom of the section. Hovering the index pulls each
 * project's image along under the cursor; on touch, rows carry their own thumbnail.
 */
export function PortfolioHeroColophon({ data }: { data: PortfolioHeroData }) {
  const t = useT();
  const palette = mergeHeroPalette(DEFAULT_HERO_PALETTE, data.presentation.palette);
  const fond = resolveHeroPaletteColor(palette, 'fond');
  const ink = resolveHeroPaletteColor(palette, 'texteFort');
  const muted = resolveHeroPaletteColor(palette, 'texteMuted');
  const rule = resolveHeroPaletteColor(palette, 'bordure');
  const accent = resolveHeroPaletteColor(palette, 'principal');
  const neutre = resolveHeroPaletteColor(palette, 'neutre');
  const imageBw = data.presentation.heroImageGrayscale === true;
  const shellX = portfolioHeroContentShellClass(data.contentGutter, data.contentWidthClass);

  const displayName = data.presentation.heroColophonName?.trim() || (data.fullName || data.nameLead || '').trim() || t('Your Name');
  const fullName = data.presentation.heroColophonUppercase ? displayName.toLocaleUpperCase() : displayName;
  const specialty = resolveHeroSpecialtyValue(data.specialite);
  const location = data.locationLabel?.trim() || '';
  const showAvailability = data.presentation.showAvailabilityBadge !== false;
  const availability = resolveHeroAvailabilityValue(
    data.isAvailable,
    data.presentation.availabilityLabel,
    data.presentation.availabilityUnavailableLabel || DEFAULT_AVAILABILITY_UNAVAILABLE_LABEL
  );
  const years =
    typeof data.yearsOfExperience === 'number' && data.yearsOfExperience > 0
      ? Math.min(99, Math.round(data.yearsOfExperience))
      : null;
  const bio = useMemo(
    () => data.description?.replace(/\s+/g, ' ').trim() || FALLBACK_BIO,
    [data.description]
  );
  const contactHref = data.contactHref || '#contact';
  const workHref = data.workHref || '#work';
  const socials = (data.socialLinks ?? []).filter((link) => link.url?.trim()).slice(0, MAX_SOCIAL_LINKS);

  // Projects with media make the index; without any, the profile's tools stand in (no preview).
  const rows: IndexRow[] = useMemo(() => {
    const works = (data.featuredWorks ?? [])
      .filter((work) => work.title?.trim())
      .slice(0, MAX_INDEX_ROWS)
      .map((work) => ({
        id: work.id,
        title: work.title.trim(),
        href: work.href?.trim() || workHref,
        imageUrl: work.imageUrl?.trim() || null,
      }));
    if (works.length > 0 || data.presentation.heroColophonSelectedWorkIds !== null) return works;
    return resolveHeroBannerTools(data.tools, data.presentation.heroEditorialRailSelectedTools, MAX_INDEX_ROWS).map(
      (tool) => ({ id: `tool-${tool}`, title: tool, href: null, imageUrl: null })
    );
  }, [data.featuredWorks, data.tools, data.presentation.heroEditorialRailSelectedTools, data.presentation.heroColophonSelectedWorkIds, workHref]);
  const hasPreviews = rows.some((row) => row.imageUrl);

  const heroRef = useRef<HTMLDivElement>(null);
  const nameBoxRef = useRef<HTMLDivElement>(null);
  const nameTextRef = useRef<HTMLSpanElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const indexRef = useRef<HTMLOListElement>(null);
  const nameFit = useFitToWidth(nameBoxRef, nameTextRef, fullName);
  const [activeRow, setActiveRow] = useState<number | null>(null);

  const navigate = useCallback(
    (event: ReactMouseEvent<HTMLAnchorElement>, href: string, fallbackSection: string) => {
      if (!href.startsWith('#') || !data.onNavigateSection) return;
      event.preventDefault();
      const target = href.slice(1);
      data.onNavigateSection(target.startsWith('work-') ? 'work' : target || fallbackSection);
    },
    [data]
  );

  // ---- Cursor-following preview: lerped position, tilt from horizontal velocity. ----
  const follow = useRef({ x: 0, y: 0, tx: 0, ty: 0, tilt: 0, raf: 0, on: false, fine: false });

  useEffect(() => {
    follow.current.fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const state = follow.current;
    return () => cancelAnimationFrame(state.raf);
  }, []);

  const tick = useCallback(function step() {
    const s = follow.current;
    const el = previewRef.current;
    if (!el) return;
    const dx = s.tx - s.x;
    s.x += dx * 0.16;
    s.y += (s.ty - s.y) * 0.16;
    s.tilt += (Math.max(-7, Math.min(7, dx * 0.09)) - s.tilt) * 0.12;
    // The print hangs to the left of the cursor, over the open space, so the titles stay readable.
    el.style.transform = `translate3d(${s.x - PREVIEW_W - PREVIEW_GAP}px, ${s.y - PREVIEW_H * 0.62}px, 0) rotate(${s.tilt}deg)`;
    const settled = Math.abs(dx) < 0.2 && Math.abs(s.ty - s.y) < 0.2 && Math.abs(s.tilt) < 0.05;
    s.raf = settled && !s.on ? 0 : requestAnimationFrame(step);
  }, []);

  const placeTarget = useCallback(
    (clientX: number, clientY: number, snap: boolean) => {
      const hero = heroRef.current;
      if (!hero) return;
      const rect = hero.getBoundingClientRect();
      const s = follow.current;
      // x is anchored to the index column's left edge (the print hangs in the open space beside
      // it); the cursor only nudges it a little, so the titles are never covered.
      const indexLeft = indexRef.current?.getBoundingClientRect().left ?? clientX;
      s.tx = indexLeft - rect.left + (clientX - indexLeft) * 0.12;
      s.ty = clientY - rect.top;
      if (snap) {
        s.x = s.tx;
        s.y = s.ty;
      }
      if (!s.raf) s.raf = requestAnimationFrame(tick);
    },
    [tick]
  );

  const openPreview = useCallback(
    (index: number, clientX: number, clientY: number) => {
      const s = follow.current;
      if (!hasPreviews || !rows[index]?.imageUrl) {
        setActiveRow(index);
        return;
      }
      const wasOpen = s.on;
      s.on = true;
      setActiveRow(index);
      placeTarget(clientX, clientY, !wasOpen);
    },
    [hasPreviews, rows, placeTarget]
  );

  const closePreview = useCallback(() => {
    follow.current.on = false;
    setActiveRow(null);
  }, []);

  const onRowPointer = (index: number) => (event: ReactPointerEvent<HTMLElement>) => {
    if (event.pointerType !== 'mouse' || !follow.current.fine) {
      setActiveRow(index);
      return;
    }
    openPreview(index, event.clientX, event.clientY);
  };

  const onRowFocus = (index: number) => (event: ReactFocusEvent<HTMLElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    // Keyboard: park the preview just left of the focused row.
    openPreview(index, rect.left, rect.top + rect.height / 2);
  };

  // ---- Entrance + scroll ----
  useLayoutEffect(() => {
    const hero = heroRef.current;
    if (!hero || !motionAllowed(data.motionProfile)) return;
    gsap.registerPlugin(ScrollTrigger);
    const desktop = window.matchMedia('(min-width: 1024px)');
    const pick = (selector: string) => [...hero.querySelectorAll<HTMLElement>(selector)];

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { overwrite: 'auto' } });
      tl.from(pick('.pf-colophon-topline'), {
        scaleX: 0,
        transformOrigin: 'left center',
        duration: 1.1,
        ease: 'power3.inOut',
      }, 0);
      tl.from(pick('.pf-colophon-credit'), { y: 10, opacity: 0, duration: 0.7, stagger: 0.07, ease: 'power3.out' }, 0.3);
      tl.from(pick('.pf-colophon-char'), {
        yPercent: 104,
        duration: 1.25,
        stagger: { each: 0.03, from: 'start' },
        ease: 'power4.out',
      }, 0.35);
      tl.from(pick('.pf-colophon-bio'), { y: 20, opacity: 0, duration: 1, ease: 'power3.out' }, 0.7);
      tl.from(pick('.pf-colophon-row-rule'), {
        scaleX: 0,
        transformOrigin: 'left center',
        duration: 0.9,
        stagger: 0.07,
        ease: 'power3.inOut',
      }, 0.75);
      tl.from(pick('.pf-colophon-row-body'), { y: 10, opacity: 0, duration: 0.6, stagger: 0.07, ease: 'power3.out' }, 0.95);

      if (desktop.matches) {
        const scroller = colophonScrollParent(hero);
        // Scrolling lifts the name out of its crop while the grid above recedes.
        gsap.to(pick('.pf-colophon-name-inner'), {
          yPercent: -16,
          ease: 'none',
          scrollTrigger: {
            trigger: hero,
            start: 'top top',
            end: 'bottom top',
            scrub: 0.4,
            ...(scroller ? { scroller } : {}),
          },
        });
        gsap.to(pick('.pf-colophon-grid'), {
          opacity: 0.25,
          y: -40,
          ease: 'none',
          scrollTrigger: {
            trigger: hero,
            start: 'top top',
            end: '70% top',
            scrub: 0.4,
            ...(scroller ? { scroller } : {}),
          },
        });
      }
    }, hero);

    return () => ctx.revert();
  }, [fullName, bio, rows.length, data.motionProfile]);

  const nameWords = useMemo(() => fullName.split(/\s+/).filter(Boolean).map((word) => Array.from(word)), [fullName]);
  const credit =
    'pf-colophon-credit m-0 text-[0.72rem] font-medium uppercase leading-[1.45] tracking-[0.065em] sm:text-[0.75rem]';
  const textLink =
    'underline decoration-1 underline-offset-[0.28em] transition-[text-decoration-color] duration-300 hover:decoration-transparent focus-visible:outline-solid focus-visible:outline-1 focus-visible:outline-offset-4';

  return (
    <div
      ref={heroRef}
      className="pf-colophon relative isolate w-full overflow-hidden font-sans"
      style={
        {
          ...(data.suppressBackground ? null : { backgroundColor: fond }),
          color: ink,
          '--pf-colophon-accent': accent,
          '--pf-colophon-muted': muted,
        } as CSSProperties
      }
      onPointerLeave={closePreview}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 left-1/2 z-0 w-screen -translate-x-1/2"
        style={data.suppressBackground ? undefined : { backgroundColor: fond }}
      />

      <div className="relative z-[1] flex min-h-[100svh] flex-col pt-[calc(4.5rem+env(safe-area-inset-top,0px))] sm:pt-[calc(5rem+env(safe-area-inset-top,0px))] lg:min-h-[100dvh] lg:pt-[calc(5.75rem+env(safe-area-inset-top,0px))]">
        <div className={`pf-colophon-grid flex flex-1 flex-col ${shellX}`}>
          <div aria-hidden className="pf-colophon-topline h-px w-full" style={{ backgroundColor: rule }} />

          {/* Credits strip — three quiet columns, read like a colophon. */}
          <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-4 lg:grid-cols-12 lg:gap-x-8">
            <div className="lg:col-span-4">
              <p className={credit}>{specialty}</p>
              {location ? (
                <p className={credit} style={{ color: muted }}>
                  {location}
                </p>
              ) : null}
            </div>
            <div className="lg:col-span-4">
              {showAvailability ? <p data-hero-availability className={credit}>{availability}</p> : null}
              {years ? (
                <p className={credit} style={{ color: muted }}>
                  {t.plural(years, '{count} year of practice', '{count} years of practice')}
                </p>
              ) : null}
            </div>
            <div className="col-span-2 flex flex-wrap gap-x-4 gap-y-1 lg:col-span-4 lg:justify-end lg:text-right">
              {data.showContactCta !== false ? (
                <a
                  href={contactHref}
                  onClick={(event) => navigate(event, contactHref, 'contact')}
                  className={`${credit} ${textLink}`}
                >
                  {t('Get in touch')}
                </a>
              ) : null}
              {socials.map((link) => (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${credit} ${textLink}`}
                  style={{ color: muted }}
                >
                  {socialName(link)}
                </a>
              ))}
            </div>
          </div>

          <div className="mt-8 grid flex-1 grid-cols-1 content-start gap-y-7 pb-4 sm:mt-14 sm:gap-y-10 sm:pb-8 lg:mt-[clamp(3rem,7vh,5.5rem)] lg:grid-cols-12 lg:grid-rows-[auto_1fr] lg:content-start lg:gap-x-8 lg:pb-[clamp(2rem,4vh,3.5rem)]">
            <p data-hero-bio
              className="pf-colophon-bio m-0 max-w-[31ch] font-medium tracking-[-0.035em] [text-indent:1.9em] [text-wrap:balance] lg:col-span-6 lg:self-start"
              style={{ fontSize: 'clamp(1.4rem, 2.45vw, 2.75rem)', lineHeight: 1.08 }}
            >
              {bio}
            </p>

            <nav
              aria-label={t('Selected work')}
              className="lg:col-span-5 lg:col-start-8 lg:row-span-2 lg:self-center lg:pb-[clamp(0rem,2vh,1.5rem)]"
            >
              <ol ref={indexRef} className="pf-colophon-index m-0 list-none p-0" onPointerLeave={closePreview}>
                {rows.map((row, index) => {
                  const active = activeRow === index;
                  const dimmed = activeRow !== null && !active;
                  const body = (
                    <>
                      <span
                        className="w-8 shrink-0 tabular-nums transition-colors duration-300"
                        style={{ color: active ? accent : muted }}
                      >
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <span
                        className="min-w-0 flex-1 truncate transition-transform duration-500 ease-out"
                        style={{ transform: active ? 'translateX(0.45rem)' : 'translateX(0)' }}
                      >
                        {row.title}
                      </span>
                      {row.imageUrl ? (
                        <span
                          className="relative ml-3 block h-10 w-8 shrink-0 overflow-hidden sm:h-12 sm:w-10 lg:hidden"
                          style={{ backgroundColor: neutre }}
                        >
                          <Image
                            src={row.imageUrl}
                            alt=""
                            fill
                            sizes="40px"
                            className={`object-cover ${heroImageGrayscaleClass(imageBw)}`}
                          />
                        </span>
                      ) : null}
                      {row.href ? (
                        <span
                          aria-hidden
                          className="ml-3 hidden shrink-0 transition-[opacity,transform,translate,scale,rotate] duration-300 lg:inline"
                          style={{ opacity: active ? 1 : 0.28, transform: active ? 'none' : 'translateX(-5px)' }}
                        >
                          ↗
                        </span>
                      ) : null}
                    </>
                  );
                  const rowClass =
                    'pf-colophon-row-body flex items-center py-2.5 text-[0.95rem] leading-tight tracking-[-0.012em] focus-visible:outline-solid focus-visible:outline-1 focus-visible:outline-offset-2 sm:py-3.5 sm:text-[1rem] lg:py-[1.05rem] lg:text-[1.08rem]';
                  return (
                    <li
                      key={row.id}
                      className="relative transition-opacity duration-300"
                      style={{ opacity: dimmed ? 0.32 : 1 }}
                    >
                      <span
                        aria-hidden
                        className="pf-colophon-row-rule absolute inset-x-0 top-0 block h-px"
                        style={{ backgroundColor: rule }}
                      />
                      {row.href ? (
                        <a
                          href={row.href}
                          onClick={(event) => navigate(event, row.href as string, 'work')}
                          onPointerEnter={onRowPointer(index)}
                          onPointerMove={(event) => {
                            if (event.pointerType === 'mouse' && follow.current.on) {
                              placeTarget(event.clientX, event.clientY, false);
                            }
                          }}
                          onFocus={onRowFocus(index)}
                          onBlur={closePreview}
                          className={rowClass}
                        >
                          {body}
                        </a>
                      ) : (
                        <div className={rowClass}>{body}</div>
                      )}
                      {index === rows.length - 1 ? (
                        <span
                          aria-hidden
                          className="pf-colophon-row-rule absolute inset-x-0 bottom-0 block h-px"
                          style={{ backgroundColor: rule }}
                        />
                      ) : null}
                    </li>
                  );
                })}
              </ol>
            </nav>
          </div>
        </div>

        {/* The name: fitted edge to edge, its last line cropped by the section's bottom edge.
            Phones stack one word per line so a long name keeps its scale. */}
        <div className={shellX}>
          <div ref={nameBoxRef} className="w-full">
            <h1
              className="pf-colophon-name relative m-0 overflow-hidden font-medium"
              style={{
                fontSize: nameFit ? `${nameFit.size}px` : 'clamp(3.5rem, 15vw, 18rem)',
                height: `${(nameFit?.lines ?? 1) - 1 + NAME_CROP_EM}em`,
                lineHeight: 1,
              }}
              aria-label={fullName}
            >
              <span className="pf-colophon-name-inner block" style={{ marginTop: '-0.045em' }}>
                {/* Tracking lives on the measured span: an em set on the h1 would be inherited as a
                    fixed px value and skew the 100px measurement in useFitToWidth. */}
                <span
                  ref={nameTextRef}
                  aria-hidden
                  className="inline-block whitespace-nowrap pr-[0.04em]"
                  style={{ letterSpacing: '-0.05em' }}
                >
                  {nameWords.map((word, wordIndex) => (
                    <span key={`${word.join('')}-${wordIndex}`} className="block sm:inline">
                      {/* A real space: it separates words on one line and is dropped at the start
                          of a stacked line (phones), so no breakpoint-specific spacer is needed. */}
                      {wordIndex > 0 ? ' ' : null}
                      {word.map((char, index) => (
                        <span key={`${char}-${index}`} className="pf-colophon-char inline-block">
                          {char}
                        </span>
                      ))}
                    </span>
                  ))}
                </span>
              </span>
            </h1>
          </div>
        </div>
      </div>

      {/* One shared print that trails the cursor over the index (fine pointers only). */}
      {hasPreviews ? (
        <div
          ref={previewRef}
          aria-hidden
          className="pointer-events-none absolute left-0 top-0 z-[2] hidden overflow-hidden lg:block"
          style={{
            width: PREVIEW_W,
            height: PREVIEW_H,
            backgroundColor: neutre,
            opacity: activeRow !== null && rows[activeRow]?.imageUrl ? 1 : 0,
            transition: 'opacity 280ms ease',
            willChange: 'transform, opacity',
          }}
        >
          {rows.map((row, index) =>
            row.imageUrl ? (
              <div
                key={row.id}
                className="absolute inset-0"
                style={{
                  clipPath: activeRow === index ? 'inset(0% 0% 0% 0%)' : 'inset(100% 0% 0% 0%)',
                  transform: activeRow === index ? 'scale(1)' : 'scale(1.18)',
                  transition:
                    'clip-path 700ms cubic-bezier(0.19, 1, 0.22, 1), transform 900ms cubic-bezier(0.19, 1, 0.22, 1)',
                  zIndex: activeRow === index ? 2 : 1,
                }}
              >
                <Image
                  src={row.imageUrl}
                  alt=""
                  fill
                  sizes={`${PREVIEW_W}px`}
                  className={`object-cover ${heroImageGrayscaleClass(imageBw)}`}
                />
              </div>
            ) : null
          )}
        </div>
      ) : null}
    </div>
  );
}

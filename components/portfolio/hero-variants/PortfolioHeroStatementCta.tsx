'use client';

import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import { useMemo, useLayoutEffect, useRef, useCallback, type MouseEvent, type ReactNode } from 'react';

// Register GSAP plugins at module level for immediate availability
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
}
import type { PortfolioHeroData } from '@/components/portfolio/portfolio-hero-types';
import {
  heroImageGrayscaleClass,
  resolveHeroAvailabilityValue,
  resolveHeroSpecialtyValue,
  resolveHeroStatementCtaTools,
} from '@/components/portfolio/portfolio-hero-banner-settings';
import {
  DEFAULT_HERO_PALETTE,
  mergeHeroPalette,
  resolveHeroPaletteColor,
} from '@/components/portfolio/portfolio-hero-palette-settings';
import { DEFAULT_AVAILABILITY_UNAVAILABLE_LABEL } from '@/components/portfolio/portfolio-hero-settings';
import { portfolioHeroContentShellClass } from '@/components/portfolio/portfolio-editorial-layout';

/**
 * Statement CTA — Awwwards-level asymmetric "Split éclaté" layout.
 * 
 * Geometry optimisations:
 * - Horizontal alignment: photo top edge aligned with bio first line
 * - Vertical breathing: generous margin under monumental title
 * - Tools bar: compact capsule layout (not full-width spread)
 * 
 * Motion choreography (GSAP + ScrollTrigger):
 * - Entry: title lines reveal from mask, photo scale+rotate, bio/CTAs stagger
 * - Cursor: magnetic inertia dial near photo
 * - Scroll: asymmetric parallax (photo 1.2x, text 0.8x)
 */

/** Nearest scrollable ancestor (pages mode nests overflow-y-auto shells). */
function statementCtaScrollParent(el: HTMLElement | null): HTMLElement | undefined {
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

/** Split title into lines for masked reveal animation. */
function splitTitleIntoLines(title: string): string[] {
  // Split at natural break points: em-dash, long dash, or after "I'm Name"
  const parts = title.split(/\s*—\s*|\s*–\s*|\s*-\s+/);
  if (parts.length >= 2) {
    return [parts[0].trim() + ' —', ...parts.slice(1).map((p) => p.trim())];
  }
  // Fallback: split at comma or midpoint
  const words = title.split(' ');
  if (words.length > 6) {
    const mid = Math.ceil(words.length / 2);
    return [words.slice(0, mid).join(' '), words.slice(mid).join(' ')];
  }
  return [title];
}

function splitBioParagraphs(raw: string): [string, string] {
  const cleaned = raw.replace(/\s+/g, ' ').trim();
  const paragraphs = raw
    .split(/\n\s*\n/)
    .map((p) => p.replace(/\s+/g, ' ').trim())
    .filter(Boolean);

  if (paragraphs.length >= 2) {
    return [paragraphs[0], paragraphs.slice(1).join(' ')];
  }

  const sentences = cleaned.match(/[^.!?]+[.!?]+|[^.!?]+$/g)?.map((s) => s.trim()).filter(Boolean) ?? [
    cleaned,
  ];
  if (sentences.length >= 2) {
    const mid = Math.ceil(sentences.length / 2);
    return [sentences.slice(0, mid).join(' '), sentences.slice(mid).join(' ')];
  }

  const words = cleaned.split(' ');
  if (words.length > 18) {
    const mid = Math.ceil(words.length / 2);
    return [words.slice(0, mid).join(' '), words.slice(mid).join(' ')];
  }

  return [cleaned, ''];
}

export function PortfolioHeroStatementCta({ data }: { data: PortfolioHeroData }) {
  const shellX = portfolioHeroContentShellClass(data.contentGutter, data.contentWidthClass);
  const palette = mergeHeroPalette(DEFAULT_HERO_PALETTE, data.presentation.palette);
  const fond = resolveHeroPaletteColor(palette, 'fond');
  const ink = resolveHeroPaletteColor(palette, 'texteFort');
  const muted = resolveHeroPaletteColor(palette, 'texteMuted');
  const principal = resolveHeroPaletteColor(palette, 'principal');
  const bordure = resolveHeroPaletteColor(palette, 'bordure');
  const imageBw = data.presentation.heroImageGrayscale === true;

  const displayName = (data.fullName || data.nameLead || 'Lorem Ipsum').trim();
  const specialty = resolveHeroSpecialtyValue(data.specialite);
  const availability = resolveHeroAvailabilityValue(
    data.isAvailable,
    data.presentation.availabilityLabel,
    data.presentation.availabilityUnavailableLabel || DEFAULT_AVAILABILITY_UNAVAILABLE_LABEL
  );
  const avatarUrl = data.avatarUrl?.trim() || null;
  const initials = (() => {
    const parts = displayName.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return '??';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase();
  })();

  const centerPortrait =
    data.presentation.heroStatementCtaCenterPortrait === true &&
    data.presentation.heroStatementCtaCenterCover !== true;
  const portraitRing = centerPortrait && data.presentation.heroStatementCtaPortraitRing === true;
  const portraitScale = Math.min(
    180,
    Math.max(100, data.presentation.heroStatementCtaPortraitScale ?? 125)
  );
  const portraitScaleFactor = portraitScale / 100;
  const desktopPortraitSize = `clamp(${(10 * portraitScaleFactor).toFixed(2)}rem, ${(18 * portraitScaleFactor).toFixed(2)}vw, ${(15 * portraitScaleFactor).toFixed(2)}rem)`;
  const mobilePortraitSize = `min(${(56 * portraitScaleFactor).toFixed(2)}vw, ${(14 * portraitScaleFactor).toFixed(2)}rem)`;

  const centerCover = data.presentation.heroStatementCtaCenterCover === true;
  const coverUrl = data.presentation.heroStatementCtaCoverImageUrl?.trim() || null;

  const [bioLead, bioTrail] = useMemo(() => {
    const source =
      data.description?.trim() ||
      'I turn complex ideas into thoughtful, high-performing products through strategy, design, and development.\n\nI partner with founders and teams to ship clear interfaces, resilient systems, and work that feels inevitable.';
    return splitBioParagraphs(source);
  }, [data.description]);

  const statementTools = useMemo(
    () =>
      resolveHeroStatementCtaTools(
        data.tools,
        data.presentation.heroEditorialRailSelectedTools
      ),
    [data.tools, data.presentation.heroEditorialRailSelectedTools]
  );

  // Title split for line-by-line animation
  const titleText = `Hi, I'm ${displayName} — a ${specialty}.`;
  const titleLines = useMemo(() => splitTitleIntoLines(titleText), [titleText]);

  const primaryHref = data.contactHref || '#contact';
  const secondaryHref = data.workHref || '#work';

  /* ───────────────────────────────────────────────────────────────────────────
   * Ref for GSAP animations and scroll detection
   * ─────────────────────────────────────────────────────────────────────────── */
  const heroRef = useRef<HTMLDivElement>(null);

  const onNavClick = (href: string) => (event: MouseEvent<HTMLAnchorElement>) => {
    if (href.startsWith('#') && data.onNavigateSection) {
      event.preventDefault();
      data.onNavigateSection(href.slice(1) || 'contact');
    }
  };

  /** 
   * Photo click → Smooth scroll GSAP vers la section About
   * Animation théâtrale de niveau Awwwards (durée 1.2s, easing power3.inOut)
   */
  const onPhotoClick = useCallback(() => {
    const hero = heroRef.current;
    
    // Find target section - comprehensive selector list
    const targetSelectors = [
      '#about',
      '#profile', 
      '#a-propos',
      '#apropos',
      '#skills',
      '#competences',
      '[data-section="about"]',
      '[data-section="profile"]',
    ];
    
    let target: HTMLElement | null = null;
    for (const selector of targetSelectors) {
      try {
        target = document.querySelector<HTMLElement>(selector);
        if (target) break;
      } catch {
        // Invalid selector, skip
      }
    }

    // Fallback: Find next section after hero container
    if (!target && hero) {
      // Walk up to find the main content wrapper that contains sections
      let container = hero.parentElement;
      while (container) {
        // Look for sibling sections
        const sections = container.querySelectorAll<HTMLElement>('section[id], [data-section]');
        for (const section of sections) {
          // Skip if it's inside the hero
          if (hero.contains(section)) continue;
          // Found a section that's after hero in DOM order
          const heroRect = hero.getBoundingClientRect();
          const sectionRect = section.getBoundingClientRect();
          if (sectionRect.top > heroRect.top) {
            target = section;
            break;
          }
        }
        if (target) break;
        container = container.parentElement;
      }
    }

    // Fallback: Just scroll down by one viewport height
    if (!target) {
      const scroller = hero ? statementCtaScrollParent(hero) : undefined;
      const scrollAmount = window.innerHeight * 0.9;
      
      if (scroller) {
        gsap.to(scroller, {
          scrollTo: { y: scroller.scrollTop + scrollAmount, autoKill: false },
          duration: 1.2,
          ease: 'power3.inOut',
        });
      } else {
        gsap.to(window, {
          scrollTo: { y: window.scrollY + scrollAmount, autoKill: false },
          duration: 1.2,
          ease: 'power3.inOut',
        });
      }
      
      // Also notify portfolio navigation if available
      if (data.onNavigateSection) {
        data.onNavigateSection('about');
      }
      return;
    }

    // Perform GSAP smooth scroll to target
    const scroller = hero ? statementCtaScrollParent(hero) : undefined;
    
    if (scroller) {
      // Custom scroll container (portfolio pages mode)
      const scrollerRect = scroller.getBoundingClientRect();
      const targetRect = target.getBoundingClientRect();
      const targetY = scroller.scrollTop + (targetRect.top - scrollerRect.top);
      
      gsap.to(scroller, {
        scrollTo: { y: targetY, autoKill: false },
        duration: 1.2,
        ease: 'power3.inOut',
      });
    } else {
      // Window scroll (standard page)
      const targetRect = target.getBoundingClientRect();
      const targetY = window.scrollY + targetRect.top;
      
      gsap.to(window, {
        scrollTo: { y: targetY, autoKill: false },
        duration: 1.2,
        ease: 'power3.inOut',
      });
    }
    
    // Also notify portfolio navigation if available (for state sync)
    if (data.onNavigateSection) {
      data.onNavigateSection('about');
    }
  }, [data.onNavigateSection]);

  const hairline = `1px solid color-mix(in srgb, ${bordure} 65%, transparent)`;
  const toolsColor = `color-mix(in srgb, ${muted} 58%, ${fond})`;
  /* Reduced padding to tighten vertical rhythm after adding title margin */
  const bandPadBottom = 'clamp(12rem, 22vh, 18rem)';

  /* ───────────────────────────────────────────────────────────────────────────
   * GSAP Animation & ScrollTrigger Parallax
   * ─────────────────────────────────────────────────────────────────────────── */

  useLayoutEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;

    // Reduced motion check
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      hero.dataset.pfEntry = 'off';
      return;
    }

    // Plugins already registered at module level
    hero.dataset.pfEntry = 'running';

    const scroller = statementCtaScrollParent(hero);
    const pick = (selector: string) => Array.from(hero.querySelectorAll<HTMLElement>(selector));

    // Element selections
    const titleLines = pick('.pf-statement-title-line');
    const titleInners = pick('.pf-statement-title-inner');
    const photoMasks = pick('.pf-statement-photo-mask');
    const photoInners = pick('.pf-statement-photo-inner');
    const bioElements = pick('.pf-statement-bio-entry');
    const ctaElements = pick('.pf-statement-cta-entry');
    const availabilityEl = pick('.pf-statement-availability');
    const toolsBar = pick('.pf-statement-tools-bar');
    const parallaxPhoto = pick('.pf-statement-parallax-photo');
    const parallaxText = pick('.pf-statement-parallax-text');
    const cursorZones = pick('.pf-statement-cursor-zone');

    const media = gsap.matchMedia();
    const detach: Array<() => void> = [];

    const ctx = gsap.context(() => {
      /* ──────────────────────────────────────────
       * A — Entry Animation Choreography
       * ────────────────────────────────────────── */

      // 1. Title lines: slide up from mask
      if (titleInners.length) {
        gsap.set(titleInners, { yPercent: 110 });
      }

      // 2. Photo: scale + micro-rotation from center
      if (photoInners.length) {
        gsap.set(photoInners, { scale: 0, rotation: -8, autoAlpha: 0 });
      }

      // 3. Bio + CTAs: fade + slide up cascade
      const cascade = [...bioElements, ...ctaElements];
      if (cascade.length) {
        gsap.set(cascade, { y: 28, autoAlpha: 0 });
      }

      // 4. Availability badge
      if (availabilityEl.length) {
        gsap.set(availabilityEl, { autoAlpha: 0, x: -12 });
      }

      // 5. Tools bar
      if (toolsBar.length) {
        gsap.set(toolsBar, { autoAlpha: 0, y: 16 });
      }

      // Build the intro timeline
      const intro = gsap.timeline({
        defaults: { ease: 'power3.out' },
        onComplete: () => {
          hero.dataset.pfEntry = 'done';
        },
      });

      // Title reveal — line by line with stagger
      if (titleInners.length) {
        intro.to(
          titleInners,
          {
            yPercent: 0,
            duration: 1.0,
            stagger: 0.12,
            ease: 'power3.out',
          },
          0
        );
      }

      // Photo bloom — scale + rotation unwind
      if (photoInners.length) {
        intro.to(
          photoInners,
          {
            scale: 1,
            rotation: 0,
            autoAlpha: 1,
            duration: 1.15,
            ease: 'power2.out',
          },
          0.25
        );
      }

      // Bio cascade — staggered fade + slide
      if (bioElements.length) {
        intro.to(
          bioElements,
          {
            y: 0,
            autoAlpha: 1,
            duration: 0.85,
            stagger: 0.15,
          },
          0.4
        );
      }

      // CTA buttons cascade
      if (ctaElements.length) {
        intro.to(
          ctaElements,
          {
            y: 0,
            autoAlpha: 1,
            duration: 0.75,
            stagger: 0.1,
          },
          0.6
        );
      }

      // Availability badge slide in
      if (availabilityEl.length) {
        intro.to(
          availabilityEl,
          {
            autoAlpha: 1,
            x: 0,
            duration: 0.65,
          },
          0.3
        );
      }

      // Tools bar fade up
      if (toolsBar.length) {
        intro.to(
          toolsBar,
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.7,
          },
          0.75
        );
      }

      /* ──────────────────────────────────────────
       * B — Magnetic Cursor (hover: fine only)
       * ────────────────────────────────────────── */
      if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
        cursorZones.forEach((zone) => {
          const dial = zone.querySelector<HTMLElement>('.pf-statement-cursor');
          if (!dial) return;

          zone.dataset.magnetic = 'on';
          gsap.set(dial, { xPercent: -50, yPercent: -50, scale: 0.55, autoAlpha: 0 });
          const toX = gsap.quickTo(dial, 'x', { duration: 0.45, ease: 'power3' });
          const toY = gsap.quickTo(dial, 'y', { duration: 0.45, ease: 'power3' });

          const follow = (event: PointerEvent, snap: boolean) => {
            const box = zone.getBoundingClientRect();
            const x = event.clientX - box.left;
            const y = event.clientY - box.top;
            if (snap) gsap.set(dial, { x, y });
            else {
              toX(x);
              toY(y);
            }
          };

          const onEnter = (event: PointerEvent) => {
            if (event.pointerType !== 'mouse') return;
            follow(event, true);
            gsap.to(dial, { autoAlpha: 1, scale: 1, duration: 0.4, ease: 'power2.out' });
          };

          const onMove = (event: PointerEvent) => {
            if (event.pointerType !== 'mouse') return;
            follow(event, false);
          };

          const onLeave = () => {
            gsap.to(dial, { autoAlpha: 0, scale: 0.55, duration: 0.28, ease: 'power2.in' });
          };

          zone.addEventListener('pointerenter', onEnter);
          zone.addEventListener('pointermove', onMove);
          zone.addEventListener('pointerleave', onLeave);
          detach.push(() => {
            zone.removeEventListener('pointerenter', onEnter);
            zone.removeEventListener('pointermove', onMove);
            zone.removeEventListener('pointerleave', onLeave);
            delete zone.dataset.magnetic;
          });
        });
      }

      return () => {
        detach.forEach((off) => off());
      };
    }, hero);

    /* ──────────────────────────────────────────
     * C — Scroll-Driven Parallax (desktop only)
     * Photo: 1.2x speed | Text: 0.8x speed
     * ────────────────────────────────────────── */
    media.add('(min-width: 768px)', () => {
      // Title fade out on scroll (horizontal effect)
      const titleContainer = hero.querySelector<HTMLElement>('.pf-statement-title-container');
      if (titleContainer) {
        gsap.fromTo(
          titleContainer,
          { autoAlpha: 1, x: 0 },
          {
            autoAlpha: 0,
            x: () => -hero.offsetWidth * 0.08,
            ease: 'none',
            scrollTrigger: {
              trigger: hero,
              scroller,
              start: 'top top',
              end: '45% top',
              scrub: true,
              invalidateOnRefresh: true,
            },
          }
        );
      }

      // Photo parallax — moves faster (1.2x ratio = moves UP more)
      parallaxPhoto.forEach((el) => {
        gsap.fromTo(
          el,
          { y: 0 },
          {
            y: () => -hero.offsetHeight * 0.2,
            ease: 'none',
            scrollTrigger: {
              trigger: hero,
              scroller,
              start: 'top top',
              end: 'bottom top',
              scrub: true,
              invalidateOnRefresh: true,
            },
          }
        );
      });

      // Text block parallax — moves slower (0.8x ratio = lags behind)
      parallaxText.forEach((el) => {
        gsap.fromTo(
          el,
          { y: 0 },
          {
            y: () => hero.offsetHeight * 0.12,
            ease: 'none',
            scrollTrigger: {
              trigger: hero,
              scroller,
              start: 'top top',
              end: 'bottom top',
              scrub: true,
              invalidateOnRefresh: true,
            },
          }
        );
      });

      // Fade out the mid content as it scrolls
      const midContent = hero.querySelector<HTMLElement>('.pf-statement-mid-content');
      if (midContent) {
        gsap.fromTo(
          midContent,
          { autoAlpha: 1 },
          {
            autoAlpha: 0,
            ease: 'none',
            scrollTrigger: {
              trigger: hero,
              scroller,
              start: 'top top',
              end: '60% top',
              scrub: true,
              invalidateOnRefresh: true,
            },
          }
        );
      }

      return () => {};
    });

    const refreshId = window.setTimeout(() => ScrollTrigger.refresh(), 80);
    return () => {
      window.clearTimeout(refreshId);
      media.revert();
      ctx.revert();
    };
  }, [centerPortrait, centerCover]);

  const ctaRow = (opts?: { compact?: boolean }): ReactNode => (
    <div className={`flex flex-nowrap items-center gap-x-8 ${opts?.compact ? 'gap-x-6' : ''}`}>
      <a
        href={primaryHref}
        onClick={onNavClick(primaryHref)}
        className={`inline-flex shrink-0 items-center justify-center rounded-full font-sans font-semibold tracking-[-0.01em] transition hover:brightness-110 ${
          opts?.compact ? 'h-11 px-6 text-[0.9rem]' : 'h-12 px-7 text-[0.95rem]'
        }`}
        style={{ backgroundColor: ink, color: fond }}
      >
        Start a project
      </a>
      <a
        href={secondaryHref}
        onClick={onNavClick(secondaryHref)}
        className={`shrink-0 font-sans font-medium tracking-[-0.01em] underline underline-offset-[5px] transition hover:opacity-80 ${
          opts?.compact ? 'text-[0.9rem]' : 'text-[0.95rem]'
        }`}
        style={{ color: ink }}
      >
        View project
      </a>
    </div>
  );

  const bioBlock = (fontSize: string): ReactNode => (
    <div className="flex min-w-0 flex-col gap-5">
      <p
        className="m-0 font-sans font-normal tracking-[-0.01em]"
        style={{ color: muted, fontSize, lineHeight: 1.55 }}
      >
        {bioLead}
      </p>
      {bioTrail ? (
        <p
          className="m-0 font-sans font-normal tracking-[-0.01em]"
          style={{ color: muted, fontSize, lineHeight: 1.55 }}
        >
          {bioTrail}
        </p>
      ) : null}
    </div>
  );

  const portraitDisk = (size: string): ReactNode => {
    const ringWidth = '3px';
    const ringGap = '4px';
    
    // pointer-events: none ensures clicks pass through to parent button
    const pointerNone = { pointerEvents: 'none' as const };
    
    const image = (
      <div
        className="relative h-full w-full overflow-hidden rounded-full"
        style={{ backgroundColor: `color-mix(in srgb, ${bordure} 35%, ${fond})`, ...pointerNone }}
      >
        {avatarUrl ? (
          <Image
            src={avatarUrl}
            alt={`Portrait of ${displayName}`}
            fill
            sizes="(max-width: 768px) 56vw, 22vw"
            className={`object-cover object-center ${heroImageGrayscaleClass(imageBw)}`}
            style={pointerNone}
            priority
          />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center font-sans text-2xl font-semibold tracking-tight md:text-4xl"
            style={{ color: muted, ...pointerNone }}
            aria-hidden
          >
            {initials}
          </div>
        )}
      </div>
    );

    if (!portraitRing) {
      return (
        <div
          className="relative shrink-0 overflow-hidden rounded-full"
          style={{
            width: size,
            height: size,
            aspectRatio: '1 / 1',
            flex: '0 0 auto',
            backgroundColor: `color-mix(in srgb, ${bordure} 35%, ${fond})`,
            ...pointerNone,
          }}
        >
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt={`Portrait of ${displayName}`}
              fill
              sizes="(max-width: 768px) 56vw, 22vw"
              className={`object-cover object-center ${heroImageGrayscaleClass(imageBw)}`}
              style={pointerNone}
              priority
            />
          ) : (
            <div
              className="flex h-full w-full items-center justify-center font-sans text-2xl font-semibold tracking-tight md:text-4xl"
              style={{ color: muted, ...pointerNone }}
              aria-hidden
            >
              {initials}
            </div>
          )}
        </div>
      );
    }

    return (
      <div
        className="relative shrink-0 rounded-full"
        style={{
          width: size,
          height: size,
          aspectRatio: '1 / 1',
          flex: '0 0 auto',
          padding: ringWidth,
          backgroundColor: principal,
          boxSizing: 'border-box',
          ...pointerNone,
        }}
      >
        <div
          className="h-full w-full rounded-full"
          style={{ padding: ringGap, backgroundColor: fond, boxSizing: 'border-box', ...pointerNone }}
        >
          {image}
        </div>
      </div>
    );
  };

  /** Horizontal cover — width = title column; height locked (slightly taller). */
  const horizontalCover = (
    <div
      className="relative w-full overflow-hidden"
      style={{
        width: '92%',
        height: 'clamp(13rem, 28vw, 26rem)',
        borderRadius: '0.85rem',
        backgroundColor: `color-mix(in srgb, ${bordure} 35%, ${fond})`,
        border: `1px solid color-mix(in srgb, ${bordure} 50%, transparent)`,
        flex: '0 0 auto',
      }}
    >
      {coverUrl ? (
        <Image
          src={coverUrl}
          alt=""
          fill
          sizes="(max-width: 768px) 92vw, 70vw"
          className={`object-cover object-center ${heroImageGrayscaleClass(imageBw)}`}
          priority
        />
      ) : (
        <div
          className="flex h-full w-full items-center justify-center font-sans text-sm font-medium tracking-[-0.01em]"
          style={{ color: muted }}
          aria-hidden
        >
          Cover
        </div>
      )}
    </div>
  );

  const ctaUnderBio = centerCover || centerPortrait;

  return (
    <div
      ref={heroRef}
      data-pf-entry="armed"
      className="pf-statement-cta-hero relative isolate w-full overflow-x-clip font-sans"
      style={{ backgroundColor: fond, color: ink }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 left-1/2 z-0 w-screen -translate-x-1/2"
        style={{ backgroundColor: fond }}
      />

      {/* —— Desktop — global content width + gutter only —— */}
      <div
        className={`relative z-[1] hidden min-h-[100dvh] md:grid ${shellX}`}
        style={{
          paddingTop: 'calc(8.25rem + env(safe-area-inset-top, 0px))',
          paddingBottom: 'clamp(1.5rem, 3vh, 2.25rem)',
          /* Same 2-col frame always — portrait must not reshape title or tools. */
          gridTemplateColumns: 'minmax(0, 74fr) minmax(12rem, 26fr)',
          gridTemplateRows: 'auto auto auto auto',
          columnGap: 'clamp(2rem, 4.5vw, 3.5rem)',
          rowGap: 0,
          alignContent: 'start',
        }}
      >
        {/* 
          TITLE — Split into lines for masked reveal animation
          GEOMETRY FIX: Added margin-bottom to separate monumental title from content
        */}
        <div
          className="pf-statement-title-container m-0 min-w-0"
          style={{
            gridColumn: 1,
            gridRow: 1,
            /* GEOMETRY: Generous bottom margin to detach title from mid content */
            marginBottom: 'clamp(3rem, 6vh, 5rem)',
          }}
        >
          <h1
            className="m-0 font-sans font-semibold tracking-[-0.045em]"
            style={{
              color: ink,
              fontSize: 'clamp(2.75rem, 4.6vw, 4.65rem)',
              lineHeight: 1.06,
              maxWidth: '100%',
            }}
          >
            {titleLines.map((line, idx) => (
              <span
                key={idx}
                className="pf-statement-title-line block overflow-hidden"
                style={{ marginBottom: idx < titleLines.length - 1 ? '0.08em' : 0 }}
              >
                <span className="pf-statement-title-inner inline-block will-change-transform">
                  {line}
                </span>
              </span>
            ))}
          </h1>
        </div>

        <div
          className="pf-statement-availability flex items-center justify-end gap-2.5 self-start"
          style={{ gridColumn: 2, gridRow: 1, paddingTop: '0.45rem' }}
        >
          <span
            className="inline-block h-2 w-2 shrink-0 rounded-full"
            style={{ backgroundColor: principal }}
            aria-hidden
          />
          <p
            className="m-0 text-[clamp(0.85rem,1vw,1rem)] font-normal leading-none tracking-[-0.01em]"
            style={{ color: muted }}
          >
            {availability}
          </p>
        </div>

        {/* 
          GEOMETRY FIX: Reduced spacer since title now has margin-bottom
        */}
        <div
          aria-hidden
          style={{
            gridColumn: '1 / -1',
            gridRow: 2,
            height: 'clamp(2rem, 4vh, 3.5rem)',
          }}
        />

        {/*
          Mid content: Photo + Bio aligned horizontally
          GEOMETRY FIX: Photo top edge aligns with bio first line (items-start)
        */}
        <div
          className="pf-statement-mid-content relative min-w-0"
          style={{
            gridColumn: '1 / -1',
            gridRow: 3,
            paddingBottom: bandPadBottom,
          }}
        >
          <div
            className="relative z-[1] grid w-full"
            style={{
              gridTemplateColumns: 'minmax(0, 74fr) minmax(12rem, 26fr)',
              columnGap: 'clamp(2rem, 4.5vw, 3.5rem)',
              /* GEOMETRY: Align photo top with bio text top */
              alignItems: 'start',
            }}
          >
            {ctaUnderBio ? (
              <>
                {/* Photo column with parallax wrapper */}
                <div className="pf-statement-parallax-photo relative min-h-0 will-change-transform">
                  <div className="flex items-start">
                    <div className="w-full">
                      {centerCover ? (
                        <div className="pf-statement-photo-mask">
                          <div className="pf-statement-photo-inner will-change-transform">
                            {horizontalCover}
                          </div>
                        </div>
                      ) : (
                        <div className="flex justify-center">
                          <div className="pf-statement-photo-mask">
                            <div className="pf-statement-photo-inner will-change-transform">
                              {/* Cursor zone restricted to photo only */}
                              <button
                                type="button"
                                className="pf-statement-cursor-zone pf-statement-photo-click relative block cursor-pointer rounded-full border-0 bg-transparent p-0"
                                onClick={onPhotoClick}
                                aria-label="Voir le profil complet"
                                style={{ width: desktopPortraitSize, height: desktopPortraitSize }}
                              >
                                {portraitDisk(desktopPortraitSize)}
                                {/* Magnetic cursor dial — inside photo bounds */}
                                <span
                                  className="pf-statement-cursor pointer-events-none absolute left-0 top-0 flex h-24 w-24 items-center justify-center whitespace-nowrap rounded-full font-sans text-[0.5rem] font-normal uppercase tracking-[0.2em]"
                                  style={{
                                    border: `1px solid color-mix(in srgb, ${ink} 22%, transparent)`,
                                    color: `color-mix(in srgb, ${ink} 68%, transparent)`,
                                    backgroundColor: `color-mix(in srgb, ${ink} 5%, transparent)`,
                                    backdropFilter: 'blur(8px)',
                                  }}
                                >
                                  View • Profile
                                </span>
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bio column with parallax wrapper (slower speed) */}
                <div className="pf-statement-parallax-text relative min-w-0 self-start will-change-transform">
                  <div className="pf-statement-bio-entry">
                    {bioBlock('clamp(1.05rem, 1.2vw, 1.2rem)')}
                  </div>
                  <div className="pf-statement-cta-entry mt-7">{ctaRow()}</div>
                </div>
              </>
            ) : (
              <>
                {/* Default Statement CTA: CTAs bottom-aligned with end of bio */}
                <div className="pf-statement-cta-entry flex items-end self-end">{ctaRow()}</div>
                <div className="pf-statement-bio-entry min-w-0 self-end">
                  {bioBlock('clamp(1.05rem, 1.2vw, 1.2rem)')}
                </div>
              </>
            )}
          </div>
        </div>

        {/* 
          TOOLS BAR — GEOMETRY FIX: Compact capsule aligned left, not full-width spread
        */}
        <div className="pf-statement-tools-bar min-w-0" style={{ gridColumn: '1 / -1', gridRow: 4 }}>
          <div className="w-full" style={{ borderTop: hairline }} />
          {statementTools.length > 0 ? (
            <div
              className="flex w-auto items-baseline justify-start"
              style={{
                marginTop: 'clamp(1.5rem, 3vh, 2.25rem)',
                /* GEOMETRY: Controlled gap instead of justify-between spread */
                gap: 'clamp(2rem, 4vw, 3.5rem)',
              }}
              role="list"
              aria-label="Tools"
            >
              {statementTools.map((tool, index) => (
                <span
                  key={`${tool}-${index}`}
                  role="listitem"
                  className="shrink-0 font-sans text-[clamp(1.05rem,1.25vw,1.2rem)] font-medium tracking-[-0.01em]"
                  style={{ color: toolsColor }}
                >
                  {tool}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      {/* —— Mobile — same global content width + gutter —— */}
      <div
        className={`relative z-[1] flex flex-col pb-12 pt-[calc(7rem+env(safe-area-inset-top,0px))] md:hidden ${shellX}`}
      >
        <div className="pf-statement-availability flex items-center gap-2.5">
          <span
            className="inline-block h-2 w-2 shrink-0 rounded-full"
            style={{ backgroundColor: principal }}
            aria-hidden
          />
          <p
            className="m-0 text-[0.875rem] font-normal leading-none tracking-[-0.01em]"
            style={{ color: muted }}
          >
            {availability}
          </p>
        </div>

        {/* MOBILE TITLE — with line reveal animation */}
        <div className="pf-statement-title-container mt-8">
          <h1
            className="m-0 w-full font-sans font-semibold tracking-[-0.04em]"
            style={{
              color: ink,
              fontSize: 'clamp(2.35rem, 10.5vw, 3.35rem)',
              lineHeight: 1.05,
            }}
          >
            {titleLines.map((line, idx) => (
              <span
                key={idx}
                className="pf-statement-title-line block overflow-hidden"
                style={{ marginBottom: idx < titleLines.length - 1 ? '0.06em' : 0 }}
              >
                <span className="pf-statement-title-inner inline-block will-change-transform">
                  {line}
                </span>
              </span>
            ))}
          </h1>
        </div>

        {centerCover ? (
          <div className="pf-statement-photo-mask mt-8 w-full">
            <div className="pf-statement-photo-inner will-change-transform">
              <div
                className="relative w-full overflow-hidden"
                style={{
                  height: 'clamp(13rem, 28vw, 26rem)',
                  borderRadius: '0.85rem',
                  backgroundColor: `color-mix(in srgb, ${bordure} 35%, ${fond})`,
                  border: `1px solid color-mix(in srgb, ${bordure} 50%, transparent)`,
                }}
              >
                {coverUrl ? (
                  <Image
                    src={coverUrl}
                    alt=""
                    fill
                    sizes="92vw"
                    className={`object-cover object-center ${heroImageGrayscaleClass(imageBw)}`}
                    priority
                  />
                ) : (
                  <div
                    className="flex h-full min-h-[9rem] w-full items-center justify-center font-sans text-sm font-medium"
                    style={{ color: muted }}
                    aria-hidden
                  >
                    Cover
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : null}

        {centerPortrait && !centerCover ? (
          <div className="pf-statement-photo-mask mt-8 flex justify-center">
            <div className="pf-statement-photo-inner will-change-transform">
              {/* Mobile photo — clickable to scroll to about */}
              <button
                type="button"
                className="pf-statement-photo-click relative block cursor-pointer rounded-full border-0 bg-transparent p-0"
                onClick={onPhotoClick}
                aria-label="Voir le profil complet"
                style={{ width: mobilePortraitSize, height: mobilePortraitSize }}
              >
                {portraitDisk(mobilePortraitSize)}
              </button>
            </div>
          </div>
        ) : null}

        <div
          className={`pf-statement-bio-entry flex flex-col gap-4 ${ctaUnderBio ? 'mt-8' : 'mt-7'}`}
        >
          <p
            className="m-0 font-sans font-normal tracking-[-0.01em]"
            style={{ color: muted, fontSize: '1rem', lineHeight: 1.55 }}
          >
            {bioLead}
          </p>
          {bioTrail ? (
            <p
              className="m-0 font-sans font-normal tracking-[-0.01em]"
              style={{ color: muted, fontSize: '1rem', lineHeight: 1.55 }}
            >
              {bioTrail}
            </p>
          ) : null}
        </div>

        <div className="pf-statement-cta-entry mt-8">{ctaRow({ compact: true })}</div>

        <div className="pf-statement-tools-bar mt-10 w-full" style={{ borderTop: hairline }} />

        {/* MOBILE TOOLS — Compact grid layout instead of full-width spread */}
        {statementTools.length > 0 ? (
          <div
            className="pf-statement-tools-bar mt-6 flex flex-wrap items-baseline gap-x-6 gap-y-3"
            role="list"
            aria-label="Tools"
          >
            {statementTools.map((tool, index) => (
              <span
                key={`${tool}-${index}`}
                role="listitem"
                className="font-sans text-[1.05rem] font-medium tracking-[-0.01em]"
                style={{ color: toolsColor }}
              >
                {tool}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

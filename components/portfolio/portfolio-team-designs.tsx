'use client';

/**
 * The Team section's nine member layouts, extracted out of portfolio-section-primitives.tsx and
 * reworked as a premium family: editorial typography (monumental names, small-caps meta,
 * hairlines instead of boxes), generous whitespace, a shared GSAP entrance
 * (portfolio-team-design-motion.ts) and one hover choreography per design.
 *
 * Every layout keeps reading the exact same settings model as before (columns, gap, radius,
 * padding, max width, alignment, avatar size, shadow, border, colors, image aspect/fit/position
 * and the four show* toggles) — nothing here introduces a new setting.
 *
 * Site-wide trap to respect when editing: any node that animates transform/opacity through CSS
 * needs `data-pf-no-color-transition`, otherwise the global color-mode transition rule in
 * globals.css replaces its `transition-property` and the motion silently disappears.
 */

import { useCallback, useEffect, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from 'react';
import gsap from 'gsap';
import { SocialPlatformIcon } from '@/components/marketplace/creator-profile-social-icons';
import { PortfolioDeferredMedia } from '@/components/portfolio/PortfolioDeferredMedia';
import {
  teamAvatarSizeClass,
  teamCardClass,
  teamCardFooterPaddingClass,
  teamCardFrameClass,
  teamCardMaxWidthClass,
  teamCardStyle,
  teamCircleAvatarClass,
  teamContentAlignClass,
  teamDirectoryMaxWidthClass,
  teamDirectoryStackGapClass,
  teamFlexAlignClass,
  teamFloatAvatarAnchorClass,
  teamFloatCardBodyPadClass,
  teamFloatCardMinHeightClass,
  teamFloatGridOffsetClass,
  teamGridClass,
  teamHoverOverlayPaddingClass,
  teamHoverPhotoClass,
  teamListAlignClass,
  teamProfilePhotoHeightClass,
  teamReadableCardText,
  teamSocialAlignClass,
  teamSocialIconButtonClass,
  teamSocialIconGlyphClass,
  teamSpotlightGridClass,
  teamSpotlightMaxWidthClass,
  teamSpotlightNameClass,
  teamSpotlightPhotoSizeClass,
  teamSpotlightRoleClass,
  type PortfolioTeamListAlign,
  type PortfolioTeamPresentationSettings,
} from '@/components/portfolio/portfolio-team-settings';
import { servicesColorLuminance } from '@/components/portfolio/portfolio-services-settings';
import {
  TEAM_CLEAR_PROPS,
  teamIndexLabel,
  teamPrefersReducedMotion,
  useTeamEntrance,
} from '@/components/portfolio/portfolio-team-design-motion';
import type { ProfileTeamMember } from '@/types/ecosystem';

/** One easing for the whole family — a long, soft expo-out, the premium-motion default here. */
const EASE_CLS = 'ease-[cubic-bezier(0.16,1,0.3,1)]';
/** Hover transitions: long enough to read as choreography, short enough to feel immediate. */
const HOVER_CLS = `transition-transform duration-[760ms] ${EASE_CLS}`;
const MEDIA_ZOOM_CLS = `h-full w-full transition-transform duration-[1100ms] ${EASE_CLS} group-hover:scale-[1.055]`;
/**
 * Touch devices have no hover, so the two hover-only designs would show nothing but portraits —
 * name, role and links would be unreachable. On a pointer that cannot hover, their reveal is
 * simply the resting state. `(hover: none)` is the honest test; a narrow desktop window is still
 * a hovering pointer (and, per portfolio-work-projects-carousel-mobile-fixes, resizing a desktop
 * viewport does not flip this query — it needs real device emulation to verify).
 */
const TOUCH_REVEAL_CLS =
  '[@media(hover:none)]:pointer-events-auto [@media(hover:none)]:translate-y-0 [@media(hover:none)]:opacity-100';

function teamImageAspectClass(aspect: PortfolioTeamPresentationSettings['imageAspect']): string {
  if (aspect === 'square') return 'aspect-square w-full';
  if (aspect === 'landscape') return 'aspect-[4/3] w-full';
  if (aspect === 'auto') return 'min-h-48 w-full';
  return 'aspect-[4/5] w-full';
}

/** Small-caps meta line — the family's signature for roles, indexes and counters. */
const META_CLS = 'text-[0.68rem] font-medium uppercase leading-none tracking-[0.2em]';

function TeamMemberImage({
  member,
  presentation,
  className = '',
  fill = false,
  zoom = false,
  reveal = false,
}: {
  member: ProfileTeamMember;
  presentation: PortfolioTeamPresentationSettings;
  className?: string;
  fill?: boolean;
  /** Adds the group-hover portrait push-in. The scale lives on its own layer so it can never blur text. */
  zoom?: boolean;
  /** Marks the portrait as the node the shared entrance settles out of its over-scale. */
  reveal?: boolean;
}) {
  if (!presentation.showImage) return null;
  const fit = presentation.imageFit === 'contain' ? 'object-contain' : 'object-cover';
  const position = {
    center: 'object-center',
    top: 'object-top',
    bottom: 'object-bottom',
    left: 'object-left',
    right: 'object-right',
  }[presentation.imagePosition];
  const media = (
    <div
      className={`relative ${zoom ? MEDIA_ZOOM_CLS : 'h-full w-full'}`}
      data-pf-no-color-transition=""
    >
      {member.imageUrl?.trim() ? (
        <PortfolioDeferredMedia
          src={member.imageUrl}
          alt={`Portrait de ${member.name}`}
          className={`h-full w-full ${fit} ${position}`}
          sizes="(max-width: 768px) 50vw, 280px"
          objectFit={presentation.imageFit === 'contain' ? 'contain' : 'cover'}
          objectPosition={presentation.imagePosition}
        />
      ) : (
        <div
          className="flex h-full min-h-0 w-full items-center justify-center text-[2.75rem] font-semibold tracking-[-0.04em] text-neutral-300"
          aria-hidden
        >
          {member.name.trim().charAt(0).toUpperCase() || '—'}
        </div>
      )}
    </div>
  );
  return (
    <div
      className={`relative overflow-hidden bg-neutral-100 ${
        fill ? 'h-full w-full' : teamImageAspectClass(presentation.imageAspect)
      } ${className}`}
    >
      {reveal ? (
        <div className="relative h-full w-full" data-team-reveal-media="">
          {media}
        </div>
      ) : (
        media
      )}
    </div>
  );
}

function TeamSocialIcon({ platform, className }: { platform: string; className: string }) {
  if (platform === 'EMAIL') {
    return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden><path d="M3.5 6.5h17v11h-17z" /><path d="m4 7 8 6 8-6" /></svg>;
  }
  if (platform === 'FACEBOOK') {
    return <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M13.7 21v-8h2.7l.4-3h-3.1V8.1c0-.9.3-1.5 1.6-1.5H17V3.9a22 22 0 0 0-2.5-.1c-2.5 0-4.2 1.5-4.2 4.2v2H7.5v3h2.8v8h3.4Z" /></svg>;
  }
  if (platform === 'WEBSITE') {
    return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c2.2 2.5 3.3 5.5 3.3 9S14.2 18.5 12 21c-2.2-2.5-3.3-5.5-3.3-9S9.8 5.5 12 3Z" /></svg>;
  }
  return <SocialPlatformIcon platform={platform} className={className} />;
}

function TeamSocialLinks({
  member,
  presentation,
  align = 'justify-center',
  hoverLight = false,
  revealOnHover = false,
}: {
  member: ProfileTeamMember;
  presentation: PortfolioTeamPresentationSettings;
  align?: string;
  hoverLight?: boolean;
  /** Overlay designs: the row rises in on a per-icon stagger instead of appearing all at once. */
  revealOnHover?: boolean;
}) {
  const links = (member.socialLinks ?? []).filter((link) => link.url.trim());
  if (!presentation.showSocials) return null;
  const size = teamSocialIconButtonClass(presentation.socialIconSize);
  const slotHeight = size.split(' ')[0] ?? 'h-9';
  if (links.length === 0) {
    return <div className={`${slotHeight} ${align}`} aria-hidden />;
  }
  const glyph = teamSocialIconGlyphClass(presentation.socialIconSize);
  const chrome =
    presentation.socialIconStyle === 'minimal'
      ? 'border-transparent bg-transparent'
      : presentation.socialIconStyle === 'outline'
        ? 'border-current bg-transparent'
        : presentation.socialIconStyle === 'soft'
          ? 'border-transparent rounded-xl'
          : 'border-transparent rounded-full';
  const hoverTone = hoverLight
    ? 'group-hover:![border-color:color-mix(in_srgb,var(--team-float-hover-ink)_30%,transparent)] group-hover:![background-color:var(--team-float-hover-icon-bg)] group-hover:![color:var(--team-float-hover-ink)]'
    : '';
  const revealCls = revealOnHover
    ? `translate-y-3 opacity-0 transition-[transform,opacity] duration-[620ms] ${EASE_CLS} group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100 ${TOUCH_REVEAL_CLS}`
    : '';
  return (
    <div className={`flex flex-wrap gap-2 ${align}`} aria-label={`Liens sociaux de ${member.name}`}>
      {links.map((link, index) => {
        const href =
          link.platform === 'EMAIL' && !/^mailto:/i.test(link.url)
            ? `mailto:${link.url}`
            : link.url;
        return (
          <a
            key={link.id}
            href={href}
            target={link.platform === 'EMAIL' ? undefined : '_blank'}
            rel={link.platform === 'EMAIL' ? undefined : 'noopener noreferrer'}
            aria-label={link.label?.trim() || `${link.platform} — ${member.name}`}
            className={`inline-flex shrink-0 items-center justify-center border ${size} ${chrome} ${hoverTone} ${revealCls} ${
              revealOnHover ? '' : `transition-transform duration-[420ms] ${EASE_CLS}`
            } hover:-translate-y-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2`}
            data-pf-no-color-transition=""
            style={{
              color: presentation.socialIconColor,
              backgroundColor:
                presentation.socialIconStyle === 'minimal' || presentation.socialIconStyle === 'outline'
                  ? 'transparent'
                  : presentation.socialBackgroundColor,
              transitionDelay: revealOnHover ? `${90 + index * 55}ms` : undefined,
            }}
          >
            <TeamSocialIcon platform={link.platform} className={glyph} />
          </a>
        );
      })}
    </div>
  );
}

function TeamMemberCopy({
  member,
  presentation,
  align = 'text-center',
  size = 'md',
}: {
  member: ProfileTeamMember;
  presentation: PortfolioTeamPresentationSettings;
  align?: string;
  size?: 'md' | 'lg';
}) {
  const readable = teamReadableCardText(presentation);
  const nameClass =
    size === 'lg'
      ? 'text-[1.7rem] font-semibold leading-[1.05] tracking-[-0.03em] sm:text-[2rem]'
      : 'text-[1.3rem] font-semibold leading-[1.1] tracking-[-0.02em]';
  return (
    <div className={align}>
      {presentation.showName ? (
        <h3 className={nameClass} style={{ color: readable.strong }}>
          {member.name}
        </h3>
      ) : null}
      {presentation.showResponsibility ? (
        <p
          className={`${META_CLS} ${size === 'lg' ? 'mt-3.5' : 'mt-2.5'} min-h-[0.7rem]`}
          style={{ color: readable.muted }}
        >
          {member.responsibility.trim() || ' '}
        </p>
      ) : null}
    </div>
  );
}

/** Hairline that draws itself left-to-right under the copy on hover. */
function TeamHoverRule({ color, align }: { color: string; align: PortfolioTeamListAlign }) {
  const origin = align === 'right' ? 'origin-right' : align === 'center' ? 'origin-center' : 'origin-left';
  return (
    <span
      aria-hidden
      className={`mt-5 block h-px w-full scale-x-0 ${origin} transition-transform duration-[760ms] ${EASE_CLS} group-hover:scale-x-100`}
      data-pf-no-color-transition=""
      style={{ backgroundColor: color }}
    />
  );
}

function TeamStandardCard({
  member,
  presentation,
  index,
  polaroidIndex,
  copySize = 'md',
  showIndex = false,
}: {
  member: ProfileTeamMember;
  presentation: PortfolioTeamPresentationSettings;
  index: number;
  polaroidIndex?: number;
  copySize?: 'md' | 'lg';
  showIndex?: boolean;
}) {
  const readable = teamReadableCardText(presentation);
  const align = presentation.listAlign ?? 'center';
  const rotation =
    polaroidIndex == null ? '' : ['-rotate-[1.4deg]', 'rotate-[1deg]', '-rotate-[0.5deg]', 'rotate-[1.7deg]'][polaroidIndex % 4];
  return (
    <article
      className={`group flex h-full w-full flex-col ${teamCardMaxWidthClass(presentation.cardMaxWidth)} ${teamCardClass(presentation)} ${rotation} ${HOVER_CLS} hover:-translate-y-2 hover:rotate-0`}
      data-pf-no-color-transition=""
      data-team-reveal=""
      style={teamCardStyle(presentation)}
    >
      <TeamMemberImage
        member={member}
        presentation={presentation}
        className="rounded-[calc(2rem-0.75rem)]"
        zoom
        reveal
      />
      <div className={`flex min-h-0 flex-1 flex-col ${presentation.showImage ? 'mt-6' : ''}`}>
        {showIndex ? (
          <span className={`${META_CLS} mb-3 block ${teamContentAlignClass(align)}`} style={{ color: readable.muted }}>
            {teamIndexLabel(index)}
          </span>
        ) : null}
        <TeamMemberCopy
          member={member}
          presentation={presentation}
          align={teamContentAlignClass(align)}
          size={copySize}
        />
        {presentation.showSocials ? (
          <div className="mt-auto">
            <TeamHoverRule color={presentation.cardBorderColor} align={align} />
            <div className="pt-5">
              <TeamSocialLinks member={member} presentation={presentation} align={teamSocialAlignClass(align)} />
            </div>
          </div>
        ) : null}
      </div>
    </article>
  );
}

/**
 * Portrait rail — a draggable editorial rail. The native scrollbar is replaced by a hairline
 * progress track with a moving thumb plus an "03 / 08" counter, so the rail reads as a
 * deliberate piece of the composition instead of a browser affordance.
 */
function TeamPortraitRail({
  members,
  presentation,
}: {
  members: ProfileTeamMember[];
  presentation: PortfolioTeamPresentationSettings;
}) {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const dragState = useRef<{ pointerId: number; startX: number; startLeft: number; moved: boolean } | null>(null);
  const [progress, setProgress] = useState(0);
  const [active, setActive] = useState(0);
  const readable = teamReadableCardText(presentation);
  const accent = presentation.socialIconColor;
  // Centering through auto margins on the edge children, never `justify-center`: a centered flex
  // row whose content overflows clips its first item outside the scrollable area, where no amount
  // of scrolling can reach it. Auto margins collapse to 0 as soon as the rail overflows.
  const railAlign =
    presentation.listAlign === 'left'
      ? ''
      : presentation.listAlign === 'right'
        ? '[&>*:first-child]:ml-auto'
        : '[&>*:first-child]:ml-auto [&>*:last-child]:mr-auto';
  const footerAlign =
    presentation.listAlign === 'left'
      ? 'justify-start'
      : presentation.listAlign === 'right'
        ? 'justify-end'
        : 'justify-center';

  const syncProgress = useCallback(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const travel = scroller.scrollWidth - scroller.clientWidth;
    const ratio = travel > 4 ? Math.min(1, Math.max(0, scroller.scrollLeft / travel)) : 0;
    setProgress(ratio);
    setActive(members.length > 1 ? Math.round(ratio * (members.length - 1)) : 0);
  }, [members.length]);

  useEffect(() => {
    syncProgress();
    const scroller = scrollerRef.current;
    if (!scroller || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(syncProgress);
    observer.observe(scroller);
    return () => observer.disconnect();
  }, [syncProgress]);

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    const scroller = scrollerRef.current;
    // Mouse only — touch and pen keep the native, momentum-preserving scroll.
    if (!scroller || event.pointerType !== 'mouse' || event.button !== 0) return;
    dragState.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startLeft: scroller.scrollLeft,
      moved: false,
    };
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const scroller = scrollerRef.current;
    const drag = dragState.current;
    if (!scroller || !drag || drag.pointerId !== event.pointerId) return;
    const delta = event.clientX - drag.startX;
    if (!drag.moved && Math.abs(delta) > 4) {
      drag.moved = true;
      scroller.setPointerCapture?.(event.pointerId);
    }
    if (!drag.moved) return;
    scroller.scrollLeft = drag.startLeft - delta;
  };

  const endDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragState.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    scrollerRef.current?.releasePointerCapture?.(event.pointerId);
    // Keep the flag one frame longer so the click that ends a drag never opens a social link.
    if (drag.moved) window.setTimeout(() => { dragState.current = null; }, 0);
    else dragState.current = null;
  };

  return (
    <div className="w-full">
      <div
        ref={scrollerRef}
        onScroll={syncProgress}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        // Without this the browser starts its own native image drag as soon as the pointer moves
        // over a portrait, which swallows the pointermove stream and the rail never scrolls.
        onDragStart={(event) => event.preventDefault()}
        onClickCapture={(event) => {
          if (dragState.current?.moved) {
            event.preventDefault();
            event.stopPropagation();
          }
        }}
        className={`flex snap-x snap-mandatory items-stretch gap-6 overflow-x-auto pb-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden sm:cursor-grab sm:active:cursor-grabbing ${railAlign}`}
      >
        {members.map((member, index) => (
          <div
            key={member.id}
            className={`flex w-[78vw] shrink-0 snap-center self-stretch sm:w-[24rem] ${teamCardMaxWidthClass(presentation.cardMaxWidth)}`}
          >
            <TeamStandardCard
              member={member}
              presentation={{ ...presentation, imageAspect: 'portrait' }}
              index={index}
              copySize="lg"
              showIndex
            />
          </div>
        ))}
      </div>
      {members.length > 1 ? (
        <div className={`mt-8 flex items-center gap-5 ${footerAlign}`}>
          <div
            className="relative h-px w-full max-w-[18rem] overflow-hidden"
            style={{ backgroundColor: presentation.cardBorderColor }}
            aria-hidden
          >
            <span
              className="absolute inset-y-0 left-0 block"
              data-pf-no-color-transition=""
              style={{
                backgroundColor: accent,
                width: `${100 / members.length}%`,
                transform: `translateX(${progress * (members.length - 1) * 100}%)`,
                transition: 'transform 420ms cubic-bezier(0.16,1,0.3,1)',
              }}
            />
          </div>
          <span className={`${META_CLS} shrink-0 tabular-nums`} style={{ color: readable.muted }}>
            {teamIndexLabel(active)} <span style={{ opacity: 0.45 }}>/ {teamIndexLabel(members.length - 1)}</span>
          </span>
        </div>
      ) : null}
    </div>
  );
}

/**
 * Spotlight — one monumental portrait, every member reachable from a thumbnail strip. Switching
 * is choreographed with GSAP: the portrait wipes up out of an inset clip while the name and role
 * rise behind it, so the swap reads as a page turn rather than an instant image replacement.
 */
function TeamSpotlight({
  members,
  presentation,
}: {
  members: ProfileTeamMember[];
  presentation: PortfolioTeamPresentationSettings;
}) {
  const [activeId, setActiveId] = useState(members[0]?.id ?? '');
  const active = members.find((member) => member.id === activeId) ?? members[0];
  const portraitRef = useRef<HTMLDivElement | null>(null);
  const copyRef = useRef<HTMLDivElement | null>(null);
  const firstRender = useRef(true);
  const activeIndex = Math.max(0, members.findIndex((member) => member.id === active?.id));

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    const portrait = portraitRef.current;
    const copy = copyRef.current;
    if (!portrait || !copy || teamPrefersReducedMotion()) return;
    let tween: gsap.core.Timeline | undefined;
    try {
      tween = gsap
        .timeline()
        .fromTo(
          portrait,
          { clipPath: 'inset(0% 0% 100% 0%)', scale: 1.06 },
          {
            clipPath: 'inset(0% 0% 0% 0%)',
            scale: 1,
            duration: 0.85,
            ease: 'power3.out',
            clearProps: TEAM_CLEAR_PROPS,
          }
        )
        .fromTo(
          copy.children,
          { autoAlpha: 0, y: 20 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.7,
            ease: 'power3.out',
            stagger: 0.07,
            clearProps: TEAM_CLEAR_PROPS,
          },
          0.08
        );
    } catch (error) {
      console.error('[Team spotlight] GSAP swap failed', error);
      gsap.set([portrait, copy.children], { clearProps: TEAM_CLEAR_PROPS });
    }
    return () => {
      tween?.kill();
    };
  }, [activeId]);

  if (!active) return null;
  const readable = teamReadableCardText(presentation);
  const portraitSize = presentation.avatarSize ?? 'sm';
  return (
    <article
      className={`${teamCardClass(presentation)} grid w-full gap-8 ${teamSpotlightMaxWidthClass(presentation.cardMaxWidth)} ${teamListAlignClass(presentation.listAlign)} ${teamSpotlightGridClass()}`}
      data-team-reveal=""
      style={teamCardStyle(presentation)}
    >
      {/* Stretches to the full height of the copy column on desktop: a portrait that stops halfway
          down the frame leaves a dead corner nothing else can fill. */}
      <div
        ref={portraitRef}
        className={`aspect-[4/5] shrink-0 self-start overflow-hidden rounded-2xl max-md:!w-full md:aspect-auto md:h-full md:self-stretch ${teamSpotlightPhotoSizeClass(portraitSize)}`}
        data-team-reveal-media=""
      >
        <TeamMemberImage
          member={active}
          presentation={{ ...presentation, imageAspect: 'portrait' }}
          fill
          className="rounded-2xl"
        />
      </div>
      <div className="flex min-h-0 min-w-0 flex-col md:h-full">
        <div ref={copyRef} className="text-left">
          {/* Counter + a rule running to the far edge: the empty width beside a short name becomes
              a deliberate measure instead of a gap. */}
          <span className="flex items-center gap-4">
            <span className={`${META_CLS} shrink-0 tabular-nums`} style={{ color: readable.muted }}>
              {teamIndexLabel(activeIndex)}
              <span style={{ opacity: 0.45 }}> / {teamIndexLabel(members.length - 1)}</span>
            </span>
            <span className="h-px flex-1" style={{ backgroundColor: presentation.cardBorderColor }} aria-hidden />
          </span>
          {presentation.showName ? (
            <h3
              className={`${teamSpotlightNameClass(presentation.cardMaxWidth)} mt-5`}
              style={{ color: readable.strong }}
            >
              {active.name}
            </h3>
          ) : null}
          {presentation.showResponsibility ? (
            <p className={`${teamSpotlightRoleClass(presentation.cardMaxWidth)}`} style={{ color: readable.muted }}>
              {active.responsibility}
            </p>
          ) : null}
          <div className="mt-8">
            <TeamSocialLinks member={active} presentation={presentation} align="justify-start" />
          </div>
        </div>
        {members.length > 1 ? (
          <div
            className="mt-10 flex gap-3 overflow-x-auto pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden md:mt-auto md:pt-10"
            role="tablist"
            aria-label="Choose a team member"
          >
            {members.map((member, index) => {
              const isActive = member.id === active.id;
              return (
                <button
                  key={member.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActiveId(member.id)}
                  // Flexible basis: the strip fits any team size instead of clipping its last
                  // thumbnail against the card edge; the min width keeps it scrollable past ~10.
                  className={`group relative aspect-square w-full min-w-[2.5rem] max-w-[4.5rem] flex-1 basis-0 overflow-hidden rounded-xl transition-[transform,opacity] duration-[520ms] ${EASE_CLS} ${
                    isActive ? 'scale-100 opacity-100' : 'scale-[0.94] opacity-60 hover:scale-100 hover:opacity-100'
                  } focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2`}
                  data-pf-no-color-transition=""
                >
                  <TeamMemberImage
                    member={member}
                    presentation={{ ...presentation, imageAspect: 'square', showImage: true }}
                    fill
                  />
                  <span
                    aria-hidden
                    className={`absolute inset-x-0 bottom-0 block h-[3px] origin-left transition-transform duration-[520ms] ${EASE_CLS} ${
                      isActive ? 'scale-x-100' : 'scale-x-0'
                    }`}
                    data-pf-no-color-transition=""
                    style={{ backgroundColor: presentation.socialIconColor }}
                  />
                  <span className="sr-only">{`${teamIndexLabel(index)} — ${member.name}`}</span>
                </button>
              );
            })}
          </div>
        ) : null}
      </div>
    </article>
  );
}

/**
 * Directory — a numbered editorial index. On hover the row's name steps to the side, the avatar
 * relaxes out of its circle and an accent hairline draws across the full width of the row.
 */
function TeamDirectoryRow({
  member,
  presentation,
  detached,
  index,
}: {
  member: ProfileTeamMember;
  presentation: PortfolioTeamPresentationSettings;
  detached: boolean;
  index: number;
}) {
  const readable = teamReadableCardText(presentation);
  const pad = teamCardFooterPaddingClass(presentation.cardPadding);
  return (
    <article
      className={`group relative flex h-full flex-col gap-5 sm:flex-row sm:items-center ${
        detached
          ? `${teamCardFrameClass(presentation)} ${pad} ${HOVER_CLS} hover:-translate-y-1`
          : `border-b last:border-b-0 ${pad}`
      }`}
      data-pf-no-color-transition=""
      data-team-reveal=""
      style={detached ? teamCardStyle(presentation) : { borderColor: presentation.cardBorderColor }}
    >
      <div className="flex min-w-0 flex-1 items-center gap-5">
        <span className={`${META_CLS} w-7 shrink-0 tabular-nums`} style={{ color: readable.muted, opacity: 0.7 }}>
          {teamIndexLabel(index)}
        </span>
        {presentation.showImage ? (
          <div
            className={`shrink-0 overflow-hidden rounded-full transition-[border-radius,transform] duration-[760ms] ${EASE_CLS} group-hover:scale-[1.06] group-hover:rounded-[28%] ${teamAvatarSizeClass(presentation.avatarSize)}`}
            data-pf-no-color-transition=""
            data-team-reveal-media=""
          >
            <TeamMemberImage
              member={member}
              presentation={{ ...presentation, imageAspect: 'square' }}
              className="h-full min-h-0"
            />
          </div>
        ) : null}
        <div
          className={`min-w-0 text-left transition-transform duration-[760ms] ${EASE_CLS} group-hover:translate-x-1.5`}
          data-pf-no-color-transition=""
        >
          {presentation.showName ? (
            <h3
              className="text-[1.45rem] font-semibold leading-[1.1] tracking-[-0.025em] sm:text-[1.7rem]"
              style={{ color: readable.strong }}
            >
              {member.name}
            </h3>
          ) : null}
          {presentation.showResponsibility ? (
            <p
              className={`${META_CLS} min-h-[0.7rem] ${presentation.showName ? 'mt-2.5' : ''}`}
              style={{ color: readable.muted }}
            >
              {member.responsibility.trim() || ' '}
            </p>
          ) : null}
        </div>
      </div>
      <div className="sm:min-w-[5.5rem]">
        <TeamSocialLinks member={member} presentation={presentation} align="justify-start sm:justify-end" />
      </div>
      <span
        aria-hidden
        className={`pointer-events-none absolute bottom-0 left-0 block h-px w-full origin-left scale-x-0 transition-transform duration-[860ms] ${EASE_CLS} group-hover:scale-x-100`}
        data-pf-no-color-transition=""
        style={{ backgroundColor: presentation.socialIconColor }}
      />
    </article>
  );
}

/** Profile cards — portrait over a typeset caption block, split by a hairline. */
function TeamProfileCard({
  member,
  presentation,
}: {
  member: ProfileTeamMember;
  presentation: PortfolioTeamPresentationSettings;
}) {
  const readable = teamReadableCardText(presentation);
  const align = presentation.listAlign ?? 'center';
  return (
    <article
      className={`group flex h-full w-full flex-col ${teamCardMaxWidthClass(presentation.cardMaxWidth)} ${teamCardFrameClass(presentation)} ${HOVER_CLS} hover:-translate-y-2`}
      data-pf-no-color-transition=""
      data-team-reveal=""
      style={teamCardStyle(presentation)}
    >
      {presentation.showImage ? (
        <div className={`w-full overflow-hidden ${teamProfilePhotoHeightClass(presentation.avatarSize)}`}>
          <TeamMemberImage member={member} presentation={presentation} fill zoom reveal />
        </div>
      ) : null}
      <div className={`${teamCardFooterPaddingClass(presentation.cardPadding)} ${teamContentAlignClass(align)} flex min-h-0 flex-1 flex-col`}>
        {presentation.showName ? (
          <h3 className="text-[1.35rem] font-semibold leading-[1.1] tracking-[-0.025em]" style={{ color: readable.strong }}>
            {member.name}
          </h3>
        ) : null}
        {presentation.showResponsibility ? (
          <p className={`${META_CLS} mt-2.5 min-h-[0.7rem]`} style={{ color: readable.muted }}>
            {member.responsibility.trim() || ' '}
          </p>
        ) : null}
        {presentation.showSocials ? (
          <div className="mt-auto">
            {presentation.showName || presentation.showResponsibility ? (
              <TeamHoverRule color={presentation.cardBorderColor} align={align} />
            ) : null}
            <div className="pt-5">
              <TeamSocialLinks member={member} presentation={presentation} align={teamSocialAlignClass(align)} />
            </div>
          </div>
        ) : null}
      </div>
    </article>
  );
}

/** Avatar cards — circular portrait inside a ring that draws itself on hover. */
function TeamAvatarCard({
  member,
  presentation,
}: {
  member: ProfileTeamMember;
  presentation: PortfolioTeamPresentationSettings;
}) {
  const readable = teamReadableCardText(presentation);
  const align = presentation.listAlign ?? 'center';
  return (
    <article
      className={`group flex h-full w-full flex-col ${teamFlexAlignClass(align)} ${teamCardMaxWidthClass(presentation.cardMaxWidth)} ${teamCardFrameClass(presentation)} ${teamCardFooterPaddingClass(presentation.cardPadding)} ${teamContentAlignClass(align)} ${HOVER_CLS} hover:-translate-y-2`}
      data-pf-no-color-transition=""
      data-team-reveal=""
      style={teamCardStyle(presentation)}
    >
      {presentation.showImage ? (
        <div className={`relative shrink-0 ${teamCircleAvatarClass(presentation.avatarSize)}`}>
          <div className="h-full w-full overflow-hidden rounded-full" data-team-reveal-media="">
            <TeamMemberImage
              member={member}
              presentation={{ ...presentation, imageAspect: 'square' }}
              fill
              zoom
            />
          </div>
          {/* Ring drawn with an SVG dash offset so it sweeps around the portrait instead of just fading. */}
          <svg
            className="pointer-events-none absolute -inset-[7px] h-[calc(100%+14px)] w-[calc(100%+14px)] -rotate-90"
            viewBox="0 0 100 100"
            fill="none"
            aria-hidden
          >
            <circle
              cx="50"
              cy="50"
              r="49"
              stroke={presentation.socialIconColor}
              strokeWidth="1"
              pathLength={1}
              strokeDasharray={1}
              className={`[stroke-dashoffset:1] transition-[stroke-dashoffset] duration-[900ms] ${EASE_CLS} group-hover:[stroke-dashoffset:0]`}
              data-pf-no-color-transition=""
            />
          </svg>
        </div>
      ) : null}
      {presentation.showName ? (
        <h3
          className={`text-[1.3rem] font-semibold leading-[1.1] tracking-[-0.02em] ${presentation.showImage ? 'mt-7' : ''}`}
          style={{ color: readable.strong }}
        >
          {member.name}
        </h3>
      ) : null}
      {presentation.showResponsibility ? (
        <p
          className={`${META_CLS} min-h-[0.7rem] ${presentation.showName ? 'mt-2.5' : presentation.showImage ? 'mt-7' : ''}`}
          style={{ color: readable.muted }}
        >
          {member.responsibility.trim() || ' '}
        </p>
      ) : null}
      {presentation.showSocials ? (
        <div
          className={`mt-auto w-full ${
            presentation.showImage || presentation.showName || presentation.showResponsibility ? 'pt-6' : ''
          }`}
        >
          <TeamSocialLinks member={member} presentation={presentation} align={teamSocialAlignClass(align)} />
        </div>
      ) : null}
    </article>
  );
}

/**
 * Floating cards — the portrait overlaps the card's top edge and the accent fill sweeps up from
 * the bottom on hover (a scaled layer, so the fill wipes in instead of cross-fading).
 */
function TeamFloatCard({
  member,
  presentation,
}: {
  member: ProfileTeamMember;
  presentation: PortfolioTeamPresentationSettings;
}) {
  const readable = teamReadableCardText(presentation);
  const align = presentation.listAlign ?? 'center';
  const cardStyle = teamCardStyle(presentation);
  const hoverFill = presentation.teamPalette?.principal?.trim() || presentation.socialIconColor;
  const hoverInk = servicesColorLuminance(hoverFill) > 0.55 ? '#111827' : '#ffffff';
  const hoverIconBg =
    servicesColorLuminance(hoverFill) > 0.55
      ? 'color-mix(in srgb, #111827 12%, transparent)'
      : 'color-mix(in srgb, #ffffff 22%, transparent)';
  return (
    <article className={`group relative flex h-full w-full flex-col overflow-visible ${presentation.showImage ? teamFloatGridOffsetClass(presentation.avatarSize) : ''} ${teamCardMaxWidthClass(presentation.cardMaxWidth)}`} data-team-reveal="">
      {presentation.showImage ? (
        <div
          className={`pointer-events-none absolute left-1/2 z-20 -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-full border-4 transition-transform duration-[760ms] ${EASE_CLS} group-hover:-translate-y-[58%] ${teamFloatAvatarAnchorClass(presentation.avatarSize)} ${teamCircleAvatarClass(presentation.avatarSize)}`}
          data-pf-no-color-transition=""
          data-team-reveal-media=""
          style={{
            borderColor: presentation.cardBackgroundColor,
            boxShadow: `0 0 0 1px ${presentation.cardBorderColor}`,
          }}
        >
          <TeamMemberImage
            member={member}
            presentation={{ ...presentation, imageAspect: 'square' }}
            fill
          />
        </div>
      ) : null}
      <div
        className={`relative flex h-full w-full flex-col overflow-hidden ${teamCardFrameClass(presentation)} ${teamFlexAlignClass(align)} ${teamFloatCardBodyPadClass(presentation.avatarSize)} ${teamFloatCardMinHeightClass(presentation.avatarSize)} ${teamContentAlignClass(align)} ${HOVER_CLS} group-hover:-translate-y-1 group-hover:border-transparent`}
        data-pf-no-color-transition=""
        style={
          {
            ...cardStyle,
            '--team-float-hover': hoverFill,
            '--team-float-hover-ink': hoverInk,
            '--team-float-hover-icon-bg': hoverIconBg,
          } as CSSProperties
        }
      >
        <span
          aria-hidden
          className={`pointer-events-none absolute inset-0 z-0 block origin-bottom scale-y-0 transition-transform duration-[720ms] ${EASE_CLS} group-hover:scale-y-100`}
          data-pf-no-color-transition=""
          style={{ backgroundColor: hoverFill }}
        />
        <div className={`relative z-[1] flex w-full flex-1 flex-col ${teamFlexAlignClass(align)}`}>
          {presentation.showName ? (
            <h3
              className="text-[1.3rem] font-semibold leading-[1.1] tracking-[-0.02em] transition-colors group-hover:![color:var(--team-float-hover-ink)]"
              style={{ color: readable.strong }}
            >
              {member.name}
            </h3>
          ) : null}
          {presentation.showResponsibility ? (
            <p
              className={`${META_CLS} min-h-[0.7rem] transition-colors group-hover:![color:color-mix(in_srgb,var(--team-float-hover-ink)_85%,transparent)] ${presentation.showName ? 'mt-2.5' : ''}`}
              style={{ color: readable.muted }}
            >
              {member.responsibility.trim() || ' '}
            </p>
          ) : null}
          {presentation.showSocials ? (
            <div className={`mt-auto w-full ${presentation.showName || presentation.showResponsibility ? 'pt-5' : ''}`}>
              <TeamSocialLinks
                member={member}
                presentation={presentation}
                align={teamSocialAlignClass(align)}
                hoverLight
              />
            </div>
          ) : null}
        </div>
      </div>
    </article>
  );
}

/**
 * Hover cards — portraits only. The caption panel is clipped to nothing until hover, then wipes
 * up from its own bottom edge while the socials stagger in behind it.
 */
function TeamHoverCard({
  member,
  presentation,
  index,
}: {
  member: ProfileTeamMember;
  presentation: PortfolioTeamPresentationSettings;
  index: number;
}) {
  const readable = teamReadableCardText(presentation);
  const align = presentation.listAlign ?? 'left';
  const overlayRadius =
    presentation.cardRadius === 'none'
      ? 'rounded-none'
      : presentation.cardRadius === 'sm'
        ? 'rounded-lg'
        : presentation.cardRadius === 'xl'
          ? 'rounded-2xl'
          : 'rounded-xl';
  return (
    <article
      className={`group relative h-full w-full ${teamCardMaxWidthClass(presentation.cardMaxWidth)} ${teamCardFrameClass(presentation)} ${teamHoverPhotoClass(presentation.avatarSize)}`}
      data-team-reveal=""
      style={teamCardStyle(presentation)}
    >
      {presentation.showImage ? (
        <TeamMemberImage
          member={member}
          presentation={{ ...presentation, imageAspect: 'portrait' }}
          fill
          zoom
          reveal
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-[2.75rem] font-semibold tracking-[-0.04em] text-neutral-300" aria-hidden>
          {member.name.trim().charAt(0).toUpperCase() || '—'}
        </div>
      )}
      <span
        // Shadowed white rather than mix-blend-difference: the blend washes out to near-invisible
        // over a light portrait, and portraits are light more often than not.
        className={`${META_CLS} pointer-events-none absolute left-4 top-4 z-10 font-semibold tabular-nums text-white drop-shadow-[0_1px_6px_rgba(0,0,0,0.55)] transition-opacity duration-[520ms] group-hover:opacity-0 [@media(hover:none)]:opacity-0`}
        data-pf-no-color-transition=""
        aria-hidden
      >
        {teamIndexLabel(index)}
      </span>
      <div
        className={`absolute inset-x-3 bottom-3 z-10 ${overlayRadius} shadow-lg ${teamHoverOverlayPaddingClass(presentation.avatarSize)} ${teamContentAlignClass(align)} pointer-events-none translate-y-4 [clip-path:inset(0_0_100%_0)] transition-[transform,clip-path] duration-[620ms] ${EASE_CLS} group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:[clip-path:inset(0_0_0_0)] group-focus-within:pointer-events-auto group-focus-within:translate-y-0 group-focus-within:[clip-path:inset(0_0_0_0)] ${TOUCH_REVEAL_CLS} [@media(hover:none)]:[clip-path:inset(0_0_0_0)]`}
        data-pf-no-color-transition=""
        style={{ backgroundColor: presentation.cardBackgroundColor }}
      >
        {presentation.showName ? (
          <h3 className="text-[1.05rem] font-semibold leading-[1.15] tracking-[-0.02em] sm:text-[1.2rem]" style={{ color: readable.strong }}>
            {member.name}
          </h3>
        ) : null}
        {presentation.showResponsibility ? (
          <p className={`${META_CLS} mt-2 min-h-[0.7rem]`} style={{ color: readable.muted }}>
            {member.responsibility.trim() || ' '}
          </p>
        ) : null}
        {presentation.showSocials ? (
          <div className={presentation.showName || presentation.showResponsibility ? 'mt-4' : ''}>
            <TeamSocialLinks
              member={member}
              presentation={presentation}
              align={teamSocialAlignClass(align)}
              revealOnHover
            />
          </div>
        ) : null}
      </div>
    </article>
  );
}

/**
 * Hover veil — the portrait stays the subject: a bottom-weighted gradient veil wipes up from the
 * lower edge and the copy rises out of it, instead of a flat grey wash over the whole face.
 */
function TeamCoverCard({
  member,
  presentation,
  index,
}: {
  member: ProfileTeamMember;
  presentation: PortfolioTeamPresentationSettings;
  index: number;
}) {
  const align = presentation.listAlign ?? 'center';
  const overlayAlign =
    align === 'left' ? 'items-start text-left' : align === 'right' ? 'items-end text-right' : 'items-center text-center';
  const riseCls = `translate-y-5 opacity-0 transition-[transform,opacity] duration-[640ms] ${EASE_CLS} group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100 ${TOUCH_REVEAL_CLS}`;
  return (
    <article
      className={`group relative h-full w-full ${teamCardMaxWidthClass(presentation.cardMaxWidth)} ${teamCardFrameClass(presentation)} ${teamHoverPhotoClass(presentation.avatarSize)}`}
      data-team-reveal=""
      style={teamCardStyle(presentation)}
    >
      {presentation.showImage ? (
        <TeamMemberImage
          member={member}
          presentation={{ ...presentation, imageAspect: 'portrait' }}
          fill
          zoom
          reveal
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-[2.75rem] font-semibold tracking-[-0.04em] text-neutral-300" aria-hidden>
          {member.name.trim().charAt(0).toUpperCase() || '—'}
        </div>
      )}
      <span
        aria-hidden
        className={`pointer-events-none absolute inset-0 z-[5] block origin-bottom scale-y-[0.18] opacity-0 transition-[transform,opacity] duration-[720ms] ${EASE_CLS} group-hover:scale-y-100 group-hover:opacity-100 group-focus-within:scale-y-100 group-focus-within:opacity-100 [@media(hover:none)]:scale-y-100 [@media(hover:none)]:opacity-100`}
        data-pf-no-color-transition=""
        style={{
          backgroundImage:
            'linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.62) 42%, rgba(0,0,0,0.18) 78%, rgba(0,0,0,0) 100%)',
        }}
      />
      <div
        className={`absolute inset-0 z-10 flex flex-col justify-end px-6 pb-7 pt-6 ${overlayAlign} pointer-events-none group-hover:pointer-events-auto group-focus-within:pointer-events-auto`}
      >
        <span
          className={`${META_CLS} tabular-nums text-white/70 ${riseCls}`}
          data-pf-no-color-transition=""
          style={{ transitionDelay: '40ms' }}
          aria-hidden
        >
          {teamIndexLabel(index)}
        </span>
        {presentation.showName ? (
          <h3
            className={`mt-3 text-[1.45rem] font-semibold leading-[1.05] tracking-[-0.03em] text-white sm:text-[1.7rem] ${riseCls}`}
            data-pf-no-color-transition=""
            style={{ transitionDelay: '90ms' }}
          >
            {member.name}
          </h3>
        ) : null}
        {presentation.showResponsibility ? (
          <p
            className={`${META_CLS} mt-3 min-h-[0.7rem] text-white/75 ${riseCls}`}
            data-pf-no-color-transition=""
            style={{ transitionDelay: '150ms' }}
          >
            {member.responsibility.trim() || ' '}
          </p>
        ) : null}
        {presentation.showSocials ? (
          <div className={presentation.showName || presentation.showResponsibility ? 'mt-6' : ''}>
            <TeamSocialLinks
              member={member}
              presentation={{
                ...presentation,
                socialIconColor: '#171717',
                socialBackgroundColor: '#ffffff',
                socialIconStyle: 'circle',
              }}
              align={teamSocialAlignClass(align)}
              revealOnHover
            />
          </div>
        ) : null}
      </div>
    </article>
  );
}

export function EditorialTeamGallery({
  members,
  presentation,
}: {
  members: ProfileTeamMember[];
  presentation: PortfolioTeamPresentationSettings;
}) {
  const rootRef = useTeamEntrance<HTMLDivElement>(
    `${presentation.layout}:${members.length}`,
    presentation.layout === 'polaroid'
  );
  if (members.length === 0) return null;

  if (presentation.layout === 'spotlight') {
    return (
      <div ref={rootRef} className="w-full">
        <TeamSpotlight members={members} presentation={presentation} />
      </div>
    );
  }

  if (presentation.layout === 'portrait-rail') {
    return (
      <div ref={rootRef} className="w-full">
        <TeamPortraitRail members={members} presentation={presentation} />
      </div>
    );
  }

  if (presentation.layout === 'directory') {
    const detached = presentation.directoryDetachedCards !== false;
    return (
      <div
        ref={rootRef}
        className={`w-full ${teamDirectoryMaxWidthClass(presentation.cardMaxWidth)} ${teamListAlignClass(presentation.listAlign)}`}
      >
        {detached ? (
          <div className={`flex w-full flex-col ${teamDirectoryStackGapClass(presentation.gap)}`}>
            {members.map((member, index) => (
              <TeamDirectoryRow
                key={member.id}
                member={member}
                presentation={presentation}
                detached
                index={index}
              />
            ))}
          </div>
        ) : (
          <div className={`overflow-hidden ${teamCardFrameClass(presentation)}`} style={teamCardStyle(presentation)}>
            {members.map((member, index) => (
              <TeamDirectoryRow
                key={member.id}
                member={member}
                presentation={presentation}
                detached={false}
                index={index}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      ref={rootRef}
      className={`w-full overflow-visible ${teamGridClass(presentation.columns, presentation.gap, presentation.listAlign, presentation.layout)}`}
    >
      {members.map((member, index) =>
        presentation.layout === 'profile-cards' ? (
          <TeamProfileCard key={member.id} member={member} presentation={presentation} />
        ) : presentation.layout === 'hover-cards' ? (
          <TeamHoverCard key={member.id} member={member} presentation={presentation} index={index} />
        ) : presentation.layout === 'cover-cards' ? (
          <TeamCoverCard key={member.id} member={member} presentation={presentation} index={index} />
        ) : presentation.layout === 'avatar-cards' ? (
          <TeamAvatarCard key={member.id} member={member} presentation={presentation} />
        ) : presentation.layout === 'float-cards' ? (
          <TeamFloatCard key={member.id} member={member} presentation={presentation} />
        ) : (
          <TeamStandardCard
            key={member.id}
            member={member}
            presentation={presentation}
            index={index}
            polaroidIndex={presentation.layout === 'polaroid' ? index : undefined}
          />
        )
      )}
    </div>
  );
}

'use client';

/**
 * Shared chrome for the Team member layouts: the motion constants every design eases with, the
 * portrait renderer and the social-link row. Extracted out of portfolio-team-designs.tsx so a
 * design can live in its own file (portfolio-team-design-float-cards.tsx is the first) without
 * importing the 1800-line catalogue back into itself.
 *
 * Site-wide trap to respect when editing: any node that animates transform/opacity through CSS
 * needs `data-pf-no-color-transition`, otherwise the global color-mode transition rule in
 * globals.css replaces its `transition-property` and the motion silently disappears.
 */

import { SocialPlatformIcon } from '@/components/marketplace/creator-profile-social-icons';
import { PortfolioDeferredMedia } from '@/components/portfolio/PortfolioDeferredMedia';
import {
  teamSocialIconButtonClass,
  teamSocialIconGlyphClass,
  type PortfolioTeamPresentationSettings,
} from '@/components/portfolio/portfolio-team-settings';
import type { ProfileTeamMember } from '@/types/ecosystem';

/** One easing for the whole family — a long, soft expo-out, the premium-motion default here. */
export const EASE_CLS = 'ease-[cubic-bezier(0.16,1,0.3,1)]';
/** Hover transitions: long enough to read as choreography, short enough to feel immediate. */
export const HOVER_CLS = `transition-transform duration-[760ms] ${EASE_CLS}`;
export const MEDIA_ZOOM_CLS = `h-full w-full transition-transform duration-[1100ms] ${EASE_CLS} group-hover:scale-[1.055]`;
/**
 * Touch devices have no hover, so the two hover-only designs would show nothing but portraits —
 * name, role and links would be unreachable. On a pointer that cannot hover, their reveal is
 * simply the resting state. `(hover: none)` is the honest test; a narrow desktop window is still
 * a hovering pointer (and, per portfolio-work-projects-carousel-mobile-fixes, resizing a desktop
 * viewport does not flip this query — it needs real device emulation to verify).
 */
export const TOUCH_REVEAL_CLS =
  '[@media(hover:none)]:pointer-events-auto [@media(hover:none)]:translate-y-0 [@media(hover:none)]:opacity-100';

export function teamImageAspectClass(aspect: PortfolioTeamPresentationSettings['imageAspect']): string {
  if (aspect === 'square') return 'aspect-square w-full';
  if (aspect === 'landscape') return 'aspect-[4/3] w-full';
  if (aspect === 'auto') return 'min-h-48 w-full';
  return 'aspect-[4/5] w-full';
}

/** Small-caps meta line — the family's signature for roles, indexes and counters. */
export const META_CLS = 'text-[calc(0.68rem*var(--pf-team-font-scale,1))] font-medium uppercase leading-none tracking-[0.2em]';

export function TeamMemberImage({
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

export function TeamSocialIcon({ platform, className }: { platform: string; className: string }) {
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

export function TeamSocialLinks({
  member,
  presentation,
  align = 'justify-center',
  hoverLight = false,
  revealOnHover = false,
  spacing = 'default',
  glyphSizeClass,
}: {
  member: ProfileTeamMember;
  presentation: PortfolioTeamPresentationSettings;
  align?: string;
  hoverLight?: boolean;
  /** Overrides only the glyph size that `socialIconSize` would derive, leaving the button box
   *  alone — for a caption row that has to stay compact inline next to a name, but where the
   *  default `sm` glyph (12px) reads as a rounding error rather than a link. */
  glyphSizeClass?: string;
  /** Overlay designs: the row rises in on a per-icon stagger instead of appearing all at once. */
  revealOnHover?: boolean;
  /** `wide` lets the row breathe inside a large, sparse composition (spotlight). */
  spacing?: 'default' | 'wide';
}) {
  const links = (member.socialLinks ?? []).filter((link) => link.url.trim());
  if (!presentation.showSocials) return null;
  const size = teamSocialIconButtonClass(presentation.socialIconSize);
  const slotHeight = size.split(' ')[0] ?? 'h-9';
  if (links.length === 0) {
    return <div className={`${slotHeight} ${align}`} aria-hidden />;
  }
  const glyph = glyphSizeClass ?? teamSocialIconGlyphClass(presentation.socialIconSize);
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
    <div
      className={`flex flex-wrap ${spacing === 'wide' ? 'gap-3.5 sm:gap-4' : 'gap-2'} ${align}`}
      aria-label={`Liens sociaux de ${member.name}`}
    >
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

/**
 * The rail/grid glyphs shared by every design that offers both navigations — a rail of cards
 * running off the frame, and a four-up grid. Lives here rather than in one design so the
 * toggle reads identically across the family.
 */
export function TeamViewToggleIcon({ view }: { view: 'rail' | 'grid' }) {
  if (view === 'grid') {
    return (
      <svg viewBox="0 0 18 18" fill="currentColor" className="h-3.5 w-3.5" aria-hidden>
        <rect x="1" y="1" width="7" height="7" rx="1.6" />
        <rect x="10" y="1" width="7" height="7" rx="1.6" />
        <rect x="1" y="10" width="7" height="7" rx="1.6" />
        <rect x="10" y="10" width="7" height="7" rx="1.6" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 18 18" fill="currentColor" className="h-3.5 w-3.5" aria-hidden>
      <rect x="1" y="2" width="6" height="14" rx="1.6" />
      <rect x="9" y="2" width="6" height="14" rx="1.6" opacity={0.6} />
      <rect x="17" y="2" width="4" height="14" rx="1.6" opacity={0.3} />
    </svg>
  );
}

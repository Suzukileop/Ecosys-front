'use client';

/**
 * Editorial rhythm — the Team section's broken, asymmetric grid.
 *
 * No two members share a size. Every card takes its column span, its portrait proportion and its
 * vertical drop from one slot table, so the row reads as a deliberately ragged skyline rather than
 * a grid: a tall plate, a small square, an intermediate vertical, a wide cinematic one. Captions
 * live above the portraits, including the featured member, to keep long text off the photographs.
 *
 * Interactions are CSS-only (no scroll-driven JS at all beyond the family's shared entrance), so
 * the whole composition costs one compositor layer per hovered card and nothing while scrolling:
 * a modest portrait push-in and a short colour transition. Social links stay visible without hover.
 *
 * Two layout rules that are load-bearing here:
 * - Every slot carries an explicit `col-start` as well as a `col-span`. With definite column
 *   positions the sparse auto-placement is fully deterministic — each 4-member stanza lands on the
 *   same two rows, and the empty cells between the spans are the composition's negative space,
 *   not leftovers. Change a span without its start and the whole rhythm reflows.
 * - The drops are margins, never transforms: the shared entrance (`useTeamEntrance`) tweens an
 *   inline transform on each `[data-team-reveal]` node and clears it by name when it ends, which
 *   would take a transform of our own with it.
 *
 * Site-wide trap to respect when editing: any node that animates transform/opacity through CSS
 * needs `data-pf-no-color-transition`, otherwise the global color-mode transition rule in
 * globals.css replaces its `transition-property` and the motion silently disappears.
 */

import { cardsRadiusClass } from '@/components/portfolio/portfolio-cards-style';
import {
  teamListAlignClass,
  teamSpotlightMaxWidthClass,
  type PortfolioTeamCardRadius,
  type PortfolioTeamGap,
  type PortfolioTeamPresentationSettings,
} from '@/components/portfolio/portfolio-team-settings';
import {
  EASE_CLS,
  TeamMemberImage,
  TeamSocialLinks,
} from '@/components/portfolio/portfolio-team-design-primitives';
import type { ProfileTeamMember } from '@/types/profile';
import { readableMix } from '@/components/portfolio/stack-designs/readable-ink';
import type { ReactNode } from 'react';

type PortraitRenderer = (member: ProfileTeamMember, index: number) => ReactNode;

/**
 * One member's whole geometry. Kept in a table rather than derived from the index so the rhythm can
 * be read — and retuned — as a composition instead of as arithmetic.
 */
type RhythmSlot = {
  /** Large screens: explicit start + span. See the deterministic-placement note at the top. */
  place: string;
  /** Large screens: the drop that breaks this card off the row's baseline. */
  drop: string;
  /** The portrait's proportion — the real source of the irregular heights. */
  ratio: string;
  /** Mobile and tablet: the indent that turns the stack into a staggered vertical list. */
  indent: string;
  /** Name scale, tied to the slot's width so a narrow column never sets display type. */
  nameSize: string;
};

const NAME_LG = 'text-[calc(clamp(1.05rem,1.6vw,1.6rem)*var(--pf-team-font-scale,1))]';
const NAME_MD = 'text-[calc(clamp(1rem,1.35vw,1.3rem)*var(--pf-team-font-scale,1))]';
const NAME_SM = 'text-[calc(clamp(0.95rem,1.15vw,1.1rem)*var(--pf-team-font-scale,1))]';

/** A single member: one wide cinematic plate, centred in the grid — nothing to be asymmetric with. */
const RHYTHM_SOLO: RhythmSlot[] = [
  {
    place: 'lg:col-start-2 lg:col-span-10',
    drop: '',
    ratio: 'aspect-[4/5] sm:aspect-[3/4] lg:aspect-[16/10]',
    indent: '',
    nameSize: NAME_LG,
  },
];

/** Two members: a tall plate and a small hanging one, with a two-column void between them. */
const RHYTHM_PAIR: RhythmSlot[] = [
  {
    place: 'lg:col-start-1 lg:col-span-7',
    drop: 'lg:mt-0',
    ratio: 'aspect-[4/5] lg:aspect-[5/6]',
    indent: '',
    nameSize: NAME_LG,
  },
  {
    place: 'lg:col-start-9 lg:col-span-4',
    drop: 'lg:mt-28',
    ratio: 'aspect-square lg:aspect-[3/4]',
    indent: 'ml-auto w-[88%] lg:ml-0 lg:w-full',
    nameSize: NAME_MD,
  },
];

/**
 * Three members, all on one row: the long plate, the smaller square hung low, the intermediate
 * vertical between the two — the arrangement the design was drawn around.
 */
const RHYTHM_TRIO: RhythmSlot[] = [
  {
    place: 'lg:col-start-1 lg:col-span-5',
    drop: 'lg:mt-0',
    ratio: 'aspect-[4/5] lg:aspect-[5/6]',
    indent: '',
    nameSize: NAME_LG,
  },
  {
    place: 'lg:col-start-7 lg:col-span-3',
    drop: 'lg:mt-24',
    ratio: 'aspect-square',
    indent: 'ml-auto w-[86%] lg:ml-0 lg:w-full',
    nameSize: NAME_SM,
  },
  {
    place: 'lg:col-start-10 lg:col-span-3',
    drop: 'lg:mt-8',
    ratio: 'aspect-[4/5] lg:aspect-[3/4]',
    indent: 'w-[80%] lg:w-full',
    nameSize: NAME_SM,
  },
];

/**
 * Four or more: a stanza of four that repeats over two rows. Row one is the tall plate and a low
 * square; row two is a narrow vertical indented off the left edge and a wide cinematic one hung
 * below it. Member five restarts the stanza on the next pair of rows.
 */
const RHYTHM_STANZA: RhythmSlot[] = [
  {
    place: 'lg:col-start-1 lg:col-span-6',
    drop: 'lg:mt-0',
    ratio: 'aspect-[4/5] lg:aspect-[5/6]',
    indent: '',
    nameSize: NAME_LG,
  },
  {
    place: 'lg:col-start-8 lg:col-span-5',
    drop: 'lg:mt-24',
    ratio: 'aspect-square',
    indent: 'ml-auto w-[88%] lg:ml-0 lg:w-full',
    nameSize: NAME_MD,
  },
  {
    place: 'lg:col-start-2 lg:col-span-4',
    drop: 'lg:mt-0',
    ratio: 'aspect-[4/5] lg:aspect-[3/4]',
    indent: 'w-[78%] lg:w-full',
    nameSize: NAME_MD,
  },
  {
    place: 'lg:col-start-7 lg:col-span-6',
    drop: 'lg:mt-20',
    ratio: 'aspect-[4/5] lg:aspect-[16/10]',
    indent: 'ml-auto w-[94%] lg:ml-0 lg:w-full',
    nameSize: NAME_LG,
  },
];

function rhythmTable(count: number): RhythmSlot[] {
  if (count <= 1) return RHYTHM_SOLO;
  if (count === 2) return RHYTHM_PAIR;
  if (count === 3) return RHYTHM_TRIO;
  return RHYTHM_STANZA;
}

/**
 * The portraits' corners. Local rather than imported from the catalogue file: that file imports
 * this design, so reaching back into it would close an import cycle.
 */
function rhythmRadiusClass(radius: PortfolioTeamCardRadius | undefined): string {
  if (radius === 'sm') return 'rounded-lg';
  if (radius === 'md') return 'rounded-2xl';
  if (radius === 'lg') return 'rounded-[2rem]';
  if (radius === 'xl') return 'rounded-[2.75rem]';
  return 'rounded-none';
}

/**
 * Column gutter and row gutter are set separately: the columns only need enough air to read as
 * separate plates, while the rows carry the whole vertical rhythm of the stanza.
 */
function rhythmGapClass(gap: PortfolioTeamGap | undefined): string {
  if (gap === 'sm') return 'gap-x-4 gap-y-12 lg:gap-y-16';
  if (gap === 'lg') return 'gap-x-8 gap-y-20 lg:gap-y-28';
  if (gap === 'xl') return 'gap-x-12 gap-y-24 lg:gap-y-36';
  return 'gap-x-6 gap-y-16 lg:gap-y-24';
}

/** A modest push-in isolated from text and the shared entrance. */
const ZOOM_CLS = 'team-rhythm-zoom h-full w-full';

/**
 * Black and white at rest, full colour on hover. The grade is what holds a row of four unrelated
 * photographs together as one composition; the colour arriving is the reward for reaching a card.
 */
const TONE_CLS = 'team-rhythm-tone';

/**
 * The card's one outgoing link, so the `↗` is never decoration: a portfolio site first, then a
 * professional profile, then whatever the member actually gave. Members with no links get no
 * arrow at all — an affordance with nothing behind it is worse than none.
 */
function rhythmPrimaryLink(member: ProfileTeamMember): { href: string; external: boolean; label: string } | null {
  const links = (member.socialLinks ?? []).filter((link) => link.url.trim());
  if (links.length === 0) return null;
  const chosen =
    links.find((link) => link.platform === 'WEBSITE') ??
    links.find((link) => link.platform === 'LINKEDIN') ??
    links[0];
  const external = chosen.platform !== 'EMAIL';
  return {
    href: external || /^mailto:/i.test(chosen.url) ? chosen.url : `mailto:${chosen.url}`,
    external,
    label: chosen.label?.trim() || `${chosen.platform} — ${member.name}`,
  };
}

function hasSocialLinks(member: ProfileTeamMember): boolean {
  return (member.socialLinks ?? []).some((link) => link.url.trim());
}

/** The micro arrow. It drifts up and out on hover — the only motion on an otherwise silent row. */
function RhythmArrow({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 14 14"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.4}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`h-3.5 w-3.5 shrink-0 transition-transform duration-[620ms] ${EASE_CLS} group-hover:translate-x-1 group-hover:-translate-y-1 ${className}`}
      data-pf-no-color-transition=""
      aria-hidden
    >
      <path d="M3.5 10.5 10.5 3.5" />
      <path d="M4.9 3.5h5.6v5.6" />
    </svg>
  );
}

function RhythmPortrait({
  member,
  presentation,
  slot,
  radius,
  portrait,
}: {
  member: ProfileTeamMember;
  presentation: PortfolioTeamPresentationSettings;
  slot: RhythmSlot;
  radius: string;
  portrait?: ReactNode;
}) {
  return (
    <div className={`team-rhythm-portrait relative w-full overflow-hidden ${radius} ${slot.ratio}`}>
      {/* The zoom sits above the entrance's own node, never on it: the entrance clears the
          transform it wrote by name when it finishes, which would take this one with it. */}
      <div className={ZOOM_CLS} data-pf-no-color-transition="">
        {portrait ?? <TeamMemberImage
          member={member}
          presentation={presentation}
          className={TONE_CLS}
          fill
          reveal
          sizes="(max-width: 1023px) 100vw, 50vw"
        />}
      </div>
    </div>
  );
}

/**
 * The first member keeps the largest name and portrait without overlaying important copy.
 */
function RhythmHeroCard({
  member,
  presentation,
  slot,
  radius,
  portrait,
}: {
  member: ProfileTeamMember;
  presentation: PortfolioTeamPresentationSettings;
  slot: RhythmSlot;
  radius: string;
  portrait?: ReactNode;
}) {
  return <RhythmStandardCard member={member} presentation={presentation} slot={slot}
    radius={radius} portrait={portrait} withImage featured />;
}

/**
 * Every other member: a medium-weight name and readable role above the image, with real links
 * visible at rest. Slot geometry, rather than reduced contrast, creates the editorial rhythm.
 */
function RhythmStandardCard({
  member,
  presentation,
  slot,
  radius,
  withImage,
  featured = false,
  portrait,
}: {
  member: ProfileTeamMember;
  presentation: PortfolioTeamPresentationSettings;
  slot: RhythmSlot;
  radius: string;
  withImage: boolean;
  featured?: boolean;
  portrait?: ReactNode;
}) {
  const surface = presentation.teamPalette?.fond ?? (presentation.activeColorMode === 'dark' ? '#0a0a0a' : '#fff');
  const readable = {
    strong: readableMix(presentation.nameColor, 100, surface),
    muted: readableMix(presentation.responsibilityColor, 100, surface),
  };
  const socialSurface = ['minimal', 'outline'].includes(presentation.socialIconStyle) ? surface : presentation.socialBackgroundColor;
  const socialPresentation = { ...presentation, socialIconColor: readableMix(presentation.socialIconColor, 100, socialSurface) };
  // The ↗ goes to one of the member's links, so General → Social links off removes it too.
  const link = presentation.showSocials ? rhythmPrimaryLink(member) : null;
  const showSocials = presentation.showSocials && hasSocialLinks(member);
  return (
    <article
      className={`team-rhythm-card group relative min-w-0 ${slot.place} ${withImage ? `${slot.drop} ${slot.indent}` : ''}`}
      data-featured={featured}
      data-team-reveal=""
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          {presentation.showName ? (
            <h3
              className={`team-rhythm-name ${slot.nameSize}`}
              style={{ color: readable.strong }}
            >
              {member.name}
            </h3>
          ) : null}
          {presentation.showResponsibility && member.responsibility.trim() ? (
            <p
              /* Light, not faint: `readable.muted` is already a muted token, so stacking a 60%
                 alpha on it dropped the role under 2.5:1 against a white section. */
              className="team-rhythm-role"
              style={{ color: readable.muted }}
            >
              {member.responsibility}
            </p>
          ) : null}
          {/* Links stay available to mouse, touch and keyboard without a reveal gesture. */}
          {showSocials ? (
            <div className="mt-4">
              <TeamSocialLinks
                member={member}
                presentation={socialPresentation}
                align="justify-start"
              />
            </div>
          ) : null}
        </div>
        {link ? (
          <a
            href={link.href}
            target={link.external ? '_blank' : undefined}
            rel={link.external ? 'noopener noreferrer' : undefined}
            aria-label={link.label}
            className="team-rhythm-link shrink-0 focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2"
            style={{ color: readable.strong }}
          >
            <RhythmArrow />
          </a>
        ) : null}
      </div>
      {withImage ? (
        <div className="mt-5 sm:mt-6">
          <RhythmPortrait member={member} presentation={presentation} slot={slot} radius={radius} portrait={portrait} />
        </div>
      ) : null}
    </article>
  );
}

export function TeamEditorialRhythm({
  members,
  presentation,
  renderPortrait,
}: {
  members: ProfileTeamMember[];
  presentation: PortfolioTeamPresentationSettings;
  renderPortrait?: PortraitRenderer;
}) {
  if (members.length === 0) return null;
  const table = rhythmTable(members.length);
  const radius = cardsRadiusClass(presentation.cardsStyle) ?? rhythmRadiusClass(presentation.cardRadius);
  const withImage = presentation.showImage !== false;
  return (
    <div
      /* `items-start` is what lets the drops read as a broken baseline: with the default `stretch`
         every card in a row would be pulled to the tallest one's height. */
      className={`team-rhythm grid w-full min-w-0 grid-cols-1 items-start lg:grid-cols-12 ${rhythmGapClass(
        presentation.gap
      )} ${teamSpotlightMaxWidthClass(presentation.cardMaxWidth)} ${teamListAlignClass(presentation.listAlign)}`}
      data-with-image={withImage}
    >
      {members.map((member, index) => {
        const slot = table[index % table.length];
        // Without portraits the collection becomes a compact, regular caption grid.
        return index === 0 && withImage ? (
          <RhythmHeroCard
            key={member.id}
            member={member}
            presentation={presentation}
            slot={slot}
            radius={radius}
            portrait={renderPortrait?.(member, index)}
          />
        ) : (
          <RhythmStandardCard
            key={member.id}
            member={member}
            presentation={presentation}
            slot={slot}
            radius={radius}
            withImage={withImage}
            portrait={renderPortrait?.(member, index)}
          />
        );
      })}
    </div>
  );
}

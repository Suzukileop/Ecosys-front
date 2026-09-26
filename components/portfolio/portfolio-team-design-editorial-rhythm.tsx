'use client';

/**
 * Editorial rhythm — the Team section's broken, asymmetric grid.
 *
 * No two members share a size. Every card takes its column span, its portrait proportion and its
 * vertical drop from one slot table, so the row reads as a deliberately ragged skyline rather than
 * a grid: a tall plate, a small square, an intermediate vertical, a wide cinematic one. The first
 * member is treated as a magazine cover — the name set massive in pure white directly over the
 * darkened portrait — and every other member gets the opposite treatment: an ultra-sparse caption
 * printed *above* its image, with a micro `↗` pushed to the far right of the row.
 *
 * Interactions are CSS-only (no scroll-driven JS at all beyond the family's shared entrance), so
 * the whole composition costs one compositor layer per hovered card and nothing while scrolling:
 * a very slow portrait push-in, the arrow drifting up and to the right, the social row rising in
 * under the role on a per-icon stagger.
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

import type { ReactNode } from 'react';
import {
  teamListAlignClass,
  teamReadableCardText,
  teamSpotlightMaxWidthClass,
  type PortfolioTeamCardRadius,
  type PortfolioTeamGap,
  type PortfolioTeamPresentationSettings,
} from '@/components/portfolio/portfolio-team-settings';
import {
  EASE_CLS,
  META_CLS,
  TeamMemberImage,
  TeamSocialLinks,
} from '@/components/portfolio/portfolio-team-design-primitives';
import type { ProfileTeamMember } from '@/types/ecosystem';

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

/** A very slow, cinematic push-in. Its own layer, so nothing it scales can ever be text. */
const ZOOM_CLS = `h-full w-full transition-transform duration-[1700ms] ${EASE_CLS} group-hover:scale-[1.07]`;

/**
 * Black and white at rest, full colour on hover. The grade is what holds a row of four unrelated
 * photographs together as one composition; the colour arriving is the reward for reaching a card.
 */
const TONE_CLS = `grayscale contrast-[1.08] saturate-[0.85] transition-[filter] duration-[1400ms] ${EASE_CLS} group-hover:grayscale-0 group-hover:contrast-100 group-hover:saturate-100`;

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
  children,
}: {
  member: ProfileTeamMember;
  presentation: PortfolioTeamPresentationSettings;
  slot: RhythmSlot;
  radius: string;
  /** Overlay content for the hero treatment; the standard cards pass nothing. */
  children?: ReactNode;
}) {
  return (
    <div className={`relative w-full overflow-hidden ${radius} ${slot.ratio}`}>
      {/* The zoom sits above the entrance's own node, never on it: the entrance clears the
          transform it wrote by name when it finishes, which would take this one with it. */}
      <div className={ZOOM_CLS} data-pf-no-color-transition="">
        <TeamMemberImage
          member={member}
          /* `cover` is forced rather than read from the section setting: each slot is a fixed
             proportion, so `contain` would letterbox a portrait inside its own plate. */
          presentation={{ ...presentation, imageFit: 'cover' }}
          className={TONE_CLS}
          fill
          reveal
        />
      </div>
      {children}
    </div>
  );
}

/**
 * The first member, as a magazine cover: the name set massive in pure white across the top of the
 * darkened portrait, the role and the links as a caption along the bottom edge. Both scrims are
 * drawn rather than a flat overlay, so the middle of the photograph stays untouched.
 */
function RhythmHeroCard({
  member,
  presentation,
  slot,
  radius,
}: {
  member: ProfileTeamMember;
  presentation: PortfolioTeamPresentationSettings;
  slot: RhythmSlot;
  radius: string;
}) {
  const link = rhythmPrimaryLink(member);
  const showSocials = presentation.showSocials && hasSocialLinks(member);
  return (
    <article
      className={`group relative min-w-0 ${slot.place} ${slot.drop} ${slot.indent}`}
      data-team-reveal=""
    >
      <RhythmPortrait member={member} presentation={presentation} slot={slot} radius={radius}>
        {/* Two drawn scrims rather than one flat overlay, so the middle of the photograph is left
            alone. Both are deliberately heavy: the caption sits a third of the way up the lower
            one, where a lighter ramp has already faded out — measured against a bright photo, the
            first pass left the role line at about 2:1. */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 block h-3/5 bg-gradient-to-b from-black/85 via-black/40 to-transparent"
        />
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 block h-1/2 bg-gradient-to-t from-black/85 via-black/45 to-transparent"
        />
        {presentation.showName ? (
          <div className="pointer-events-none absolute inset-x-0 top-0 p-6 sm:p-8 lg:p-10">
            <h3 className="text-[calc(clamp(1.9rem,4.2vw,4.25rem)*var(--pf-team-font-scale,1))] font-semibold uppercase leading-[0.86] tracking-[-0.045em] text-white">
              {member.name}
            </h3>
          </div>
        ) : null}
        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-6 p-6 sm:p-8 lg:p-10">
          <div className="min-w-0">
            {presentation.showResponsibility ? (
              <p className={`${META_CLS} text-white/75`}>{member.responsibility}</p>
            ) : null}
            {showSocials ? (
              <div className="mt-5 [&_a:hover]:opacity-100 [&_a]:opacity-80">
                <TeamSocialLinks
                  member={member}
                  presentation={{
                    ...presentation,
                    socialIconColor: '#ffffff',
                    socialBackgroundColor: 'transparent',
                    socialIconStyle: 'minimal',
                  }}
                  align="justify-start"
                  revealOnHover
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
              className="shrink-0 p-1 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              <RhythmArrow className="h-4 w-4" />
            </a>
          ) : null}
        </div>
      </RhythmPortrait>
    </article>
  );
}

/**
 * Every other member: the caption printed above the image and nothing drawn around either. Thin
 * uppercase name, the role under it at low contrast, the arrow pushed to the far right of the row,
 * and the social links rising in under the role only while the card is addressed.
 */
function RhythmStandardCard({
  member,
  presentation,
  slot,
  radius,
  withImage,
}: {
  member: ProfileTeamMember;
  presentation: PortfolioTeamPresentationSettings;
  slot: RhythmSlot;
  radius: string;
  withImage: boolean;
}) {
  const readable = teamReadableCardText(presentation);
  const link = rhythmPrimaryLink(member);
  const showSocials = presentation.showSocials && hasSocialLinks(member);
  return (
    <article
      className={`group relative min-w-0 ${slot.place} ${slot.drop} ${slot.indent}`}
      data-team-reveal=""
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          {presentation.showName ? (
            <h3
              className={`min-w-0 break-words font-light uppercase leading-[1.08] tracking-[0.04em] ${slot.nameSize}`}
              style={{ color: readable.strong }}
            >
              {member.name}
            </h3>
          ) : null}
          {presentation.showResponsibility ? (
            <p
              /* Light, not faint: `readable.muted` is already a muted token, so stacking a 60%
                 alpha on it dropped the role under 2.5:1 against a white section. */
              className={`${META_CLS} mt-2.5 opacity-80`}
              style={{ color: readable.muted }}
            >
              {member.responsibility}
            </p>
          ) : null}
          {/* The row's height is reserved whether it is showing or not — only opacity and offset
              change — so revealing the links can never nudge the portrait underneath it. */}
          {showSocials ? (
            <div className="mt-4">
              <TeamSocialLinks
                member={member}
                presentation={presentation}
                align="justify-start"
                revealOnHover
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
            className="mt-1 shrink-0 p-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
            style={{ color: readable.strong }}
          >
            <RhythmArrow />
          </a>
        ) : null}
      </div>
      {withImage ? (
        <div className="mt-5 sm:mt-6">
          <RhythmPortrait member={member} presentation={presentation} slot={slot} radius={radius} />
        </div>
      ) : null}
    </article>
  );
}

export function TeamEditorialRhythm({
  members,
  presentation,
}: {
  members: ProfileTeamMember[];
  presentation: PortfolioTeamPresentationSettings;
}) {
  if (members.length === 0) return null;
  const table = rhythmTable(members.length);
  const radius = rhythmRadiusClass(presentation.cardRadius);
  const withImage = presentation.showImage !== false;
  return (
    <div
      /* `items-start` is what lets the drops read as a broken baseline: with the default `stretch`
         every card in a row would be pulled to the tallest one's height. */
      className={`grid w-full min-w-0 grid-cols-1 items-start lg:grid-cols-12 ${rhythmGapClass(
        presentation.gap
      )} ${teamSpotlightMaxWidthClass(presentation.cardMaxWidth)} ${teamListAlignClass(presentation.listAlign)}`}
    >
      {members.map((member, index) => {
        const slot = table[index % table.length];
        // Without a portrait there is no cover to print a name on, so the hero treatment simply
        // does not exist and every member reads as a caption block.
        return index === 0 && withImage ? (
          <RhythmHeroCard
            key={member.id}
            member={member}
            presentation={presentation}
            slot={slot}
            radius={radius}
          />
        ) : (
          <RhythmStandardCard
            key={member.id}
            member={member}
            presentation={presentation}
            slot={slot}
            radius={radius}
            withImage={withImage}
          />
        );
      })}
    </div>
  );
}

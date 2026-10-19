const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..', '..');

function edit(rel, fn) {
  const f = path.join(root, rel);
  let s = fs.readFileSync(f, 'utf8');
  const eol = s.includes('\r\n') ? '\r\n' : '\n';
  s = s.replace(/\r\n/g, '\n');
  const rep = (a, b) => {
    if (!s.includes(a)) throw new Error(rel + ' missing: ' + a.slice(0, 80));
    s = s.replace(a, b);
  };
  fn(rep, () => s, (v) => { s = v; });
  fs.writeFileSync(f, s.replace(/\n/g, eol));
}

// ---------------------------------------------------------------- settings
edit('components/portfolio/portfolio-about-us-settings.ts', (rep) => {
  rep(
    `export type PortfolioAboutUsQuoteMedia = 'image' | 'svg';`,
    `export type PortfolioAboutUsQuoteMedia = 'image' | 'svg';

/** The look of the About us button. \`solid\` is the filled pill the section always had. */
export type PortfolioAboutUsCtaStyle = 'solid' | 'link' | 'outline' | 'circle' | 'underline';

export const PORTFOLIO_ABOUT_US_CTA_STYLE_OPTIONS: {
  value: PortfolioAboutUsCtaStyle;
  label: string;
  description: string;
}[] = [
  { value: 'solid', label: msg('Solid'), description: msg('Filled pill in the accent colour.') },
  { value: 'link', label: msg('Arrow link'), description: msg('Text, a fine accent rule and an arrow.') },
  { value: 'outline', label: msg('Outline'), description: msg('Hairline pill that fills on hover.') },
  { value: 'circle', label: msg('Round arrow'), description: msg('Label and a small circle with an arrow.') },
  { value: 'underline', label: msg('Underline'), description: msg('Plain text; an accent line draws across.') },
];

const ABOUT_US_CTA_STYLES = PORTFOLIO_ABOUT_US_CTA_STYLE_OPTIONS.map((option) => option.value);

/** Saved style, or this design's own default: the overlap design has always led with the arrow link. */
export function resolveAboutUsCtaStyle(
  presentation: Pick<PortfolioAboutUsPresentationSettings, 'ctaStyle' | 'design'>
): PortfolioAboutUsCtaStyle {
  if (presentation.ctaStyle && ABOUT_US_CTA_STYLES.includes(presentation.ctaStyle)) return presentation.ctaStyle;
  return presentation.design === 'split-overlap' ? 'link' : 'solid';
}`
  );
  rep(
    `  ctaLabel: string;
  quoteMedia: PortfolioAboutUsQuoteMedia;`,
    `  ctaLabel: string;
  /** Unset = the design's default (see resolveAboutUsCtaStyle). */
  ctaStyle?: PortfolioAboutUsCtaStyle;
  quoteMedia: PortfolioAboutUsQuoteMedia;`
  );
  rep(
    `    ctaLabel: resolveAboutUsCtaLabel(record.ctaLabel, base.ctaLabel),
`,
    `    ctaLabel: resolveAboutUsCtaLabel(record.ctaLabel, base.ctaLabel),
    ctaStyle:
      typeof record.ctaStyle === 'string' && (ABOUT_US_CTA_STYLES as string[]).includes(record.ctaStyle)
        ? (record.ctaStyle as PortfolioAboutUsCtaStyle)
        : base.ctaStyle,
`
  );
});

// ---------------------------------------------------------------- section
edit('components/portfolio/EditorialAboutUsSection.tsx', (rep, get, set) => {
  rep(
    `  DEFAULT_ABOUT_US_SUBTITLE,
  resolveAboutUsMediaSide,
  type PortfolioAboutUsPresentationSettings,`,
    `  DEFAULT_ABOUT_US_SUBTITLE,
  resolveAboutUsCtaStyle,
  resolveAboutUsMediaSide,
  type PortfolioAboutUsCtaStyle,
  type PortfolioAboutUsPresentationSettings,`
  );

  const component = `function AboutUsCtaArrow({ className = 'h-3.5 w-3.5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={\`shrink-0 \${className}\`} fill="none" aria-hidden>
      <path d="M2 8h11M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * The About us button, in the style picked under Design → Layout. Every style keeps the accent as the
 * one signature touch (rule, ring, fill-on-hover) and the section's title colour for the label, so
 * contrast follows whatever palette the creator chose. \`solidClassName\` is each design's own filled
 * pill (their radii and paddings differ), so the default look of every design is unchanged.
 */
function AboutUsCta({
  presentation,
  label,
  linkProps,
  className = '',
  solidClassName,
}: {
  presentation: PortfolioAboutUsPresentationSettings;
  label: string;
  linkProps: ReturnType<typeof useAboutUsCtaLinkProps>;
  /** Spacing only (margin / width). */
  className?: string;
  solidClassName: string;
}) {
  const variant: PortfolioAboutUsCtaStyle = resolveAboutUsCtaStyle(presentation);
  const accent = presentation.accentColor;
  const ink = presentation.titleColor;
  const focus = 'focus-visible:outline-2 focus-visible:outline-offset-4';
  const vars = {
    '--cta-accent': accent,
    '--cta-on': aboutUsReadableInk(accent),
    '--cta-ink': ink,
    color: ink,
    outlineColor: accent,
  } as CSSProperties;
  const hairline = 'color-mix(in srgb, var(--cta-ink) 32%, transparent)';

  if (variant === 'solid') {
    return (
      <a
        {...linkProps}
        className={\`\${className} \${solidClassName}\`}
        data-pf-no-color-transition=""
        style={{ backgroundColor: accent, color: aboutUsReadableInk(accent) }}
      >
        {label}
      </a>
    );
  }

  if (variant === 'link') {
    return (
      <a
        {...linkProps}
        className={\`group \${className} inline-flex w-fit max-w-full items-center gap-2.5 border-b pb-1.5 text-[15px] font-medium tracking-wide transition-[gap] duration-300 hover:gap-3.5 focus-visible:gap-3.5 \${focus}\`}
        data-pf-no-color-transition=""
        style={{ ...vars, borderColor: accent }}
      >
        {label}
        <span style={{ color: accent }}>
          <AboutUsCtaArrow />
        </span>
      </a>
    );
  }

  if (variant === 'outline') {
    return (
      <a
        {...linkProps}
        className={\`\${className} inline-flex w-fit max-w-full items-center justify-center rounded-full border px-7 py-3 text-[15px] font-medium tracking-wide transition-colors duration-300 hover:[background-color:var(--cta-accent)] hover:[border-color:var(--cta-accent)] hover:[color:var(--cta-on)] focus-visible:[background-color:var(--cta-accent)] focus-visible:[border-color:var(--cta-accent)] focus-visible:[color:var(--cta-on)] \${focus}\`}
        data-pf-no-color-transition=""
        style={{ ...vars, borderColor: hairline }}
      >
        {label}
      </a>
    );
  }

  if (variant === 'circle') {
    return (
      <a
        {...linkProps}
        className={\`group \${className} inline-flex w-fit max-w-full items-center gap-3.5 text-[15px] font-medium tracking-wide \${focus}\`}
        data-pf-no-color-transition=""
        style={vars}
      >
        {label}
        <span
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full border transition-colors duration-300 group-hover:[background-color:var(--cta-accent)] group-hover:[border-color:var(--cta-accent)] group-hover:[color:var(--cta-on)] group-focus-visible:[background-color:var(--cta-accent)] group-focus-visible:[border-color:var(--cta-accent)] group-focus-visible:[color:var(--cta-on)]"
          style={{ borderColor: hairline }}
        >
          <AboutUsCtaArrow className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
        </span>
      </a>
    );
  }

  // underline: plain text over a quiet hairline; a short accent segment runs the full width on hover.
  return (
    <a
      {...linkProps}
      className={\`group \${className} relative inline-flex w-fit max-w-full items-center pb-2 text-[15px] font-medium tracking-wide \${focus}\`}
      data-pf-no-color-transition=""
      style={vars}
    >
      {label}
      <span aria-hidden className="absolute inset-x-0 bottom-0 h-px" style={{ backgroundColor: hairline }} />
      <span
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-[1.5px] origin-left scale-x-[0.28] transition-transform duration-500 group-hover:scale-x-100 group-focus-visible:scale-x-100"
        style={{ backgroundColor: accent }}
      />
    </a>
  );
}

`;
  rep(`function AboutUsAccentCheck(`, component + `function AboutUsAccentCheck(`);

  // call sites
  const sites = [
    {
      old: /\{presentation\.showCta \? \(\n\s*\/\/ An editorial text link[\s\S]*?<\/a>\n\s*\) : null\}/,
      neu: `{presentation.showCta ? (
              <AboutUsCta
                presentation={presentation}
                label={ctaLabel}
                linkProps={ctaLink}
                className="mt-9 sm:mt-10"
                solidClassName="inline-flex items-center justify-center rounded-full px-8 py-3.5 text-[15px] font-semibold transition hover:opacity-90"
              />
            ) : null}`,
    },
    {
      old: /\{presentation\.showCta \? \(\n\s*<a\n\s*\{\.\.\.ctaLink\}\n\s*className="mt-10 inline-flex items-center justify-center rounded-full px-9 py-4 text-base font-semibold transition hover:opacity-90"[\s\S]*?<\/a>\n\s*\) : null\}/,
      neu: `{presentation.showCta ? (
              <AboutUsCta
                presentation={presentation}
                label={ctaLabel}
                linkProps={ctaLink}
                className="mt-10"
                solidClassName="inline-flex items-center justify-center rounded-full px-9 py-4 text-base font-semibold transition hover:opacity-90"
              />
            ) : null}`,
    },
    {
      old: /\{presentation\.showCta \? \(\n\s*<a\n\s*\{\.\.\.ctaLink\}\n\s*className="mt-9 inline-flex items-center justify-center rounded-2xl[\s\S]*?<\/a>\n\s*\) : null\}/,
      neu: `{presentation.showCta ? (
            <AboutUsCta
              presentation={presentation}
              label={ctaLabel}
              linkProps={ctaLink}
              className="mt-9"
              solidClassName="inline-flex items-center justify-center rounded-2xl px-8 py-3.5 text-base font-semibold transition hover:opacity-90"
            />
          ) : null}`,
    },
    {
      old: /\{presentation\.showCta \? \(\n\s*<a\n\s*\{\.\.\.ctaLink\}\n\s*className="mt-8 inline-flex w-fit[\s\S]*?<\/a>\n\s*\) : null\}/,
      neu: `{presentation.showCta ? (
              <AboutUsCta
                presentation={presentation}
                label={ctaLabel}
                linkProps={ctaLink}
                className="mt-8"
                solidClassName="inline-flex w-fit items-center justify-center rounded-full px-8 py-3.5 text-base font-semibold transition hover:opacity-90"
              />
            ) : null}`,
    },
    {
      old: /\{presentation\.showCta \? \(\n\s*<a\n\s*\{\.\.\.ctaLink\}\n\s*className="mt-10 inline-flex w-fit[\s\S]*?<\/a>\n\s*\) : null\}/,
      neu: `{presentation.showCta ? (
            <AboutUsCta
              presentation={presentation}
              label={ctaLabel}
              linkProps={ctaLink}
              className="mt-10"
              solidClassName="inline-flex w-fit items-center justify-center rounded-full px-8 py-3.5 text-base font-semibold transition hover:opacity-90"
            />
          ) : null}`,
    },
  ];
  let s2 = get();
  sites.forEach((site, i) => {
    if (!site.old.test(s2)) throw new Error('call site ' + i + ' not found');
    s2 = s2.replace(site.old, site.neu);
  });
  set(s2);
});

console.log('ok');

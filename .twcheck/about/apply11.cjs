const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..', '..');
function edit(rel, fn) {
  const f = path.join(root, rel);
  let s = fs.readFileSync(f, 'utf8');
  const eol = s.includes('\r\n') ? '\r\n' : '\n';
  s = s.replace(/\r\n/g, '\n');
  const rep = (a, b) => {
    if (!s.includes(a)) throw new Error(rel + ' missing: ' + a.slice(0, 90));
    s = s.replace(a, b);
  };
  fn(rep, () => s, (v) => { s = v; });
  fs.writeFileSync(f, s.replace(/\n/g, eol));
}

// ------------------------------------------------------------------ settings
edit('components/portfolio/portfolio-about-us-settings.ts', (rep) => {
  rep(`export type PortfolioAboutUsQuoteMedia = 'image' | 'svg';`, `export type PortfolioAboutUsQuoteMedia = 'image' | 'svg';

/** General → Text size: one scale for every type size in the section's content, whatever the design. */
export type PortfolioAboutUsTextSize = 'small' | 'medium' | 'large' | 'xlarge';

export const PORTFOLIO_ABOUT_US_TEXT_SIZE_OPTIONS: { value: PortfolioAboutUsTextSize; label: string }[] = [
  { value: 'small', label: msg('Small') },
  { value: 'medium', label: msg('Medium') },
  { value: 'large', label: msg('Large') },
  { value: 'xlarge', label: msg('Extra Large') },
];

const ABOUT_US_TEXT_SCALE: Record<PortfolioAboutUsTextSize, number> = {
  small: 0.88,
  medium: 1,
  large: 1.12,
  xlarge: 1.25,
};

/** Multiplier behind \`--pf-about-scale\` (see the .pf-about-scale rule in globals.css). */
export function aboutUsTextScale(size: PortfolioAboutUsTextSize | undefined): number {
  return (size && ABOUT_US_TEXT_SCALE[size]) || 1;
}`);
  rep(`  /** Unset = the design's default (see resolveAboutUsCtaStyle). */
  ctaStyle?: PortfolioAboutUsCtaStyle;`, `  /** Unset = the design's default (see resolveAboutUsCtaStyle). */
  ctaStyle?: PortfolioAboutUsCtaStyle;
  /** Unset = medium. */
  textSize?: PortfolioAboutUsTextSize;`);
  rep(`    ctaStyle:
      typeof record.ctaStyle`, `    textSize: pick(record.textSize, ['small', 'medium', 'large', 'xlarge'] as const, base.textSize ?? 'medium'),
    ctaStyle:
      typeof record.ctaStyle`);
});

// --------------------------------------------------------------------- css
{
  const f = path.join(root, 'app/globals.css');
  let s = fs.readFileSync(f, 'utf8');
  const sizes = { xs: [0.75, 1], sm: [0.875, 1.25], base: [1, 1.5], lg: [1.125, 1.75], xl: [1.25, 1.75], '2xl': [1.5, 2], '3xl': [1.875, 2.25], '4xl': [2.25, 2.5] };
  const rules = Object.entries(sizes)
    .map(([k, [fs_, lh]]) => `  --text-${k}: calc(${fs_}rem * var(--pf-about-scale, 1));\n  --text-${k}--line-height: calc(${lh}rem * var(--pf-about-scale, 1));`)
    .join('\n');
  const block = `
/* About us — General → Text size. The named sizes (text-xs … text-4xl) read these theme variables, so
   re-declaring them on the section's wrapper rescales every one of them inside it; the arbitrary
   sizes in EditorialAboutUsSection.tsx multiply by the same \`--pf-about-scale\` themselves. */
.pf-about-scale {
${rules}
}
`;
  if (!s.includes('.pf-about-scale')) fs.writeFileSync(f, s.replace(/\s*$/, '\n') + block);
}

// ----------------------------------------------------------------- section
edit('components/portfolio/EditorialAboutUsSection.tsx', (rep, get, set) => {
  rep(`  aboutUsIsDarkMode,
  aboutUsReadableInk,`, `  aboutUsIsDarkMode,
  aboutUsReadableInk,
  aboutUsTextScale,`);

  // CTA: size is a prop (the editorial list is large enough that 15px looks timid beside it)
  rep(`  className = '',
  solidClassName,
}: {
  presentation: PortfolioAboutUsPresentationSettings;
  label: string;`, `  className = '',
  solidClassName,
  textClassName = 'text-[15px]',
}: {
  presentation: PortfolioAboutUsPresentationSettings;
  label: string;`);
  rep(`  solidClassName: string;
}) {
  const variant: PortfolioAboutUsCtaStyle`, `  solidClassName: string;
  /** Label size. */
  textClassName?: string;
}) {
  const variant: PortfolioAboutUsCtaStyle`);
  let s = get();
  const fnStart = s.indexOf('function AboutUsCta({');
  const fnEnd = s.indexOf('function AboutUsTaskMarker');
  let fn = s.slice(fnStart, fnEnd);
  const n = (fn.match(/text-\[15px\] font-medium tracking-wide/g) || []).length;
  if (n !== 4) throw new Error('expected 4 cta sizes, got ' + n);
  fn = fn.replace(/text-\[15px\] font-medium tracking-wide/g, '${textClassName} font-medium tracking-wide');
  s = s.slice(0, fnStart) + fn + s.slice(fnEnd);
  set(s);

  // Editorial balance
  rep(`className="w-7 shrink-0 text-[13px] font-medium tabular-nums tracking-wide"`, `className="w-7 shrink-0 text-[14px] font-medium tabular-nums tracking-wide"`);
  rep(`className="min-w-0 text-xl font-light leading-tight sm:text-[1.65rem]"`, `className="min-w-0 text-xl font-normal leading-tight sm:text-[1.5rem]"`);
  rep(`className="max-w-[32rem] text-pretty text-lg font-light leading-[1.5] sm:text-[1.3rem]"`, `className="max-w-[32rem] text-pretty text-lg font-normal leading-[1.55] sm:text-[1.25rem]"`);
  rep(`text-pretty text-[1.375rem] font-light leading-snug sm:text-[1.75rem]`, `text-pretty text-[1.375rem] font-normal leading-[1.3] sm:text-[1.75rem]`);
  rep(`                  solidClassName="inline-flex w-fit items-center justify-center rounded-full px-8 py-3.5 text-base font-semibold transition hover:opacity-90"
                />
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function AboutUsMediaLeftSingleVisual`, `                  solidClassName="inline-flex w-fit items-center justify-center rounded-full px-8 py-3.5 text-base font-semibold transition hover:opacity-90"
                  textClassName="text-[1.0625rem]"
                />
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function AboutUsMediaLeftSingleVisual`);

  // every arbitrary size multiplies by the section scale
  s = get();
  let count = 0;
  s = s.replace(/text-\[(\d*\.?\d+(?:rem|px)|clamp\([^\]]*\))\]/g, (_m, size) => {
    count++;
    return `text-[calc(${size}*var(--pf-about-scale,1))]`;
  });
  set(s);
  console.log('arbitrary sizes scaled:', count);

  // wrapper around whichever design renders
  rep(`export function EditorialAboutUsSection({`, `export function EditorialAboutUsSection(props: EditorialAboutUsSectionProps) {
  return (
    <div
      className="pf-about-scale"
      style={{ '--pf-about-scale': aboutUsTextScale(props.presentation.textSize) } as CSSProperties}
    >
      <AboutUsDesignSwitch {...props} />
    </div>
  );
}

type EditorialAboutUsSectionProps = {
  aboutUs: ProfileAboutUs;
  presentation: PortfolioAboutUsPresentationSettings;
  sectionTitle?: string;
  sectionSubtitle?: string;
  founderRating?: number;
  ctaHref?: string;
  onCtaNavigate?: (href: string) => void;
};

function AboutUsDesignSwitch({`);
});

// ------------------------------------------------------------------- panel
edit('components/portfolio/portfolio-about-us-settings-panel.tsx', (rep) => {
  rep(`          <NpCollapsibleSection title={t('Style')}>
      <SectionColorModeControl
        label={t('Color mode')}
        value={aboutUs.colorModeOverride}
        onChange={(colorModeOverride) => onChange({ colorModeOverride })}
      />

          </NpCollapsibleSection>
`, ``);
  rep(`            <NpCollapsibleSection title={t('Content')}>`, `            <NpCollapsibleSection title={t('Style')}>
              {/* Both apply to the whole section, whichever design is active. */}
              <SectionColorModeControl
                label={t('Color mode')}
                value={aboutUs.colorModeOverride}
                onChange={(colorModeOverride) => onChange({ colorModeOverride })}
              />
              <NpSegmentedControl
                label={t('Text size')}
                options={PORTFOLIO_ABOUT_US_TEXT_SIZE_OPTIONS.map((option) => ({ value: option.value, label: t(option.label) }))}
                value={aboutUs.textSize ?? 'medium'}
                onChange={(textSize) => onChange({ textSize })}
              />
            </NpCollapsibleSection>
            <NpCollapsibleSection title={t('Content')}>`);
  rep(`  PORTFOLIO_ABOUT_US_TASK_BULLET_OPTIONS,`, `  PORTFOLIO_ABOUT_US_TASK_BULLET_OPTIONS,
  PORTFOLIO_ABOUT_US_TEXT_SIZE_OPTIONS,`);
  rep(`  NpPanelShell,
  NpPickerRow,`, `  NpPanelShell,
  NpPickerRow,
  NpSegmentedControl,`);
});
console.log('ok');

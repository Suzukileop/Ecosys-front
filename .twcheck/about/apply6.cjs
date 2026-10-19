const fs = require('fs');
const path = require('path');
const f = path.join(__dirname, '..', '..', 'components/portfolio/portfolio-about-us-settings-panel.tsx');
let s = fs.readFileSync(f, 'utf8');
const eol = s.includes('\r\n') ? '\r\n' : '\n';
s = s.replace(/\r\n/g, '\n');
const rep = (a, b) => { if (!s.includes(a)) throw new Error('missing ' + a.slice(0, 70)); s = s.replace(a, b); };
rep(`  PORTFOLIO_ABOUT_US_CONTENT_PLACEMENT_OPTIONS,
  PORTFOLIO_ABOUT_US_DESIGN_OPTIONS,`, `  PORTFOLIO_ABOUT_US_CONTENT_PLACEMENT_OPTIONS,
  PORTFOLIO_ABOUT_US_CTA_STYLE_OPTIONS,
  PORTFOLIO_ABOUT_US_DESIGN_OPTIONS,`);
rep(`  resolveAboutUsMediaSide,
  type PortfolioAboutUsCardBorder,`, `  resolveAboutUsCtaStyle,
  resolveAboutUsMediaSide,
  type PortfolioAboutUsCardBorder,`);
rep(`  type PortfolioAboutUsContentPlacement,
  type PortfolioAboutUsDesign,`, `  type PortfolioAboutUsContentPlacement,
  type PortfolioAboutUsCtaStyle,
  type PortfolioAboutUsDesign,`);
rep(`export type AboutUsSubSection =`, `/** A few strokes per style, drawn with currentColor so the picker card stays on-palette. */
function AboutUsCtaStyleIllustration({ style }: { style: PortfolioAboutUsCtaStyle }) {
  const arrow = <path d="M4 7h8M9 4l3 3-3 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" fill="none" />;
  return (
    <svg viewBox="0 0 64 28" className="h-7 w-16" aria-hidden>
      {style === 'solid' ? <rect x="12" y="6" width="40" height="16" rx="8" fill="currentColor" opacity="0.8" /> : null}
      {style === 'link' ? (
        <>
          <rect x="14" y="10" width="22" height="3" rx="1.5" fill="currentColor" opacity="0.7" />
          <g transform="translate(38 4)">{arrow}</g>
          <rect x="14" y="20" width="36" height="1.5" rx="0.75" fill="currentColor" opacity="0.9" />
        </>
      ) : null}
      {style === 'outline' ? <rect x="12.5" y="6.5" width="39" height="15" rx="7.5" fill="none" stroke="currentColor" strokeWidth="1.3" opacity="0.8" /> : null}
      {style === 'circle' ? (
        <>
          <rect x="10" y="12" width="26" height="3" rx="1.5" fill="currentColor" opacity="0.7" />
          <circle cx="47" cy="14" r="9.25" fill="none" stroke="currentColor" strokeWidth="1.3" opacity="0.8" />
          <g transform="translate(40 7)">{arrow}</g>
        </>
      ) : null}
      {style === 'underline' ? (
        <>
          <rect x="14" y="10" width="36" height="3" rx="1.5" fill="currentColor" opacity="0.7" />
          <rect x="14" y="19" width="36" height="1" rx="0.5" fill="currentColor" opacity="0.3" />
          <rect x="14" y="18.75" width="12" height="1.5" rx="0.75" fill="currentColor" />
        </>
      ) : null}
    </svg>
  );
}

export type AboutUsSubSection =`);
rep(`              onChange={(ctaLabel) => onChange({ ctaLabel })}
            />
          ) : null}`, `              onChange={(ctaLabel) => onChange({ ctaLabel })}
            />
          ) : null}
          {aboutUs.showCta ? (
            <NpOptionCardGroup label={t('Button style')} columns={2}>
              {PORTFOLIO_ABOUT_US_CTA_STYLE_OPTIONS.map((option) => (
                <NpOptionCard
                  key={option.value}
                  compact
                  selected={option.value === resolveAboutUsCtaStyle(aboutUs)}
                  title={t(option.label)}
                  subtitle={t(option.description)}
                  illustration={<AboutUsCtaStyleIllustration style={option.value} />}
                  onClick={() => onChange({ ctaStyle: option.value })}
                />
              ))}
            </NpOptionCardGroup>
          ) : null}`);
fs.writeFileSync(f, s.replace(/\n/g, eol));
console.log('ok');

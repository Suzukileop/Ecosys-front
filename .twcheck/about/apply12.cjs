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
  fn(rep);
  fs.writeFileSync(f, s.replace(/\n/g, eol));
}

edit('components/portfolio/portfolio-about-us-settings.ts', (rep) => {
  rep(`  small: 0.88,
  medium: 1,`, `  small: 0.85,
  medium: 1,`);
  rep(`  /** Unset = medium. */
  textSize?: PortfolioAboutUsTextSize;`, `  /** Unset = medium. */
  textSize?: PortfolioAboutUsTextSize;
  /** Editorial headline only. Unset = follow the section's title colour / palette. */
  editorialTitleColor?: string;
  /** Editorial headline only: exact size in px on a desktop screen (it steps down on small screens).
   *  Unset = the design's automatic responsive size. */
  editorialTitleSizePx?: number;`);
  rep(`    textSize: pick(record.textSize,`, `    editorialTitleColor:
      typeof record.editorialTitleColor === 'string' && /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(record.editorialTitleColor.trim())
        ? record.editorialTitleColor.trim()
        : 'editorialTitleColor' in record
          ? undefined // cleared: back to automatic
          : base.editorialTitleColor,
    editorialTitleSizePx:
      typeof record.editorialTitleSizePx === 'number' && Number.isFinite(record.editorialTitleSizePx)
        ? Math.min(ABOUT_US_EDITORIAL_TITLE_PX_MAX, Math.max(ABOUT_US_EDITORIAL_TITLE_PX_MIN, Math.round(record.editorialTitleSizePx)))
        : 'editorialTitleSizePx' in record
          ? undefined
          : base.editorialTitleSizePx,
    textSize: pick(record.textSize,`);
  rep(`/** General → Text size:`, `export const ABOUT_US_EDITORIAL_TITLE_PX_MIN = 32;
export const ABOUT_US_EDITORIAL_TITLE_PX_MAX = 160;
/** The size the automatic headline reaches on a wide screen (shown as the slider's starting point). */
export const ABOUT_US_EDITORIAL_TITLE_AUTO_PX = 80;

/** General → Text size:`);
});

edit('components/portfolio/EditorialAboutUsSection.tsx', (rep) => {
  // smaller automatic headline: 100px → 80px at most
  rep(`text-[calc(clamp(2.5rem,8.2vw,6.25rem)*var(--pf-about-scale,1))]`, `text-[calc(clamp(2.25rem,6.6vw,5rem)*var(--pf-about-scale,1))]`);
  rep(`          style={{ color: presentation.titleColor } satisfies CSSProperties}
        >
          {title}
        </h3>
      ) : null}

      {twoColumns || hasVisualColumn || hasTextColumn ? (`, `          style={editorialTitleStyle}
        >
          {title}
        </h3>
      ) : null}

      {twoColumns || hasVisualColumn || hasTextColumn ? (`);
  rep(`  const gridCols = !twoColumns`, `  // Manual headline colour / size (Design → Layout → Headline). The size is the desktop size: it steps
  // down with the viewport so a large value never overflows a phone, and ignores Text size on purpose.
  const customSize = presentation.editorialTitleSizePx;
  const editorialTitleStyle: CSSProperties = {
    color: presentation.editorialTitleColor ?? presentation.titleColor,
    ...(customSize
      ? { fontSize: \`clamp(\${Math.round(customSize * 0.42)}px, \${((customSize / 1100) * 100).toFixed(2)}vw, \${customSize}px)\` }
      : null),
  };

  const gridCols = !twoColumns`);
});

edit('components/portfolio/portfolio-about-us-settings-panel.tsx', (rep) => {
  rep(`  PORTFOLIO_ABOUT_US_TEXT_SIZE_OPTIONS,`, `  PORTFOLIO_ABOUT_US_TEXT_SIZE_OPTIONS,
  ABOUT_US_EDITORIAL_TITLE_AUTO_PX,
  ABOUT_US_EDITORIAL_TITLE_PX_MAX,
  ABOUT_US_EDITORIAL_TITLE_PX_MIN,`);
  rep(`          <NpCollapsibleSection title={t('Layout')}>
      {isSplitFamily ? (`, `          <NpCollapsibleSection title={t('Layout')}>
      {isEditorial ? (
        <div className="space-y-4">
          <p className="pf-stack-block-label">{t('Headline')}</p>
          <ColorField
            label={t('Headline color')}
            value={aboutUs.editorialTitleColor ?? aboutUs.titleColor}
            onChange={(editorialTitleColor) => onChange({ editorialTitleColor })}
          />
          <NpRangeField
            label={t('Headline size')}
            value={aboutUs.editorialTitleSizePx ?? ABOUT_US_EDITORIAL_TITLE_AUTO_PX}
            min={ABOUT_US_EDITORIAL_TITLE_PX_MIN}
            max={ABOUT_US_EDITORIAL_TITLE_PX_MAX}
            step={2}
            unit="px"
            onChange={(editorialTitleSizePx) => onChange({ editorialTitleSizePx })}
          />
          <p className="text-[13px] leading-5 text-[color:var(--pf-palette-texte-muted)]">
            {aboutUs.editorialTitleSizePx
              ? t('Desktop size; it steps down on smaller screens. Text size no longer changes the headline.')
              : t('Automatic: follows the screen width and the Text size setting.')}
          </p>
          {aboutUs.editorialTitleColor || aboutUs.editorialTitleSizePx ? (
            <button
              type="button"
              onClick={() => onChange({ editorialTitleColor: undefined, editorialTitleSizePx: undefined })}
              className="text-xs font-medium text-[color:var(--pf-palette-texte-muted)] underline underline-offset-4 hover:text-[color:var(--pf-palette-texte-fort)]"
            >
              {t('Reset headline to automatic')}
            </button>
          ) : null}
        </div>
      ) : null}
      {isSplitFamily ? (`);
});
console.log('ok');

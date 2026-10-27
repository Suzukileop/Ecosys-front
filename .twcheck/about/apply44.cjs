const fs=require('fs'),path=require('path');const root=path.join(__dirname,'..','..');
function edit(rel,fn){const f=path.join(root,rel);let s=fs.readFileSync(f,'utf8');const eol=s.includes('\r\n')?'\r\n':'\n';s=s.replace(/\r\n/g,'\n');
const rep=(a,b)=>{if(s.split(a).length!==2)throw new Error(rel+' need one: '+a.slice(0,70));s=s.replace(a,b);};fn(rep);fs.writeFileSync(f,s.replace(/\n/g,eol));}
const H='components/portfolio/';
edit(H+'portfolio-work-settings.ts',rep=>{
rep(`  /** Outer frame / border around each spec sheet. */
  sheetFrame: 'none' | 'thin' | 'solid' | 'accent';
  /** Show project media thumbnail on the right of each sheet. */`,`  /** Outer frame / border around each spec sheet. */
  sheetFrame: 'none' | 'thin' | 'solid' | 'accent';
  /** Border colour (palette token); auto keeps the frame colour of the chosen framing. */
  frameColor: PortfolioWorkSpecColor | 'auto';
  /** Border opacity, in percent. */
  frameOpacity: number;
  /** Fill behind the sheet (palette token); none = transparent. */
  frameFill: PortfolioWorkSpecColor | 'none';
  /** Fill opacity, in percent. */
  frameFillOpacity: number;
  /** Colour of the category line: the muted text, or a palette token. */
  categoryColor: PortfolioWorkSpecMetaColor;
  /** Colour of the role line: the muted text, or a palette token. */
  roleColor: PortfolioWorkSpecMetaColor;
  /** Small rule between the category and the role. */
  metaDivider: 'none' | 'short' | 'long';
  /** Colour of that rule. */
  metaDividerColor: PortfolioWorkSpecColor;
  /** Thickness and length of that rule. */
  metaDividerSize: 'sm' | 'md' | 'lg';
  /** Show project media thumbnail on the right of each sheet. */`);
rep(`export type PortfolioWorkProjectsSpecSettings = {`,`/** Palette colours a Spec sheet can use: the main colours, the strong text, or the muted text. */
export type PortfolioWorkSpecColor = 'principal' | 'secondaire' | 'texteFort' | 'muted';
export type PortfolioWorkSpecMetaColor = 'muted' | 'principal' | 'secondaire';

export const PORTFOLIO_WORK_SPEC_COLOR_OPTIONS: { value: PortfolioWorkSpecColor; label: string }[] = [
  { value: 'principal', label: msg('Primary') },
  { value: 'secondaire', label: msg('Secondary') },
  { value: 'texteFort', label: msg('Strong text') },
  { value: 'muted', label: msg('Muted') },
];

export const PORTFOLIO_WORK_SPEC_META_COLOR_OPTIONS: { value: PortfolioWorkSpecMetaColor; label: string }[] = [
  { value: 'muted', label: msg('Muted') },
  { value: 'principal', label: msg('Primary') },
  { value: 'secondaire', label: msg('Secondary') },
];

export const PORTFOLIO_WORK_SPEC_META_DIVIDER_OPTIONS: {
  value: 'none' | 'short' | 'long';
  label: string;
  description: string;
}[] = [
  { value: 'none', label: msg('None'), description: msg('No rule between category and role.') },
  { value: 'short', label: msg('Short'), description: msg('A short rule, centered.') },
  { value: 'long', label: msg('Long'), description: msg('A rule across the full width.') },
];

export const PORTFOLIO_WORK_SPEC_META_DIVIDER_SIZE_OPTIONS: {
  value: 'sm' | 'md' | 'lg';
  label: string;
  description: string;
}[] = [
  { value: 'sm', label: msg('Small'), description: msg('A fine, short rule.') },
  { value: 'md', label: msg('Medium'), description: msg('Balanced thickness and length.') },
  { value: 'lg', label: msg('Large'), description: msg('A bolder, longer rule.') },
];

export type PortfolioWorkProjectsSpecSettings = {`);
rep(`  sheetFrame: 'none',
  showThumbnail: false,
  showFieldLabels: true,
  descriptionLabel: 'Summary',
  stackLabel: 'Stack',
  linkLabel: 'Link',
};

export function mergeProjectsSpecSettings(`,`  sheetFrame: 'none',
  frameColor: 'auto',
  frameOpacity: 100,
  frameFill: 'none',
  frameFillOpacity: 8,
  categoryColor: 'principal',
  roleColor: 'secondaire',
  metaDivider: 'none',
  metaDividerColor: 'muted',
  metaDividerSize: 'md',
  showThumbnail: false,
  showFieldLabels: true,
  descriptionLabel: 'Summary',
  stackLabel: 'Stack',
  linkLabel: 'Link',
};

const SPEC_COLORS: readonly PortfolioWorkSpecColor[] = ['principal', 'secondaire', 'texteFort', 'muted'];
const SPEC_META_COLORS: readonly PortfolioWorkSpecMetaColor[] = ['muted', 'principal', 'secondaire'];
function pickSpecOption<T extends string>(value: unknown, allowed: readonly T[], fallback: T): T {
  return typeof value === 'string' && (allowed as readonly string[]).includes(value) ? (value as T) : fallback;
}
function clampPercent(value: unknown, fallback: number, min: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? Math.min(100, Math.max(min, Math.round(value))) : fallback;
}

export function mergeProjectsSpecSettings(`);
rep(`        ? record.sheetFrame
        : base.sheetFrame,
    showThumbnail:
      typeof record.showThumbnail === 'boolean' ? record.showThumbnail : base.showThumbnail,
    showFieldLabels:
      typeof record.showFieldLabels === 'boolean' ? record.showFieldLabels : base.showFieldLabels,
    descriptionLabel:
      typeof record.descriptionLabel === 'string' && record.descriptionLabel.trim()
        ? record.descriptionLabel.trim()
        : base.descriptionLabel,
    stackLabel:`,`        ? record.sheetFrame
        : base.sheetFrame,
    frameColor: pickSpecOption<PortfolioWorkSpecColor | 'auto'>(record.frameColor, ['auto', ...SPEC_COLORS], base.frameColor ?? 'auto'),
    frameOpacity: clampPercent(record.frameOpacity, base.frameOpacity ?? 100, 10),
    frameFill: pickSpecOption<PortfolioWorkSpecColor | 'none'>(record.frameFill, ['none', ...SPEC_COLORS], base.frameFill ?? 'none'),
    frameFillOpacity: clampPercent(record.frameFillOpacity, base.frameFillOpacity ?? 8, 2),
    categoryColor: pickSpecOption(record.categoryColor, SPEC_META_COLORS, base.categoryColor ?? 'principal'),
    roleColor: pickSpecOption(record.roleColor, SPEC_META_COLORS, base.roleColor ?? 'secondaire'),
    metaDivider: pickSpecOption<'none' | 'short' | 'long'>(record.metaDivider, ['none', 'short', 'long'], base.metaDivider ?? 'none'),
    metaDividerColor: pickSpecOption(record.metaDividerColor, SPEC_COLORS, base.metaDividerColor ?? 'muted'),
    metaDividerSize: pickSpecOption<'sm' | 'md' | 'lg'>(record.metaDividerSize, ['sm', 'md', 'lg'], base.metaDividerSize ?? 'md'),
    showThumbnail:
      typeof record.showThumbnail === 'boolean' ? record.showThumbnail : base.showThumbnail,
    showFieldLabels:
      typeof record.showFieldLabels === 'boolean' ? record.showFieldLabels : base.showFieldLabels,
    descriptionLabel:
      typeof record.descriptionLabel === 'string' && record.descriptionLabel.trim()
        ? record.descriptionLabel.trim()
        : base.descriptionLabel,
    stackLabel:`);
});
edit(H+'portfolio-work-projects-spec.tsx',rep=>{
rep(`  DEFAULT_WORK_PRESENTATION,
  mergeProjectsSpecSettings,
} from '@/components/portfolio/portfolio-work-settings';`,`  DEFAULT_WORK_PRESENTATION,
  mergeProjectsSpecSettings,
  workPaletteTokenColor,
} from '@/components/portfolio/portfolio-work-settings';`);
rep(`  const frameBorderColor = sheetFrame === 'accent' ? accent : rule;
  const frameBorderWidth =
    sheetFrame === 'solid' ? 2 : sheetFrame === 'thin' || sheetFrame === 'accent' ? 1 : 0;`,`  const specColor = (token: 'principal' | 'secondaire' | 'texteFort' | 'muted') =>
    token === 'muted' ? muted : workPaletteTokenColor(token);
  const percentMix = (color: string, percent: number) =>
    percent >= 100 ? color : \`color-mix(in srgb, \${color} \${percent}%, transparent)\`;
  const frameColorSetting = settings.frameColor ?? 'auto';
  const frameBorderBase =
    frameColorSetting === 'auto' ? (sheetFrame === 'accent' ? accent : rule) : specColor(frameColorSetting);
  const frameBorderColor = percentMix(frameBorderBase, settings.frameOpacity ?? 100);
  const frameBorderWidth =
    sheetFrame === 'solid' ? 2 : sheetFrame === 'thin' || sheetFrame === 'accent' ? 1 : 0;
  const frameFillSetting = settings.frameFill ?? 'none';
  const frameFillColor =
    frameFillSetting === 'none' ? undefined : percentMix(specColor(frameFillSetting), settings.frameFillOpacity ?? 8);
  const padded = framed || frameFillColor !== undefined;
  const categoryInk =
    !settings.categoryColor || settings.categoryColor === 'muted' ? muted : workPaletteTokenColor(settings.categoryColor);
  const roleInk = !settings.roleColor || settings.roleColor === 'muted' ? muted : workPaletteTokenColor(settings.roleColor);
  const metaDivider = settings.metaDivider ?? 'none';
  const metaDividerThickness = settings.metaDividerSize === 'lg' ? 3 : settings.metaDividerSize === 'sm' ? 1 : 2;
  const metaDividerLength = settings.metaDividerSize === 'lg' ? '2.25rem' : settings.metaDividerSize === 'sm' ? '1rem' : '1.5rem';
  const metaDividerInk = specColor(settings.metaDividerColor ?? 'muted');`);
rep(`                className="truncate text-xs font-normal tracking-[0.06em] sm:text-sm"
                style={{ color: muted, opacity: 0.9 }}
              >
                {category}
              </p>
            ) : null}
            {showRole ? (
              <p
                className={\`truncate text-sm font-normal tracking-[-0.01em] sm:text-[0.9375rem] \${
                  showCategory ? 'mt-1' : ''
                }\`}
                style={{ color: muted, opacity: 0.88 }}
              >`,`                className="truncate text-xs font-medium tracking-[0.06em] sm:text-sm"
                style={{ color: categoryInk }}
              >
                {category}
              </p>
            ) : null}
            {showCategory && showRole && metaDivider !== 'none' ? (
              <span
                aria-hidden
                className={\`my-1.5 flex \${metaDivider === 'short' ? 'justify-center' : ''}\`}
              >
                <span
                  className="block"
                  style={{
                    height: metaDividerThickness,
                    width: metaDivider === 'short' ? metaDividerLength : '100%',
                    backgroundColor: metaDividerInk,
                  }}
                />
              </span>
            ) : null}
            {showRole ? (
              <p
                className={\`truncate text-sm font-normal tracking-[-0.01em] sm:text-[0.9375rem] \${
                  showCategory && metaDivider === 'none' ? 'mt-1' : ''
                }\`}
                style={{ color: roleInk }}
              >`);
rep(`        <p className="mt-2 text-sm sm:hidden" style={{ color: muted, opacity: 0.9 }}>
          {[showRole ? role : '', showCategory ? category : ''].filter(Boolean).join(' · ')}
        </p>`,`        <p className="mt-2 text-sm sm:hidden">
          {showRole ? <span style={{ color: roleInk }}>{role}</span> : null}
          {showRole && showCategory ? <span style={{ color: muted }}> · </span> : null}
          {showCategory ? <span style={{ color: categoryInk }}>{category}</span> : null}
        </p>`);
rep("        className={`relative min-w-0 flex-1 ${framed ? 'p-5 sm:p-6 lg:p-8' : ''}`}","        className={`relative min-w-0 flex-1 ${padded ? 'p-5 sm:p-6 lg:p-8' : ''}`}");
rep(`        style={
          framed
            ? {
                borderWidth: frameBorderWidth,
                borderStyle: 'solid',
                borderColor: frameBorderColor,
              }
            : undefined
        }`,`        style={
          padded
            ? {
                ...(framed
                  ? { borderWidth: frameBorderWidth, borderStyle: 'solid', borderColor: frameBorderColor }
                  : null),
                backgroundColor: frameFillColor,
              }
            : undefined
        }`);
});
console.log('ok');

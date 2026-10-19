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

edit('components/portfolio/portfolio-list-marker.ts', (rep) => {
  rep(`const PORTFOLIO_LIST_MARKER_STYLE_OPTIONS: {`, `export const PORTFOLIO_LIST_MARKER_STYLE_OPTIONS: {`);
});

edit('components/portfolio/portfolio-about-us-settings.ts', (rep, get) => {
  const s = get();
  // import line for the marker module
  if (!s.includes("from '@/components/portfolio/portfolio-list-marker'")) {
    rep(`export type PortfolioAboutUsQuoteMedia = 'image' | 'svg';`, `export type PortfolioAboutUsQuoteMedia = 'image' | 'svg';

/** Bullets offered for the task list: the shared marker vocabulary, trimmed to what suits this section. */
const ABOUT_US_TASK_BULLET_STYLES: PortfolioListMarkerStyle[] = [
  'disc', 'dot', 'dash', 'arrow', 'chevron', 'check', 'check-circle', 'bullseye', 'square', 'number', 'roman', 'none',
];
export const PORTFOLIO_ABOUT_US_TASK_BULLET_OPTIONS = PORTFOLIO_LIST_MARKER_STYLE_OPTIONS.filter((option) =>
  ABOUT_US_TASK_BULLET_STYLES.includes(option.value)
).sort((a, b) => ABOUT_US_TASK_BULLET_STYLES.indexOf(a.value) - ABOUT_US_TASK_BULLET_STYLES.indexOf(b.value));`);
    // add import at top: after first import line block start
    const first = get().indexOf('import ');
    const cur = get();
    rep(cur.slice(first, cur.indexOf('\n', first) + 1), cur.slice(first, cur.indexOf('\n', first) + 1) + `import {
  isPortfolioListMarkerStyle,
  PORTFOLIO_LIST_MARKER_STYLE_OPTIONS,
  type PortfolioListMarkerStyle,
} from '@/components/portfolio/portfolio-list-marker';
`);
  }
  rep(`  /** Unset = the design's default (see resolveAboutUsCtaStyle). */
  ctaStyle?: PortfolioAboutUsCtaStyle;`, `  /** Unset = the design's default (see resolveAboutUsCtaStyle). */
  ctaStyle?: PortfolioAboutUsCtaStyle;
  /** Bullet of the task list. Unset = the design's own (a disc in Classique, an accent check elsewhere). */
  taskBulletStyle?: PortfolioListMarkerStyle;`);
  rep(`    ctaStyle:
      typeof record.ctaStyle`, `    taskBulletStyle: isPortfolioListMarkerStyle(record.taskBulletStyle) ? record.taskBulletStyle : base.taskBulletStyle,
    ctaStyle:
      typeof record.ctaStyle`);
});

edit('components/portfolio/EditorialAboutUsSection.tsx', (rep, get, set) => {
  rep(`function AboutUsAccentCheck({ color, compact = false }`, `/**
 * Task-list bullet. With no choice saved, each design keeps its own (see AboutUsAccentCheck); once the
 * creator picks one under Design → List bullets it is drawn from the shared marker set, in the accent
 * colour, at the same size in every design.
 */
function AboutUsTaskMarker({
  presentation,
  index,
  compact = false,
}: {
  presentation: PortfolioAboutUsPresentationSettings;
  index: number;
  compact?: boolean;
}) {
  if (!presentation.taskBulletStyle) return <AboutUsAccentCheck color={presentation.accentColor} compact={compact} />;
  return (
    <PortfolioListMarker
      style={presentation.taskBulletStyle}
      color={presentation.accentColor}
      index={index}
      size="md"
      className="mt-1"
    />
  );
}

function AboutUsAccentCheck({ color, compact = false }`);
  let s = get();
  s = s.replace(/<AboutUsAccentCheck color=\{accent\} compact \/>/, '<AboutUsTaskMarker presentation={presentation} index={index} compact />');
  s = s.replace(/<AboutUsAccentCheck color=\{accent\} \/>/g, '<AboutUsTaskMarker presentation={presentation} index={index} />');
  set(s);
  rep(`      taskBulletStyle: 'disc',
      taskBulletColor: presentation.taskColor,`, `      taskBulletStyle: presentation.taskBulletStyle ?? 'disc',
      taskBulletColor: presentation.taskColor,`);
});

edit('components/portfolio/portfolio-about-us-settings-panel.tsx', (rep) => {
  rep(`  PORTFOLIO_ABOUT_US_SECTION_LAYOUT_OPTIONS,
  resolveAboutUsCtaStyle,`, `  PORTFOLIO_ABOUT_US_SECTION_LAYOUT_OPTIONS,
  PORTFOLIO_ABOUT_US_TASK_BULLET_OPTIONS,
  resolveAboutUsCtaStyle,`);
  rep(`import { useT } from '@/lib/i18n/I18nProvider';`, `import { PortfolioListMarker } from '@/components/portfolio/PortfolioListMarker';
import { useT } from '@/lib/i18n/I18nProvider';`);
  rep(`          </NpCollapsibleSection>
            </>
          )}
        </div>
      ) : null}
    </NpPanelShell>`, `          </NpCollapsibleSection>
          {aboutUs.showTasks ? (
            <NpCollapsibleSection title={t('List bullets')}>
              <NpOptionCardGroup label={t('Task list bullet')} columns={3}>
                {PORTFOLIO_ABOUT_US_TASK_BULLET_OPTIONS.map((option) => (
                  <NpOptionCard
                    key={option.value}
                    compact
                    selected={option.value === aboutUs.taskBulletStyle}
                    title={t(option.label)}
                    illustration={
                      option.value === 'none' ? (
                        <span className="text-xs opacity-60">—</span>
                      ) : (
                        <span className="flex items-center gap-1.5" style={{ color: aboutUs.accentColor }}>
                          <PortfolioListMarker style={option.value} color={aboutUs.accentColor} index={0} size="md" className="!mt-0" />
                          <span className="h-1.5 w-8 rounded-full bg-current opacity-25" style={{ color: 'currentColor' }} />
                        </span>
                      )
                    }
                    onClick={() => onChange({ taskBulletStyle: option.value })}
                  />
                ))}
              </NpOptionCardGroup>
              {aboutUs.taskBulletStyle ? (
                <button
                  type="button"
                  onClick={() => onChange({ taskBulletStyle: undefined })}
                  className="mt-3 text-xs font-medium text-[color:var(--pf-palette-texte-muted)] underline underline-offset-4 hover:text-[color:var(--pf-palette-texte-fort)]"
                >
                  {t('Use this design’s default bullet')}
                </button>
              ) : null}
            </NpCollapsibleSection>
          ) : null}
            </>
          )}
        </div>
      ) : null}
    </NpPanelShell>`);
});
console.log('ok');

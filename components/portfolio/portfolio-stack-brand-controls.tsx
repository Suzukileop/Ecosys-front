'use client';
import { ToolsControlGroups } from './portfolio-tools-control-groups';

import { useT } from '@/lib/i18n/I18nProvider';
import { HeaderSteppedSlider } from './portfolio-header-style-controls';
import { NpToggleRow } from './portfolio-nav-panel-ui';
import type { PortfolioStackSectionSettings } from './portfolio-stack-settings';
import { PORTFOLIO_TOOLS_TILE_SIZE_OPTIONS, PORTFOLIO_TOOLS_CARD_GAP_OPTIONS, PORTFOLIO_TOOLS_CONTENT_ALIGNMENT_OPTIONS, PORTFOLIO_TOOLS_BRAND_CARDS_ICON_PLACEMENT_OPTIONS } from './portfolio-tools-settings';
import styles from './portfolio-stack-rail-controls.module.css';

type BrandSettings = Pick<PortfolioStackSectionSettings,
  'tileSize' | 'cardGap' | 'brandCardsIconPlacement' | 'brandCardsColumnsPerRow' |
  'brandCardsContentAlignment' | 'brandCardsFullWidth'>;

export function StackBrandControls({ stack, onChange, aside }: {
  stack: BrandSettings;
  onChange: (patch: Partial<BrandSettings>) => void;
  aside: boolean;
}) {
  const t = useT();
  const sizes = PORTFOLIO_TOOLS_TILE_SIZE_OPTIONS;
  const size = sizes.find(option => option.value === stack.tileSize) ?? sizes[1];
  return <ToolsControlGroups>
    <div className="np-text-size-slider"><HeaderSteppedSlider label={t('Logo size')}
      steps={sizes.map((option,index) => ({ value: option.value, tick: ['S','M','L','XL'][index] }))}
      value={size.value} currentName={t(size.label)} onChange={tileSize => onChange({ tileSize })} /></div>
    <div>
      <p className={styles.label}>{t('Card spacing')}</p>
      <div className={styles.spacing} role="group" aria-label={t('Card spacing')}>
        {PORTFOLIO_TOOLS_CARD_GAP_OPTIONS.map((option,index) => <button type="button" key={option.value} className={styles.choice}
          aria-pressed={(stack.cardGap ?? 'tight') === option.value} onClick={() => onChange({ cardGap: option.value })}>
          <span className={styles.bars} style={{ gap: [0,4,9,15][index] }} aria-hidden><i/><i/><i/></span>
          <span>{index === 3 ? 'XL' : t(option.label)}</span>
        </button>)}
      </div>
    </div>
    <div>
      <p className={styles.label}>{t('Icon placement')}</p>
      <div className={styles.colors} role="group" aria-label={t('Icon placement')}>
        {PORTFOLIO_TOOLS_BRAND_CARDS_ICON_PLACEMENT_OPTIONS.map(option => <button type="button" key={option.value} className={styles.choice}
          aria-pressed={(stack.brandCardsIconPlacement ?? 'left') === option.value} onClick={() => onChange({ brandCardsIconPlacement: option.value })}>
          <svg width="64" height="32" viewBox="0 0 64 32" fill="currentColor" aria-hidden>
            {option.value === 'top' ? <><rect x="26" y="2" width="12" height="12" rx="2"/><rect x="15" y="21" width="34" height="2" rx="1"/><rect x="21" y="27" width="22" height="2" rx="1"/></> : <><rect x="4" y="8" width="16" height="16" rx="2"/><rect x="28" y="10" width="30" height="2" rx="1"/><rect x="28" y="20" width="23" height="2" rx="1"/></>}
          </svg><span>{t(option.label)}</span>
        </button>)}
      </div>
    </div>
    {!aside ? <div>
      <p className={styles.label}>{t('Columns (large screen)')}</p>
      <div className={styles.alignment} role="group" aria-label={t('Columns (large screen)')}>
        {([1,2,3] as const).map(columns => <button type="button" key={columns} className={styles.choice}
          aria-label={`${t('Columns (large screen)')}: ${columns}`} aria-pressed={Math.min(3, stack.brandCardsColumnsPerRow ?? 2) === columns}
          onClick={() => onChange({ brandCardsColumnsPerRow: columns })}>
          <svg width="48" height="24" viewBox="0 0 48 24" fill="currentColor" aria-hidden>{Array.from({length:columns},(_,index) => <rect key={index} x={index * (48/columns)} y="3" width={48/columns-3} height="18" rx="2"/>)}</svg>
          <span>{columns}</span>
        </button>)}
      </div>
    </div> : null}
    <div>
      <p className={styles.label}>{t('Content alignment')}</p>
      <div className={styles.alignment} role="group" aria-label={t('Content alignment')}>
        {PORTFOLIO_TOOLS_CONTENT_ALIGNMENT_OPTIONS.map(option => <button type="button" key={option.value} className={styles.choice}
          aria-label={t(option.label)} title={t(option.label)} aria-pressed={(stack.brandCardsContentAlignment ?? 'left') === option.value}
          onClick={() => onChange({ brandCardsContentAlignment: option.value })}>
          <svg width="23" height="20" viewBox="0 0 24 20" fill="currentColor" aria-hidden><rect x={option.value === 'right' ? 10 : option.value === 'center' ? 5 : 0} y="2" width="14" height="2" rx="1"/><rect x="0" y="9" width="24" height="2" rx="1"/><rect x={option.value === 'right' ? 13 : option.value === 'center' ? 6.5 : 0} y="16" width="11" height="2" rx="1"/></svg>
        </button>)}
      </div>
    </div>
    <NpToggleRow title={t('Full width')} checked={stack.brandCardsFullWidth === true} onChange={brandCardsFullWidth => onChange({brandCardsFullWidth})}/>
  </ToolsControlGroups>;
}

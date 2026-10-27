'use client';
import { ToolsControlGroups } from './portfolio-tools-control-groups';

import { HeaderSteppedSlider } from './portfolio-header-style-controls';
import { NpToggleRow } from './portfolio-nav-panel-ui';
import { useT } from '@/lib/i18n/I18nProvider';
import type { PortfolioStackSectionSettings } from './portfolio-stack-settings';
import { PORTFOLIO_TOOLS_TILE_SIZE_OPTIONS, PORTFOLIO_TOOLS_CARD_GAP_OPTIONS, PORTFOLIO_TOOLS_CONTENT_ALIGNMENT_OPTIONS } from './portfolio-tools-settings';
import styles from './portfolio-stack-rail-controls.module.css';

type RailSettings = Pick<PortfolioStackSectionSettings,
  'tileSize' | 'cardGap' | 'workflowRailLogoTreatment' | 'workflowRailLayout' |
  'workflowRailAutoCenter' | 'workflowRailContentAlignment'>;

export function StackRailControls({ stack, onChange }: {
  stack: RailSettings;
  onChange: (patch: Partial<RailSettings>) => void;
}) {
  const t = useT();
  const sizes = PORTFOLIO_TOOLS_TILE_SIZE_OPTIONS;
  const sizeIndex = Math.max(0, sizes.findIndex(option => option.value === stack.tileSize));
  const sizeLabels = ['S', 'M', 'L', 'XL'];
  return <ToolsControlGroups>
    <div className="np-text-size-slider">
      <HeaderSteppedSlider label={t('Logo size')}
        steps={sizes.map((option, index) => ({ value: option.value, tick: sizeLabels[index] }))}
        value={sizes[sizeIndex].value} currentName={t(sizes[sizeIndex].label)}
        onChange={tileSize => onChange({ tileSize })} />
    </div>
    <div>
      <p className={styles.label}>{t('Card spacing')}</p>
      <div className={styles.spacing} role="group" aria-label={t('Card spacing')}>
        {PORTFOLIO_TOOLS_CARD_GAP_OPTIONS.map((option, index) => <button type="button" key={option.value}
          className={styles.choice} aria-pressed={(stack.cardGap ?? 'tight') === option.value}
          onClick={() => onChange({ cardGap: option.value })}>
          <span className={styles.bars} style={{ gap: [0, 4, 9, 15][index] }} aria-hidden><i /><i /><i /></span>
          <span>{index === 3 ? 'XL' : t(option.label)}</span>
        </button>)}
      </div>
    </div>
    <div>
      <p className={styles.label}>{t('Logo visibility')}</p>
      <div className={styles.colors} role="group" aria-label={t('Logo visibility')}>
        {(['vivid', 'soft'] as const).map(treatment => <button type="button" key={treatment} className={styles.choice}
          aria-pressed={(stack.workflowRailLogoTreatment ?? 'vivid') === treatment}
          onClick={() => onChange({ workflowRailLogoTreatment: treatment })}>
          <span>{t(treatment === 'vivid' ? 'Vivid colors' : 'Soft colors')}</span>
          <span className={styles.swatches} data-soft={treatment === 'soft'} aria-hidden><i /><i /><i /></span>
        </button>)}
      </div>
    </div>
    <div>
      <p className={styles.label}>{t('Display mode')}</p>
      <div className={styles.colors} role="group" aria-label={t('Display mode')}>
        {(['wrap', 'carousel'] as const).map(layout => <button type="button" key={layout} className={styles.choice}
          aria-pressed={(stack.workflowRailLayout ?? 'wrap') === layout}
          onClick={() => onChange({ workflowRailLayout: layout })}>
          <svg width="36" height="23" viewBox="0 0 36 23" fill="currentColor" aria-hidden>
            {layout === 'wrap' ? <><rect x="2" y="2" width="8" height="8" rx="1"/><rect x="14" y="2" width="8" height="8" rx="1"/><rect x="26" y="2" width="8" height="8" rx="1"/><rect x="2" y="14" width="8" height="8" rx="1"/><rect x="14" y="14" width="8" height="8" rx="1"/></> : <><rect x="10" y="6" width="6" height="11" rx="1"/><rect x="20" y="6" width="6" height="11" rx="1"/><path d="m5 7-4 4 4 4m26-8 4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.5"/></>}
          </svg>
          <span>{t(layout === 'wrap' ? 'Show all' : 'Carousel')}</span>
        </button>)}
      </div>
    </div>
    {(stack.workflowRailLayout ?? 'wrap') === 'wrap' ? <NpToggleRow
      title={t('Automatic centering')}
      description={t('Center every row, including the last one.')}
      checked={stack.workflowRailAutoCenter === true}
      onChange={workflowRailAutoCenter => onChange({ workflowRailAutoCenter })}
    /> : null}
    {((stack.workflowRailLayout ?? 'wrap') !== 'wrap' || stack.workflowRailAutoCenter !== true) ? <div>
      <p className={styles.label}>{t('Content alignment')}</p>
      <div className={styles.alignment} role="group" aria-label={t('Content alignment')}>
        {PORTFOLIO_TOOLS_CONTENT_ALIGNMENT_OPTIONS.map(option => <button key={option.value} type="button" className={styles.choice}
          aria-label={t(option.label)} title={t(option.label)}
          aria-pressed={(stack.workflowRailContentAlignment ?? 'center') === option.value}
          onClick={() => onChange({ workflowRailContentAlignment: option.value })}>
          <svg width="23" height="20" viewBox="0 0 24 20" fill="currentColor" aria-hidden>
            <rect x={option.value === 'right' ? 10 : option.value === 'center' ? 5 : 0} y="2" width="14" height="2" rx="1" />
            <rect x="0" y="9" width="24" height="2" rx="1" />
            <rect x={option.value === 'right' ? 13 : option.value === 'center' ? 6.5 : 0} y="16" width="11" height="2" rx="1" />
          </svg>
        </button>)}
      </div>
    </div> : null}
  </ToolsControlGroups>;
}

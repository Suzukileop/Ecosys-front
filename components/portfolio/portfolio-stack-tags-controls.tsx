'use client';
import { ToolsControlGroups } from './portfolio-tools-control-groups';

import { useT } from '@/lib/i18n/I18nProvider';
import { HeaderSteppedSlider } from './portfolio-header-style-controls';
import { NpToggleRow } from './portfolio-nav-panel-ui';
import { PORTFOLIO_STACK_TAGS_SIZE_OPTIONS, type PortfolioStackSectionSettings } from './portfolio-stack-settings';
import { PORTFOLIO_TOOLS_CARD_GAP_OPTIONS, PORTFOLIO_TOOLS_CONTENT_ALIGNMENT_OPTIONS } from './portfolio-tools-settings';
import styles from './portfolio-stack-rail-controls.module.css';

export function StackTagsControls({ stack, onChange }: {
  stack: PortfolioStackSectionSettings;
  onChange: (patch: Partial<PortfolioStackSectionSettings>) => void;
}) {
  const t = useT();
  const size = PORTFOLIO_STACK_TAGS_SIZE_OPTIONS.find(option => option.value === stack.stackTagsSize) ?? PORTFOLIO_STACK_TAGS_SIZE_OPTIONS[1];
  return <ToolsControlGroups>
    <div className="np-text-size-slider">
      <HeaderSteppedSlider label={t('Tag size')}
        steps={PORTFOLIO_STACK_TAGS_SIZE_OPTIONS.map((option, index) => ({ value: option.value, tick: ['S', 'M', 'L', 'XL'][index] }))}
        value={size.value} currentName={t(size.label)}
        onChange={stackTagsSize => onChange({ stackTagsSize })} />
    </div>
    <div>
      <p className={styles.label}>{t('Tag spacing')}</p>
      <div className={styles.spacing} role="group" aria-label={t('Tag spacing')}>
        {PORTFOLIO_TOOLS_CARD_GAP_OPTIONS.map((option, index) => <button type="button" key={option.value}
          className={styles.choice} aria-pressed={(stack.cardGap ?? 'tight') === option.value}
          onClick={() => onChange({ cardGap: option.value })}>
          <span className={styles.bars} style={{ gap: [0, 4, 9, 15][index] }} aria-hidden><i /><i /><i /></span>
          <span>{index === 3 ? 'XL' : t(option.label)}</span>
        </button>)}
      </div>
    </div>
    <NpToggleRow title={t('Fill tags')} checked={stack.stackTagsFill === true}
      onChange={stackTagsFill => onChange({ stackTagsFill })} />
    <NpToggleRow title={t('Automatic centering')}
      description={t('Center every row, including the last one.')}
      checked={stack.stackTagsAutoCenter === true}
      onChange={stackTagsAutoCenter => onChange({ stackTagsAutoCenter })} />
    {stack.stackTagsAutoCenter !== true ? <div>
      <p className={styles.label}>{t('Tag alignment')}</p>
      <div className={styles.alignment} role="group" aria-label={t('Tag alignment')}>
        {PORTFOLIO_TOOLS_CONTENT_ALIGNMENT_OPTIONS.map(option => <button type="button" key={option.value}
          className={styles.choice} aria-pressed={(stack.contentAlignment ?? 'center') === option.value}
          aria-label={t(option.label)} title={t(option.label)} onClick={() => onChange({ contentAlignment: option.value })}>
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

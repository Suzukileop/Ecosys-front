'use client';
import { SettingsControlSection } from './portfolio-settings-control-section';
import { WorkButtonStylePreview } from './portfolio-work-button-style-preview';
import { WorkContentLabels } from './portfolio-work-content-labels';

import { useT } from '@/lib/i18n/I18nProvider';
import { msg } from '@/lib/i18n/config';
import { Choices } from './portfolio-stack-progress-controls';
import { NpToggleRow } from './portfolio-nav-panel-ui';
import { ColorSwatchRow } from './portfolio-color-swatch-row';
import { resolveHeroPaletteColor } from './portfolio-hero-palette-settings';
import { PORTFOLIO_WORK_SPEC_META_COLOR_OPTIONS } from './portfolio-work-settings';
import { useThumbnailTheme } from './portfolio-thumbnail-theme';
import { DEFAULT_PROJECTS_LEDGER_SETTINGS, PORTFOLIO_WORK_LEDGER_EXPAND_OPTIONS, type PortfolioWorkSectionSettings } from './portfolio-work-settings';
import styles from './portfolio-stack-rail-controls.module.css';
import ledgerStyles from './portfolio-work-ledger-controls.module.css';

export function WorkLedgerControls({work,onChange}:{work:PortfolioWorkSectionSettings;onChange:(patch:Partial<PortfolioWorkSectionSettings>)=>void}) {
  const t=useT();
  const settings={...DEFAULT_PROJECTS_LEDGER_SETTINGS,...work.projectsLedger};
  const theme=useThumbnailTheme('work');
  const metaSwatch={muted:theme.muted,principal:resolveHeroPaletteColor(theme.palette,'principal'),secondaire:resolveHeroPaletteColor(theme.palette,'secondaire')};
  const metaOptions=PORTFOLIO_WORK_SPEC_META_COLOR_OPTIONS.map(option=>({value:option.value,label:t(option.label),color:metaSwatch[option.value]}));
  return <div className={`${styles.controls} ${ledgerStyles.controls}`}>
    <SettingsControlSection title={t('Interaction')} className={`${styles.settingsGroup} ${ledgerStyles.interaction}`}>
      
      <Choices label={t('Reveal details')} options={PORTFOLIO_WORK_LEDGER_EXPAND_OPTIONS} columns={3} value={settings.expandMode??'hover'} onChange={expandMode=>onChange({projectsLedger:{...settings,expandMode}})}
        glyph={value=><svg width="64" height="32" viewBox="0 0 64 32" fill="none" aria-hidden>
          <path d="M8 9h28" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
          <path d={value==='always'?'M8 18h42M8 25h32':'M8 20h21'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity=".4"/>
          {value==='always'?<path d="m46 10 4-4 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>:<>
            {value==='click'?<circle cx="45" cy="17" r="10" stroke="currentColor" opacity=".3"/>:null}
            <path d="m42 13 1 14 4-5 6-1Z" fill="currentColor"/>
          </>}
        </svg>}/>
    </SettingsControlSection>
    <SettingsControlSection title={t('Appearance')} className={styles.settingsGroup}>
      
      <NpToggleRow title={t('Show numbering')} checked={settings.showIndex!==false} onChange={showIndex=>onChange({projectsLedger:{...settings,showIndex}})}/>
      <NpToggleRow title={t('Striped rows')} checked={settings.stripedRows===true} onChange={stripedRows=>onChange({projectsLedger:{...settings,stripedRows}})}/>
      <ColorSwatchRow label={t('Category / role color')} value={settings.metaColor??'muted'} onChange={metaColor=>onChange({projectsLedger:{...settings,metaColor:metaColor as typeof settings.metaColor}})} options={metaOptions}/>
    </SettingsControlSection>
    {settings.showConsult!==false?<SettingsControlSection title={t('Consult link')} className={styles.settingsGroup}>
      
      <WorkContentLabels work={work} onChange={onChange} scope="consult"/>
      
      <Choices<'link'|'underline'|'outline'|'solid'|'pill'> label={t('Button style')} hideOptionLabels columns={2}
        options={[{value:'link',label:msg('Link')},{value:'underline',label:msg('Underline')},{value:'outline',label:msg('Outline')},{value:'solid',label:msg('Solid')},{value:'pill',label:msg('Pill')}]}
        value={settings.consultStyle??'link'} onChange={consultStyle=>onChange({projectsLedger:{...settings,consultStyle}})}
        glyph={value=><WorkButtonStylePreview variant={value} label={settings.consultLabel?.trim()||t('Consult this project')}/>} />
    </SettingsControlSection>:null}
  </div>;
}

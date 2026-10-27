'use client';
import { SettingsControlSection } from './portfolio-settings-control-section';

import { useT } from '@/lib/i18n/I18nProvider';
import { Choices } from './portfolio-stack-progress-controls';
import { HeaderSteppedSlider } from './portfolio-header-style-controls';
import { NpToggleRow } from './portfolio-nav-panel-ui';
import { SvSlider } from './portfolio-settings-variants';
import { DEFAULT_PROJECTS_CAROUSEL_SETTINGS, PORTFOLIO_WORK_CAROUSEL_IMAGE_SIZE_OPTIONS, PORTFOLIO_WORK_CAROUSEL_ASPECT_OPTIONS, PORTFOLIO_WORK_CAROUSEL_RADIUS_OPTIONS, PORTFOLIO_WORK_CAROUSEL_GAP_OPTIONS, type PortfolioWorkSectionSettings } from './portfolio-work-settings';
import styles from './portfolio-stack-rail-controls.module.css';
import compactStyles from './portfolio-work-accordion-controls.module.css';

export function WorkCarouselControls({work,onChange}:{work:PortfolioWorkSectionSettings;onChange:(patch:Partial<PortfolioWorkSectionSettings>)=>void}) {
  const t=useT();
  const settings={...DEFAULT_PROJECTS_CAROUSEL_SETTINGS,...work.projectsCarousel};
  const size=PORTFOLIO_WORK_CAROUSEL_IMAGE_SIZE_OPTIONS.find(option=>option.value===(settings.imageSize??'lg'))!;
  return <div className={`${styles.controls} ${compactStyles.controls}`}>
    <SettingsControlSection title={t('Layout')} className={styles.settingsGroup}>
      
      <div className="np-text-size-slider"><HeaderSteppedSlider label={t('Image size')} value={size.value} currentName={t(size.label)} steps={PORTFOLIO_WORK_CAROUSEL_IMAGE_SIZE_OPTIONS.map((option,index)=>({value:option.value,tick:['S','M','L','XL'][index]}))} onChange={imageSize=>onChange({projectsCarousel:{...settings,imageSize}})}/></div>
      <Choices label={t('Gap between images')} options={PORTFOLIO_WORK_CAROUSEL_GAP_OPTIONS} columns={3} value={settings.gap??'md'} onChange={gap=>onChange({projectsCarousel:{...settings,gap}})}
        glyph={(_,index)=><svg width="58" height="36" viewBox="0 0 58 36" fill="currentColor" aria-hidden>{[-1,0,1].map(i=><rect key={i} x={24+i*[11,17,23][index]} y="4" width="10" height="28" rx="1"/>)}</svg>}/>
    </SettingsControlSection>
    <SettingsControlSection title={t('Appearance')} className={styles.settingsGroup}>
      
      <Choices label={t('Aspect ratio')} options={PORTFOLIO_WORK_CAROUSEL_ASPECT_OPTIONS} columns={3} value={settings.aspectRatio??'square'} onChange={aspectRatio=>onChange({projectsCarousel:{...settings,aspectRatio}})}
        glyph={value=><svg width="58" height="42" viewBox="0 0 58 42" fill="none" aria-hidden><rect x={value==='portrait'?17:value==='square'?11:5} y={value==='landscape'?10:3} width={value==='portrait'?24:value==='square'?36:48} height={value==='landscape'?24:36} stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity=".1"/></svg>}/>
      <Choices label={t('Image radius')} options={PORTFOLIO_WORK_CAROUSEL_RADIUS_OPTIONS} columns={3} value={settings.imageRadius??'none'} onChange={imageRadius=>onChange({projectsCarousel:{...settings,imageRadius}})}
        glyph={value=><svg width="56" height="38" viewBox="0 0 56 38" fill="none" aria-hidden><rect x="3" y="3" width="50" height="32" rx={value==='none'?0:value==='md'?6:13} stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity=".1"/></svg>}/>
      <NpToggleRow title={t('Numbering')} checked={settings.showNumbers!==false} onChange={showNumbers=>onChange({projectsCarousel:{...settings,showNumbers}})}/>
    </SettingsControlSection>
    <SettingsControlSection title={t('Focus')} className={styles.settingsGroup}>
      
      <Choices<'first'|'center'> label="Position du focus (desktop)"
        options={[{value:'first',label:'Premier élément'},{value:'center',label:'Élément central'}]}
        value={settings.desktopFocus??'center'} onChange={desktopFocus=>onChange({projectsCarousel:{...settings,desktopFocus}})}
        glyph={value=><svg width="88" height="48" viewBox="0 0 88 48" fill="currentColor" aria-hidden>
          {[7,33,59].map((x,i)=><rect key={x} x={x} y={i===(value==='center'?1:0)?5:9} width="22" height={i===(value==='center'?1:0)?38:30} rx="2" opacity={i===(value==='center'?1:0)?1:.25}/>) }
        </svg>}/>
      <NpToggleRow title={t('Focus mode')} checked={settings.focusDim===true} onChange={focusDim=>onChange({projectsCarousel:{...settings,focusDim}})}/>
      {settings.focusDim===true ? <div>
        <p className="mb-2 text-[13px] font-semibold">{t('Faded slides opacity')}</p>
        <SvSlider label={t('Faded slides opacity')} density="regular" min={10} max={95} value={settings.focusOpacity??60} onChange={focusOpacity=>onChange({projectsCarousel:{...settings,focusOpacity}})}/>
      </div> : null}
    </SettingsControlSection>
    <SettingsControlSection title={t('Interaction')} className={styles.settingsGroup}>
      
      <NpToggleRow title={t('Hover reveal')} checked={settings.hoverReveal !== false} onChange={hoverReveal=>onChange({projectsCarousel:{...settings,hoverReveal}})}/>
      <NpToggleRow title={t('Hover stack')} checked={settings.hoverStack !== false} onChange={hoverStack=>onChange({projectsCarousel:{...settings,hoverStack}})}/>
    </SettingsControlSection>
  </div>;
}

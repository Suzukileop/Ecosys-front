'use client';
import { SettingsControlSection } from './portfolio-settings-control-section';
import { WorkContentLabels } from './portfolio-work-content-labels';
import type { CSSProperties } from 'react';
import { useT } from '@/lib/i18n/I18nProvider';
import { msg } from '@/lib/i18n/config';
import { resolveHeroPaletteColor } from './portfolio-hero-palette-settings';
import { ColorSwatchRow } from './portfolio-color-swatch-row';
import { WorkButtonStylePreview } from './portfolio-work-button-style-preview';
import { useThumbnailTheme } from './portfolio-thumbnail-theme';
import styles from './portfolio-stack-rail-controls.module.css';
import { Choices } from './portfolio-stack-progress-controls';
import { NpToggleRow } from './portfolio-nav-panel-ui';
import { HeaderSteppedSlider } from './portfolio-header-style-controls';
import compactStyles from './portfolio-work-ledger-controls.module.css';
import choiceStyles from './portfolio-work-spec-controls.module.css';
import { DEFAULT_PROJECTS_DUOTONE_SETTINGS, PORTFOLIO_WORK_DUOTONE_SCROLL_MODE_OPTIONS, PORTFOLIO_WORK_DUOTONE_THUMBNAIL_EFFECT_OPTIONS, PORTFOLIO_WORK_DUOTONE_THUMBNAIL_HEIGHT_OPTIONS, PORTFOLIO_WORK_DUOTONE_FRAME_COLOR_OPTIONS, PORTFOLIO_WORK_DUOTONE_FRAME_RADIUS_OPTIONS, PORTFOLIO_WORK_DUOTONE_SLIDE_NAV_STYLE_OPTIONS, PORTFOLIO_WORK_DUOTONE_VERTICAL_GAP_OPTIONS, type PortfolioWorkProjectsDuotoneLinkStyle, type PortfolioWorkProjectsDuotoneMetaColor, type PortfolioWorkSectionSettings } from './portfolio-work-settings';

function DuotoneToggle({label,checked,onChange}:{label:string;checked:boolean;onChange:(value:boolean)=>void}) {return <NpToggleRow title={label} checked={checked} onChange={onChange}/>;}
function DuotoneChoice<T extends string>({label,options,value,onChange,columns}:{label:string;options:{value:T;label:string;description?:string}[];value:T;onChange:(value:T)=>void;columns?:number}) {
  const t=useT();
  if(label===t('Thumbnail height')) {const current=options.find(option=>option.value===value)??options[0];return <div className="np-text-size-slider"><HeaderSteppedSlider label={label} value={current.value} currentName={t(current.label)} steps={options.map((option,index)=>({value:option.value,tick:['S','M','L'][index]}))} onChange={onChange}/></div>;}
  return <Choices label={label} options={options} value={value} onChange={onChange} columns={columns===4?4:columns===3?3:2}
    glyph={(option,index)=><svg width="64" height="40" viewBox="0 0 64 40" fill="currentColor" aria-hidden>
      {label===t('Vertical rhythm')?<>{[-1,0,1].map(i=><rect key={i} x="6" y={18+i*[5,9,13,16][index]} width="52" height="3" rx="1"/>)}</>:label===t('Frame radius')?<rect x="5" y="3" width="54" height="34" rx={option==='none'?0:option==='sm'?5:13} fillOpacity=".1" stroke="currentColor" strokeWidth="2"/>:label===t('Slide navigation')?(option==='chevron'?<><circle cx="16" cy="20" r="12" fillOpacity=".15"/><circle cx="48" cy="20" r="12" fillOpacity=".15"/><path d="m18 14-6 6 6 6m28-12 6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2"/></>:<text x="32" y="24" textAnchor="middle" fontSize="12">Prev / Next</text>):label===t('Scroll mode')?<><rect x="4" y="4" width="24" height="32" rx="2" opacity={option==='sticky'?1:.2}/>{[7,17,27].map(y=><rect key={y} x="35" y={y} width="25" height="4" opacity=".5"/>)}{option==='slide'?<path d="m48 10 7 10-7 10" stroke="currentColor" strokeWidth="2" fill="none"/>:option==='scroll'?<path d="m17 10 0 16m-5-5 5 5 5-5" stroke="currentColor" strokeWidth="2" fill="none"/>:null}</>:<><rect x="5" y="3" width="54" height="34" rx="3" fillOpacity={option==='none'?0:.15} stroke="currentColor" strokeWidth={option==='none'?0:2}/><path d="m8 31 13-16 12 9 9-11 13 18Z" opacity={option==='grayscale'?.35:option==='tint'?.65:1}/><circle cx="45" cy="12" r="4" opacity=".5"/></>}
    </svg>}/>;
}
const LINK_STYLE_OPTIONS:{value:PortfolioWorkProjectsDuotoneLinkStyle;label:string}[]=[
  {value:'arrow',label:msg('Arrow')},{value:'text',label:msg('Animated text')},{value:'underline',label:msg('Underline')},
  {value:'outline',label:msg('Outline')},{value:'solid',label:msg('Solid')},{value:'pill',label:msg('Pill')},
];
const META_COLOR_OPTIONS:{value:PortfolioWorkProjectsDuotoneMetaColor;label:string}[]=[
  {value:'muted',label:msg('Muted')},{value:'principal',label:msg('Primary')},{value:'secondaire',label:msg('Secondary')},
];
const TITLE_SIZE_MIN=24,TITLE_SIZE_MAX=160,TITLE_SIZE_AUTO_POSITION=88;

/** Title size, role / category colour and the "View project" button — shared by all three scroll modes. */
function DuotoneTextAndLinkControls({work,onChange}:{work:PortfolioWorkSectionSettings;onChange:(patch:Partial<PortfolioWorkSectionSettings>)=>void}) {
  const t=useT();
  const theme=useThumbnailTheme('work');
  const settings=work.projectsDuotone??DEFAULT_PROJECTS_DUOTONE_SETTINGS;
  const patch=(next:Partial<typeof settings>)=>onChange({projectsDuotone:{...settings,...next}});
  const sizeValue=settings.titleSize??TITLE_SIZE_AUTO_POSITION;
  const label=settings.linkLabel.trim()||t('View project');
  const metaColors={muted:theme.muted,principal:resolveHeroPaletteColor(theme.palette,'principal'),secondaire:resolveHeroPaletteColor(theme.palette,'secondaire')};
  return <>
    <SettingsControlSection title={t('Title')} className={styles.settingsGroup}>
      
      <div className="np-field np-text-size-slider block">
        <div className="flex items-center justify-between gap-3">
          <label htmlFor="duotone-title-size" className="np-field-label">{t('Title size')}</label>
          <span className="text-xs text-neutral-400">{settings.titleSize==null?t('Auto'):`${settings.titleSize} px`}</span>
        </div>
        <input id="duotone-title-size" type="range" min={TITLE_SIZE_MIN} max={TITLE_SIZE_MAX} step={1} value={sizeValue} className="pf-exp-centered-slider pf-exp-centered-slider--thick"
          style={{'--pf-exp-slider-fill':`${(sizeValue-TITLE_SIZE_MIN)/(TITLE_SIZE_MAX-TITLE_SIZE_MIN)*100}%`} as CSSProperties}
          onChange={event=>patch({titleSize:Number(event.target.value)})}/>
        <button type="button" className="mt-2 text-xs text-neutral-400 hover:text-white disabled:opacity-40" disabled={settings.titleSize==null}
          onClick={()=>patch({titleSize:null})}>{t('Auto')}</button>
      </div>
      <ColorSwatchRow label={t('Category / role color')} value={settings.metaColor} onChange={metaColor=>patch({metaColor:metaColor as PortfolioWorkProjectsDuotoneMetaColor})}
        options={META_COLOR_OPTIONS.map(option=>({value:option.value,label:option.label,color:metaColors[option.value]}))}/>
    </SettingsControlSection>
    <SettingsControlSection title={t('Consult link')} className={styles.settingsGroup}>
      
      <WorkContentLabels work={work} onChange={onChange} scope="consult"/>
      <Choices<PortfolioWorkProjectsDuotoneLinkStyle> label={t('Button style')} hideOptionLabels columns={2} options={LINK_STYLE_OPTIONS} value={settings.linkStyle} onChange={linkStyle=>patch({linkStyle})}
        glyph={value=><WorkButtonStylePreview variant={value==='arrow'?'text':value} label={label} arrow={value==='arrow'?'right':'diagonal'}/>}/>
      
    </SettingsControlSection>
  </>;
}

export function WorkDuotoneControls({work,onChange}:{work:PortfolioWorkSectionSettings;onChange:(patch:Partial<PortfolioWorkSectionSettings>)=>void}) {
const t=useT();
const mode=(work.projectsDuotone??DEFAULT_PROJECTS_DUOTONE_SETTINGS).scrollMode;
return <div className={`${styles.controls} ${compactStyles.controls} ${choiceStyles.controls}`}>
<SettingsControlSection title={t('Layout')} className={styles.settingsGroup}>
<DuotoneChoice
            label={t('Scroll mode')}
            options={PORTFOLIO_WORK_DUOTONE_SCROLL_MODE_OPTIONS}
            value={(work.projectsDuotone ?? DEFAULT_PROJECTS_DUOTONE_SETTINGS).scrollMode}
            onChange={(scrollMode) =>
              onChange({
                projectsDuotone: {
                  ...(work.projectsDuotone ?? DEFAULT_PROJECTS_DUOTONE_SETTINGS),
                  scrollMode,
                },
              })
            }
            columns={3}
          />
<DuotoneToggle
            label={t('Intro screen')}
            checked={(work.projectsDuotone ?? DEFAULT_PROJECTS_DUOTONE_SETTINGS).showIntro}
            onChange={(showIntro) =>
              onChange({
                projectsDuotone: {
                  ...(work.projectsDuotone ?? DEFAULT_PROJECTS_DUOTONE_SETTINGS),
                  showIntro,
                },
              })
            }
          />
{mode!=='slide'?<><DuotoneToggle
                label={t('Swap sides')}
                checked={(work.projectsDuotone ?? DEFAULT_PROJECTS_DUOTONE_SETTINGS).swapSides}
                onChange={(swapSides) =>
                  onChange({
                    projectsDuotone: {
                      ...(work.projectsDuotone ?? DEFAULT_PROJECTS_DUOTONE_SETTINGS),
                      swapSides,
                    },
                  })
                }
              />
<DuotoneChoice
                label={t('Vertical rhythm')}
                options={PORTFOLIO_WORK_DUOTONE_VERTICAL_GAP_OPTIONS}
                value={(work.projectsDuotone ?? DEFAULT_PROJECTS_DUOTONE_SETTINGS).verticalGap}
                onChange={(verticalGap) =>
                  onChange({
                    projectsDuotone: {
                      ...(work.projectsDuotone ?? DEFAULT_PROJECTS_DUOTONE_SETTINGS),
                      verticalGap,
                    },
                  })
                }
                columns={4}
              /></>:null}
{mode==='scroll'?<><DuotoneToggle
                label={t('Alternate sides')}
                checked={(work.projectsDuotone ?? DEFAULT_PROJECTS_DUOTONE_SETTINGS).alternateSides}
                onChange={(alternateSides) =>
                  onChange({
                    projectsDuotone: {
                      ...(work.projectsDuotone ?? DEFAULT_PROJECTS_DUOTONE_SETTINGS),
                      alternateSides,
                    },
                  })
                }
              />
<DuotoneToggle
                label={t('Full-width title')}
                checked={(work.projectsDuotone ?? DEFAULT_PROJECTS_DUOTONE_SETTINGS).scrollFullWidthTitle}
                onChange={(scrollFullWidthTitle) =>
                  onChange({
                    projectsDuotone: {
                      ...(work.projectsDuotone ?? DEFAULT_PROJECTS_DUOTONE_SETTINGS),
                      scrollFullWidthTitle,
                    },
                  })
                }
              /></>:null}
</SettingsControlSection>
<SettingsControlSection title={t('Thumbnail')} className={styles.settingsGroup}>
<DuotoneChoice
            label={t('Thumbnail height')}
            options={PORTFOLIO_WORK_DUOTONE_THUMBNAIL_HEIGHT_OPTIONS}
            value={(work.projectsDuotone ?? DEFAULT_PROJECTS_DUOTONE_SETTINGS).thumbnailHeight}
            onChange={(thumbnailHeight) =>
              onChange({
                projectsDuotone: {
                  ...(work.projectsDuotone ?? DEFAULT_PROJECTS_DUOTONE_SETTINGS),
                  thumbnailHeight,
                },
              })
            }
            columns={3}
          />
<DuotoneChoice
            label={t('Thumbnail effect')}
            options={PORTFOLIO_WORK_DUOTONE_THUMBNAIL_EFFECT_OPTIONS}
            value={(work.projectsDuotone ?? DEFAULT_PROJECTS_DUOTONE_SETTINGS).thumbnailEffect}
            onChange={(thumbnailEffect) =>
              onChange({
                projectsDuotone: {
                  ...(work.projectsDuotone ?? DEFAULT_PROJECTS_DUOTONE_SETTINGS),
                  thumbnailEffect,
                },
              })
            }
            columns={3}
          />
{mode==='slide'?<><DuotoneChoice
                label={t('Frame color')}
                options={PORTFOLIO_WORK_DUOTONE_FRAME_COLOR_OPTIONS}
                value={(work.projectsDuotone ?? DEFAULT_PROJECTS_DUOTONE_SETTINGS).frameColor}
                onChange={(frameColor) =>
                  onChange({
                    projectsDuotone: {
                      ...(work.projectsDuotone ?? DEFAULT_PROJECTS_DUOTONE_SETTINGS),
                      frameColor,
                    },
                  })
                }
                columns={3}
              />
<DuotoneChoice
                label={t('Frame radius')}
                options={PORTFOLIO_WORK_DUOTONE_FRAME_RADIUS_OPTIONS}
                value={(work.projectsDuotone ?? DEFAULT_PROJECTS_DUOTONE_SETTINGS).frameRadius}
                onChange={(frameRadius) =>
                  onChange({
                    projectsDuotone: {
                      ...(work.projectsDuotone ?? DEFAULT_PROJECTS_DUOTONE_SETTINGS),
                      frameRadius,
                    },
                  })
                }
                columns={3}
              /></>:null}
</SettingsControlSection>
{mode==='slide'?<SettingsControlSection title={t('Navigation')} className={styles.settingsGroup}>
<DuotoneChoice
                label={t('Slide navigation')}
                options={PORTFOLIO_WORK_DUOTONE_SLIDE_NAV_STYLE_OPTIONS}
                value={(work.projectsDuotone ?? DEFAULT_PROJECTS_DUOTONE_SETTINGS).slideNavStyle}
                onChange={(slideNavStyle) =>
                  onChange({
                    projectsDuotone: {
                      ...(work.projectsDuotone ?? DEFAULT_PROJECTS_DUOTONE_SETTINGS),
                      slideNavStyle,
                    },
                  })
                }
                columns={2}
              />
<DuotoneToggle
                label={t('Auto-advance')}
                checked={(work.projectsDuotone ?? DEFAULT_PROJECTS_DUOTONE_SETTINGS).autoAdvance}
                onChange={(autoAdvance) =>
                  onChange({
                    projectsDuotone: {
                      ...(work.projectsDuotone ?? DEFAULT_PROJECTS_DUOTONE_SETTINGS),
                      autoAdvance,
                    },
                  })
                }
              />
</SettingsControlSection>:null}
<DuotoneTextAndLinkControls work={work} onChange={onChange}/>
</div>;
}

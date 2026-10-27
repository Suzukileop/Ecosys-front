'use client';
import type {PortfolioFooterHeaderDesign} from './portfolio-footer-header-settings';
import {useT} from '@/lib/i18n/I18nProvider';
import {StackHeaderSkeleton} from './portfolio-stack-header-skeleton';
export function FooterHeaderSkeleton({design,compact=false}:{design:PortfolioFooterHeaderDesign;compact?:boolean}){
 const t=useT();
 if(design==='none')return null;
 if(design==='index'||design==='serif-lead'||design==='masthead')return <StackHeaderSkeleton design={design} word="CONTACT" title="Créons ensemble" lead="Créons" count="04" compact={compact}/>;
 const b=(x:number,y:number,w:number,h:number,soft=false,rx=2)=><rect x={x} y={y} width={w} height={h} rx={rx} className={soft?'pf-stack-mini-mute':'pf-stack-mini-ink'}/>;
 return <svg viewBox={compact?'0 50 640 220':'0 0 640 320'} className="pf-stack-mini" aria-hidden="true" data-footer-header-skeleton={design}>
  {design==='editorial'?<>{b(48,80,410,42)}{b(48,142,300,42)}{b(48,226,340,6,true)}</>:null}
  {design==='billboard'?<text x="320" y="207" textAnchor="middle" fontSize="144" fontWeight="800" className="pf-stack-mini-ring" strokeWidth="2">{t('Hello').toLocaleUpperCase(t.locale)}</text>:null}
  {design==='hero'?<>{b(110,65,420,42)}{b(165,124,310,42)}{b(224,216,192,42,true,21)}</>:null}
  {design==='name'?<>{b(32,125,576,70)}</>:null}
  {design==='timezone'?<>{b(48,55,90,6,true)}{b(48,94,320,34)}{b(48,145,248,34)}{b(48,218,230,6,true)}{b(48,238,186,6,true)}{b(466,58,126,24)}{b(486,101,106,6,true)}</>:null}
 </svg>;
}

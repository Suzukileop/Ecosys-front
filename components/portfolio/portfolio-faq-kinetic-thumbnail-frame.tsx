'use client';

import {useEffect,useRef,useState} from 'react';
import {createPortal} from 'react-dom';
import {FaqKineticSplitDesign} from './portfolio-faq-kinetic-split';
import {FaqFloatingGalleryDesign} from './portfolio-faq-floating-gallery';
import {FaqEditorialMasonryDesign} from './portfolio-faq-editorial-masonry';
import {FaqPrismCardsDesign} from './portfolio-faq-prism-cards';
import {FaqTriGridDesign} from './portfolio-faq-tri-grid';
import {FaqSplitIndexDesign} from './portfolio-faq-split-index';
import {FaqCenteredFocusDesign} from './portfolio-faq-centered-focus';
import {FaqBentoDualDesign} from './portfolio-faq-bento-dual';
import type {PortfolioFaqDesign} from './portfolio-faq-settings';
import {useT} from '@/lib/i18n/I18nProvider';

const items=[
  {id:'start',question:'How do we get started?',answer:'We discuss your goals and agree on the next steps.'},
  {id:'timing',question:'What is the timeline?',answer:'We agree on a schedule together.'},
  {id:'remote',question:'Do you work remotely?',answer:'Yes, with regular updates.'},
];
const shell='<!doctype html><html><head><meta charset="utf-8"></head><body><div id="preview"></div></body></html>';
const css=`html,body{margin:0;overflow:hidden}body{font-family:Arial,sans-serif;background:var(--pf-palette-fond,#faf6ee);color:var(--pf-palette-texte-fort,#241e14)}#preview{padding:32px;box-sizing:border-box}.pf-faq-kinetic-grid{display:grid!important;grid-template-columns: .85fr 1.15fr!important;gap:38px!important}.pf-faq-kinetic-left{display:block!important;position:static!important}.pf-faq-kinetic-trigger{padding:12px 0!important;opacity:1!important;gap:12px!important}.pf-faq-kinetic-text{font:500 21px/1.3 Arial,sans-serif!important;letter-spacing:-.02em!important}.pf-faq-kinetic-index{font-size:10px!important}.pf-faq-kinetic-item:first-child .pf-faq-kinetic-panel{height:auto!important}.pf-faq-kinetic-panel-inner{padding:0 0 16px 0!important}.pf-faq-kinetic-answer{font:400 15px/1.5 Arial,sans-serif!important;opacity:.7}.pf-faq-kinetic-item:not(:first-child) .pf-faq-kinetic-panel{display:none}*{animation:none!important;transition:none!important}`;
const readableCss=`body{background:#ffffff!important;color:#132238!important}.pf-faq-kinetic{color:#132238!important}.pf-faq-kinetic-grid{grid-template-columns:.8fr 1.2fr!important;gap:28px!important}.pf-faq-kinetic-left{color:#132238!important}.pf-faq-kinetic-trigger{padding:14px 0!important}.pf-faq-kinetic-text{font:600 22px/1.35 Arial,sans-serif!important;color:#132238!important}.pf-faq-kinetic-index{font-size:12px!important;color:#52647c!important}.pf-faq-kinetic-answer{font:400 18px/1.5 Arial,sans-serif!important;color:#40516a!important;opacity:1!important}.pf-faq-kinetic-panel-inner{padding-bottom:18px!important}`;

const floatingCss=`body{background:#eff5f0!important;color:#203c32!important}.pf-faq-gallery-head{margin-bottom:26px!important}.pf-faq-gallery-row{padding:14px 0!important;border-color:#ceddd3!important;opacity:1!important;transform:none!important}.pf-faq-gallery-q{font:500 21px/1.3 Arial,sans-serif!important;color:#203c32!important}.pf-faq-gallery-plus{width:26px;height:26px;color:#486457!important;border-color:#b9cfc0!important}.pf-faq-gallery-row:first-child{height:168px;border:0!important}.pf-faq-gallery-row:first-child>.pf-faq-gallery-trigger{visibility:hidden}.pf-faq-gallery-glass{display:none!important}.pf-faq-gallery-row:first-child .pf-faq-gallery-glass{display:block!important;position:absolute!important;inset:auto 0 auto 32px!important;top:0!important;width:auto!important;opacity:1!important;transform:none!important;padding:20px 24px!important;border-radius:16px!important;background:#ffffff!important;box-shadow:0 8px 24px -14px #53756366!important;backdrop-filter:none!important}.pf-faq-gallery-glass-head{margin-bottom:10px!important}.pf-faq-gallery-eyebrow{font:500 10px Arial,sans-serif!important;letter-spacing:.12em!important;color:#486457!important}.pf-faq-gallery-close{width:22px;height:22px;color:#486457!important}.pf-faq-gallery-glass h3{font:500 24px/1.2 Georgia,serif!important;color:#203c32!important;margin-bottom:10px!important;max-width:none!important}.pf-faq-gallery-glass p{font:400 17px/1.5 Arial,sans-serif!important;color:#486457!important;max-width:none!important}`;

const masonryCss=`body{background:#181c24!important;color:#f1f4fa!important}.pf-faq-masonry{--pfm-ink:#f1f4fa;--pfm-paper:#181c24;--pfm-accent:#a6bde5;color:#f1f4fa!important}.pf-faq-masonry-head{margin-bottom:34px!important}.pf-faq-masonry-grid{display:grid!important;grid-template-columns:1fr 1fr!important;gap:40px!important}.pf-faq-masonry-col--right{margin-top:36px!important}.pf-faq-masonry-row{padding:0 0 28px!important}.pf-faq-masonry-row::after{display:none!important}.pf-faq-masonry-trigger{gap:10px!important;padding:0!important;align-items:start!important}.pf-faq-masonry-q{font:500 20px/1.3 Arial,sans-serif!important;color:#f1f4fa!important}.pf-faq-masonry-index{font-size:10px!important;color:#a6bde5!important}.pf-faq-masonry-icon{display:none!important}.pf-faq-masonry-panel{display:block!important;grid-template-rows:1fr!important;height:auto!important;opacity:1!important}.pf-faq-masonry-panel-inner{padding:12px 0 0!important}.pf-faq-masonry-answer{font:400 16px/1.5 Arial,sans-serif!important;color:#b4c0d1!important;opacity:1!important}`;

// One complete example per thumbnail; grids must not reserve empty peer columns.
const singleItemCss=`.pf-faq-masonry-grid,.pf-faq-tri-grid,.pf-faq-bento-grid{grid-template-columns:minmax(0,1fr)!important}.pf-faq-masonry-col--right{margin:0!important}.pf-faq-tri-block{max-width:440px}.pf-faq-bento-card{max-width:440px}.pf-faq-tri-a{font:400 17px/1.5 Arial,sans-serif!important;color:#bdc6d2!important}.pf-faq-masonry-panel{visibility:visible!important}`;

/** Preview-only illustration: real layout and heading, static bars instead of sample copy. */
function skeletonCss(dark:boolean){
 const question=['kinetic-text','gallery-q','masonry-q','prism-q','star-q','tri-q','split-q','focus-q','bento-q'].map(c=>`.pf-faq-${c}`).concat('.pf-faq-gallery-glass h3').join(',');
 const answer=['kinetic-answer','masonry-answer','prism-answer','star-answer','tri-a','split-answer','focus-answer','bento-a'].map(c=>`.pf-faq-${c}`).concat('.pf-faq-gallery-glass p','.pf-faq-kinetic-left p:last-child').join(',');
 return `#preview{--preview-bar:${dark?'#d9e2ee':'#263f52'}}${question}{font-size:0!important;line-height:0!important;color:transparent!important;min-width:0!important;text-shadow:none!important}${question.split(',').map(s=>s+'::after').join(',')}{content:'';display:block;height:16px;width:80%;max-width:340px;border-radius:4px;background:color-mix(in srgb,var(--preview-bar) 60%,transparent);margin:4px 0 8px}${answer}{font-size:0!important;line-height:0!important;color:transparent!important;text-shadow:none!important}${answer.split(',').map(s=>s+'::after').join(',')}{content:'';display:block;width:100%;height:30px;background:linear-gradient(color-mix(in srgb,var(--preview-bar) 25%,transparent) 0 0) left top/95% 7px no-repeat,linear-gradient(color-mix(in srgb,var(--preview-bar) 25%,transparent) 0 0) left 21px/72% 7px no-repeat;border-radius:2px}.pf-faq-focus-q::after{margin-left:auto;margin-right:auto}.pf-faq-gallery-eyebrow,.pf-faq-split-rail-label{font-size:0!important}.pf-faq-kinetic-left p:first-child{font-size:0!important;height:5px;width:30px;background:color-mix(in srgb,var(--preview-bar) 25%,transparent);border-radius:2px}`;
}

/** Only the real FAQ component is portalled; the iframe never boots another portfolio/app. */
const components={'kinetic-split':FaqKineticSplitDesign,'floating-gallery':FaqFloatingGalleryDesign,'editorial-masonry':FaqEditorialMasonryDesign,'prism-cards':FaqPrismCardsDesign,'tri-grid':FaqTriGridDesign,'split-index':FaqSplitIndexDesign,'centered-focus':FaqCenteredFocusDesign,'bento-dual':FaqBentoDualDesign};
const darkThemes:Record<string,readonly[string,string]>={'prism-cards':['#f6f4fa','#73648e'],'tri-grid':['#f0f6f2','#52765e'],'split-index':['#faf6ef','#8c7049'],'centered-focus':['#f6f5fa','#73678e'],'bento-dual':['#f1f7f8','#4e7983']};
function darkPreviewCss(design:string){
 const [background,accent]=darkThemes[design];
 const families=['prism','star','tri','split','focus','bento'];
 const roots=families.map(f=>`.pf-faq-${f}`).join(',');
 const questions=families.map(f=>`.pf-faq-${f}-q`).join(',');
 const answers=families.flatMap(f=>[`.pf-faq-${f}-answer`,`.pf-faq-${f}-a`]).join(',');
 const heads=families.map(f=>`.pf-faq-${f}-head`).join(',');
 const panels=families.map(f=>`.pf-faq-${f}-panel`).join(',');
 const inner=families.map(f=>`.pf-faq-${f}-panel-inner`).join(',');
 return `body{background:${background}!important;color:#f2f4f8!important}${roots}{color:#f2f4f8!important;--pf-faq-q-color:#f2f4f8;--pf-faq-a-color:#bdc6d2}${heads}{margin-bottom:24px!important}${questions}{font:500 21px/1.35 Arial,sans-serif!important;color:#f2f4f8!important}${answers}{font:400 16px/1.5 Arial,sans-serif!important;color:#bdc6d2!important}${panels}{visibility:visible!important;opacity:1!important;grid-template-rows:1fr!important;height:auto!important}${inner}{padding:10px 0 12px!important}.pf-faq-prism-card,.pf-faq-bento-card{background:color-mix(in srgb,${background} 88%,white)!important;color:#f2f4f8!important;border-color:#ffffff14!important;padding:14px 18px!important;border-radius:12px!important}.pf-faq-prism-fill{display:none!important}.pf-faq-prism-trigger,.pf-faq-bento-trigger{padding:0!important}.pf-faq-prism-list{gap:14px!important}.pf-faq-star-head{display:flex!important;gap:24px!important;align-items:center!important}.pf-faq-star-mark{width:42px!important;height:42px!important;color:${accent}!important}.pf-faq-star-row,.pf-faq-focus-row,.pf-faq-split-item{padding:12px 0!important;border-color:#ffffff20!important}.pf-faq-star-trigger,.pf-faq-focus-trigger,.pf-faq-split-trigger{padding:0!important}.pf-faq-tri-grid{display:grid!important;grid-template-columns:repeat(3,minmax(0,1fr))!important;gap:24px!important}.pf-faq-tri-card{padding:0!important;border:0!important}.pf-faq-tri-q{font-size:20px!important}.pf-faq-tri-answer{margin-top:14px!important}.pf-faq-split-row{display:grid!important;grid-template-columns:76px minmax(0,1fr)!important;gap:22px!important}.pf-faq-split-rail{color:${accent}!important}.pf-faq-split-badge{color:${accent}!important;background:#ffffff0a!important}.pf-faq-focus-list{max-width:460px!important;margin:auto!important}.pf-faq-focus-head{text-align:center!important}.pf-faq-focus-panel-inner{text-align:center!important}.pf-faq-bento-grid{display:grid!important;grid-template-columns:1fr 1fr!important;gap:18px!important}.pf-faq-bento-icon,.pf-faq-prism-icon,.pf-faq-focus-icon,.pf-faq-split-icon{color:${accent}!important}`;
}
export function FaqKineticThumbnailFrame({design='kinetic-split'}:{design?:PortfolioFaqDesign}){
 const t=useT();
 const floating=design==='floating-gallery';
 const masonry=design==='editorial-masonry';
 const dark=false;
 const Component=components[design];
 const previewItems=items.slice(0,1);
 const wrapper=useRef<HTMLSpanElement>(null);
 const frame=useRef<HTMLIFrameElement>(null);
 const [target,setTarget]=useState<HTMLElement|null>(null);
 const [width,setWidth]=useState(360);
 const [height,setHeight]=useState(300);
 useEffect(()=>{
  const content=target?.firstElementChild;if(!content)return;
  let disposed=false;
  const measure=()=>{if(disposed)return;const next=Math.ceil(content.getBoundingClientRect().height);if(next>0)setHeight(previous=>Math.abs(previous-next)>1?next:previous);};
  const observer=new ResizeObserver(measure);observer.observe(content);measure();
  void target.ownerDocument.fonts.ready.then(measure);
  return()=>{disposed=true;observer.disconnect();};
 },[target,design,t]);
 useEffect(()=>{
  const el=wrapper.current;if(!el)return;
  const observer=new ResizeObserver(entries=>setWidth(entries[0].contentRect.width));observer.observe(el);return()=>observer.disconnect();
 },[]);
 useEffect(()=>{
  if(!target||!frame.current)return;
  // A deterministic light catalogue preview must not inherit the studio's dark editor tokens.
  const palette={'--pf-palette-fond':darkThemes[design]?.[0]??(floating?'#eff5f0':'#ffffff'),'--pf-palette-texte-fort':'#132238','--pf-palette-texte-muted':'#40516a'};
  for(const [key,value] of Object.entries(palette)){target.ownerDocument.documentElement.style.setProperty(key,value);target.style.setProperty(key,value);}
 },[target,floating,dark,design]);
 return <span ref={wrapper} className="relative block w-full overflow-hidden rounded-lg" style={{aspectRatio:`600 / ${height}`}}>
  <iframe ref={frame} title={t(masonry?'Editorial masonry':floating?'Floating gallery':'Kinetic split')} tabIndex={-1} aria-hidden="true" sandbox="allow-same-origin" srcDoc={shell} className="absolute inset-0 block border-0" style={{pointerEvents:'none',width:600,height,transform:`scale(${width/600})`,transformOrigin:'top left'}} onLoad={()=>{
   const doc=frame.current?.contentDocument;if(!doc)return;
   for(const node of document.querySelectorAll('link[rel="stylesheet"],style'))doc.head.appendChild(node.cloneNode(true));
   const lightCss=`body{background:${darkThemes[design]?.[0]??(floating?'#eff5f0':'#ffffff')}!important}#preview,#preview *{color:#132238!important}.pf-faq-prism-card,.pf-faq-bento-card{border-color:#13223818!important}.pf-faq-bento-trigger{background:#e5edf1!important}.pf-faq-bento-panel-inner{background:#ffffff!important}`;
   const style=doc.createElement('style');style.textContent=css+(masonry?masonryCss+'.pf-faq-masonry-panel{visibility:visible!important}':floating?floatingCss:darkThemes[design]?darkPreviewCss(design):readableCss)+singleItemCss+lightCss+skeletonCss(false)+'[class$="-answer"],.pf-faq-bento-a{max-width:none!important}';doc.head.appendChild(style);const mount=doc.getElementById('preview');if(mount)mount.style.padding='0';setTarget(mount);
  }}/>
  {target&&createPortal(<div inert style={{width:600,padding:'38px 34px',boxSizing:'border-box'}}><Component activeColorMode={dark?'dark':'light'} items={previewItems.map(item=>({...item,question:t(item.question),answer:t(item.answer)}))} header={floating||dark?<h3 style={{font:'500 32px/1.15 Georgia,serif',letterSpacing:-.5,margin:0,color:dark?'#f1f4fa':'#203c32'}}>{t('Frequently asked questions')}</h3>:<div><p style={{fontSize:12,letterSpacing:2,margin:'0 0 20px',color:'#52647c'}}>FAQ</p><h3 style={{font:'600 36px/1.1 Arial,sans-serif',letterSpacing:-1.3,margin:0,color:'#132238'}}>{t('Frequently asked questions')}</h3><p style={{fontSize:17,lineHeight:1.5,marginTop:26,color:'#40516a'}}>{t('Answers to help plan your project.')}</p></div>}/></div>,target)}
 </span>;
}

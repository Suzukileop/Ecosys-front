'use client';
import {useThumbnailTheme} from './portfolio-thumbnail-theme';
import {useEffect,useRef,useState} from 'react';
import {createPortal} from 'react-dom';
import {GalleryFloatingCanvas} from './portfolio-gallery-design-floating-canvas';
import {EditorialGallerySection} from './portfolio-section-gallery';
import {DEFAULT_GALLERY_PRESENTATION} from './portfolio-gallery-settings';
import {useT} from '@/lib/i18n/I18nProvider';
import type {ProfileGalleryItem} from '@/types/profile';

const shell='<!doctype html><html><head><meta charset="utf-8"></head><body><div id="preview"></div></body></html>';
const presentation={...DEFAULT_GALLERY_PRESENTATION,design:'floating-canvas' as const,imageAspect:'auto' as const,sectionBackgroundColor:'#ffffff',itemTitleColor:'#222222',floatingCanvasParallax:'off' as const,hoverZoom:false};

/** Same component and geometry as the published gallery; only media pixels are replaced. */
export function GalleryFloatingThumbnailFrame({design='floating-canvas'}:{design?:'floating-canvas'|'caption-carousel'|'hero-mosaic'|'tall-row'|'editorial-split'|'visual-index'|'contact-sheet'}){
 const caption=design==='caption-carousel';
 const section=design!=='floating-canvas';
 const viewport=design==='hero-mosaic'?1440:1080;
 const label=design==='contact-sheet'?'Contact sheet':design==='visual-index'?'Visual index':design==='editorial-split'?'Editorial split':design==='tall-row'?'Tall + row':design==='hero-mosaic'?'Hero mosaic':caption?'Caption cards':'Floating canvas';
 const t=useT();const wrapper=useRef<HTMLSpanElement>(null);const iframe=useRef<HTMLIFrameElement>(null);
 const [target,setTarget]=useState<HTMLElement|null>(null);const [width,setWidth]=useState(360);const [height,setHeight]=useState(700);
 const theme=useThumbnailTheme('gallery',target);
 const themedPresentation={...presentation,sectionBackgroundColor:theme.background,itemTitleColor:theme.ink,colorModeOverride:theme.mode,galleryPalette:theme.palette};
 useEffect(()=>{const el=wrapper.current;if(!el)return;const observer=new ResizeObserver(([entry])=>setWidth(entry.contentRect.width));observer.observe(el);return()=>observer.disconnect();},[]);
 useEffect(()=>{
  if(!target)return;
  const copied=new WeakSet<Element>();const sync=()=>{for(const node of document.head.querySelectorAll('link[rel="stylesheet"],style'))if(!copied.has(node)){copied.add(node);target.ownerDocument.head.insertBefore(node.cloneNode(true),target.ownerDocument.head.firstChild);}};
  sync();const observer=new MutationObserver(sync);observer.observe(document.head,{childList:true,subtree:true});return()=>observer.disconnect();
 },[target]);
 useEffect(()=>{
  const content=target?.firstElementChild;if(!content)return;let disposed=false;
  const measure=()=>{if(disposed)return;const next=Math.ceil(content.getBoundingClientRect().height);if(next>0)setHeight(previous=>Math.abs(previous-next)>1?next:previous);};
  const observer=new ResizeObserver(measure);observer.observe(content);measure();void target.ownerDocument.fonts.ready.then(measure);
  return()=>{disposed=true;observer.disconnect();};
 },[target]);
 const items:ProfileGalleryItem[]=Array.from({length:design==='hero-mosaic'?5:design==='editorial-split'?4:design==='visual-index'?3:6},(_,i)=>({id:`preview-${i}`,sortOrder:i,title:`${t('Gallery')} ${String(i+1).padStart(2,'0')}`,mediaType:'IMAGE',mediaUrl:''}));
 const placeholder=(_:ProfileGalleryItem,index:number)=><div aria-hidden="true" style={{position:'absolute',inset:0,background:`color-mix(in srgb,${theme.ink} ${[8,14,22,10,28,18][index%6]}%,${theme.background})`,boxShadow:`inset 0 0 0 1px ${theme.border}`}}><div style={{position:'absolute',inset:24,display:'flex',flexDirection:'column',gap:12,justifyContent:'flex-end'}}><span style={{width:28,height:28,borderRadius:index===4?'50%':6,background:theme.accent,marginBottom:'auto',opacity:0.7}}/><span style={{height:9,width:'75%',borderRadius:4,background:theme.ink,opacity:0.5}}/><span style={{height:6,width:'50%',borderRadius:3,background:theme.muted,opacity:0.6}}/></div></div>;
 return <span ref={wrapper} className="relative block w-full overflow-hidden rounded-lg" style={{aspectRatio:`${viewport} / ${height}`}}>
  <iframe ref={iframe} title={t(label)} aria-hidden="true" tabIndex={-1} sandbox="allow-same-origin" srcDoc={shell} className="absolute inset-0 block border-0" style={{width:viewport,height:section?Math.max(720,height):height,transform:`scale(${width/viewport})`,transformOrigin:'top left',pointerEvents:'none'}} onLoad={()=>{
    const doc=iframe.current?.contentDocument;if(!doc)return;
    for(const node of document.querySelectorAll('link[rel="stylesheet"],style'))doc.head.appendChild(node.cloneNode(true));
    const style=doc.createElement('style');style.textContent='html,body{margin:0;overflow:hidden;background:#fff;color:#222;font-family:Arial,sans-serif}*{animation:none!important;transition:none!important}#preview{--pf-palette-fond:#fff;--pf-palette-texte-fort:#222;--pf-palette-neutre:#eee}';doc.head.appendChild(style);setTarget(doc.getElementById('preview'));
  }}/>
  {target&&createPortal(<div inert style={{width:viewport,padding:40,boxSizing:'border-box'}}>{section?<EditorialGallerySection items={items} presentation={{...themedPresentation,design,imageAspect:'landscape',showTitle:false}} renderPreviewMedia={placeholder}/>:<GalleryFloatingCanvas items={items} presentation={themedPresentation} showTitle renderMedia={placeholder}/>}</div>,target)}
 </span>;
}

'use client';
import {useEffect} from 'react';
import type Lenis from 'lenis';
import {ScrollTrigger} from 'gsap/ScrollTrigger';

import {normalizeScrollValue} from './portfolio-smooth-scroll-settings';

/** Native document scrolling, or the currently mounted Pages viewport. Never owns editor scrolling. */
export function PortfolioSmoothScroll({enabled,softness,wheelSpeed,pages=false}:{enabled:boolean;softness:number;wheelSpeed:number;pages?:boolean}){
 useEffect(()=>{
  if(!enabled)return;
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
  let disposed=false;let instance:Lenis|undefined;let wrapper:HTMLElement|Window|undefined;
  let LenisClass:typeof Lenis|undefined;
  const destroy=()=>{instance?.destroy();instance=undefined;wrapper=undefined;};
  const sync=()=>{
   if(disposed)return;
   if(reduced.matches){destroy();return;}
   const next=pages?document.querySelector<HTMLElement>('[data-pf-pages-scroll="active"]'):window;
   if(!next||!LenisClass){destroy();return;}
   if(wrapper!==next){
    destroy();wrapper=next;
    instance=new LenisClass({wrapper:next,content:next===window?document.documentElement:(next as HTMLElement).firstElementChild as HTMLElement,
     autoRaf:true,smoothWheel:true,syncTouch:false,allowNestedScroll:true,anchors:false,
     lerp:0.22-normalizeScrollValue(softness,50,0,100)*0.00185,wheelMultiplier:normalizeScrollValue(wheelSpeed,100,25,200)/100,
     prevent:node=>!!node.closest('[role="dialog"],dialog,textarea,select,[contenteditable="true"],[data-lenis-prevent]')});
    instance.on('scroll',()=>ScrollTrigger.update());
   }
   const locked=document.body.style.overflow==='hidden'||document.documentElement.style.overflow==='hidden';
   const modal=document.querySelector('[role="dialog"][aria-modal="true"],dialog[open]');
   // Pages mode itself locks the document; only the active inner viewport should scroll there.
   if(modal||(locked&&!pages))instance?.stop();else instance?.start();
  };
  const observer=new MutationObserver(sync);
  observer.observe(document.body,{attributes:true,attributeFilter:['style']});
  observer.observe(document.documentElement,{attributes:true,attributeFilter:['style']});
  const contentObserver=new MutationObserver(sync);
  contentObserver.observe(document.body,{childList:true,subtree:true});
  reduced.addEventListener('change',sync);
  void import('lenis').then(module=>{if(!disposed){LenisClass=module.default;sync();}}).catch(()=>{/* Keep native scrolling when loading fails. */});
  return()=>{disposed=true;observer.disconnect();contentObserver.disconnect();reduced.removeEventListener('change',sync);destroy();};
 },[enabled,softness,wheelSpeed,pages]);
 return null;
}

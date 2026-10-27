'use client';

import {useLayoutEffect, useRef, type CSSProperties} from 'react';
import {readableMix} from './stack-designs/readable-ink';
import styles from './portfolio-work-grid-cta.module.css';

export function gridButtonVars(ink:string):CSSProperties {
  return {'--grid-cta-ink':ink,'--grid-cta-on-fill':readableMix('#ffffff',100,ink)} as CSSProperties;
}
export function GridButtonContent({label}:{label:string}) {
  const labelRef=useRef<HTMLSpanElement>(null);
  useLayoutEffect(()=>{
    const host=labelRef.current?.parentElement;
    if(!host)return;
    const probe=document.createElement('span');
    probe.style.cssText='position:absolute;visibility:hidden;pointer-events:none;color:var(--grid-cta-ink)';
    probe.setAttribute('aria-hidden','true');
    host.appendChild(probe);
    const canvas=document.createElement('canvas');
    canvas.width=canvas.height=1;
    const context=canvas.getContext('2d');
    const update=()=>{
      if(!context)return;
      context.clearRect(0,0,1,1);
      // Composite translucent button ink over its actual card/section surface.
      const ancestors:Element[]=[];
      for(let el=host.parentElement;el;el=el.parentElement)ancestors.push(el);
      context.fillStyle='#ffffff';
      context.fillRect(0,0,1,1);
      ancestors.reverse().forEach(el=>{
        context.fillStyle=getComputedStyle(el).backgroundColor;
        context.fillRect(0,0,1,1);
      });
      context.fillStyle=getComputedStyle(probe).color;
      context.fillRect(0,0,1,1);
      const rgb=Array.from(context.getImageData(0,0,1,1).data).slice(0,3).map(v=>{
        const c=v/255;
        return c<=.04045?c/12.92:((c+.055)/1.055)**2.4;
      });
      const luminance=.2126*rgb[0]+.7152*rgb[1]+.0722*rgb[2];
      host.style.setProperty('--grid-cta-on-fill',luminance>.179?'#111111':'#ffffff');
    };
    update();
    const observer=new MutationObserver(update);
    for(let el=host.parentElement;el;el=el.parentElement){
      observer.observe(el,{attributes:true,attributeFilter:['style','class','data-theme','data-color-mode']});
    }
    const media=window.matchMedia('(prefers-color-scheme: dark)');
    media.addEventListener('change',update);
    return ()=>{
      observer.disconnect();
      media.removeEventListener('change',update);
      probe.remove();
    };
  });
  return <><span ref={labelRef} className={styles.label}><span className={styles.roll}>
    <span className={styles.rollText}>{label}</span>
    <span className={styles.rollCopy} aria-hidden>{label}</span>
  </span></span><span className={styles.arrow} aria-hidden>
    <span className={styles.arrowText}>↗</span><span className={styles.arrowCopy}>↗</span>
  </span></>;
}
/** Actual button presentation without an interactive element inside the choice button. */
export function GridButtonPreview({label,variant,ink}:{label:string;variant:'text'|'underline'|'outline'|'solid'|'pill';ink:string}) {
  return <span className={styles.previewHost} aria-hidden style={gridButtonVars(ink)}>
    <span className={styles.cta} data-variant={variant}><GridButtonContent label={label}/></span>
  </span>;
}

function inkLuminance(ink:string):number|null {
  const value=ink.trim();
  if(!value||value.startsWith('var(')||typeof document==='undefined') return null;
  // The canvas resolves any CSS colour (hex, rgb, hsl, color-mix, named); an unparsable one keeps the previous fill.
  const ctx=document.createElement('canvas').getContext('2d');
  if(!ctx) return null;
  ctx.fillStyle='#010203';
  ctx.fillStyle=value;
  ctx.fillRect(0,0,1,1);
  const [r8,g8,b8,a8]=ctx.getImageData(0,0,1,1).data;
  if(r8===1&&g8===2&&b8===3&&a8===255) return null;
  const [r,g,b]=[r8,g8,b8].map(v=>v/255).map(v=>v<=0.03928?v/12.92:((v+0.055)/1.055)**2.4);
  return 0.2126*r+0.7152*g+0.0722*b;
}
/**
 * Preview for a settings choice tile. The tile is dark, but the button is drawn in the portfolio's ink
 * (often near-black on a white card): shown on the bare tile it disappears. It sits on a small
 * chip of the opposite tone, which is also what the button sits on in the real section.
 */
export function GridButtonChoicePreview({label,variant,ink}:{label:string;variant:'text'|'underline'|'outline'|'solid'|'pill';ink:string}) {
  const lum=inkLuminance(ink);
  const chip=lum==null?undefined:lum>0.5?'#16161a':'#ffffff';
  return <span style={{display:'flex',width:'100%',borderRadius:6,background:chip,overflow:'hidden'}}>
    <GridButtonPreview label={label} variant={variant} ink={ink}/>
  </span>;
}

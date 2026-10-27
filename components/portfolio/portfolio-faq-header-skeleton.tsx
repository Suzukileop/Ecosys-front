import type {PortfolioFaqHeaderDesignSelectable} from './portfolio-faq-header-settings';
import {StackHeaderSkeleton} from './portfolio-stack-header-skeleton';

/** The four FAQ compositions, not the legacy eight shared header layouts. */
export function FaqHeaderSkeleton({design,compact=false}:{design:PortfolioFaqHeaderDesignSelectable;compact?:boolean}){
 if(design==='none')return null;
 if(design==='editorial')return <StackHeaderSkeleton design="editorial" word="FAQ" title="Vos questions" compact={compact}/>;
 const block=(x:number,y:number,w:number,h:number,soft=false,rx=2)=><rect x={x} y={y} width={w} height={h} rx={rx} className={soft?'pf-stack-mini-mute':'pf-stack-mini-ink'}/>;
 return <svg viewBox={compact?'0 50 640 220':'0 0 640 320'} className="pf-stack-mini" aria-hidden="true" data-faq-header-skeleton={design}>
  {design==='signal'?<>{block(48,55,172,28,true,14)}<circle cx="65" cy="69" r="5" className="pf-stack-mini-ink"/>{block(48,116,330,32)}{block(48,162,224,32)}{block(428,170,164,6,true)}{block(428,190,130,6,true)}</>:null}
  {design==='query'?<><text x="535" y="225" textAnchor="middle" fontSize="220" fontWeight="800" className="pf-stack-mini-mute">?</text>{block(48,75,6,160,true)}{block(82,90,310,32)}{block(82,138,230,32)}{block(82,207,282,6,true)}</>:null}
  {design==='dialogue'?<>{block(48,92,185,34)}{block(253,92,168,34,true)}{block(48,145,280,34)}{block(498,88,94,88,true,16)}{block(48,219,370,6,true)}{block(48,261,544,2,true)}</>:null}
 </svg>;
}

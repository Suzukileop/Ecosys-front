'use client';
import type { PortfolioInfoDesign } from './portfolio-info-settings';
import { PortfolioInfoClassicSkeleton } from './PortfolioInfoClassicSkeleton';

/** Ten body layouts, with neutral content silhouettes rather than a second section header. */
export function InfoDesignSkeleton({design}:{design:PortfolioInfoDesign}) {
 if(design==='about-me') return <PortfolioInfoClassicSkeleton/>;
 const block=(x:number,y:number,w:number,h:number,soft=false,rx=3)=><rect x={x} y={y} width={w} height={h} rx={rx} className={soft?'pf-stack-mini-mute':'pf-stack-mini-ink'}/>;
 const lines=(x:number,y:number,w:number)=><>{block(x,y,w,7,true)}{block(x,y+20,w*.9,7,true)}{block(x,y+40,w*.72,7,true)}</>;
 const portrait=(x:number,y:number,w:number,h:number)=><>{block(x,y,w,h,true,4)}<circle cx={x+w/2} cy={y+h*.32} r={Math.min(w,h*.8)*.17} className="pf-stack-mini-ink"/>{block(x+w/2-Math.min(w*.56,h*.5)/2,y+h*.55,Math.min(w*.56,h*.5),h*.32,false,12)}</>;
 let content;
 switch(design){
 case 'about-me-trait': content=<>{portrait(40,45,180,210)}{block(254,65,270,26)}{lines(254,122,315)}{block(246,65,2,150,true)}{[40,240,440].map(x=><g key={x}>{block(x,300,90,22)}{block(x,338,125,7,true)}</g>)}</>;break;
 case 'about-split': content=<>{portrait(40,35,230,330)}{block(310,55,250,28)}{lines(310,120,285)}{[210,275,340].map(y=><g key={y}>{block(310,y,110,10)}{block(310,y+22,270,6,true)}</g>)}</>;break;
 case 'about-banner': content=<>{portrait(40,35,560,160)}{block(40,235,205,28)}{lines(300,230,290)}{block(40,320,140,8,true)}{block(300,320,200,8,true)}</>;break;
 case 'about-platform': content=<>{portrait(40,40,190,240)}{block(270,45,280,30)}{lines(270,110,315)}{[210,270,330].map(y=><g key={y}>{block(270,y,40,15)}{block(330,y,240,8,true)}</g>)}</>;break;
 case 'about-portrait-skills': content=<>{portrait(370,40,225,290)}{[65,140,215].map(y=><g key={y}>{block(40,y,260,35)}</g>)}{block(40,310,210,8,true)}{block(370,355,200,7,true)}</>;break;
 case 'about-manifesto': content=<>{block(40,55,340,42)}{block(40,130,105,3)}{lines(40,205,265)}{[205,260,315].map(y=><g key={y}>{block(395,y,150,13)}</g>)}{block(355,200,2,135,true)}</>;break;
 case 'about-terminal': content=<><rect x="40" y="40" width="560" height="320" rx="8" className="pf-stack-mini-ring" strokeWidth="2"/>{[64,84,104].map(x=><circle key={x} cx={x} cy="64" r="4" className="pf-stack-mini-ink"/>)}{block(40,88,560,2,true)}{block(64,120,225,18)}{lines(64,164,430)}{block(64,254,160,18)}{block(64,295,350,8,true)}{block(64,325,10,16)}</>;break;
 case 'about-index': content=<>{block(40,60,65,24)}{block(195,55,310,30)}{lines(195,120,365)}{block(40,215,560,2,true)}{block(195,250,140,12)}{block(395,250,150,12)}{[195,325,455].map(x=><g key={x}>{block(x,315,70,30)}</g>)}</>;break;
 case 'about-value-steps': content=<>{[65,175,285].map(y=><g key={y}>{block(40,y,60,40)}{block(155,y,245,22)}{block(155,y+40,420,8,true)}{block(40,y+80,555,2,true)}</g>)}</>;break;
 }
 return <svg viewBox="0 0 640 400" className="pf-stack-mini" aria-hidden="true" data-info-design-skeleton={design}>{content}</svg>;
}

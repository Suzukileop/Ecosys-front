'use client';
import {GalleryFramedGridSchematic} from './gallery-framed-grid-option';
type Box=[number,number,number,number];
const layouts:Record<string,Box[]>={
 'experience-kinetic':[[5,12,109,14],[5,33,94,14],[5,54,76,14]],
 'experience-editorial':[[5,10,25,70],[39,12,73,12],[39,33,60,5],[39,46,50,5],[82,58,30,23]],
 'experience-milestone':[[21,9,94,17],[21,37,78,17],[21,65,88,17]],
 'experience-table':[[5,10,110,16],[5,31,110,16],[5,52,110,16],[5,73,110,9]],
 'experience-cards':[[5,9,51,72],[64,9,51,72]],
 'experience-reel':[[31,5,58,81]],
 'experience-duotone':[[5,19,43,11],[5,38,37,5],[5,51,33,5],[58,6,57,80]],
 'experience-gallery':[[5,9,51,31],[64,9,51,31],[5,51,51,31],[64,51,51,31]],
 'experience-loft':[[5,10,22,18],[36,11,77,5],[36,22,58,3],[5,37,22,18],[36,38,77,5],[36,49,58,3],[5,64,22,18],[36,65,77,5],[36,76,58,3]],
 'experience-press':[[5,13,110,12],[5,38,62,7],[5,54,53,4],[5,66,46,4],[78,38,37,5],[78,52,32,4],[78,65,25,4]],
 'experience-legacy':[[5,7,75,12],[5,26,49,5],[5,43,48,38],[64,44,51,8],[64,60,43,4],[64,72,36,4]],
 'floating-canvas':[[5,8,30,34],[44,29,34,28],[89,6,24,25],[13,61,23,23],[85,57,28,29]],
 'caption-carousel':[[5,16,34,48],[44,16,34,48],[83,16,34,48]],
 'hero-mosaic':[[5,6,110,44],[5,55,33,30],[43,55,33,30],[81,55,34,30]],
 'tall-row':[[5,7,48,78],[58,41,16,44],[79,41,16,44],[100,41,16,44]],
 'editorial-split':[[5,7,68,33],[78,7,37,33],[5,45,37,40],[47,45,68,40]],
 'visual-index':[[5,12,73,63],[85,12,15,15],[85,34,15,15],[85,56,15,15]],
 'contact-sheet':[[5,9,33,29],[43,9,33,29],[81,9,34,29],[5,53,33,29],[43,53,33,29],[81,53,34,29]],
 'portrait-rail':[[5,10,34,65],[44,10,34,65],[83,10,34,65]],
 'spotlight':[[5,8,55,76],[68,55,13,22],[85,55,13,22],[102,55,13,22]],
 'split-screen':[[5,12,49,12],[5,32,49,12],[5,52,49,12],[5,72,49,12],[65,8,50,76]],
 'editorial-rhythm':[[5,6,48,71],[60,6,25,39],[91,6,24,39],[60,52,25,33],[91,52,24,33]],
 'directory':[[5,12,110,13],[5,38,110,13],[5,64,110,13]],
 'polaroid':[[5,16,34,53],[44,10,34,53],[83,20,32,53]],
 'profile-cards':[[5,12,33,66],[43,12,33,66],[81,12,34,66]],
 'cover-cards':[[5,12,33,66],[43,12,33,66],[81,12,34,66]],
 'avatar-cards':[[5,15,33,60],[43,15,33,60],[81,15,34,60]],
 'float-cards':[[5,35,49,45],[65,35,49,45]],
 'team-floating-canvas':[[5,9,28,45],[44,33,28,45],[84,12,30,46]],
};
/** Native diagrams encode proportions, placement and captions without simulated photos. */
export function LayoutOptionSchematic({design,section}:{design:string;section:'gallery'|'team'|'experience'}){
 if(design==='framed-grid')return <GalleryFramedGridSchematic/>;
 const key=section==='experience'?`experience-${design}`:section==='team'&&design==='floating-canvas'?'team-floating-canvas':design;
 const boxes=layouts[key]??[];
 return <svg viewBox="0 0 120 92" className="block h-auto w-full" aria-hidden="true">
   <g fill="currentColor" fillOpacity=".09" stroke="currentColor" strokeOpacity=".22" strokeWidth=".8">
     {boxes.map(([x,y,w,h],i)=><g key={i}>
       {design==='avatar-cards'?<><circle cx={x+w/2} cy={y+18} r="13"/><path d={`M${x+5} ${y+43}h${w-10}m-${w-10} 5h${w-16}`} fill="none"/></>:<rect x={x} y={y} width={w} height={h} rx={design==='polaroid'?0:2}/>}
       {['caption-carousel','contact-sheet','polaroid','profile-cards'].includes(design)?<path d={`M${x+4} ${y+h-8}h${w*.55}`} fill="none"/>:null}
       {design==='cover-cards'?<rect x={x+1} y={y+h-19} width={w-2} height="18" fillOpacity=".18" stroke="none"/>:null}
     </g>)}
     {design==='float-cards'?<><rect x="14" y="9" width="31" height="41" rx="2"/><rect x="74" y="9" width="31" height="41" rx="2"/></>:null}
     {design==='visual-index'?<path d="M104 17h10m-10 22h10m-10 22h10" fill="none"/>:null}
     {section==='experience'&&design==='milestone'?<path d="M11 7v78m-4-67h8M7 46h8M7 74h8" fill="none" stroke="var(--pf-palette-principal,#f97316)"/>:null}
     {section==='experience'&&['cards','reel'].includes(design)?<path d={design==='reel'?'M39 20h28m-28 9h21m-21 15h39m-39 9h34m-34 9h24':'M12 20h29m-29 9h21m38-9h29m-29 9h21M12 57h35m24 0h35'} fill="none"/>:null}
     {section==='experience'&&design==='table'?<path d="M28 10v72m38-72v72m30-72v72" fill="none"/>:null}
   </g>
   <path d="M9 88h12" stroke="var(--pf-palette-principal,#f97316)" strokeWidth="2" strokeLinecap="round"/>
 </svg>;
}

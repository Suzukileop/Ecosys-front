import React from 'react';
import { createRoot } from 'react-dom/client';
import { ProductThumbnailMedia } from '../components/marketplace/ProductThumbnailMedia';
const root=createRoot(document.getElementById('root')!);
(window as any).renderTeam=(count=5,options:any={})=>root.render(<div style={{display:'grid',gridTemplateColumns:'repeat('+Math.min(options.canvasColumns??2,innerWidth<640?1:3)+',minmax(0,1fr))',gap:24}}>{Array.from({length:count},(_,i)=><div key={i} style={{position:'relative',aspectRatio:'4 / 5',background:'#222'}}><ProductThumbnailMedia crisp url={'/api/storage/content/public/test/'+i+'.jpg'} alt="Experience" fit="cover" className="h-full w-full"/></div>)}</div>);
(window as any).renderTeam();

const fs=require('fs'),path=require('path');
const f=path.join(__dirname,'..','..','components/portfolio/portfolio-work-projects-carousel.tsx');
let s=fs.readFileSync(f,'utf8');const eol=s.includes('\r\n')?'\r\n':'\n';s=s.replace(/\r\n/g,'\n');
const rep=(a,b)=>{if(!s.includes(a))throw new Error('missing '+a.slice(0,60));s=s.replace(a,b);};
rep('<span className="font-medium italic tracking-[-0.03em]">{parts.italic}</span>','<span className="font-medium tracking-[-0.03em]">{parts.italic}</span>');
rep('px-1.5 py-1 text-[10px] font-medium leading-none tabular-nums tracking-[0.2em] text-white','px-1.5 py-1 text-[11px] font-medium leading-none tabular-nums tracking-[0.2em] text-white');
rep('className="text-[10px] font-medium tabular-nums tracking-[0.22em] sm:text-[11px]"\n            style={{ color: muted, opacity: 0.7 }}','className="text-[11px] font-medium tabular-nums tracking-[0.22em] sm:text-[12px]"\n            style={{ color: muted, opacity: 0.88 }}');
fs.writeFileSync(f,s.replace(/\n/g,eol));console.log('ok');

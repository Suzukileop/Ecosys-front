const fs=require('fs'),path=require('path');
const f=path.join(__dirname,'..','..','components/portfolio/portfolio-experience-lists.tsx');
let s=fs.readFileSync(f,'utf8');const eol=s.includes('\r\n')?'\r\n':'\n';s=s.replace(/\r\n/g,'\n');
const rep=(a,b)=>{if(s.split(a).length!==2)throw new Error('need one: '+a.slice(0,70));s=s.replace(a,b);};
const SC='var(--pf-experience-font-scale, 1)';
rep(`        fontWeight: premium ? 400 : 640,`,`        fontWeight: premium ? 500 : 640,`);
rep(`        lineHeight: premium ? (titleScale === 'compact' ? 1.08 : 0.95) : 1.08,
        letterSpacing: '-0.02em',`,`        lineHeight: premium ? (titleScale === 'compact' ? 1.1 : 1.04) : 1.08,
        letterSpacing: '-0.025em',`);
rep(`        fontSize: premium
          ? titleScale === 'compact'
            ? 'clamp(2.1rem, 9vw, 3rem)'
            : 'clamp(3rem, 6vw, 5.5rem)'
          : 'clamp(2rem, 3vw, 3.1rem)',`,`        // Display size, scaled by the General "Text size" like the rest of the row (the shared
        // "#experience .text-*" overrides never reach an inline style).
        fontSize: premium
          ? titleScale === 'compact'
            ? 'calc(clamp(1.9rem, 8vw, 2.5rem) * ${SC})'
            : 'calc(clamp(2.25rem, 4.4vw, 4rem) * ${SC})'
          : 'calc(clamp(1.75rem, 2.6vw, 2.6rem) * ${SC})',`);
fs.writeFileSync(f,s.replace(/\n/g,eol));console.log('ok');

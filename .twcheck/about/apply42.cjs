const fs=require('fs'),path=require('path');
const f=path.join(__dirname,'..','..','components/portfolio/hero-variants/PortfolioHeroCirclePortrait.tsx');
let s=fs.readFileSync(f,'utf8');const eol=s.includes('\r\n')?'\r\n':'\n';s=s.replace(/\r\n/g,'\n');
const rep=(a,b)=>{if(s.split(a).length!==2)throw new Error('need one: '+a.slice(0,70));s=s.replace(a,b);};
rep("style={{ width: size, height: size }} data-orbit-column>","style={{ width: size, height: roundShape ? size : `calc(${size} * 1.25)` }} data-orbit-column>");
rep(`        <PortraitOffsetOutline enabled={portraitShape === 'offset'} principal={principal} className="h-full max-w-[88%]">
          <div className="h-full" style={{ aspectRatio: '4 / 5', maxWidth: '100%' }}>{frameBox}</div>
        </PortraitOffsetOutline>`,`        // Same width as the round portrait (the column), 4:5 tall.
        <PortraitOffsetOutline enabled={portraitShape === 'offset'} principal={principal} className="size-full">
          {frameBox}
        </PortraitOffsetOutline>`);
fs.writeFileSync(f,s.replace(/\n/g,eol));console.log('ok');

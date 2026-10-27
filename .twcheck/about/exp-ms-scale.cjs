const path=require('path');const {chromium}=require(path.join(__dirname,'..','..','node_modules','playwright-core'));
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1440,height:900},reducedMotion:'reduce'});
await p.route('**/zz-harness',r=>r.fulfill({contentType:'text/html',body:'<body style="margin:0"><iframe id="f" src="/portfolio/tester1?embed=1" style="width:1440px;height:880px;border:0"></iframe></body>'}));
await p.goto('http://localhost:3000/zz-harness',{waitUntil:'domcontentloaded'});await p.waitForTimeout(9000);
const frame=p.frames().find(f=>f.url().includes('/portfolio/tester1'));
for(const size of ['small','medium','xxlarge']){
await p.evaluate(([size])=>document.getElementById('f').contentWindow.postMessage({source:'skraft-portfolio-studio',type:'apply-settings',settings:{experience:{experienceDesign:'milestone',enabled:true,premiumFontSize:size}}},location.origin),[size]);
await p.waitForTimeout(9000);
const r=await frame.evaluate(()=>{const s=document.getElementById('experience');const out=[];for(const el of s.querySelectorAll('p,h3')){if(!el.textContent.trim())continue;const fs=parseFloat(getComputedStyle(el).fontSize);if(fs>=20)out.push(el.textContent.trim().slice(0,22)+' '+Math.round(fs*10)/10);}return [getComputedStyle(s).getPropertyValue('--pf-experience-font-scale'),...out.slice(0,4)];});
console.log(size,JSON.stringify(r));}
await b.close();})();

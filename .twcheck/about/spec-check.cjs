const path=require('path');const {chromium}=require(path.join(__dirname,'..','..','node_modules','playwright-core'));
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1440,height:900},reducedMotion:'reduce'});
await p.route('**/zz-harness',r=>r.fulfill({contentType:'text/html',body:'<body style="margin:0"><iframe id="f" src="/portfolio/tester1?embed=1" style="width:1440px;height:880px;border:0"></iframe></body>'}));
await p.goto('http://localhost:3000/zz-harness',{waitUntil:'domcontentloaded'});await p.waitForTimeout(9000);
const frame=p.frames().find(f=>f.url().includes('/portfolio/tester1'));
const cases=[{linkStyle:'outline'},{linkStyle:'solid'}];
for(const c of cases){
await p.evaluate(([c])=>document.getElementById('f').contentWindow.postMessage({source:'skraft-portfolio-studio',type:'apply-settings',settings:{work:{sectionDesign:'projects-duotone',enabled:true,projectsDuotone:c}}},location.origin),[c]);
await p.waitForTimeout(10000);
const r=await frame.evaluate(()=>{const s=document.getElementById('work');const cat=[...s.querySelectorAll('p')].find(e=>e.textContent.trim()==='mobile');const role=[...s.querySelectorAll('p')].find(e=>e.textContent.trim()==='Fullstack Developer');if(!cat||!role)return 'no meta';const sep=cat.nextElementSibling&&cat.nextElementSibling.tagName==='SPAN'?cat.nextElementSibling:null;const sr=sep&&sep.firstElementChild.getBoundingClientRect();const art=cat.closest('article');const ac=getComputedStyle(art);return {cat:getComputedStyle(cat).color,role:getComputedStyle(role).color,sep:sr?{w:Math.round(sr.width),h:Math.round(sr.height),bg:getComputedStyle(sep.firstElementChild).backgroundColor}:null,block:Math.round(cat.parentElement.getBoundingClientRect().width),border:ac.borderTopColor+' '+ac.borderTopWidth,fill:ac.backgroundColor};});
console.log(JSON.stringify(c),JSON.stringify(r));}
await b.close();})();

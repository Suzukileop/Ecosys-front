const path=require('path');const {chromium}=require(path.join(__dirname,'..','..','node_modules','playwright-core'));
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1440,height:900},reducedMotion:'reduce'});
await p.route('**/zz-harness',r=>r.fulfill({contentType:'text/html',body:'<body style="margin:0"><iframe id="f" src="/portfolio/tester1?embed=1" style="width:1440px;height:880px;border:0"></iframe></body>'}));
await p.goto('http://localhost:3000/zz-harness',{waitUntil:'domcontentloaded'});await p.waitForTimeout(9000);
const frame=p.frames().find(f=>f.url().includes('/portfolio/tester1'));
for(const [design,key,sel] of [['projects-spec','projectsSpec','article'],['projects-case','projectsCase','article']])
for(const gap of ['tight','md','xl','2xl']){
await p.evaluate(([design,key,gap])=>document.getElementById('f').contentWindow.postMessage({source:'skraft-portfolio-studio',type:'apply-settings',settings:{work:{sectionDesign:design,enabled:true,[key]:{sheetGap:gap}}}},location.origin),[design,key,gap]);
await p.waitForTimeout(9000);
const r=await frame.evaluate((sel)=>{const arts=[...document.querySelectorAll('#work '+sel)].filter(a=>a.getBoundingClientRect().height>100);if(arts.length<2)return 'few '+arts.length;const a=arts[0].getBoundingClientRect(),c=arts[1].getBoundingClientRect();return Math.round(c.top-a.bottom);},sel);
console.log(design,gap,JSON.stringify(r));}
await b.close();})();

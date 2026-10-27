const path=require('path');const {chromium}=require(path.join(__dirname,'..','..','node_modules','playwright-core'));
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1440,height:900},reducedMotion:'reduce'});
await p.route('**/zz-harness',r=>r.fulfill({contentType:'text/html',body:'<body style="margin:0"><iframe id="f" src="/portfolio/tester1?embed=1" style="width:1440px;height:880px;border:0"></iframe></body>'}));
await p.goto('http://localhost:3000/zz-harness',{waitUntil:'domcontentloaded'});await p.waitForTimeout(9000);
const frame=p.frames().find(f=>f.url().includes('/portfolio/tester1'));
for(const consultStyle of ['muted','principal','secondaire']){
await p.evaluate(([c])=>document.getElementById('f').contentWindow.postMessage({source:'skraft-portfolio-studio',type:'apply-settings',settings:{work:{sectionDesign:'projects-ledger',enabled:true,projectsLedger:{expandMode:'always',metaColor:c}}}},location.origin),[consultStyle]);
await p.waitForTimeout(13000);
const r=await frame.evaluate(()=>{const row=document.querySelector('.pf-work-ledger-row');if(!row)return 'no row';const rt=row.querySelector('.pf-work-ledger-role-text');return rt?getComputedStyle(rt).color:'no role';});
console.log(consultStyle,JSON.stringify(r));}
await b.close();})();

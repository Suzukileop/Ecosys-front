const path=require('path');const {chromium}=require(path.join(__dirname,'..','..','node_modules','playwright-core'));
(async()=>{const b=await chromium.launch();
for(const W of [1440]){
const p=await b.newPage({viewport:{width:W,height:900},reducedMotion:'reduce'});
await p.route('**/zz-harness',r=>r.fulfill({contentType:'text/html',body:`<body style="margin:0"><iframe id="f" src="/portfolio/tester1?embed=1" style="width:${W}px;height:880px;border:0"></iframe></body>`}));
await p.goto('http://localhost:3000/zz-harness',{waitUntil:'domcontentloaded'});await p.waitForTimeout(9000);
const frame=p.frames().find(f=>f.url().includes('/portfolio/tester1'));
for(const showIndex of [false,true]){
await p.evaluate(([showIndex])=>document.getElementById('f').contentWindow.postMessage({source:'skraft-portfolio-studio',type:'apply-settings',settings:{work:{sectionDesign:'projects-ledger',enabled:true,projectsLedger:{showIndex,expandMode:'always'}}}},location.origin),[showIndex]);
await p.waitForTimeout(13000);
const r=await frame.evaluate(()=>{const row=document.querySelector('.pf-work-ledger-row');if(!row)return 'no row';const t=row.querySelector('[data-ledger-title]').getBoundingClientRect();const rr=row.getBoundingClientRect();const hasIdx=!!row.querySelector('[data-ledger-index]');const role=row.querySelector('[data-ledger-role]');return {idx:hasIdx,titleLeftOffset:Math.round(t.left-rr.left),roleRight:role?Math.round(rr.right-role.getBoundingClientRect().right):null,ovf:document.documentElement.scrollWidth>innerWidth};});
console.log(W,showIndex,JSON.stringify(r));}
await p.close();}
await b.close();})();

const { chromium }=require('@playwright/test');
const fs=require('node:fs');
const ts=require('typescript');
const assert=require('node:assert/strict');
(async()=>{
 const source=fs.readFileSync('components/portfolio/portfolio-experience-lists.tsx','utf8');
 const start=source.indexOf('    const anchor = scrollAnchor.current;');
 const end=source.indexOf('  }, [animate, rowOpacity, rowX]);',start);
 assert(start>0 && end>start);
 const effect=source.slice(start,end);
 const progress=ts.transpileModule(fs.readFileSync('lib/experience-scroll-progress.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText;
 const browser=await chromium.launch({headless:true});
 try {
  const page=await browser.newPage({viewport:{width:1200,height:900}});
  await page.setContent('<style>body{margin:0}.viewport{height:600px;overflow:auto;margin-top:80px}.before{height:650px}.anchor{height:400px}.block{height:100%}.after{height:800px}</style><div class="viewport"><div class="before"></div><div class="anchor"><article class="block">EXPERIENCE</article></div><div class="after"></div></div>');
  await page.evaluate(({effect,progress})=>{
   const mod={exports:{}};new Function('exports','module',progress)(mod.exports,mod);
   const anchor=document.querySelector('.anchor'),block=document.querySelector('.block');
   const parent=el=>{for(let n=el.parentElement;n&&n!==document.body;n=n.parentElement)if(/auto|scroll/.test(getComputedStyle(n).overflowY)&&n.scrollHeight>n.clientHeight+1)return n;return null;};
   new Function('scrollAnchor','animate','rowOpacity','rowX','getScrollParent','experienceScrollProgress','scrollDirection',effect)({current:anchor},true,{get:()=>1,set:value=>block.style.opacity=value},{get:()=>0,set:value=>block.style.transform=`translateX(${value}px)`},parent,mod.exports.experienceScrollProgress,1);
  },{effect,progress});
  const sample=async position=>{
   await page.locator('.viewport').evaluate((el,y)=>el.scrollTop=y,position);
   await page.waitForTimeout(850);
   return Number(await page.locator('.block').evaluate(el=>getComputedStyle(el).opacity));
  };
  assert.equal(await sample(0),0);
  await page.locator('.viewport').evaluate(el=>el.scrollTop=90);
  await page.waitForTimeout(45);
  const during=Number(await page.locator('.block').evaluate(el=>getComputedStyle(el).opacity));
  const entering=await sample(90);assert(entering>0&&entering<1);
  assert.equal(await page.locator('.block').evaluate(el=>getComputedStyle(el).transform), 'matrix(1, 0, 0, 1, 0, 0)');
  assert(during<entering,'Entry must interpolate over time, not jump to scroll target');
  assert.equal(await sample(550),1);
  const leaving=await sample(1010);assert(leaving>0&&leaving<1);
  assert.equal(await sample(1100),0);
  assert.equal(await sample(550),1);
  console.log('PASS actual scroll effect: nested preview scroller, entry, readable plateau, exit, reverse');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});

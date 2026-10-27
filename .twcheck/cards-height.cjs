const {chromium}=require('@playwright/test');
const fs=require('node:fs');
const assert=require('node:assert/strict');
(async()=>{
 const source=fs.readFileSync('components/portfolio/portfolio-experience-lists.tsx','utf8');
 const start=source.indexOf('    const equalize = () => {');
 const end=source.indexOf('    const onResize = () => {',start);
 const code=source.slice(start,end);
 const browser=await chromium.launch({headless:true});
 try {
  const page=await browser.newPage();
  await page.setContent('<div class="card" style="height:400px;transform:scale(.9)"></div><div class="card" style="height:600px"></div><div class="card" style="height:450px;transform:scale(.95)"></div>');
  const heights=await page.evaluate(code=>{const cards=Array.from(document.querySelectorAll('.card'));new Function('cards','ScrollTrigger','let ticking=false;'+code+';equalize();')(cards,{refresh(){}});return cards.map(card=>card.offsetHeight)},code);
  assert.deepEqual(heights,[600,600,600]);
  console.log('PASS equal layout heights despite cascade transforms');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});

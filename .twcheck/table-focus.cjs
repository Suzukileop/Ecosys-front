const {chromium}=require('@playwright/test');
const fs=require('node:fs');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true});
 try{
  const page=await browser.newPage();
  const css=fs.readFileSync('components/portfolio/portfolio-experience-focus.module.css','utf8');
  await page.setContent(`<style>${css}header,[data-table-row]{padding-inline:16px;box-sizing:border-box}button{padding:24px 0;width:100%;text-align:left;border:0}header{height:40px}</style><header><span>Period</span></header><div class="tableRows" data-focus-blur="true">${[1,2,3].map(i=>`<div><div data-table-row style="background:${i%2?'#eee':'transparent'}"><button>Row ${i}</button></div></div>`).join('')}</div>`);
  await page.getByRole('button',{name:'Row 1'}).click();
  await page.getByRole('button',{name:'Row 2'}).hover();
  await page.waitForTimeout(550);
  const rows=page.locator('[data-table-row]');
  assert.deepEqual(await rows.evaluateAll(es=>es.map(e=>Number(getComputedStyle(e).opacity))),[.6,1,.6]);
  assert.deepEqual(await rows.evaluateAll(es=>es.map(e=>getComputedStyle(e).filter)),['blur(0.75px)','none','blur(0.75px)']);
  const header=await page.locator('header span').boundingBox();
  const button=await page.getByRole('button',{name:'Row 1'}).boundingBox();
  assert.equal(header.x,button.x);
  await page.mouse.move(700,500);await page.waitForTimeout(550);
  assert.deepEqual(await rows.evaluateAll(es=>es.map(e=>getComputedStyle(e).filter)),['none','none','none']);
  console.log('PASS: table hover focus and blur, focus-after-click, reset, striped/header padding alignment');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});

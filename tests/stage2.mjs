import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const choice=process.argv.includes('fries')?'fries':'chicken',full=process.argv.includes('--full');
const other=choice==='chicken'?'fries':'chicken',seconds=choice==='chicken'?4:2;
await fs.mkdir('artifacts',{recursive:true});
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
try{
 const page=await browser.newPage({viewport:{width:1366,height:900}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:5173');await page.locator('#start').click();
 console.log(`${choice}: waiting for day 1 to close naturally`);
 await page.waitForFunction(()=>document.getElementById('overlay').dataset.mode==='end',null,{timeout:210000});
 assert.match(await page.locator('#day-label').innerText(),/01/);assert.equal(await page.locator('#shop-clock').innerText(),'22:00');
 await page.locator('#open-upgrades').click();assert.equal(await page.locator('#overlay').getAttribute('data-mode'),'upgrade');
 assert.equal(await page.locator('#next-day').isDisabled(),true);assert.equal(await page.locator('[data-cook="drink"]').isDisabled(),true);
 const frozen=await page.locator('#time').innerText();await page.waitForTimeout(500);assert.equal(await page.locator('#time').innerText(),frozen);
 await page.screenshot({path:`artifacts/upgrade-${choice}-before.png`});
 const plus=await page.locator(`[data-cook="${choice}"] .upgrade-plus`).boundingBox();await page.mouse.click(plus.x+plus.width/2,plus.y+plus.height/2);
 assert.equal(await page.locator('.upgrade-selected').getAttribute('data-cook'),choice);
 assert.equal(await page.locator(`[data-cook="${other}"]`).isDisabled(),true);
 assert.match(await page.locator(`#detail-${choice}`).innerText(),new RegExp(`^${seconds} วิ`));
 await page.screenshot({path:`artifacts/upgrade-${choice}-selected.png`});
 await page.locator('#next-day').click();assert.match(await page.locator('#day-label').innerText(),/02/);assert.match(await page.locator('#stage-label').innerText(),/2/);
 assert.equal(await page.locator('#overlay').getAttribute('data-mode'),'');assert.equal(await page.locator('.upgraded').getAttribute('data-cook'),choice);
 assert.equal(await page.locator('#costs').innerText(),'฿0');assert.equal(await page.locator(`#stock-${choice}`).innerText(),'0/5');
 assert.match(await page.locator('[data-customer="1"] .customer-status').innerText(),/10 วิ/);await page.locator('[data-customer="1"]').click();
 await page.locator(`[data-cook="${choice}"]`).click({clickCount:2});assert.equal(await page.locator(`#timer-${choice}`).innerText(),String(seconds));
 await page.waitForFunction(item=>document.getElementById(`stock-${item}`).textContent==='1/5',choice);
 assert.equal(await page.locator(`#queue-${choice}`).innerText(),'คิว 1 / 5');
 await page.waitForFunction(item=>document.getElementById(`stock-${item}`).textContent==='2/5',choice);
 const customer=page.locator('[data-customer="1"]');await customer.click();const recipe=(await customer.getAttribute('data-order-items')).split(',');
 for(const item of recipe)if(item!==choice)await page.locator(`[data-cook="${item}"]`).click();
 for(const item of recipe){await page.waitForFunction(item=>Number(document.getElementById(`stock-${item}`).textContent.split('/')[0])>0,item);await page.locator(`[data-add="${item}"]:not(:disabled)`).first().click();}
 await page.locator('#serve').click();assert.match(await page.locator('#served').innerText(),/^1 /);assert.equal(await page.locator('.customer-reaction').count(),1);
 await page.screenshot({path:`artifacts/stage2-${choice}-playing.png`});
 await page.locator('#pause').click();const timer=await page.locator('#time').innerText();await page.waitForTimeout(350);assert.equal(await page.locator('#time').innerText(),timer);await page.locator('#resume').click();
 console.log(`PASS ${choice}: day 1 summary, one upgrade via +, clean day 2, ${seconds}s queued cooking, 36s food patience, service and pause`);
 if(full){
  console.log(`${choice}: waiting for day 2 final summary`);
  await page.waitForFunction(()=>document.getElementById('overlay').dataset.mode==='end',null,{timeout:210000});
  assert.equal(await page.locator('#open-upgrades').count(),0);assert.match(await page.locator('.campaign-total').innerText(),/กำไรรวม 2 วัน/);
  assert.equal(await page.locator('#shop-clock').innerText(),'22:00');await page.screenshot({path:'artifacts/two-day-summary.png'});
  await page.locator('#restart').click();assert.match(await page.locator('#day-label').innerText(),/01/);assert.equal(await page.locator('.upgraded').count(),0);assert.match(await page.locator('#detail-chicken').innerText(),/^5 วิ/);assert.match(await page.locator('#detail-fries').innerText(),/^3 วิ/);
  console.log('PASS: day 2 final summary, combined profit, full reset to day 1');
 }
 assert.deepEqual(errors,[]);
}finally{await browser.close()}

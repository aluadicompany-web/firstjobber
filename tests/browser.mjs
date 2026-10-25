import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
await fs.mkdir('artifacts',{recursive:true});
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
try {
 const page=await browser.newPage({viewport:{width:1440,height:1200}});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:5173');await page.locator('canvas').waitFor();await page.locator('#start').click();
 const customer=id=>page.locator(`[data-customer="${id}"]`);
 const cook=item=>page.locator(`[data-cook="${item}"]`);
 const oilState=()=>page.locator('[data-cook=chicken] .oil-bubble').first().evaluate(el=>getComputedStyle(el).animationPlayState);
 const food=item=>page.locator(`[data-add="${item}"]:not(:disabled)`).first();
 const waitStock=async(item,n)=>page.waitForFunction(({item,n})=>Number(document.getElementById(`stock-${item}`).textContent.split('/')[0])>=n,{item,n});
 assert.equal(await page.locator('aside,#orders').count(),0);
 assert.match(await customer(1).innerText(),/คุณมิน/);
 await customer(1).locator('.person').click();assert.match(await customer(1).getAttribute('aria-label'),/รับออเดอร์แล้ว/);
 await customer(1).click();assert.equal(await page.locator('#revenue').innerText(),'฿0');
 assert.equal(await oilState(),'paused');
 await cook('chicken').click({clickCount:2});await cook('drink').click();
 assert.equal(await page.locator('#queue-chicken').innerText(),'คิว 2 / 5');
 assert.equal(await page.locator('#costs').innerText(),'฿40');
 assert.equal(await oilState(),'running');
 const oilMotion=()=>page.locator('[data-cook=chicken] .oil-surface').evaluate(el=>getComputedStyle(el).transform);
 const beforeOil=await oilMotion();await page.waitForTimeout(150);assert.notEqual(await oilMotion(),beforeOil,'Oil should visibly move while cooking');
 assert.equal(await page.locator('[data-cook=drink] .soda-stream').evaluate(el=>getComputedStyle(el).animationPlayState),'running');
 await page.screenshot({path:'artifacts/kitchen-queued.png',fullPage:true});
 await page.locator('#pause').click();assert.equal(await oilState(),'paused');const time=await page.locator('#time').innerText();const timer=await page.locator('#timer-chicken').innerText();
 const pausedOil=await oilMotion();await page.waitForTimeout(1100);assert.equal(await oilMotion(),pausedOil,'Oil should freeze while paused');assert.equal(await page.locator('#time').innerText(),time);assert.equal(await page.locator('#timer-chicken').innerText(),timer);await page.locator('#resume').click();
 await waitStock('chicken',1);assert.equal(await page.locator('#queue-chicken').innerText(),'คิว 1 / 5');
 await page.screenshot({path:'artifacts/kitchen-cabinet.png',fullPage:true});
 await food('chicken').click();await page.locator('#serve').click();assert.match(await page.locator('#served').innerText(),/^0 /);assert.match(await page.locator('#message').innerText(),/ยังไม่ตรง/);
 await food('drink').click();assert.equal(await page.locator('#serve').getAttribute('class'),'serving-tray ready');
 await page.waitForTimeout(550);await page.screenshot({path:'artifacts/kitchen-tray.png',fullPage:true});
 await page.locator('#serve').click();assert.match(await page.locator('#served').innerText(),/^1 /);assert.equal(await page.locator('#profit').innerText(),'฿48');assert.equal(await customer(1).count(),0);
 console.log('PASS: named overhead orders, no sidebar, click queue, sequential cooking, paused cooldown, physical stock, wrong tray rejection, click-to-serve');
 if(process.argv.includes('--orders')) { await customer(4).waitFor({timeout:45000});await customer(3).click();assert.match(await customer(3).getAttribute('aria-label'),/รับออเดอร์แล้ว/);await customer(4).locator('.bubble').click();assert.match(await customer(4).getAttribute('aria-label'),/รับออเดอร์แล้ว/); }
 else {
  // Capacity rejection cannot charge a sixth piece; slots are exact, not decorative counters.
  for(let i=0;i<5;i++)await cook('fries').click();const cost=await page.locator('#costs').innerText();await cook('fries').click();assert.equal(await page.locator('#costs').innerText(),cost);assert.match(await page.locator('#message').innerText(),/ครบ 5 ชิ้น/);
  await waitStock('fries',5);assert.equal(await page.locator('[data-add="fries"]:not(:disabled)').count(),5);assert.equal(await page.locator('#queue-fries').innerText(),'คิว 0 / 5');
  assert.equal(await page.locator('[data-cook=fries] .oil-bubble').first().evaluate(el=>getComputedStyle(el).animationPlayState),'paused');
  await food('fries').click();await page.locator('#clear').click();assert.equal(await page.locator('[data-add="fries"]:not(:disabled)').count(),5);
  // Keyboard actions use the same state as direct scene clicks.
  await page.keyboard.press('Tab');await page.keyboard.press('e');await page.keyboard.press('3');await waitStock('drink',1);await page.keyboard.press('r');assert.equal(await page.locator('#tray-items').innerText(),'🥤');await page.keyboard.press('Backspace');assert.equal(await page.locator('#stock-drink').innerText(),'1/5');
  await page.screenshot({path:'artifacts/kitchen-desktop.png',fullPage:true});
  console.log('PASS: five-piece cap, automatic queue drain, five physical slots, return food, keyboard');
 }
 await page.setViewportSize({width:390,height:844});
 const mobileCustomer=page.locator('[data-customer]').first();await mobileCustomer.click();assert.match(await mobileCustomer.getAttribute('aria-label'),/รับออเดอร์แล้ว/);
 await cook('drink').click();await waitStock('drink',1);await food('drink').click();await page.locator('#clear').click();
 await page.waitForTimeout(550);
 await page.screenshot({path:'artifacts/kitchen-mobile.png',fullPage:true});
 await page.locator('.world-scroll').evaluate(el=>el.scrollLeft=0);
 const bounds=await page.locator('[data-customer]').first().evaluate(el=>({bubble:el.querySelector('.bubble').getBoundingClientRect().bottom,head:el.querySelector('.head').getBoundingClientRect().top}));
 assert.ok(bounds.head>=bounds.bubble,'Customer must stay below the order bubble');
 await page.screenshot({path:'artifacts/kitchen-mobile-left.png',fullPage:true});
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
 assert.deepEqual(errors,[]);console.log('PASS: mobile scrollable scene, customer/station/cabinet/tray clicks, no page errors');
 if(!process.argv.includes('--orders')&&!process.argv.includes('--kitchen')) {
  console.log('Waiting for real shift end...');await page.waitForFunction(()=>document.getElementById('overlay').dataset.mode==='end',null,{timeout:210000});
  await page.locator('#restart').click();assert.match(await page.locator('#served').innerText(),/^0 /);assert.equal(await page.locator('#stock-chicken').innerText(),'0/5');assert.equal(await page.locator('#queue-chicken').innerText(),'คิว 0 / 5');assert.equal(await page.locator('#costs').innerText(),'฿0');assert.deepEqual(errors,[]);console.log('PASS: shift end and clean restart');
 }
} finally {await browser.close()}

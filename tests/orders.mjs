import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
await fs.mkdir('artifacts',{recursive:true});
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
try {
 const page=await browser.newPage({viewport:{width:1440,height:1100}});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const order=id=>page.locator(`[data-customer="${id}"]`);
 const clickWorld=async(x,y)=>{const canvas=page.locator('canvas');await canvas.scrollIntoViewIfNeeded();const box=await canvas.boundingBox();await page.mouse.click(box.x+x*box.width/800,box.y+y*box.height/410)};
 await page.goto('http://127.0.0.1:5173');await page.locator('#start').click();
 await order(1).waitFor();
 await page.screenshot({path:'artifacts/orders-before.png',fullPage:true});
 // Empty floor next to a customer must not accept an order.
 await clickWorld(215,164);assert.match(await order(1).innerText(),/รอรับออเดอร์/);
 await clickWorld(150,164);assert.match(await order(1).innerText(),/✓ กำลังเตรียม/);
 await clickWorld(150,164);assert.equal(await page.locator('#revenue').innerText(),'฿0');
 await page.waitForTimeout(200);
 await page.screenshot({path:'artifacts/orders-accepted.png',fullPage:true});
 // An accepted order still follows the original cooking and service flow.
 await page.locator('[data-cook="chicken"]').click();await page.locator('[data-cook="drink"]').click();
 await page.waitForFunction(()=>document.getElementById('status-chicken').textContent.includes('พร้อม 1 ชิ้น'));
 await page.locator('[data-add="chicken"]').click();await page.locator('[data-add="drink"]').click();await page.locator('#serve').click();
 assert.match(await page.locator('#served').innerText(),/^1 /);assert.equal(await page.locator('#profit').innerText(),'฿66');assert.equal(await order(1).count(),0);
 console.log('PASS: floor miss, customer click accepts, repeated click, cooking and service');
 // Three different customers, including a full three-item meal.
 await order(4).waitFor({timeout:45000});
 await clickWorld(300,164);assert.match(await order(3).innerText(),/✓ กำลังเตรียม/);assert.match(await order(2).innerText(),/รอรับออเดอร์/);
 await clickWorld(450,90);assert.match(await order(4).innerText(),/✓ กำลังเตรียม/);
 await page.waitForTimeout(200);await page.screenshot({path:'artifacts/orders-desktop.png',fullPage:true});
 await page.setViewportSize({width:390,height:844});await clickWorld(150,164);assert.match(await order(2).innerText(),/✓ กำลังเตรียม/);
 await page.waitForTimeout(200);await page.screenshot({path:'artifacts/orders-mobile.png',fullPage:true});
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
 assert.deepEqual(errors,[]);console.log('PASS: correct customer, bubble click, three-item meal, scaled mobile click, no browser errors');
} finally {await browser.close()}

import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
await fs.mkdir('artifacts',{recursive:true});
const b=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
try {
 const p=await b.newPage({viewport:{width:1366,height:768}}),errors=[];
 p.on('pageerror',e=>errors.push(e.message));
 await p.addInitScript(()=>{Math.random=()=>0});
 await p.goto('http://127.0.0.1:5173');await p.locator('#start').click();
 for(let n=1;n<=10;n++){
  const customer=p.locator('[data-customer]').first();await customer.click();
  const order=(await customer.getAttribute('data-order-items')).split(',');
  for(const item of order)await p.locator(`[data-cook="${item}"]`).click();
  for(const item of order){
   await p.waitForFunction(item=>document.getElementById(`stock-${item}`).textContent!=='0/5',item);
   await p.locator(`[data-add="${item}"]:not(:disabled)`).first().click();
  }
  await p.locator('#serve').click();
  await p.waitForFunction(n=>document.getElementById('served').textContent===`${n} ออเดอร์`,n);
  if(n<10)assert.equal(await p.locator('#nabi').isVisible(),false);
  console.log(`served ${n}`);
 }
 await p.locator('#nabi').waitFor({state:'visible'});
 assert.equal(await p.locator('#nabi').getAttribute('data-visit'),'1');
 const pos=()=>p.locator('#nabi').evaluate(el=>[el.style.left,el.style.top]);
 const a=await pos();await p.waitForTimeout(500);assert.notDeepEqual(await pos(),a);
 await p.locator('#pause').click();const frozen=await pos();await p.waitForTimeout(600);assert.deepEqual(await pos(),frozen);
 await p.locator('#resume').click();await p.screenshot({path:'artifacts/nabi-desktop.png'});
 await p.setViewportSize({width:390,height:844});await p.waitForTimeout(200);await p.screenshot({path:'artifacts/nabi-mobile.png'});
 assert.equal(await p.locator('#nabi').evaluate(el=>getComputedStyle(el).pointerEvents),'none');
 await p.locator('#nabi').waitFor({state:'hidden',timeout:10000});
 assert.match(await p.locator('#served').innerText(),/^10 /);assert.deepEqual(errors,[]);
 console.log('PASS natural ten-order trigger, movement, pause, responsive rendering and timed exit');
}finally{await b.close()}

import {test} from 'node:test';
import assert from 'node:assert/strict';
import {Employee,workPoint} from '../src/employee';
import {Shift} from '../src/game';
test('employee visits each work point while staying behind the service counter',()=>{
 const actor=new Employee();actor.enqueue({kind:'cook',item:'drink'});actor.enqueue({kind:'storage',item:'chicken'});actor.enqueue({kind:'tray'});
 const visited=new Set<string>();
 for(let i=0;i<500;i++){actor.tick(.03);assert.ok(!(actor.x>30&&actor.x<940&&actor.y>405&&actor.y<570),'route must avoid central island');for(const kind of ['cook','storage','tray'] as const){const target=workPoint({kind,item:kind==='cook'?'drink':'chicken'});if(Math.hypot(actor.x-target.x,actor.y-target.y)<1)visited.add(kind);}}
 assert.deepEqual([...visited].sort(),['cook','storage','tray']);assert.equal(actor.x,180);assert.equal(actor.y,610);assert.equal(actor.jobs.length,0);
});
test('pause freezes walking and waiting tasks',()=>{const actor=new Employee();actor.enqueue({kind:'cook',item:'chicken'});actor.tick(.1);const position=[actor.x,actor.y,actor.jobs.length,actor.path.length];actor.tick(10,true);assert.deepEqual([actor.x,actor.y,actor.jobs.length,actor.path.length],position);});
test('shop clock opens at 10:00, pauses and closes at 22:00',()=>{const g=new Shift();assert.equal(g.shopTime,'10:00');g.start();g.tick(45);assert.equal(g.shopTime,'13:00');g.paused=true;g.tick(20);assert.equal(g.shopTime,'13:00');g.paused=false;g.tick(500);assert.equal(g.shopTime,'22:00');assert.equal(g.ended,true);});
test('money and staff events are emitted once per successful action',()=>{const g=new Shift();g.start();g.accept();for(let i=0;i<6;i++)g.cook('chicken');assert.equal(g.moneyEvents.length,5);assert.equal(g.moneyEvents.reduce((n,e)=>n+e.amount,0),-90);assert.equal(g.workEvents.filter(e=>e.kind==='cook').length,5);g.cook('drink');g.tick(5);g.add('chicken');g.add('drink');g.serve();assert.equal(g.moneyEvents.filter(e=>e.amount>0).length,1);assert.equal(g.moneyEvents.at(-1)?.amount,88);assert.equal(g.moneyEvents.reduce((n,e)=>n+e.amount,0),g.profit);g.serve();assert.equal(g.moneyEvents.filter(e=>e.amount>0).length,1);});

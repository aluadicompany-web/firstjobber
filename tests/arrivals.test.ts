import {test} from 'node:test';
import assert from 'node:assert/strict';
import {Shift} from '../src/game';
test('serving the last customer adds exactly one immediately and resets arrival time',()=>{const g=new Shift(()=>0);g.start();g.accept();g.cook('chicken');g.cook('drink');g.tick(5);g.add('chicken');g.add('drink');g.spawnIn=.01;g.serve();assert.equal(g.served,1);assert.equal(g.customers.length,1);assert.equal(g.current?.id,2);assert.equal(g.current?.patience,55);assert.equal(g.current?.accepted,false);assert.equal(g.spawnIn,20);g.tick(.02);assert.equal(g.customers.length,1);});
test('an empty shop refills in the same update after customer patience expires',()=>{const g=new Shift(()=>0);g.start();g.current!.patience=.1;g.spawnIn=15;g.tick(.2);assert.equal(g.lost,1);assert.equal(g.customers.length,1);assert.equal(g.current?.id,2);assert.equal(g.current?.patience,55);assert.equal(g.spawnIn,20);});
test('first minute allows preparation before the next arrival; later pace increases gradually',()=>{const g=new Shift(()=>0);g.start();g.tick(19.9);assert.equal(g.customers.length,1);g.tick(.2);assert.equal(g.customers.length,2);assert.equal(g.spawnIn,28);g.elapsed=60;assert.equal(g.arrivalInterval,26);g.elapsed=120;assert.equal(g.arrivalInterval,24);g.spawn();assert.equal(g.customers.length,3);assert.equal(g.arrivalInterval,24);});
test('a remaining customer keeps their timer and the normal arrival countdown',()=>{const g=new Shift(()=>0);g.start();g.spawn();g.accept();g.cook('chicken');g.cook('drink');g.tick(5);g.add('chicken');g.add('drink');const timer=g.spawnIn,patience=g.customers[1].patience;g.serve();assert.equal(g.customers.length,1);assert.equal(g.current?.id,2);assert.equal(g.current?.patience,patience);assert.equal(g.spawnIn,timer);});
test('pause and closing never generate new customers',()=>{const g=new Shift(()=>0);g.start();g.customers=[];g.paused=true;g.tick(10);assert.equal(g.customers.length,0);assert.equal(g.spawnIn,20);g.paused=false;g.remaining=.1;g.spawnIn=0;const next=g.nextId;g.tick(.2);assert.equal(g.ended,true);assert.equal(g.nextId,next);assert.equal(g.customers.length,0);});
test('a full queue cannot burst beyond four customers, and waiting recipes stay distinct',()=>{const g=new Shift(()=>0);g.start();for(let i=0;i<200;i++){g.tick(.5);assert.ok(g.customers.length>=1&&g.customers.length<=4);const keys=g.customers.map(c=>[...c.items].sort().join(','));assert.equal(new Set(keys).size,keys.length);} });
test('first-stage goal remains reachable at 20 to 30 seconds per order across random menus',()=>{
 for(const seconds of [20,26,30])for(let seed=1;seed<=20;seed++){
  let state=seed;const g=new Shift(()=>{state=(state*1664525+1013904223)>>>0;return state/4294967296});g.start();
  let job:{id:number;ready:number}|null=null;
  while(!g.ended){
   if(job&&!g.customers.some(c=>c.id===job!.id))job=null;
   if(!job&&g.customers.length){g.select(g.customers[0].id);g.accept();for(const item of g.current!.items)if(g.stock[item]===0&&g.queued[item]===0)g.cook(item);job={id:g.selected,ready:g.elapsed+seconds};}
   if(job&&g.elapsed>=job.ready){g.select(job.id);for(const item of g.current!.items)g.add(item);g.serve();job=null;}
   g.tick(.25);assert.ok(g.customers.length<=4);
  }
  assert.ok(g.served>=5,`${seconds}s per order, seed ${seed}: ${g.served} served`);assert.equal(g.lost,0);
 }
});

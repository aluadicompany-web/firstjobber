import {test} from 'node:test';
import assert from 'node:assert/strict';
import {Shift} from '../src/game';
test('complete order includes real cooking, inventory, costs and tip',()=>{const g=new Shift(()=>0);g.start();g.accept();g.cook('chicken');g.cook('drink');g.tick(5);g.add('chicken');g.add('drink');g.serve();assert.equal(g.served,1);assert.equal(g.revenue,88);assert.equal(g.costs,22);assert.equal(g.profit,66);assert.deepEqual(g.tray,[])});
test('wrong orders do not consume the tray or reward money',()=>{const g=new Shift(()=>0);g.start();g.accept();g.cook('fries');g.tick(3);g.add('fries');g.serve();assert.equal(g.served,0);assert.deepEqual(g.tray,['fries']);g.clear();assert.equal(g.stock.fries,1)});
test('pause freezes cooking, customer patience and shift clock',()=>{const g=new Shift(()=>0);g.start();g.cook('chicken');g.paused=true;g.tick(20);assert.equal(g.remaining,180);assert.equal(g.current?.patience,55);assert.equal(g.cooking.chicken,5)});
test('customers leave and shift finishes without negative time',()=>{const g=new Shift(()=>0);g.start();g.tick(56);assert.equal(g.lost,1);g.tick(200);assert.equal(g.remaining,0);assert.equal(g.ended,true);const costs=g.costs;g.tick(2);assert.equal(g.costs,costs)});
test('queued cooking is sequential and starts the next piece automatically',()=>{const g=new Shift(()=>0);g.start();g.cook('chicken');g.tick(2);g.cook('chicken');assert.equal(g.cooking.chicken,3);assert.equal(g.queued.chicken,2);g.tick(3);assert.equal(g.stock.chicken,1);assert.equal(g.queued.chicken,1);assert.equal(g.cooking.chicken,5);g.tick(4.5);assert.equal(g.stock.chicken,1);g.tick(.5);assert.equal(g.stock.chicken,2);assert.equal(g.queued.chicken,0);assert.equal(g.cooking.chicken,0);assert.equal(g.costs,36)});
test('time remaining in a tick carries into the next piece and stations run independently',()=>{const g=new Shift(()=>0);g.start();for(let i=0;i<3;i++)g.cook('chicken');g.cook('fries');g.cook('drink');g.tick(12);assert.equal(g.stock.chicken,2);assert.equal(g.cooking.chicken,3);assert.equal(g.queued.chicken,1);assert.equal(g.stock.fries,1);assert.equal(g.stock.drink,1);assert.equal(g.events.filter(e=>e.type==='ready').length,4)});
test('limit five includes pending, storage and tray; refusal charges nothing',()=>{const g=new Shift(()=>0);g.start();for(let i=0;i<6;i++)g.cook('chicken');assert.equal(g.queued.chicken,5);assert.equal(g.costs,90);g.tick(25);assert.equal(g.stock.chicken,5);g.add('chicken');g.cook('chicken');assert.equal(g.queued.chicken,0);assert.equal(g.costs,90);g.clear();assert.equal(g.stock.chicken,5);assert.equal(g.owned('chicken'),5)});
test('serving frees capacity and returning food preserves stock and costs',()=>{const g=new Shift(()=>0);g.start();g.accept();for(let i=0;i<5;i++)g.cook('chicken');g.cook('drink');g.tick(25);g.add('chicken');g.add('drink');g.serve();assert.equal(g.served,1);assert.equal(g.owned('chicken'),4);g.cook('chicken');assert.equal(g.queued.chicken,1);assert.equal(g.owned('chicken'),5);const cost=g.costs;g.add('chicken');g.clear();assert.equal(g.costs,cost);assert.equal(g.owned('chicken'),5)});
test('pause and end freeze queued work, and the end truncates cooking time',()=>{const g=new Shift(()=>0);g.start();g.cook('chicken');g.cook('chicken');g.paused=true;g.tick(10);assert.equal(g.queued.chicken,2);assert.equal(g.cooking.chicken,5);g.paused=false;g.remaining=2;g.tick(20);assert.equal(g.ended,true);assert.equal(g.stock.chicken,0);assert.equal(g.cooking.chicken,3);g.tick(20);assert.equal(g.stock.chicken,0)});
test('random orders do not repeat within each bag or across a round boundary',()=>{
 for(let seed=1;seed<=25;seed++){
  let value=seed;const rng=()=>{value=(value*1664525+1013904223)>>>0;return value/4294967296};
  const g=new Shift(rng);const orders:string[]=[];
  for(let i=0;orders.length<30&&i<100;i++){g.spawn();assert.equal(g.customers.length,1);if(g.customers[0].name!=='เบิร์ด')orders.push([...g.customers[0].items].sort().join(','));g.customers=[];}
  assert.equal(orders.length,30);
  for(let i=0;i<orders.length;i+=5)assert.equal(new Set(orders.slice(i,i+5)).size,5);
  for(let i=1;i<orders.length;i++)assert.notEqual(orders[i],orders[i-1]);
 }
});
test('waiting customers have distinct orders and names, and full queues do not consume recipes',()=>{
 const g=new Shift(()=>0);for(let i=0;i<4;i++)g.spawn();const next=g.nextId;g.spawn();assert.equal(g.nextId,next);
 for(let i=0;i<30;i++){g.customers.shift();g.spawn();const keys=g.customers.map(c=>[...c.items].sort().join(','));assert.equal(new Set(keys).size,keys.length);assert.equal(new Set(g.customers.map(c=>c.name)).size,g.customers.length);}
});
test('random input changes the first order instead of using a fixed cycle',()=>{const a=new Shift(()=>0),b=new Shift(()=>.999);a.start();b.start();assert.notDeepEqual(a.current!.items,b.current!.items);});
test('wrong service shows angry reaction without losing food or adding revenue, correct service smiles once',()=>{
 const g=new Shift(()=>0);g.start();g.accept();g.cook('chicken');g.cook('drink');g.tick(5);g.add('chicken');g.serve();assert.equal(g.reactionEvents.at(-1)?.mood,'angry');assert.deepEqual(g.tray,['chicken']);assert.equal(g.revenue,0);assert.equal(g.served,0);g.add('drink');g.serve();assert.equal(g.reactionEvents.at(-1)?.mood,'happy');assert.equal(g.reactionEvents.at(-1)?.customerId,1);assert.equal(g.served,1);assert.equal(g.revenue,88);g.serve();assert.equal(g.revenue,88);assert.equal(g.reactionEvents.filter(e=>e.mood==='happy').length,1);
});

import {test} from 'node:test';
import assert from 'node:assert/strict';
import {Shift,items,menu,birdChance} from '../src/game';
const seeded=(seed:number)=>()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};
test('Bird roll boundary, normal arrivals, and no duplicate Bird in the waiting queue',()=>{
 const low=new Shift(()=>.949999);low.spawn();assert.notEqual(low.current?.name,'เบิร์ด');
 const high=new Shift(()=>.95);high.spawn();assert.equal(high.current?.name,'เบิร์ด');high.spawn();assert.equal(high.customers.length,2);assert.equal(high.customers.filter(c=>c.name==='เบิร์ด').length,1);
 for(let i=0;i<5;i++)high.spawn();assert.equal(high.customers.length,4);
});
test('Bird orders have six random pieces, at most five per type, with about five percent arrivals',()=>{
 const g=new Shift(seeded(42));let birds=0;const recipes=new Set<string>();
 for(let i=0;i<20000;i++){g.customers=[];g.spawn();if(g.current?.name==='เบิร์ด'){birds++;assert.equal(g.current.items.length,6);for(const item of items)assert.ok(g.current.items.filter(i=>i===item).length<=5);recipes.add([...g.current.items].sort().join(','));}}
 assert.ok(Math.abs(birds/20000-birdChance)<.01,`${birds}/20000`);assert.ok(recipes.size>10);
});
test('both days can cook, reject an incomplete tray, and serve all six pieces exactly once',()=>{
 for(const day of [1,2] as const){const g=new Shift(()=>.999,day,day===2?'chicken':null);g.start();assert.equal(g.current?.name,'เบิร์ด');assert.equal(g.current?.maxPatience,day===2?22:27.5);const order=[...g.current!.items];g.accept();for(const item of order)g.cook(item);const duration=Math.max(...items.map(item=>order.filter(i=>i===item).length*g.cookSeconds(item)));g.tick(duration);g.add(order[0]);g.serve();assert.equal(g.served,0);assert.equal(g.reactionEvents.at(-1)?.mood,'angry');for(const item of order.slice(1))g.add(item);assert.equal(g.tray.length,6);assert.equal(g.trayMatches,true);g.serve();assert.equal(g.served,1);assert.equal(g.tray.length,0);assert.equal(g.costs,order.reduce((n,i)=>n+menu[i].cost,0));assert.equal(g.revenue,order.reduce((n,i)=>n+menu[i].price,0)*2);assert.equal(g.reactionEvents.at(-1)?.mood,'happy');const revenue=g.revenue;g.serve();assert.equal(g.revenue,revenue);}
});

test('Bird pays twice the food price while wrong service is fined once, including subsequent timeout',()=>{
 const g=new Shift(()=>.999);g.start();const bird=g.current!,price=bird.items.reduce((n,i)=>n+menu[i].price,0);g.accept();g.serve();assert.equal(g.penalties,price);g.serve();assert.equal(g.penalties,price);g.tick(27.5);assert.equal(g.penalties,price);assert.equal(g.profit,-price);assert.equal(g.moneyEvents.filter(e=>e.amount===-price).length,1);
});
test('Bird timeout without acceptance and closing with an unfulfilled Bird each charge exactly once',()=>{
 for(const closing of [false,true]){const g=new Shift(()=>.999,2);g.start();const price=g.current!.items.reduce((n,i)=>n+menu[i].price,0);if(closing)g.remaining=1;g.tick(closing?1:22);assert.equal(g.penalties,price);assert.equal(g.revenue,0);assert.equal(g.profit,-price);g.tick(.1);assert.equal(g.penalties,price);}
});
test('successful Bird delivery before timeout has no fine and normal customers keep their original patience',()=>{
 const g=new Shift(()=>.999,2);g.start();g.accept();const order=[...g.current!.items];for(const i of order)g.cook(i);g.tick(5);for(const i of order)g.add(i);g.serve();assert.equal(g.penalties,0);assert.equal(g.revenue,2*order.reduce((n,i)=>n+menu[i].price,0));const ordinary=new Shift(()=>0,2);ordinary.start();assert.equal(ordinary.current!.maxPatience,44);
});

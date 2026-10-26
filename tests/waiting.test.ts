import {test} from 'node:test';
import assert from 'node:assert/strict';
import {Shift,menu} from '../src/game';
test('ten-second reception window resets once on acceptance and freezes during pause',()=>{
 const g=new Shift(()=>0);g.start();assert.equal(g.current!.accepted,false);assert.equal(g.current!.patience,10);g.tick(9);g.accept();assert.equal(g.current!.patience,45);g.tick(4);g.accept();assert.equal(g.current!.patience,41);g.paused=true;g.tick(20);assert.equal(g.current!.patience,41);
 const h=new Shift(()=>0);h.start();h.tick(10);assert.equal(h.lost,1);assert.equal(h.current!.id,2);assert.equal(h.current!.patience,10);assert.equal(h.reactionEvents[0].mood,'angry');
});
for(const day of [1,2] as const)for(const bird of [false,true])test(`day ${day} ${bird?'Bird':'ordinary'} food timer and exact payment thresholds`,()=>{
 for(const [ratio,factor,mood] of [[1,1.1,'happy'],[.7,1.1,'happy'],[.699,1,'neutral'],[.4,1,'neutral'],[.399,.95,'angry'],[.2,.95,'angry'],[.199,0,'angry']] as const){
  const g=new Shift(()=>bird?.999:0,day);g.start();assert.equal(g.current!.maxPatience,10);g.accept();const c=g.current!,base=c.items.reduce((n,i)=>n+menu[i].price,0);assert.equal(c.maxPatience,(day===1?45:36)*(bird?.5:1));c.patience=c.maxPatience*ratio;g.tray=[...c.items];g.serve();assert.equal(g.served,1);assert.equal(g.revenue,Math.round(base*(bird?2:1)*factor*100)/100,`ratio ${ratio}`);assert.equal(g.reactionEvents.at(-1)!.mood,mood);assert.equal(g.tray.length,0);assert.equal(g.penalties,bird&&!factor?base:0);g.serve();assert.equal(g.served,1);
 }
});
test('accepted orders expire with no revenue; Bird penalty is charged once',()=>{
 for(const bird of [false,true]){const g=new Shift(()=>bird?.999:0);g.start();g.accept();const c=g.current!,price=c.items.reduce((n,i)=>n+menu[i].price,0);g.tick(c.maxPatience);assert.equal(g.revenue,0);assert.equal(g.lost,1);assert.equal(g.penalties,bird?price:0);assert.equal(g.reactionEvents.at(-1)!.mood,'angry');}
});

test('discounted daily profit is rounded to cents without floating point tails',()=>{const g=new Shift(()=>0);g.start();g.accept();g.costs=22;g.current!.patience=g.current!.maxPatience*.3;g.tray=[...g.current!.items];g.serve();assert.equal(g.revenue,74.1);assert.equal(g.profit,52.1);});

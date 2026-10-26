import {test} from 'node:test';
import assert from 'node:assert/strict';
import {Shift} from '../src/game';
import {Campaign} from '../src/campaign';
import {Nabi} from '../src/nabi';
function serveOne(g:Shift){
 const id=g.nextId++;g.customers=[{id,name:'ลูกค้าทดสอบ',items:['drink'],patience:g.patienceSeconds,maxPatience:g.patienceSeconds,accepted:false}];g.selected=id;
 g.accept();g.cook('drink');g.tick(1);g.add('drink');g.serve();
}
test('Nabi arrives exactly at every ten successful orders in either stage, without changing customer slots or finance',()=>{
 for(const stage of [1,2] as const){const g=new Shift(()=>0,stage);g.start();for(let i=1;i<=20;i++){serveOne(g);assert.equal(g.served,i);assert.equal(g.nabi.visits,Math.floor(i/10));if(i%10===0){assert.equal(g.nabi.active,true);assert.equal(g.nabi.elapsed,0);assert.equal(g.customers.length,1);assert.notEqual(g.current?.name,'นาบี');}assert.equal(g.revenue,i*29);assert.equal(g.costs,i*4);assert.equal(g.lost,0);}}
});
test('rejected serving never triggers a visit and pause freezes both position and visit time',()=>{
 const g=new Shift(()=>0);g.start();for(let i=0;i<9;i++)serveOne(g);g.serve();assert.equal(g.nabi.visits,0);assert.equal(g.served,9);serveOne(g);g.tick(2);const before=[g.nabi.x,g.nabi.y,g.nabi.elapsed];g.paused=true;g.tick(20);assert.deepEqual([g.nabi.x,g.nabi.y,g.nabi.elapsed],before);g.paused=false;g.tick(6);assert.equal(g.nabi.active,false);assert.equal(g.nabi.visits,1);
});
test('Nabi changes direction, exits at eight seconds, and queues a rapid second milestone',()=>{
 const n=new Nabi();n.arrive();const entrance=[n.x,n.y];n.tick(2);assert.notDeepEqual([n.x,n.y],entrance);assert.equal(n.facing,-1);n.tick(2);assert.equal(n.facing,1);n.arrive();assert.equal(n.pending,1);n.tick(4);assert.equal(n.visits,2);assert.equal(n.elapsed,0);n.tick(8);assert.equal(n.active,false);assert.deepEqual([n.x,n.y],entrance);n.tick(10);assert.equal(n.visits,2);
});
test('closing cancels Nabi, and next stage starts with its own served counter and no visitor',()=>{
 const c=new Campaign(()=>0);c.shift.start();for(let i=0;i<10;i++)serveOne(c.shift);c.shift.remaining=.1;c.shift.tick(.1);assert.equal(c.shift.ended,true);assert.equal(c.shift.nabi.active,false);assert.equal(c.shift.nabi.pending,0);c.openUpgrades();c.chooseUpgrade('fries');c.startDayTwo();assert.equal(c.shift.served,0);assert.equal(c.shift.nabi.visits,0);assert.equal(c.shift.nabi.active,false);for(let i=0;i<10;i++)serveOne(c.shift);assert.equal(c.shift.nabi.visits,1);
});

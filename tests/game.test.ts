import {test} from 'node:test';
import assert from 'node:assert/strict';
import {Shift} from '../src/game';
test('complete order includes real cooking, inventory, costs and tip',()=>{const g=new Shift();g.start();g.accept();g.cook('chicken');g.cook('drink');g.tick(5);g.add('chicken');g.add('drink');g.serve();assert.equal(g.served,1);assert.equal(g.revenue,88);assert.equal(g.costs,22);assert.equal(g.profit,66);assert.deepEqual(g.tray,[])});
test('wrong orders do not consume the tray or reward money',()=>{const g=new Shift();g.start();g.accept();g.cook('fries');g.tick(3);g.add('fries');g.serve();assert.equal(g.served,0);assert.deepEqual(g.tray,['fries']);g.clear();assert.equal(g.stock.fries,1)});
test('pause freezes cooking, customer patience and shift clock',()=>{const g=new Shift();g.start();g.cook('chicken');g.paused=true;g.tick(20);assert.equal(g.remaining,180);assert.equal(g.current?.patience,55);assert.equal(g.cooking.chicken,5)});
test('customers leave and shift finishes without negative time',()=>{const g=new Shift();g.start();g.tick(56);assert.equal(g.lost,1);g.tick(200);assert.equal(g.remaining,0);assert.equal(g.ended,true);const costs=g.costs;g.tick(2);assert.equal(g.costs,costs)});

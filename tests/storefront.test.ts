import {test} from 'node:test';
import assert from 'node:assert/strict';
import {daylight} from '../src/storefront';
test('daylight transitions from day to sunset to night and clamps outside business hours',()=>{const morning=daylight(600),sunset=daylight(1080),night=daylight(1320);assert.equal(morning.night,0);assert.equal(morning.dusk,0);assert.equal(sunset.dusk,1);assert.equal(night.night,1);assert.notEqual(morning.sky,sunset.sky);assert.notEqual(sunset.sky,night.sky);assert.deepEqual(daylight(0),morning);assert.deepEqual(daylight(2000),night);});
test('lighting interpolates continuously with game time',()=>{const a=daylight(1050),b=daylight(1051);assert.ok(Math.abs(a.night-b.night)<.01);assert.ok(Math.abs(a.dusk-b.dusk)<.01);assert.ok(Math.abs(a.sunShift-b.sunShift)<1);assert.notEqual(a.sky,b.sky);});

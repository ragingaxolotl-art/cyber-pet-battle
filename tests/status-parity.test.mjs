import test from 'node:test';
import assert from 'node:assert/strict';
import {Arena,fighter} from '../site/engine.js';
import {freshAttack,defaultStats,simulate} from '../site/shared/combat-model.js';
import {refreshStatus,statusDuration} from '../site/shared/status-rules.js';
const stats={...defaultStats(),focus:0};
for(const kind of ['burn','poison','regen'])for(const hitLimit of [1,5])test(`${kind} preview/Arena tick parity with ${hitLimit} hits`,()=>{
 const a={...freshAttack(),startup:0,active:25,recovery:0,base:0,coefficient:0,knockback:0,hitstun:0,status:kind,statusPower:3,statusDuration:30,statusInterval:10,hitInterval:5,hitLimit};
 const sim=simulate(a,stats,stats,{distance:50,targetHP:.5});
 const p=fighter('P',stats),o=fighter('O',stats),arena=new Arena(p,o,[a]);p.x=450;o.x=500;o.hp=o.maxHP*.5;arena.paused=false;arena.ai=false;arena.attack(p,a);
 for(let age=0;age<sim.frames.length;age++){arena.tick();assert.equal(o.hp,sim.frames[age].target.hp,`HP at cast frame ${age}`);}
});
test('resistance shortens harmful effects only, never to zero frames',()=>{
 for(const status of ['regen','haste'])assert.equal(statusDuration({status,statusDuration:30},.75),30);
 for(const status of ['burn','poison','slow','weaken','stun'])assert.equal(statusDuration({status,statusDuration:30},.75),23);
 assert.equal(statusDuration({status:'stun',statusDuration:1},0),1);
});
test('refresh keeps tick schedule while updating duration and power',()=>{
 const a={status:'burn',statusPower:3,statusInterval:10,statusDuration:30};
 const first=refreshStatus(null,a,0);const next=refreshStatus(first,{...a,statusPower:5},8);
 assert.equal(next.next,10);assert.equal(next.until,38);assert.equal(next.power,5);
});

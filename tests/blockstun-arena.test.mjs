import test from 'node:test';import assert from 'node:assert/strict';
import {Arena,fighter} from '../site/engine.js';import {freshAttack,defaultStats} from '../site/shared/combat-model.js';
function setup(){const a={...freshAttack(),startup:0,active:1,cost:0,contactFeedback:{blockstop:2,blockstun:3}},p=fighter('A',defaultStats()),o=fighter('B',defaultStats()),arena=new Arena(p,o,[a]);arena.ai=false;arena.paused=false;o.x=p.x+35;arena.attack(o,a);arena.tick(new Set(['Shift']));return {a,p,o,arena};}
test('blockstun retains guard and prevents movement after releasing block',()=>{
 const {a,p,arena}=setup(),x=p.x;assert.equal(arena.hitstopRemaining,2);assert.equal(p.blockstunUntil,5);
 for(let i=0;i<2;i++)arena.tick();assert.equal(arena.frame,1);assert.equal(arena.dodge(p),'Recovering from a block');assert.equal(arena.jump(p),'Recovering from a block');assert.equal(arena.attack(p,a),false);
 for(let i=0;i<3;i++){arena.tick(new Set(['ArrowLeft','ArrowUp']));assert.equal(p.x,x);assert.equal(p.y,0);assert.equal(p.guarding,true);}
 arena.tick(new Set(['ArrowLeft']));assert.equal(p.guarding,false);assert.ok(p.x<x);
});
test('blockstun preserves defense strength and reset clears guard lock',()=>{
 const {p,arena}=setup();assert.equal(p.blockstunReduction,p.guard);arena.training=true;arena.resetDummy();assert.equal(p.blockstunUntil,0);
});

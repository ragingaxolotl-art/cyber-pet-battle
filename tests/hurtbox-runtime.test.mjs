import test from 'node:test';import assert from 'node:assert/strict';
import {Arena,fighter} from '../site/shared/combat-runtime.js';import {freshAttack,defaultStats,validateAttack} from '../site/shared/combat-model.js';
function setup(boxes){
 const hit={...freshAttack(),startup:0,active:10,recovery:0,cost:0,base:10,coefficient:0,knockback:0,hitstun:0};
 const defend={...freshAttack('heal'),startup:0,active:10,recovery:0,cost:0,base:0,coefficient:0,hurtboxes:{frames:[{boxes}]}};validateAttack(defend);
 const p=fighter('P',defaultStats()),q=fighter('Q',defaultStats()),arena=new Arena(p,q,[hit,defend]);p.x=100;q.x=150;arena.ai=false;arena.paused=false;arena.attack(q,defend);arena.attack(p,hit);return {arena,p,q};
}
test('defender authored region changes actual attack contact',()=>{
 const {arena,q}=setup([{x:-14,y:-200,w:28,h:20,shape:'rectangle'}]);arena.tick();assert.equal(q.hp,q.maxHP);
});
test('multiple overlapping vulnerable regions do not multiply ordinary damage',()=>{
 const box={x:-14,y:-60,w:28,h:60,shape:'rectangle'}, {arena,q}=setup([box,{...box}]);arena.tick();assert.equal(q.maxHP-q.hp,10);
});
test('expired or interrupted defender action restores default body',()=>{
 const {arena,q}=setup([{x:-14,y:-200,w:28,h:20,shape:'rectangle'}]);assert.equal(arena.hurtboxesFor(q)[0].y,-200);
 arena.frame=q.cast.start+100;assert.equal(arena.hurtboxesFor(q)[0].y,-60);
 q.cast=null;q.crouch=true;assert.equal(arena.hurtboxesFor(q)[0].h,34);
});

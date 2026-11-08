import test from 'node:test';
import assert from 'node:assert/strict';
import {Arena,fighter} from '../site/engine.js';
import {defaultStats} from '../site/shared/combat-model.js';
function setup(){
 const p=fighter('Player',defaultStats()),o=fighter('Opponent',defaultStats());
 const arena=new Arena(p,o,[],{training:true});arena.paused=false;arena.frame=10;
 const cast={start:5,a:{movementCancels:[{id:'movement_dodge',action:'dodge',start:5,duration:3,condition:'hit',cost:4}]},outcomes:new Set(['hit'])};
 p.cast=cast;p.cooldowns.set('original',50);return {p,arena,cast};
}
test('eligible dodge consumes its cost once and preserves original cooldown and cast outcomes',()=>{
 const {p,arena,cast}=setup(),energy=p.energy;
 assert.equal(arena.dodge(p),'');assert.equal(p.cast,null);assert.equal(p.energy,energy-Math.ceil(4*p.cost));assert.equal(p.cooldowns.get('original'),50);assert.deepEqual([...cast.outcomes],['hit']);
 assert.ok(arena.dodge(p));assert.equal(p.energy,energy-Math.ceil(4*p.cost));
});
for(const [name,change] of Object.entries({cooldown:({p})=>p.dodgeReady=20,energy:({p})=>p.energy=0,stun:({p})=>p.stun=20,recovery:({p})=>p.reaction='airborne',early:({arena})=>arena.frame=9,late:({arena})=>arena.frame=13,miss:({cast})=>cast.outcomes.clear()}))test(`failed ${name} dodge preserves attack and energy`,()=>{
 const state=setup();change(state);const energy=state.p.energy;
 assert.ok(state.arena.dodge(state.p));assert.equal(state.p.cast,state.cast);assert.equal(state.p.energy,energy);assert.equal(state.p.dodgeUntil,0);
});
test('movement cancellation preserves already launched independent projectiles',()=>{
 const {p,arena,cast}=setup();cast.projectileLaunched=true;
 const projectile={owner:p,cast};arena.projectiles.entries.push(projectile);
 assert.equal(arena.dodge(p),'');assert.equal(arena.projectiles.entries[0],projectile);assert.equal(projectile.cast,cast);
});
function jumping(){const state=setup();state.cast.a.movementCancels[0].action='jump';return state;}
test('jump cancel launches once and retains attack cooldown',()=>{
 const {p,arena}=jumping(),energy=p.energy;
 assert.equal(arena.jump(p),'');assert.equal(p.cast,null);assert.ok(p.vy<0);assert.equal(p.energy,energy-Math.ceil(4*p.cost));assert.equal(p.cooldowns.get('original'),50);
 assert.equal(arena.jump(p),'Land before jumping');assert.equal(p.energy,energy-Math.ceil(4*p.cost));
});
for(const [name,change] of Object.entries({airborne:({p})=>p.y=-1,verticalMotion:({p})=>p.vy=1,crouch:({p})=>p.crouch=true,guard:({p})=>p.guarding=true,energy:({p})=>p.energy=0,stun:({p})=>p.stun=20,missingArtwork:({p})=>p.pet={config:{},images:new Map()},late:({arena})=>arena.frame=13}))test(`failed ${name} jump leaves cast and resources intact`,()=>{
 const state=jumping();change(state);const energy=state.p.energy,velocity=state.p.vy;
 assert.ok(state.arena.jump(state.p));assert.equal(state.p.cast,state.cast);assert.equal(state.p.energy,energy);assert.equal(state.p.vy,velocity);
});
test('existing upward input triggers an eligible jump cancel in the simulation',()=>{
 const {p,arena}=jumping();arena.frame=9;arena.tick(new Set(['ArrowUp']));assert.equal(p.cast,null);assert.ok(p.y<0);assert.ok(p.vy<0);
});
function dashing(direction='forward',facing=1){const state=setup();Object.assign(state.cast.a.movementCancels[0],{action:'dash',direction});state.p.x=450;state.arena.fighters[1].x=450+150*facing;return state;}
for(const facing of [-1,1])for(const direction of ['forward','backward','input'])test(`dash travels exactly twelve frames: ${direction}, facing ${facing}`,()=>{
 const {p,arena}=dashing(direction,facing),start=p.x;
 assert.equal(arena.dash(p,-1),'');assert.equal(p.cast,null);
 const sign=direction==='input'?-1:facing*(direction==='backward'?-1:1);
 for(let i=0;i<12;i++)arena.tick();assert.equal(p.x,start+sign*60);
 arena.tick();assert.equal(p.x,start+sign*60);assert.equal(p.sprinting,false);
});
for(const [name,change] of Object.entries({cooldown:({p})=>p.dashReady=20,airborne:({p})=>p.y=-1,energy:({p})=>p.energy=0,stun:({p})=>p.stun=20,missingArtwork:({p})=>p.pet={config:{},images:new Map()},late:({arena})=>arena.frame=13}))test(`failed ${name} dash preserves cast and resources`,()=>{
 const state=dashing();change(state);const energy=state.p.energy;
 assert.ok(state.arena.dash(state.p));assert.equal(state.p.cast,state.cast);assert.equal(state.p.energy,energy);assert.equal(state.p.dashUntil,0);
});
test('input-directed dash needs explicit direction and charges once',()=>{
 const {p,arena,cast}=dashing('input'),energy=p.energy;
 assert.ok(arena.dash(p));assert.equal(p.cast,cast);assert.equal(p.energy,energy);
 assert.equal(arena.dash(p,1),'');assert.equal(p.energy,energy-Math.ceil(4*p.cost));assert.ok(arena.dash(p,1));
 assert.ok(arena.jump(p));assert.ok(arena.dodge(p));
});
test('stun cancels remaining dash travel and does not resume on recovery',()=>{
 const {p,arena}=dashing();arena.dash(p);arena.tick();const x=p.x;p.stun=arena.frame+2;
 arena.tick();assert.equal(p.x,x);assert.equal(p.dashUntil,0);arena.tick();arena.tick();assert.equal(p.x,x);
});
test('dash ignores opposite walking input and clamps arena boundaries',()=>{
 const {p,arena}=dashing();p.x=920;arena.fighters[1].x=940;arena.dash(p);
 for(let i=0;i<12;i++)arena.tick(new Set(['ArrowLeft']));assert.equal(p.x,925);
});

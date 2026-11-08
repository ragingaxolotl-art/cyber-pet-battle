import test from 'node:test';import assert from 'node:assert/strict';
import {Arena,fighter} from '../site/engine.js';import {freshAttack,defaultStats} from '../site/shared/combat-model.js';
function setup(rule){const a={...freshAttack('projectile'),startup:0,active:200,cost:0,projectileLifetime:200,projectileSpeed:6,projectileSteering:rule},p=fighter('A',defaultStats()),o=fighter('B',defaultStats()),arena=new Arena(p,o,[a]);p.x=100;o.x=800;arena.ai=false;arena.paused=false;arena.attack(p,a);arena.tick();return {a,p,o,arena,projectile:arena.projectiles.entries[0]};}
test('Arena homing updates once per combat frame and pauses during hitstop',()=>{
 const {arena,projectile,p,o}=setup({mode:'homing',turnRate:10});o.y=-100;
 arena.tick();const state=structuredClone(projectile.cast.steering);assert.ok(state.y< -30);
 arena.prepareCast(p,o,projectile.cast);arena.prepareCast(p,o,projectile.cast);assert.deepEqual(projectile.cast.steering,state);
 arena.hitstopRemaining=3;for(let i=0;i<3;i++)arena.tick();assert.deepEqual(projectile.cast.steering,state);
 arena.tick();assert.notEqual(projectile.cast.steering.x,state.x);
});
test('returning projectile is removed when caught without damaging its owner',()=>{
 const {arena,p}=setup({mode:'return',turnRate:180,returnAfter:4});const hp=p.hp;
 for(let i=0;i<30;i++)arena.tick();assert.equal(arena.projectiles.entries.length,0);assert.equal(p.hp,hp);assert.ok(arena.events.some(e=>e.text==='PROJECTILE RETURNED'));
});
test('reflection preserves steering position and lifetime while reversing heading',()=>{
 const {arena,projectile,o}=setup({mode:'homing',turnRate:10});arena.tick();const prior=structuredClone(projectile.cast.steering),expires=projectile.expires;
 arena.reflectProjectile(projectile,o);assert.equal(projectile.owner,o);assert.equal(projectile.expires,expires);assert.equal(projectile.cast.steering.x,prior.x);assert.equal(projectile.cast.steering.y,prior.y);assert.equal(projectile.cast.steering.spawnFrame,prior.spawnFrame);
 arena.tick();assert.ok(projectile.cast.steering.x<prior.x);
});
test('steering keeps grouped collision offsets before and after reflection',()=>{
 const {arena,projectile,p,o}=setup({mode:'homing',turnRate:10});const a=projectile.cast.a;
 a.hitboxGroups=[{id:'group_one',hitLimit:1,hitInterval:1,boxes:[{...a.box,id:'box_one',x:a.box.x+12,y:a.box.y-5,w:20,h:20,start:0,duration:100}]}];
 arena.tick();let shot=arena.prepareCast(p,o,projectile.cast);assert.ok(Math.abs(shot.boxes[0].x-shot.box.x-12)<1e-8);assert.ok(Math.abs(shot.boxes[0].y-shot.box.y+5)<1e-8);
 arena.reflectProjectile(projectile,o);shot=arena.prepareCast(o,p,projectile.cast);assert.ok(Math.abs(shot.boxes[0].x-shot.box.x-(a.box.w-12-20))<1e-8);assert.ok(Math.abs(shot.boxes[0].y-shot.box.y+5)<1e-8);
});


import {compareAttacks} from '../site/matchup.js';
test('comparison explains each return exactly once without catch damage',()=>{
 const a={...freshAttack('projectile'),startup:0,active:120,cost:0,projectileLifetime:120,projectileSpeed:3,projectileSteering:{mode:'return',turnRate:90,returnAfter:12}};
 const result=compareAttacks(a,{...a,id:'attack_other'}, {distance:400,frames:180});
 const returns=result.rows.filter(row=>row.event.startsWith('Projectile returned to owner:'));
 assert.equal(returns.length,2);assert.deepEqual(new Set(returns.map(row=>row.actor)),new Set(['A','B']));assert.deepEqual(result.damage,[0,0]);assert.equal(result.remainingProjectiles,0);
});

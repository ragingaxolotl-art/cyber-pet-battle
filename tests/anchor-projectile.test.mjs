import test from 'node:test';import assert from 'node:assert/strict';
import {Arena,fighter} from '../site/shared/combat-runtime.js';
import {freshAttack,defaultStats,simulate,validateAttack} from '../site/shared/combat-model.js';
const stats=defaultStats();
const attack=()=>({...freshAttack('projectile'),startup:0,active:60,recovery:0,cost:0,base:10,coefficient:0,hitLimit:1,hitstun:0,knockback:0,projectileSpeed:2,projectileLifetime:60,
 poseTiming:'custom',poseDurations:[.1,.1],animationAnchors:{frames:[{id:'launch',points:{hand:{x:20,y:-30}}},{id:'later',points:{hand:{x:150,y:-150}}}]},box:{x:0,y:0,w:10,h:10,shape:'rectangle',anchor:'hand'}});
for(const direction of [-1,1])for(const grouped of [false,true])test(`anchored projectile contact parity facing${direction} grouped${grouped}`,()=>{
 const a=attack();if(grouped)a.hitboxGroups=[{id:'group_hand',hitLimit:1,hitInterval:1,boxes:[{...a.box,id:'box_hand',start:0,duration:60}]}];validateAttack(a);
 const sim=simulate(a,stats,stats,{distance:100,facing:direction,targetSide:direction,targetHP:1});
 const p=fighter('P',stats),q=fighter('Q',stats),arena=new Arena(p,q,[a]);p.x=450;q.x=450+100*direction;arena.ai=false;arena.paused=false;arena.attack(p,a);
 for(let frame=0;frame<45;frame++){arena.tick();assert.equal(q.hp,sim.frames[frame].target.hp,`frame ${frame}`);}
 assert.equal(q.maxHP-q.hp,10);
});
test('anchored split children and reflection preserve launch positions and lifetime',()=>{
 const a=attack();a.projectileSplit={afterFrames:3,count:3,spread:30,speed:4,lifetime:30};
 const p=fighter('P',stats),q=fighter('Q',stats),arena=new Arena(p,q,[a]);p.x=100;q.x=800;arena.ai=false;arena.paused=false;arena.attack(p,a);
 for(let frame=0;frame<8;frame++)arena.tick();assert.equal(arena.projectiles.entries.length,3);
 for(const child of arena.projectiles.entries){const before=arena.prepareCast(child.owner,child.target,child.cast).box,expires=child.expires;
 assert.ok(before.x<200);assert.ok(before.y>-80);
 arena.reflectProjectile(child,q);const after=arena.prepareCast(child.owner,child.target,child.cast).box;
 assert.equal(after.x,before.x);assert.equal(after.y,before.y);assert.equal(child.expires,expires);}
});

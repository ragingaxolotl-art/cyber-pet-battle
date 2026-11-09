import test from 'node:test';
import assert from 'node:assert/strict';
import {freshAttack,defaultStats,validateAttack,worldBox} from '../site/shared/combat-model.js';
const stats=defaultStats();
function anchored(){return {...freshAttack(),poseTiming:'custom',poseDurations:[.1,.1],
 animationAnchors:{frames:[{id:'first',points:{hand:{x:10,y:-10}}},{id:'second',points:{hand:{x:50,y:-30}}}]},
 box:{x:2,y:3,w:8,h:6,shape:'rectangle',anchor:'hand'}};}
test('bound hitboxes follow authored points and mirror the entire box',()=>{
 const a=anchored(); validateAttack(a);
 assert.equal(worldBox(a,0,stats).x,12);
 assert.equal(worldBox(a,6,stats).x,52);
 assert.equal(worldBox(a,6,stats).y,-27);
 assert.equal(worldBox(a,6,stats,-1).x,-60);
});
test('projectiles retain their launch anchor after later pose changes',()=>{
 const a=anchored();a.delivery='projectile';a.startup=0;a.projectileStart=0;a.projectileSpeed=2;
 const start=worldBox(a,0,stats),later=worldBox(a,12,stats);
 assert.equal(later.x-start.x,24);assert.equal(later.y,start.y);
 assert.equal(worldBox(a,12,stats,-1).x,-later.x-later.w);
});
test('primary and grouped bindings reject missing points',()=>{
 const a=anchored(); delete a.animationAnchors.frames[1].points.hand;
 assert.throws(()=>validateAttack(a),/every animation frame/);
 const b=anchored(); delete b.box.anchor;
 b.hitboxGroups=[{id:'group_hand',hitLimit:1,hitInterval:1,boxes:[{...b.box,id:'box_hand',start:0,duration:1,anchor:'tail'}]}];
 assert.throws(()=>validateAttack(b),/every animation frame/);
});

import {simulate} from '../site/shared/combat-model.js';
import {Arena,fighter} from '../site/shared/combat-runtime.js';
import {posePlayback} from '../site/shared/pose-timing.js';
for(const facing of [-1,1])for(const grouped of [false,true])test(`anchor contact parity facing${facing} grouped${grouped}`,()=>{
 const a=anchored();Object.assign(a,{startup:0,active:12,recovery:0,cost:0,base:10,coefficient:0,knockback:0,hitstun:0,hitLimit:1});
 if(grouped)a.hitboxGroups=[{id:'group_hand',hitLimit:1,hitInterval:1,boxes:[{...a.box,id:'box_hand',start:0,duration:12}]}];
 validateAttack(a);
 const sim=simulate(a,stats,stats,{distance:50,facing,targetSide:facing,targetHP:1});
 const p=fighter('P',stats),q=fighter('Q',stats),arena=new Arena(p,q,[a]);p.x=450;q.x=450+50*facing;arena.ai=false;arena.paused=false;arena.attack(p,a);
 for(let frame=0;frame<12;frame++){
  arena.tick();assert.equal(q.hp,sim.frames[frame].target.hp,`frame ${frame}`);
  if(frame<6)assert.equal(q.hp,q.maxHP);
 }
 assert.equal(q.maxHP-q.hp,10);
});
test('anchor-driven synced animation cannot wait on its own collision',()=>{
 const a=anchored();a.poseTiming='synced';a.poseImpact=2;
 const timing={startup:6,active:2,recovery:6};
 for(const frame of [0,5,6,7,10,14]){
  const expected=posePlayback(a,2,frame,timing);
  assert.deepEqual(posePlayback(a,12,frame,timing,Infinity),expected);
  assert.deepEqual(posePlayback(a,5,frame,timing,30),expected);
 }
});

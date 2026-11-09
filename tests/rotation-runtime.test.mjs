import test from 'node:test';import assert from 'node:assert/strict';
import {freshAttack,defaultStats,validateAttack,worldBox,simulate} from '../site/shared/combat-model.js';
import {shapePoints} from '../site/shared/hitbox-shapes.js';import {Arena,fighter} from '../site/shared/combat-runtime.js';
const stats=defaultStats();
test('facing mirrors the complete rotated shape about the attacker',()=>{
 for(const shape of ['rectangle','diamond','triangle']){const a={...freshAttack(),box:{x:10,y:-30,w:60,h:8,shape,rotation:37}},right=shapePoints(worldBox(a,0,stats,1)),left=shapePoints(worldBox(a,0,stats,-1));
 for(const p of right)assert.ok(left.some(q=>Math.abs(p.x+q.x)<1e-8&&Math.abs(p.y-q.y)<1e-8));}
});
for(const shape of ['rectangle','ellipse','diamond','triangle'])for(const direction of [-1,1])for(const grouped of [false,true])test(`rotated contact parity ${shape} facing${direction} grouped${grouped}`,()=>{
 const a={...freshAttack(),startup:0,active:1,recovery:0,cost:0,base:10,coefficient:0,knockback:0,hitstun:0,box:{x:10,y:-40,w:80,h:8,shape,rotation:90}};
 if(grouped)a.hitboxGroups=[{id:'group_rotated',hitLimit:1,hitInterval:1,boxes:[{...a.box,id:'box_rotated',start:0,duration:1}]}];validateAttack(a);
 const sim=simulate(a,stats,stats,{distance:50,facing:direction,targetSide:direction,targetHP:1});
 const p=fighter('P',stats),q=fighter('Q',stats),arena=new Arena(p,q,[a]);p.x=450;q.x=450+direction*50;arena.ai=false;arena.paused=false;arena.attack(p,a);arena.tick();
 assert.equal(q.maxHP-q.hp,10);assert.equal(q.hp,sim.frames[0].target.hp);
});
test('invalid primary and grouped angles are rejected without coercion',()=>{
 for(const rotation of [null,'30',NaN,Infinity,-181,181]){const a=freshAttack();a.box.rotation=rotation;assert.throws(()=>validateAttack(a),/rotation/);delete a.box.rotation;a.hitboxGroups=[{id:'group_rotated',hitLimit:1,hitInterval:1,boxes:[{...a.box,shape:'rectangle',rotation,id:'box_rotated',start:0,duration:1}]}];assert.throws(()=>validateAttack(a),/rotation/);}
});

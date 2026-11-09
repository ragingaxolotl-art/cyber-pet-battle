import test from 'node:test';import assert from 'node:assert/strict';
import {Arena,fighter} from '../site/shared/combat-runtime.js';import {freshAttack,defaultStats} from '../site/shared/combat-model.js';import {traceHitbox} from '../site/shared/hitbox-view.js';import {shapePoints} from '../site/shared/hitbox-shapes.js';
test('split children preserve authored angle and reflection mirrors it without moving center or renewing lifetime',()=>{
 const a={...freshAttack('projectile'),startup:0,active:100,cost:0,projectileLifetime:100,projectileSplit:{afterFrames:3,count:3,spread:30,speed:4,lifetime:30}};a.box.rotation=37;
 const p=fighter('P',defaultStats()),q=fighter('Q',defaultStats()),arena=new Arena(p,q,[a]);p.x=100;q.x=800;arena.ai=false;arena.paused=false;arena.attack(p,a);for(let i=0;i<6;i++)arena.tick();
 assert.equal(arena.projectiles.entries.length,3);
 for(const child of arena.projectiles.entries){const before=arena.prepareCast(child.owner,child.target,child.cast).box,expires=child.expires;assert.equal(before.rotation,37);arena.reflectProjectile(child,q);const after=arena.prepareCast(child.owner,child.target,child.cast).box;assert.equal(after.rotation,-37);assert.equal(after.x,before.x);assert.equal(after.y,before.y);assert.equal(child.expires,expires);}
});
test('replay trace uses rotated polygon points and ellipse angle',()=>{
 const calls=[],ctx={beginPath(){},moveTo(...v){calls.push(['move',...v]);},lineTo(...v){calls.push(['line',...v]);},closePath(){},ellipse(...v){calls.push(['ellipse',...v]);}};
 const box={x:20,y:-30,w:60,h:10,shape:'triangle',rotation:45};traceHitbox(ctx,box,250);const points=shapePoints(box);assert.deepEqual(calls[0],['move',points[0].x,250+points[0].y]);
 calls.length=0;traceHitbox(ctx,{...box,shape:'ellipse'},250);assert.equal(calls[0][5],Math.PI/4);
});

import {ProjectileClashes} from '../site/shared/projectile-clashes.js';
import {jugglePreset,sequenceState} from '../site/shared/hit-sequence.js';
import {impactAreaAnchor,createImpactArea} from '../site/shared/projectile-area.js';
test('clashes use rotated shapes outside original bounds and reject empty corners',()=>{
 const a={x:0,y:0,w:80,h:10,shape:'ellipse',rotation:90};
 const shot=(id,box)=>({id,owner:id,durability:1,boxes:[box]});
 const hit=new ProjectileClashes().resolve([shot(1,a),shot(2,{x:39,y:30,w:2,h:2,shape:'rectangle'})]);assert.equal(hit.contacts.length,1);assert.equal(hit.destroyed.size,2);
 const miss=new ProjectileClashes().resolve([shot(1,a),shot(2,{x:2,y:2,w:2,h:2,shape:'rectangle'})]);assert.equal(miss.contacts.length,0);
});
test('reflected attached primary and grouped boxes retain mirrored angles while following target',()=>{
 const primary={x:10,y:-30,w:40,h:30,shape:'rectangle',rotation:35};
 const move={...freshAttack('projectile'),startup:0,active:10,cost:0,projectileLifetime:60,behaviorVersion:2,projectileMode:'attached',box:primary,hitEvents:jugglePreset(3,3),hitboxGroups:[{id:'group_tip',hitLimit:1,hitInterval:1,boxes:[{...primary,id:'box_tip',shape:'triangle',rotation:-25,x:40,w:10,start:0,duration:10}]}]};
 const p=fighter('P',defaultStats()),q=fighter('Q',defaultStats()),arena=new Arena(p,q,[move]);p.x=100;q.x=800;arena.ai=false;arena.paused=false;arena.attack(p,move);arena.tick();const entity=arena.projectiles.entries[0];arena.reflectProjectile(entity,q);entity.cast.sequence=sequenceState();entity.cast.sequence.attached=true;entity.cast.sequence.contactFrame=0;entity.cast.impact=0;
 const first=arena.prepareCast(q,p,entity.cast);assert.equal(first.box.rotation,-35);assert.equal(first.boxes[0].rotation,25);p.x+=40;p.y-=20;const next=arena.prepareCast(q,p,entity.cast);assert.equal(next.box.x-first.box.x,40);assert.equal(next.boxes[0].y-first.boxes[0].y,-20);
});
test('impact area anchors to rotated contacting group center',()=>{
 const box={x:0,y:0,w:80,h:10,shape:'rectangle',rotation:90,groupId:'group_tip'},hurt={x:39,y:30,w:2,h:2},fallback={x:900,y:900,w:1,h:1};
 const anchor=impactAreaAnchor([box],'group_tip',hurt,fallback);assert.equal(anchor,box);
 const a={...freshAttack('projectile'),projectileLifetime:60,projectileContact:'single',projectileArea:{width:40,height:40,duration:20,interval:1,hitLimit:1,damage:5}};
 const area=createImpactArea(a,anchor,0);assert.equal(area.box.x+area.box.w/2,40);assert.equal(area.box.y+area.box.h/2,5);
});

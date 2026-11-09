import test from 'node:test';import assert from 'node:assert/strict';
import {validateHurtboxes,fighterHurtboxes,touchesHurtboxes} from '../site/shared/hurtboxes.js';
const a=()=>({poseTiming:'custom',poseDurations:[.1,.1],hurtboxes:{frames:[{boxes:[{x:10,y:-40,w:20,h:30,shape:'rectangle',rotation:25}]},{boxes:[{x:50,y:-20,w:20,h:20,shape:'ellipse'}]}]}});
test('legacy standing and crouching regions remain unchanged',()=>{
 assert.deepEqual(fighterHurtboxes({x:100,y:0}),[{x:86,y:-60,w:28,h:60,shape:'rectangle'}]);
 assert.equal(fighterHurtboxes({x:100,y:-10,crouch:true})[0].y,-44);
});
test('authored regions follow frame timing and facing',()=>{
 const attack=a();validateHurtboxes(attack);const action={attack,frame:0,timing:{startup:0,active:12,recovery:0}};
 const right=fighterHurtboxes({x:100,y:5,facing:1},action)[0],left=fighterHurtboxes({x:100,y:5,facing:-1},action)[0];
 assert.equal(right.x,110);assert.equal(left.x,70);assert.equal(left.rotation,-25);
 action.frame=6;assert.equal(fighterHurtboxes({x:100,y:5},action)[0].x,150);
});
test('overlapping regions produce one contact and invalid empty frames fail',()=>{
 const box={x:0,y:0,w:10,h:10,shape:'rectangle'};assert.equal(touchesHurtboxes(box,[box,box]),true);
 const attack=a();attack.hurtboxes.frames[0].boxes=[];assert.throws(()=>validateHurtboxes(attack));
});

import {posePlayback,poseSourceFrames} from '../site/shared/pose-timing.js';
import {impactAreaAnchor} from '../site/shared/projectile-area.js';
test('hurtbox-only sequences keep authored timing with differently sized artwork',()=>{
 const attack=a(),tm={startup:6,active:2,recovery:6};delete attack.poseTiming;
 assert.deepEqual(posePlayback(attack,12,8,tm,100),posePlayback(attack,2,8,tm));
 assert.deepEqual(poseSourceFrames(attack,12),[0,6]);
});
test('impact origin uses the contacting hitbox against any vulnerable region',()=>{
 const miss={x:0,y:0,w:10,h:10,shape:'rectangle',groupId:'g'},hit={...miss,x:100};
 const hurt=[{...miss,x:400},{...hit,shape:'ellipse'}];
 assert.equal(impactAreaAnchor([miss,hit],'g',hurt,miss),hit);
});

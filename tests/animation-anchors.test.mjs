import test from 'node:test';
import assert from 'node:assert/strict';
import {validateAnimationAnchors, animationAnchorAt} from '../site/shared/animation-anchors.js';
const timing = {startup: 6, active: 2, recovery: 6};
const attack = () => ({poseTiming:'custom', poseDurations:[0.1,0.2],
 animationAnchors:{frames:[{id:'windup',points:{hand:{x:10,y:-20}}},
 {id:'strike',points:{hand:{x:40,y:-15}}}]}});
test('authored anchors sample custom frame boundaries and mirror without mutation',()=>{
 const a=attack(); validateAnimationAnchors(a);
 assert.deepEqual(animationAnchorAt(a,'hand',5,timing),{x:10,y:-20,frameId:'windup',index:0});
 assert.deepEqual(animationAnchorAt(a,'hand',6,timing,-1),{x:-40,y:-15,frameId:'strike',index:1});
 assert.equal(a.animationAnchors.frames[1].points.hand.x,40);
 assert.equal(animationAnchorAt(a,'tail',6,timing),null);
});
test('stable frame identities and points travel together when sequence is reordered',()=>{
 const a=attack(); a.animationAnchors.frames.reverse(); a.poseDurations.reverse();
 validateAnimationAnchors(a);
 assert.equal(animationAnchorAt(a,'hand',0,timing).frameId,'strike');
 assert.equal(animationAnchorAt(a,'hand',12,timing).frameId,'windup');
});
test('synced anchors follow explicit authored count, including impact hold',()=>{
 const a=attack(); delete a.poseTiming; delete a.poseDurations; a.poseImpact=2;
 assert.equal(animationAnchorAt(a,'hand',0,timing).frameId,'windup');
 assert.equal(animationAnchorAt(a,'hand',6,timing).frameId,'strike');
 assert.equal(animationAnchorAt(a,'hand',100,timing).frameId,'strike');
});
test('invalid or mismatched anchor definitions are rejected',()=>{
 for(const change of [a=>a.animationAnchors.frames[1].id='windup',
 a=>a.poseFrames=[0],a=>a.poseDurations=[0.1],
 a=>a.animationAnchors.frames[0].points.hand.x=Infinity,
 a=>a.animationAnchors.frames[0].points.hand.y=501,
 a=>a.animationAnchors.frames=[]]){
  const a=attack(); change(a); assert.throws(()=>validateAnimationAnchors(a));
 }
 validateAnimationAnchors({});
 assert.equal(animationAnchorAt({},'hand',0,timing),null);
});

// Different artwork lengths must not change the combat anchor clock.
import {posePlayback,poseSourceFrames} from '../site/shared/pose-timing.js';
test('different sprite sheets retain the same authored anchor timing',()=>{
 const a=attack();
 for(const count of [1,2,5,12]) {
  for(const frame of [0,5,6,12,18,40]) {
   assert.equal(posePlayback(a,count,frame,timing).index,
    animationAnchorAt(a,'hand',frame,timing).index);
  }
  const order=poseSourceFrames(a,count);
  assert.equal(order.length,2);
  assert.ok(order.every(n=>Number.isInteger(n)&&n>=0&&n<count));
 }
 assert.deepEqual(poseSourceFrames(a,12),[0,6]);
 assert.deepEqual(poseSourceFrames({...a,poseFrames:[4,1]},12),[4,1]);
});

test('short artwork uses the same last-frame fallback without changing anchor positions',()=>{
 const a=attack();a.poseFrames=[4,1];
 assert.deepEqual(poseSourceFrames(a,2),[1,1]);
 assert.deepEqual(poseSourceFrames(a,1),[0,0]);
 assert.deepEqual(a.poseFrames,[4,1]);
 assert.equal(animationAnchorAt(a,'hand',6,timing).frameId,'strike');
});

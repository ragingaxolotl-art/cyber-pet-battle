import test from 'node:test';import assert from 'node:assert/strict';
import {reflectedProjectileTransform,transformProjectileBox} from '../site/shared/projectile-reflection.js';
test('reflection preserves current bounds and reverses the next horizontal movement',()=>{
 const box={x:100,y:-30,w:20,h:10,shape:'triangle',facing:1},before=structuredClone(box);
 const reflection=reflectedProjectileTransform(null,box);
 assert.deepEqual(transformProjectileBox(box,reflection),{...box,facing:-1});
 assert.deepEqual(transformProjectileBox({...box,x:110,y:-35},reflection),{...box,x:90,y:-35,facing:-1});
 assert.deepEqual(box,before);assert.ok(Object.isFrozen(reflection));
});
test('a second reflection at a different location keeps position and resumes forward travel',()=>{
 const initial={x:100,y:0,w:20,h:10,facing:1};
 const first=reflectedProjectileTransform(null,initial);
 const authored={...initial,x:140},current=transformProjectileBox(authored,first);
 assert.equal(current.x,60);
 const second=reflectedProjectileTransform(first,current);
 assert.deepEqual(transformProjectileBox(authored,second),{...current,facing:1});
 assert.equal(transformProjectileBox({...authored,x:150},second).x,70);
});
test('group hitboxes mirror as one projectile while retaining group identity and height',()=>{
 const reflection=reflectedProjectileTransform(null,{x:100,w:40});
 const left={x:100,y:-10,w:10,h:10,groupId:'group_tip',boxId:'box_tip',facing:1};
 const right={x:130,y:-30,w:10,h:30,groupId:'group_body',boxId:'box_body',facing:1};
 assert.deepEqual(transformProjectileBox(left,reflection),{...left,x:130,facing:-1});
 assert.deepEqual(transformProjectileBox(right,reflection),{...right,x:100,facing:-1});
});
test('leftward projectile reflects rightward without changing geometry dimensions',()=>{
 const initial={x:-60,y:-20,w:30,h:15,facing:-1};const reflection=reflectedProjectileTransform(null,initial);
 assert.deepEqual(transformProjectileBox({...initial,x:-70},reflection),{...initial,x:-50,facing:1});
});
test('invalid contact geometry is rejected before creating reflection state',()=>{
 for(const box of [{x:NaN,w:20},{x:0,w:0},{x:Infinity,w:10},null])assert.throws(()=>reflectedProjectileTransform(null,box),/Reflection/);
 assert.throws(()=>reflectedProjectileTransform({direction:0,offset:0},{x:0,w:10}),/Invalid/);
});

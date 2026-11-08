import test from 'node:test';import assert from 'node:assert/strict';
import {validateProjectileSteering,createSteeringState,advanceSteering,reflectSteering} from '../site/shared/projectile-steering.js';
const owner={x:-100,y:0},target={x:100,y:-100};
test('steering validates bounded mode-specific authoring settings',()=>{
 validateProjectileSteering(undefined);validateProjectileSteering({mode:'homing',turnRate:10});validateProjectileSteering({mode:'return',turnRate:180,returnAfter:600});
 for(const bad of [null,{},[],{mode:'homing',turnRate:0},{mode:'homing',turnRate:1,returnAfter:2},{mode:'return',turnRate:2,returnAfter:0},{mode:'return',turnRate:181,returnAfter:5}])assert.throws(()=>validateProjectileSteering(bad));
});
test('homing turn is bounded, speed stays constant and repeated queries do not move',()=>{
 const s=createSteeringState({x:0,y:0},1,0),rule={mode:'homing',turnRate:10};advanceSteering(s,rule,6,1,target,owner);
 assert.ok(Math.abs(s.angle+Math.PI/18)<1e-10);assert.ok(Math.abs(Math.hypot(s.x,s.y)-6)<1e-10);
 const previous=structuredClone(s);advanceSteering(s,rule,6,1,target,owner);assert.deepEqual(s,previous);
 assert.throws(()=>advanceSteering(s,rule,6,3,target,owner),/consecutive/);assert.deepEqual(s,previous);
});
test('return turns on its combat deadline and catches the moving owner without damage logic',()=>{
 const s=createSteeringState({x:0,y:0},1,0),rule={mode:'return',turnRate:180,returnAfter:3};
 advanceSteering(s,rule,12,1,target,{x:0,y:0});advanceSteering(s,rule,12,2,target,{x:0,y:0});assert.equal(s.x,24);assert.equal(s.phase,'outbound');
 advanceSteering(s,rule,12,3,target,{x:2,y:0});assert.equal(s.phase,'returning');assert.equal(s.caught,true);const before=structuredClone(s);advanceSteering(s,rule,12,4,target,owner);assert.deepEqual(s,before);
});
test('reflection mirrors heading without moving position or renewing return age',()=>{
 const s=createSteeringState({x:40,y:-20},1,10);s.angle=Math.PI/4;s.lastFrame=15;s.phase='returning';const before=structuredClone(s);reflectSteering(s);
 assert.ok(Math.abs(s.angle-3*Math.PI/4)<1e-10);assert.deepEqual({...s,angle:before.angle},before);
});

import {steeringVisualPosition} from '../site/shared/projectile-steering.js';
test('VFX alignment preserves offsets around the projectile center for either facing',()=>{
 const box={x:22,y:-52,w:54,h:44},visual={x:10,y:-20};
 assert.deepEqual(steeringVisualPosition({x:200,y:-80},box,visual,1),{x:161,y:-70});
 assert.deepEqual(steeringVisualPosition({x:200,y:-80},box,visual,-1),{x:239,y:-70});
});

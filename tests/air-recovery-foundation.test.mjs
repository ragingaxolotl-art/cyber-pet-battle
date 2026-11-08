import test from 'node:test';import assert from 'node:assert/strict';
import {beginReaction} from '../site/reactions.js';
import {applyPulseReaction} from '../site/shared/hit-sequence.js';
import {Arena,fighter} from '../site/engine.js';
import {freshAttack,defaultStats,simulate} from '../site/shared/combat-model.js';
test('authored hitstun expiry remains separate from a longer launch and knockdown',()=>{
 const f=fighter('Target',defaultStats()),a={...freshAttack(),launchHeight:40,flightFrames:30,hitstun:5,floorSlam:true};beginReaction(f,a,1,10);
 assert.equal(f.hitstunUntil,15);assert.ok(f.stun>=102);assert.ok(f.legacyMotion);
 const preview=simulate({...a,startup:0,cost:0}, {...defaultStats(),speed:0},defaultStats(),{distance:35});assert.equal(preview.frames[0].target.hitstunUntil,5);assert.ok(preview.frames[0].target.stun>5);
});
test('new shorter hits cannot erase earlier authored hitstun',()=>{
 const f=fighter('Target',defaultStats());beginReaction(f,{...freshAttack(),hitstun:20},1,5);beginReaction(f,{...freshAttack(),hitstun:1},1,8);assert.equal(f.hitstunUntil,25);
 applyPulseReaction(f,{reaction:'none',hitstun:2},1,9);assert.equal(f.hitstunUntil,25);
});
test('pulse movement and explicit hitstun keep separate clocks; dummy reset clears both',()=>{
 const p=fighter('A',defaultStats()),f=fighter('B',defaultStats());
 applyPulseReaction(f,{reaction:'launch',height:40,knockback:0,frames:24,hold:5,hitstun:3},1,10);assert.equal(f.hitstunUntil,13);assert.ok(f.pulseMotion);
 const arena=new Arena(p,f,[]);arena.training=true;arena.resetDummy();assert.equal(f.hitstunUntil,0);assert.equal(f.stun,0);assert.equal(f.pulseMotion,null);
});

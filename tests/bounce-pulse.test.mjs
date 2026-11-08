import test from 'node:test';import assert from 'node:assert/strict';
import {applyPulseReaction,advancePulseReaction} from '../site/shared/hit-sequence.js';import {resetGroundedJuggle} from '../site/shared/juggle-rules.js';
const bounces={floor:{height:25,distance:10,frames:10},wall:{height:20,distance:30,frames:10}};
const hit={reaction:'launch',height:30,knockback:0,frames:10,hold:1,hitstun:3,bounces};
const target=()=>({x:100,y:0,hp:100,stun:0});
test('floor rebound preserves hit age, hitstun and budgets until final landing',()=>{
 const f=target();applyPulseReaction(f,hit,-1,0);f.airRecoveryUsed=true;
 for(let frame=1;frame<=10;frame++)advancePulseReaction(f,frame,0,200);
 assert.ok(f.y===0);assert.equal(f.pulseMotion.bounce,true);assert.equal(f.bounceCounts.floor,1);assert.equal(f.lastHit,0);assert.equal(f.hitstunUntil,3);
 resetGroundedJuggle(f);assert.equal(f.juggleHits,1);assert.equal(f.airRecoveryUsed,true);
 advancePulseReaction(f,11,0,200);assert.ok(f.y<0);assert.ok(f.x<100);
 for(let frame=12;frame<=20;frame++)advancePulseReaction(f,frame,0,200);
 assert.equal(f.pulseMotion,null);assert.ok(f.y===0);assert.equal(f.airRecoveryUsed,false);assert.deepEqual(f.bounceCounts,{wall:0,floor:0});
});
test('wall rebound turns inward and can subsequently bounce from the floor',()=>{
 const f={...target(),x:190};applyPulseReaction(f,{...hit,knockback:50},1,0);
 for(let frame=1;frame<=2;frame++)advancePulseReaction(f,frame,0,200);
 assert.equal(f.x,200);assert.equal(f.pulseMotion.direction,-1);assert.equal(f.bounceCounts.wall,1);
 advancePulseReaction(f,3,0,200);assert.ok(f.x<200);
 for(let frame=4;frame<=12;frame++)advancePulseReaction(f,frame,0,200);
 assert.equal(f.bounceCounts.floor,1);assert.equal(f.bounceCounts.wall,1);
});
test('a rehit cannot replenish a spent floor bounce',()=>{
 const f=target();applyPulseReaction(f,hit,1,0);for(let frame=1;frame<=11;frame++)advancePulseReaction(f,frame,0,200);
 applyPulseReaction(f,hit,1,11);for(let frame=12;frame<=21;frame++)advancePulseReaction(f,frame,0,200);
 assert.equal(f.pulseMotion,null);assert.ok(f.y===0);
});

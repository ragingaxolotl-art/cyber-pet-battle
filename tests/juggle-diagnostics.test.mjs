import test from 'node:test';import assert from 'node:assert/strict';
import {jugglePreset,sequenceState,sequenceOpportunities,hitResult} from '../site/shared/hit-sequence.js';
test('expired airborne hit explains juggle lock instead of implying a geometry miss',()=>{
 const a={hitEvents:jugglePreset(1),projectileMode:'contact'},s=sequenceState(),target={y:-20,juggleLocked:true};
 assert.deepEqual(sequenceOpportunities(a,s,0,true,target),[]);
 sequenceOpportunities(a,s,1,true,target);
 assert.match(s.results[0].reason,/Juggle limit/);
});
test('landing during the active window permits a previously blocked hit',()=>{
 const a={hitEvents:jugglePreset(1),projectileMode:'contact'};a.hitEvents[0].duration=3;const s=sequenceState();
 sequenceOpportunities(a,s,0,true,{y:-20,juggleLocked:true});
 const ready=sequenceOpportunities(a,s,1,true,{y:0,juggleLocked:true});assert.equal(ready.length,1);hitResult(s,ready[0],1,'Connected');
 sequenceOpportunities(a,s,3,true,{y:0});assert.equal(s.results.length,1);assert.equal(s.results[0].result,'Connected');
});
test('ordinary collision miss retains its geometry-neutral explanation',()=>{
 const a={hitEvents:jugglePreset(1),projectileMode:'contact'},s=sequenceState();s.contactFrame=0;
 sequenceOpportunities(a,s,0,false,{y:-20});sequenceOpportunities(a,s,1,false,{y:-20});assert.doesNotMatch(s.results[0].reason,/Juggle limit/);
});

import {applyPulseReaction,advancePulseReaction} from '../site/shared/hit-sequence.js';
import {beginReaction} from '../site/reactions.js';
import {Arena,fighter} from '../site/engine.js';
import {defaultStats,freshAttack} from '../site/shared/combat-model.js';
test('ordinary launch cannot replace the forced landing after the sequence juggle limit',()=>{
 const target=fighter('Target',defaultStats());Object.assign(target,{x:400,y:-40,juggleHits:9});
 applyPulseReaction(target,jugglePreset()[0],1,10);assert.equal(target.juggleLocked,true);
 const forced=target.pulseMotion,stun=target.stun;
 beginReaction(target,{...freshAttack(),launchHeight:100},1,11);
 assert.equal(target.pulseMotion,forced);assert.equal(target.legacyMotion,null);assert.equal(target.stun,stun);
 advancePulseReaction(target,25);assert.ok(target.y===0);
 beginReaction(target,{...freshAttack(),launchHeight:100},1,26);
 assert.equal(target.juggleLocked,false);assert.equal(target.juggleHits,0);assert.ok(target.legacyMotion);
});

test('ordinary damage still connects during forced landing without restarting the motion',()=>{
 const stats=defaultStats(),p=fighter('A',stats),target=fighter('B',stats);
 const attack={...freshAttack(),startup:0,cost:0,base:10,coefficient:0,launchHeight:100};
 const arena=new Arena(p,target,[attack]);arena.ai=false;arena.paused=false;p.x=450;Object.assign(target,{x:500,y:-10,juggleHits:9});
 applyPulseReaction(target,jugglePreset()[0],1,0);const forced=target.pulseMotion,hp=target.hp;
 arena.attack(p,attack);arena.tick();assert.equal(target.hp,hp-10);assert.equal(target.pulseMotion,forced);assert.equal(target.legacyMotion,null);
});

test('landing clears the lock before a new jump or attack is needed',()=>{
 const target=fighter('Target',defaultStats());Object.assign(target,{y:-40,juggleHits:9});
 applyPulseReaction(target,jugglePreset()[0],1,0);advancePulseReaction(target,15);
 assert.equal(target.juggleLocked,false);assert.equal(target.juggleHits,0);
 target.y=-10;const a={hitEvents:jugglePreset(1),projectileMode:'contact'};
 assert.equal(sequenceOpportunities(a,sequenceState(),0,true,target).length,1);
});
test('ordinary gravity landing clears stale juggle state',()=>{
 const p=fighter('A',defaultStats()),o=fighter('B',defaultStats()),arena=new Arena(p,o,[]);arena.ai=false;arena.paused=false;
 Object.assign(o,{y:-0.1,vy:1,juggleHits:10,juggleLocked:true});arena.tick();
 assert.equal(o.y,0);assert.equal(o.juggleHits,0);assert.equal(o.juggleLocked,false);
});

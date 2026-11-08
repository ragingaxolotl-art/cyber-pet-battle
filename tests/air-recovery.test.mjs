import test from 'node:test';import assert from 'node:assert/strict';
import {recoverInAir,airRecoveryReason} from '../site/shared/air-recovery.js';
import {resetGroundedJuggle} from '../site/shared/juggle-rules.js';
import {Arena,fighter} from '../site/engine.js';import {defaultStats} from '../site/shared/combat-model.js';
const target=()=>({...fighter('Target',defaultStats()),x:400,y:-60,reaction:'airborne',lastHit:0,hitstunUntil:8,stun:100,juggleHits:4,legacyMotion:{attack:{floorSlam:false}},pulseOwned:true});
test('recovery releases motion at the same position without replenishing juggle budget',()=>{
 const f=target();assert.equal(recoverInAir(f,12),'');assert.equal(f.x,400);assert.equal(f.y,-60);assert.equal(f.stun,12);assert.equal(f.reaction,'standing');assert.equal(f.juggleHits,4);assert.equal(f.airRecoveryUsed,true);assert.equal(f.legacyMotion,null);assert.equal(f.pulseOwned,false);assert.equal(f.vy,0);
 f.reaction='airborne';assert.match(recoverInAir(f,30),/Land before/);f.y=0;resetGroundedJuggle(f);assert.equal(f.airRecoveryUsed,false);
});
test('ineligible air recovery has no state mutations',()=>{
 for(const patch of [{hp:0},{y:0},{hitstunUntil:13},{lastHit:1},{needsFall:true},{juggleLocked:true},{reaction:'wall'},{reaction:'standing'},{statuses:[{type:'stun',until:20}]}]){
  const f=Object.assign(target(),patch),before=structuredClone(f);assert.notEqual(recoverInAir(f,12),'');assert.deepEqual(f,before);
 }
 assert.equal(airRecoveryReason({...target(),statuses:[{type:'stun',until:12}]},12),'');
});
test('Arena recovery respects pause and hitstop, resumes falling and resets on landing',()=>{
 const p=target(),o=fighter('Other',defaultStats()),arena=new Arena(p,o,[]);arena.ai=false;arena.frame=12;arena.paused=true;assert.match(arena.airRecover(p),/resume/);arena.paused=false;arena.hitstopRemaining=2;assert.equal(arena.airRecover(p),'Impact pause');arena.hitstopRemaining=0;
 assert.equal(arena.airRecover(p),'');const y=p.y;arena.tick();assert.ok(p.y>y);assert.equal(p.reaction,'standing');assert.equal(p.airRecoveryUsed,true);
 for(let i=0;i<30;i++)arena.tick();assert.equal(p.y,0);assert.equal(p.airRecoveryUsed,false);assert.equal(p.reaction,'standing');
});

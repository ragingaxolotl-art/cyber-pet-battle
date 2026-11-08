import test from 'node:test';import assert from 'node:assert/strict';
import {freshAttack,defaultStats,simulate} from '../site/shared/combat-model.js';
import {Arena,fighter} from '../site/engine.js';import {jugglePreset} from '../site/shared/hit-sequence.js';
for(const mode of ['attached','contact'])test(`air recovery retains projectile contacts and landing budget: ${mode}`,()=>{
 const stats={...defaultStats(),speed:0};
 const a={...freshAttack('projectile'),startup:0,cost:0,projectileSpeed:0,behaviorVersion:2,impactTrigger:'contact',projectileMode:mode,hitEvents:jugglePreset(2,20).map(e=>({...e,reaction:'launch',height:150,frames:60,knockback:0,hitstun:3}))};
 const preview=simulate(a,stats,stats,{distance:35,targetHP:1,recoveryFrame:12});
 const p=fighter('A',stats),o=fighter('B',stats),arena=new Arena(p,o,[a]);arena.ai=false;arena.paused=false;o.x=p.x+35;arena.attack(p,a);
 for(const shot of preview.frames){
  arena.tick();if(shot.frame===12)assert.equal(arena.airRecover(o),'');
  assert.equal(o.hp,shot.target.hp,`HP frame ${shot.frame}`);
  assert.ok(Math.abs(o.y-shot.target.y)<1e-8,`height frame ${shot.frame}: ${o.y}/${shot.target.y}`);
  if(shot.frame===20&&mode==='attached'){assert.equal(o.airRecoveryUsed,true);assert.equal(o.juggleHits,2);assert.equal(o.reaction,'airborne');}
  if(shot.frame===32&&mode==='attached')assert.match(arena.airRecover(o),/Land before/);
 }
 assert.equal(preview.recovery.recovered,true);
 assert.equal(preview.hitResults[1].result,mode==='attached'?'Connected':'Missed');
 assert.equal(o.y,0);assert.equal(o.airRecoveryUsed,false);
});

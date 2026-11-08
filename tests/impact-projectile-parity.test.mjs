import test from 'node:test';
import assert from 'node:assert/strict';
import {Arena,fighter} from '../site/engine.js';
import {freshAttack,defaultStats,simulate} from '../site/shared/combat-model.js';
import {jugglePreset} from '../site/shared/hit-sequence.js';

for(const sequence of [false,true])for(const guarded of [false,true]){
 test(`${sequence?'attached sequence':'ordinary projectile'} impact playback agrees with Arena (${guarded?'blocked':'hit'})`,()=>{
  const stats={...defaultStats(),speed:0};
  const attack={...freshAttack('projectile'),startup:5,active:1,recovery:2,cost:0,base:7,coefficient:0,projectileSpeed:12,impactTrigger:'contact',knockback:0,projectileLifetime:60,contactFeedback:{hitstop:3,blockstop:2,blockstun:5}};
  if(sequence)Object.assign(attack,{behaviorVersion:2,projectileMode:'attached',hitEvents:jugglePreset(3,3).map(hit=>({...hit,target:'any'}))});
  const preview=simulate(attack,stats,stats,{distance:200,guard:guarded,targetHP:1});
  const defender=fighter('Defender',stats),owner=fighter('Owner',stats),arena=new Arena(defender,owner,[attack]);
  arena.ai=false;arena.paused=false;defender.x=450;owner.x=650;arena.attack(owner,attack);
  const inputs=new Set(guarded?['Shift']:[]);
  for(const shot of preview.presentationFrames){
   arena.tick(inputs);
   assert.equal(arena.frame-1,shot.combatFrame,`combat clock at playback ${shot.presentationFrame}`);
   assert.equal(arena.hitstopRemaining,shot.hitstopRemaining,`impact pause at combat ${shot.combatFrame}`);
   assert.equal(defender.hp,shot.target.hp,`damage at combat ${shot.combatFrame}`);
   if(guarded)assert.equal(defender.blockstunUntil>arena.frame,!shot.target.canAct,`guard recovery at combat ${shot.combatFrame}`);
  }
  assert.equal(arena.projectiles.entries.length,0);
  // A blocked first contact cancels attachment; it must not invent follow-up hits.
  assert.equal(preview.frames.at(-1).hits,sequence&&!guarded?3:1);
 });
}

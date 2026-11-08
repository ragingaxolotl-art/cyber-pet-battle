import test from 'node:test';
import assert from 'node:assert/strict';
import {Arena,fighter} from '../site/engine.js';
import {beginReaction} from '../site/reactions.js';
import {freshAttack,defaultStats} from '../site/shared/combat-model.js';
import {jugglePreset} from '../site/shared/hit-sequence.js';
function setup(sequence=false){
 const stats={...defaultStats(),speed:0},owner=fighter('Owner',stats),target=fighter('Target',stats);
 const attack={...freshAttack('projectile'),startup:0,active:1,recovery:0,projectileLifetime:90,impactTrigger:'contact',projectileSpeed:10,cost:0,base:7,coefficient:0,knockback:0,hitstun:12};
 if(sequence)Object.assign(attack,{behaviorVersion:2,projectileMode:'attached',hitEvents:jugglePreset(3,3)});
 const arena=new Arena(owner,target,[attack]);arena.ai=false;arena.paused=false;owner.x=200;target.x=500;arena.attack(owner,attack);arena.tick();
 return {arena,owner,target,attack,entity:arena.projectiles.entries[0]};
}
for(const sequence of [false,true])test(`reflected ${sequence?'sequence':'ordinary'} projectile credits its new owner`,()=>{
 const {arena,owner,target,entity}=setup(sequence);assert.equal(arena.reflectProjectile(entity,target),true);
 for(let i=0;i<80;i++)arena.tick();
 const rows=arena.combos.snapshot();assert.equal(rows.length,1);assert.equal(rows[0].attacker,target);assert.equal(rows[0].target,owner);assert.equal(rows[0].bestHits,sequence?3:1);assert.equal(rows[0].bestDamage,owner.maxHP-owner.hp);assert.equal(target.hp,target.maxHP);
});
for(const sequence of [false,true])test(`persistent ${sequence?'sequence':'ordinary'} projectile retains credit after owner interruption`,()=>{
 const {arena,owner,target}=setup(sequence);beginReaction(owner,{...freshAttack(),knockback:0,hitstun:40},-1,arena.frame);assert.equal(owner.cast,null);
 for(let i=0;i<80;i++)arena.tick();
 const rows=arena.combos.snapshot();assert.equal(rows.length,1);assert.equal(rows[0].attacker,owner);assert.equal(rows[0].target,target);assert.equal(rows[0].bestHits,sequence?3:1);assert.equal(rows[0].bestDamage,target.maxHP-target.hp);
});

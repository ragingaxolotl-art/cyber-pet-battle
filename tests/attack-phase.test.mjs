import test from 'node:test';import assert from 'node:assert/strict';
import {attackPhase} from '../site/shared/attack-phase.js';
const cast=(extra={})=>({a:{},start:10,impact:3,tm:{startup:3,active:4,recovery:2},...extra});
test('attack phase has exclusive boundaries and an idle pre-start frame',()=>{
 const c=cast();assert.deepEqual([9,10,12,13,16,17,18,19].map(f=>attackPhase(c,f)),['idle','startup','startup','active','active','recovery','recovery','idle']);assert.equal(attackPhase(null,20),'idle');
});
test('contact waiting and delayed impact retain the actual active/recovery boundaries',()=>{
 const c=cast({impact:null});assert.equal(attackPhase(c,613),'active');assert.equal(attackPhase(c,614),'recovery');assert.equal(attackPhase(c,616),'idle');c.impact=100;assert.equal(attackPhase(c,113),'active');assert.equal(attackPhase(c,114),'recovery');assert.equal(attackPhase(c,116),'idle');
});
test('independent projectiles cannot prolong the owner phase until their later impact',()=>{
 for(const extra of [{a:{projectileLifetime:120}},{projectileLaunched:true}]){
  const c=cast({...extra,impact:100});assert.equal(attackPhase(c,17),'recovery');assert.equal(attackPhase(c,19),'idle');
 }
});

test('Arena keeps both pre-contact phases after the first trade interrupts a cast',async()=>{
 const {Arena,fighter}=await import('../site/engine.js');
 const {freshAttack,defaultStats}=await import('../site/shared/combat-model.js');
 for(const reverse of [false,true]){
  const stats={...defaultStats(),speed:0},a={...freshAttack(),startup:0,active:4,cost:0,knockback:0,hitstun:8};
  const p=fighter('A',stats),o=fighter('B',stats),arena=new Arena(p,o,[a]);arena.ai=false;arena.paused=false;o.x=p.x+35;
  arena.attack(p,a);arena.attack(o,a);arena.frame=1;
  const pending=[arena.prepare(p,o),arena.prepare(o,p)];if(reverse)pending.reverse();
  assert.deepEqual(pending.map(hit=>hit.defenderPhase),['active','active']);
  arena.resolve(pending[0].f,pending[0].target,pending[0]);
  assert.equal(pending[0].target.cast,null);
  assert.equal(pending[1].defenderPhase,'active');
  arena.resolve(pending[1].f,pending[1].target,pending[1]);
  assert.ok(p.hp<p.maxHP&&o.hp<o.maxHP);
 }
});

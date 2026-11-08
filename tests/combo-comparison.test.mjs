import test from 'node:test';import assert from 'node:assert/strict';
import {compareAttacks} from '../site/matchup.js';
import {freshAttack,defaultStats} from '../site/shared/combat-model.js';
test('comparison exposes serializable combo identities and independent replay snapshots',()=>{
 const move={...freshAttack(),startup:0,active:8,recovery:0,cost:0,base:5,coefficient:0,knockback:0,hitstun:6,hitLimit:2,hitInterval:3};
 const other={...freshAttack(),startup:50,cost:0};const stats={...defaultStats(),speed:0};
 const result=compareAttacks(move,other,{distance:35,frames:20,statsA:stats,statsB:stats});
 assert.equal(result.combos[0].attacker,'A');assert.equal(result.combos[0].target,'B');assert.equal(result.combos[0].bestHits,2);assert.equal(result.combos[0].bestDamage,10);
 assert.equal(result.replay[0].combos[0].hits,1);assert.equal(result.replay[3].combos[0].hits,2);
 result.combos[0].last.reason='changed';assert.notEqual(result.replay.at(-1).combos[0].last.reason,'changed');assert.doesNotThrow(()=>JSON.stringify(result));
});

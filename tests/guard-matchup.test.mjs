import test from 'node:test';import assert from 'node:assert/strict';
import {compareAttacks} from '../site/matchup.js';import {freshAttack} from '../site/shared/combat-model.js';
test('comparison explains zero-damage guard crush and interrupts full guard',()=>{
 const a={...freshAttack(),startup:0,active:1,cost:0,base:20,coefficient:0,knockback:0,hitstun:0,guardInteraction:{mode:'crush',recoveryFrames:20}};
 const result=compareAttacks(a,freshAttack(),{actionB:'guard',frames:30});assert.ok(result.rows.some(r=>r.event.includes('Guard crush:')));assert.equal(result.contacts[0],1);
});

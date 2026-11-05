import test from 'node:test';
import assert from 'node:assert/strict';
import {fighter} from '../site/engine.js';
import {defaultStats} from '../site/shared/combat-model.js';
import {knockDown,advanceReaction} from '../site/reactions.js';
import {RECOVERY_TIMING} from '../site/shared/recovery-timing.js';
test('knockdown and get-up share the authored presentation timeline',()=>{
 const f=fighter('F',defaultStats()),emit=()=>{};knockDown(f,100,emit);
 advanceReaction(f,129,emit);assert.equal(f.reaction,'down');
 advanceReaction(f,130,emit);assert.equal(f.reaction,'getting_up');
 advanceReaction(f,161,emit);assert.equal(f.reaction,'getting_up');
 advanceReaction(f,162,emit);assert.equal(f.reaction,'standing');
 assert.equal(RECOVERY_TIMING.down+RECOVERY_TIMING.getUp,62);
});

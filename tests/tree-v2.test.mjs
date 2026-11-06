import test from 'node:test';
import assert from 'node:assert/strict';
import {bankTree,checkPlayableTree} from '../site/skill-trees.js';
import {freshAttack} from '../site/shared/combat-model.js';
import {jugglePreset} from '../site/shared/hit-sequence.js';
test('Arena imports versioned trees generated from mixed banks without losing sequence data',()=>{
 const attack={...freshAttack('projectile'),behaviorVersion:2,hitEvents:jugglePreset(),impactTrigger:'contact',projectileMode:'attached'};
 const tree=bankTree([freshAttack(),attack]);assert.equal(tree.version,2);assert.deepEqual(checkPlayableTree(JSON.parse(JSON.stringify(tree)),new Set()).nodes[1].attack,attack);
 assert.equal(bankTree([freshAttack()]).version,1);
 assert.throws(()=>checkPlayableTree({...tree,version:1},new Set()),/version 2/);
});

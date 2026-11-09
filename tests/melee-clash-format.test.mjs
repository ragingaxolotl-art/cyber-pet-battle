import test from 'node:test';import assert from 'node:assert/strict';
import {freshAttack,validateAttack,validateDesign} from '../site/shared/combat-model.js';
import {attacksVersion} from '../site/shared/attack-format.js';
import {emptyBank,saveToBank,encodeBank,decodeBank,validateBank} from '../site/shared/attack-bank.js';
test('melee priority survives format29 design and bank round trips, older versions refuse it',()=>{
 const a={...freshAttack(),meleeClash:{priority:3}};validateAttack(a);assert.equal(attacksVersion([a]),29);
 const bank=saveToBank(emptyBank(),a,validateAttack);assert.equal(bank.version,29);assert.deepEqual(validateBank(decodeBank(encodeBank(bank)),validateAttack),bank);
 assert.throws(()=>validateBank({...bank,version:28},validateAttack),/version 29/);
 const project={format:'cyber-pet-combat-design',version:29,attacks:[a]};assert.deepEqual(validateDesign(project),project);assert.throws(()=>validateDesign({...project,version:28}),/version 29/);
 delete a.meleeClash;assert.equal(attacksVersion([a]),1);
});
test('invalid melee rules are rejected by the common attack validator',()=>{
 for(const priority of [-1,10,.5,'3',null])assert.throws(()=>validateAttack({...freshAttack(),meleeClash:{priority}}));
 assert.throws(()=>validateAttack({...freshAttack('projectile'),meleeClash:{priority:0}}),/melee/);
});

import test from 'node:test';import assert from 'node:assert/strict';
import {freshAttack,validateAttack,validateDesign} from '../site/shared/combat-model.js';import {attacksVersion} from '../site/shared/attack-format.js';import {emptyBank,saveToBank,encodeBank,decodeBank,validateBank} from '../site/shared/attack-bank.js';
test('ballistic flight roundtrips as format30 and older containers refuse it',()=>{
 const a={...freshAttack('projectile'),projectileLifetime:120,projectileFlight:{angle:-25,acceleration:.2,gravity:.3,range:240}};validateAttack(a);assert.equal(attacksVersion([a]),30);
 const bank=saveToBank(emptyBank(),a,validateAttack);assert.equal(bank.version,30);assert.deepEqual(validateBank(decodeBank(encodeBank(bank)),validateAttack),bank);assert.throws(()=>validateBank({...bank,version:29},validateAttack),/version 30/);
 const project={format:'cyber-pet-combat-design',version:30,attacks:[a]};assert.deepEqual(validateDesign(project),project);assert.throws(()=>validateDesign({...project,version:29}),/version 30/);
 delete a.projectileFlight;assert.equal(attacksVersion([a]),7);
});

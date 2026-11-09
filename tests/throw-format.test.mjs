import test from 'node:test';import assert from 'node:assert/strict';
import {freshAttack,validateAttack,validateDesign} from '../site/shared/combat-model.js';import {attacksVersion} from '../site/shared/attack-format.js';import {emptyBank,saveToBank,encodeBank,decodeBank,validateBank} from '../site/shared/attack-bank.js';
test('throws roundtrip as format31 and older containers refuse it',()=>{
 const a={...freshAttack(),throw:{holdFrames:12,holdX:30,holdHeight:20,target:'grounded'}};validateAttack(a);assert.equal(attacksVersion([a]),31);
 const bank=saveToBank(emptyBank(),a,validateAttack);assert.equal(bank.version,31);assert.deepEqual(validateBank(decodeBank(encodeBank(bank)),validateAttack),bank);assert.throws(()=>validateBank({...bank,version:30},validateAttack),/version 31/);
 const project={format:'cyber-pet-combat-design',version:31,attacks:[a]};assert.deepEqual(validateDesign(project),project);assert.throws(()=>validateDesign({...project,version:30}),/version 31/);
 delete a.throw;assert.equal(attacksVersion([a]),1);
});
test('throw-only immunity requires format31 even without a grab attack',()=>{
 const a={...freshAttack(),defenseWindows:[{id:'defense_throw',kind:'invulnerability',start:0,duration:12,against:'throw'}]};validateAttack(a);assert.equal(attacksVersion([a]),31);
 const bank=saveToBank(emptyBank(),a,validateAttack);assert.deepEqual(validateBank(decodeBank(encodeBank(bank)),validateAttack),bank);assert.throws(()=>validateBank({...bank,version:30},validateAttack),/version 31/);
 assert.throws(()=>validateAttack({...a,defenseWindows:[{...a.defenseWindows[0],kind:'armor',hits:1}]}),/invulnerability/);
});

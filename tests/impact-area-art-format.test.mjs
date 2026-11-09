import test from 'node:test';import assert from 'node:assert/strict';
import {freshAttack,validateAttack,validateDesign} from '../site/shared/combat-model.js';
import {attacksVersion} from '../site/shared/attack-format.js';
import {emptyBank,saveToBank,encodeBank,decodeBank,validateBank} from '../site/shared/attack-bank.js';
test('impact-area artwork roundtrips as format28 and rejects older containers',()=>{
 const a={...freshAttack('projectile'),projectileLifetime:120,projectileContact:'single',projectileArea:{width:80,height:60,duration:90,interval:15,hitLimit:5,damage:3,visual:{effectId:'sample',scale:1,rate:1,loop:true}}};
 validateAttack(a);assert.equal(attacksVersion([a]),28);
 const bank=saveToBank(emptyBank(),a,validateAttack);assert.equal(bank.version,28);assert.deepEqual(validateBank(decodeBank(encodeBank(bank)),validateAttack),bank);
 assert.throws(()=>validateBank({...bank,version:27},validateAttack),/version 28/);
 const project={format:'cyber-pet-combat-design',version:28,attacks:[a]};assert.deepEqual(validateDesign(project),project);assert.throws(()=>validateDesign({...project,version:27}),/version 28/);
 delete a.projectileArea.visual;assert.equal(attacksVersion([a]),20);
});

import test from 'node:test';import assert from 'node:assert/strict';
import {freshAttack,validateAttack} from '../site/shared/combat-model.js';import {attackVersion,requireGroupVersion} from '../site/shared/attack-format.js';
test('movement definitions require version11 and retain legacy version classification',()=>{
 const legacy=freshAttack(),attack={...legacy,movementCancels:[{id:'movement_jump',action:'jump',start:2,duration:4,condition:'hit',cost:3}]};
 validateAttack(attack);assert.equal(attackVersion(legacy),1);assert.equal(attackVersion(attack),11);assert.throws(()=>requireGroupVersion(10,[legacy,attack]),/version 11/);requireGroupVersion(11,[legacy,attack]);
 assert.throws(()=>validateAttack({...attack,movementCancels:[{...attack.movementCancels[0],automatic:true}]}),/manual/);
});
import {validateCatalog} from '../site/catalog.js';
test('Arena catalog imports version11 movement windows and refuses mislabeled older files',()=>{
 const a={...freshAttack(),movementCancels:[{id:'movement_jump',action:'jump',start:2,duration:4,condition:'hit',cost:3}]};
 const project={format:'cyber-pet-combat-design',version:11,attacks:[a]};assert.deepEqual(validateCatalog(project),[a]);assert.throws(()=>validateCatalog({...project,version:10}),/version 11/);
});

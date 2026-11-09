import test from 'node:test';import assert from 'node:assert/strict';
import {freshAttack,validateAttack,validateDesign} from '../site/shared/combat-model.js';
import {jugglePreset} from '../site/shared/hit-sequence.js';
import {linkHitProperties} from '../site/shared/hit-property-links.js';
import {attacksVersion} from '../site/shared/attack-format.js';
import {emptyBank,saveToBank,encodeBank,decodeBank,validateBank} from '../site/shared/attack-bank.js';
const sample=()=>{const a={...freshAttack(),behaviorVersion:2,sequenceTiming:'cast',delivery:'melee',payload:'damage',status:'none',impactTrigger:'timed',hitEvents:jugglePreset(3,5)};return linkHitProperties(a,a.hitEvents[0].id,[a.hitEvents[1].id],['damage']);};
test('shared hit settings roundtrip as format27 and older containers reject them',()=>{
 const a=sample();validateAttack(a);assert.equal(attacksVersion([a]),27);
 const bank=saveToBank(emptyBank(),a,validateAttack);assert.equal(bank.version,27);assert.deepEqual(validateBank(decodeBank(encodeBank(bank)),validateAttack),bank);
 assert.throws(()=>validateBank({...bank,version:26},validateAttack),/version 27/);
 const project={format:'cyber-pet-combat-design',version:27,attacks:[a]};assert.deepEqual(validateDesign(project),project);assert.throws(()=>validateDesign({...project,version:26}),/version 27/);
});
test('stale materialized values and missing sources fail validation without modifying input',()=>{
 const a=sample();a.hitEvents[0].damage=99;const before=structuredClone(a);assert.throws(()=>validateAttack(a),/out of date/);assert.deepEqual(a,before);
 a.hitPropertyLinks[0].sourceId='hit_missing';assert.throws(()=>validateAttack(a),/existing hits/);
});

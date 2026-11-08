import test from 'node:test';import assert from 'node:assert/strict';
import {freshAttack,validateAttack,validateDesign} from '../site/shared/combat-model.js';
import {attackVersion,requireGroupVersion} from '../site/shared/attack-format.js';
import {emptyBank,saveToBank,validateBank,encodeBank,decodeBank,createClassroomBank} from '../site/shared/attack-bank.js';
const move=()=>({...freshAttack(),defenseWindows:[{id:'defense_reward',kind:'absorb',against:'projectile',start:0,duration:60,hits:1,energyGain:25}]});
test('absorption energy version18 round trip preserves old definitions and rejects mislabeled envelopes',()=>{
 const a=move(),legacy=freshAttack();validateAttack(a);assert.equal(attackVersion(a),18);assert.equal(attackVersion(legacy),1);assert.throws(()=>requireGroupVersion(17,[a]),/version 18/);
 const old=saveToBank(emptyBank(),legacy,validateAttack),before=structuredClone(old),bank=saveToBank(old,a,validateAttack);
 assert.equal(bank.version,18);assert.deepEqual(validateBank(decodeBank(encodeBank(bank)),validateAttack),bank);assert.deepEqual(old,before);
 assert.deepEqual(validateDesign({format:'cyber-pet-combat-design',version:18,attacks:[a]}).attacks[0].defenseWindows,a.defenseWindows);
 assert.throws(()=>validateBank({...bank,version:17},validateAttack),/version 18/);
});
test('classroom clients negotiate18 and refuse absorption energy writes to older servers',async()=>{
 const bank=saveToBank(emptyBank(),move(),validateAttack),calls=[];let modern=true;
 const remote=createClassroomBank(validateAttack,async(url,options)=>{calls.push({url,options});return {ok:true,json:async()=>url.endsWith('/capabilities')?{bankVersions:modern?[1,17,18]:[1,17],attackVersions:modern?[1,17,18]:[1,17],revisionProtection:true}:{bank,revision:3}};});
 await remote.read();assert.equal(calls.at(-1).options.headers['X-Attack-Bank-Version'],'18');await remote.write(bank,3);assert.deepEqual(JSON.parse(calls.at(-1).options.body),{bank,revision:3});
 modern=false;calls.length=0;await assert.rejects(remote.write(bank,3),/version 18/);assert.equal(calls.length,1);assert.notEqual(calls[0].options.method,'PUT');
});

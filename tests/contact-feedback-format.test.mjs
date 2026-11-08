import test from 'node:test';import assert from 'node:assert/strict';
import {freshAttack,validateAttack} from '../site/shared/combat-model.js';import {attackVersion,requireGroupVersion} from '../site/shared/attack-format.js';
import {emptyBank,saveToBank,validateBank,encodeBank,decodeBank,createClassroomBank} from '../site/shared/attack-bank.js';
const move=()=>({...freshAttack(),contactFeedback:{hitstop:4,blockstop:2,blockstun:12}});
test('contact feedback requires version12 and round trips without mutating legacy attacks',()=>{
 const a=move(),legacy=freshAttack();validateAttack(a);assert.equal(attackVersion(a),12);assert.equal(attackVersion(legacy),1);assert.throws(()=>requireGroupVersion(11,[a]),/version 12/);
 const old=saveToBank(emptyBank(),legacy,validateAttack),before=structuredClone(old),bank=saveToBank(old,a,validateAttack);assert.equal(bank.version,12);assert.deepEqual(validateBank(decodeBank(encodeBank(bank)),validateAttack),bank);assert.deepEqual(old,before);
 assert.throws(()=>validateAttack({...a,contactFeedback:{hitstop:21}}),/0–20/);
});
test('version12 reads negotiate support and old servers cannot receive feedback writes',async()=>{
 const bank=saveToBank(emptyBank(),move(),validateAttack),calls=[];let modern=true;
 const remote=createClassroomBank(validateAttack,async(url,options)=>{calls.push({url,options});return {ok:true,json:async()=>url.endsWith('/capabilities')?{bankVersions:modern?[1,11,12]:[1,11],attackVersions:modern?[1,11,12]:[1,11],revisionProtection:true}:{bank,revision:3}};});
 assert.deepEqual((await remote.read()).bank,bank);assert.equal(calls.at(-1).options.headers['X-Attack-Bank-Version'],'12');await remote.write(bank,3);assert.deepEqual(JSON.parse(calls.at(-1).options.body),{bank,revision:3});
 modern=false;calls.length=0;await assert.rejects(remote.write(bank,3),/version 12/);assert.equal(calls.length,1);assert.notEqual(calls[0].options.method,'PUT');
});

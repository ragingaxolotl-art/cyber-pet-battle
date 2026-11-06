import test from 'node:test';
import assert from 'node:assert/strict';
import {emptyBank,saveToBank,validateBank,encodeBank,decodeBank,createClassroomBank} from '../site/shared/attack-bank.js';
import {freshAttack,validateAttack} from '../site/shared/combat-model.js';
import {jugglePreset} from '../site/shared/hit-sequence.js';
const sequence=()=>({...freshAttack('projectile'),behaviorVersion:2,hitEvents:jugglePreset(),projectileMode:'attached',impactTrigger:'contact'});
test('local bank upgrades without mutating legacy data and preserves every hit',()=>{
 const old=saveToBank(emptyBank(),freshAttack(),validateAttack),before=structuredClone(old),a=sequence();
 const next=saveToBank(old,a,validateAttack);assert.equal(old.version,1);assert.deepEqual(old,before);assert.equal(next.version,2);
 const loaded=validateBank(decodeBank(encodeBank(next)),validateAttack);assert.deepEqual(loaded.attacks[1],a);assert.deepEqual(loaded.attacks[0],old.attacks[0]);
 assert.throws(()=>validateBank({...next,version:1},validateAttack),/version 2/);
});

test('v2 writes negotiate capabilities and preserve the revision and complete hit data',async()=>{
 const requests=[],bank=saveToBank(emptyBank(),sequence(),validateAttack);
 const remote=createClassroomBank(validateAttack,async(url,options)=>{requests.push({url,options});return {ok:true,json:async()=>url.endsWith('/capabilities')?{bankVersions:[1,2],attackVersions:[1,2],revisionProtection:true}:{revision:8}};});
 await remote.write(bank,7);assert.equal(requests.length,2);assert.ok(requests[0].url.endsWith('/capabilities'));
 assert.equal(requests[1].options.headers['X-Attack-Bank-Version'],'2');assert.deepEqual(JSON.parse(requests[1].options.body),{bank,revision:7});
});
for(const capabilities of [{},{bankVersions:[1]},{bankVersions:[1,2],attackVersions:[1,2],revisionProtection:false}])test('unsupported capabilities never send a bank PUT '+JSON.stringify(capabilities),async()=>{
 const methods=[];const remote=createClassroomBank(validateAttack,async(url,options)=>{methods.push(options.method||'GET');return {ok:true,json:async()=>capabilities};});
 await assert.rejects(remote.write(saveToBank(emptyBank(),sequence(),validateAttack),0),/cannot safely save/);assert.deepEqual(methods,['GET']);
});
test('network failure leaves the caller bank untouched and does not attempt PUT',async()=>{
 const bank=saveToBank(emptyBank(),sequence(),validateAttack),before=structuredClone(bank);let calls=0;
 const remote=createClassroomBank(validateAttack,async()=>{calls++;throw Error('Offline');});await assert.rejects(remote.write(bank,0),/Offline/);assert.deepEqual(bank,before);assert.equal(calls,1);
});

 test('Arena reads mixed classroom banks using the v2 protocol without losing sequence data',async()=>{
 const bank=saveToBank(saveToBank(emptyBank(),freshAttack(),validateAttack),sequence(),validateAttack);
 const remote=createClassroomBank(validateAttack,async(url,options)=>{
 assert.equal(options.headers['X-Attack-Bank-Version'],'2');
 return {ok:true,json:async()=>({bank,revision:9})};
 });
 const result=await remote.read();assert.equal(result.revision,9);assert.deepEqual(result.bank,bank);
 });

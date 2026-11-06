import test from 'node:test';import assert from 'node:assert/strict';
import {freshAttack,validateAttack,validateDesign} from '../site/shared/combat-model.js';
import {emptyBank,saveToBank,validateBank,encodeBank,decodeBank,createClassroomBank} from '../site/shared/attack-bank.js';
import {attacksVersion,requireGroupVersion} from '../site/shared/attack-format.js';
const grouped=()=>({...freshAttack(),hitboxGroups:[{id:'group_one',hitLimit:1,hitInterval:1,boxes:[{id:'box_one',start:0,duration:2,shape:'rectangle',x:22,y:-52,w:54,h:44}]}]});
test('grouped attacks roundtrip with legacy attacks in version 3 banks and projects',()=>{
 const original=saveToBank(emptyBank(),freshAttack(),validateAttack),before=structuredClone(original),a=grouped();
 const bank=saveToBank(original,a,validateAttack);assert.equal(bank.version,3);assert.deepEqual(original,before);assert.deepEqual(validateBank(decodeBank(encodeBank(bank)),validateAttack),bank);
 const project={format:'cyber-pet-combat-design',version:3,attacks:bank.attacks};assert.deepEqual(validateDesign(JSON.parse(JSON.stringify(project))),project);assert.equal(attacksVersion(bank.attacks),3);
 for(const version of [1,2]){assert.throws(()=>validateBank({...bank,version},validateAttack),/version 3/);assert.throws(()=>validateDesign({...project,version}),/version 3/);assert.throws(()=>requireGroupVersion(version,[a]),/version 3/);}
});
test('v2 server cannot receive a grouped bank PUT',async()=>{
 const requests=[],remote=createClassroomBank(validateAttack,async(url,options)=>{requests.push(options);return {ok:true,json:async()=>({bankVersions:[1,2],attackVersions:[1,2],revisionProtection:true})};});
 await assert.rejects(remote.write(saveToBank(emptyBank(),grouped(),validateAttack),4),/version 3/);assert.equal(requests.length,1);assert.notEqual(requests[0].method,'PUT');
});
test('v3 capable server negotiates reads and writes with complete geometry and revision',async()=>{
 const bank=saveToBank(emptyBank(),grouped(),validateAttack),calls=[];
 const remote=createClassroomBank(validateAttack,async(url,options)=>{calls.push({url,options});if(url.endsWith('/capabilities'))return {ok:true,json:async()=>({bankVersions:[1,2,3],attackVersions:[1,2,3],revisionProtection:true})};assert.equal(options.headers['X-Attack-Bank-Version'],'3');return {ok:true,json:async()=>({bank,revision:5})};});
 assert.deepEqual((await remote.read()).bank,bank);await remote.write(bank,4);assert.deepEqual(JSON.parse(calls.at(-1).options.body),{bank,revision:4});
});

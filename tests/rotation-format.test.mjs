import test from 'node:test';import assert from 'node:assert/strict';
import {freshAttack,validateAttack,simulate,defaultStats} from '../site/shared/combat-model.js';
import {emptyBank,saveToBank,validateBank,encodeBank,decodeBank,createClassroomBank} from '../site/shared/attack-bank.js';
const move=()=>{const a=freshAttack();a.box.rotation=35;return a;};
test('rotation version24 bank roundtrip and older-server refusal preserve data',async()=>{
 const a=move(),old=saveToBank(emptyBank(),freshAttack(),validateAttack),before=structuredClone(old),bank=saveToBank(old,a,validateAttack);assert.equal(bank.version,24);assert.deepEqual(old,before);assert.deepEqual(validateBank(decodeBank(encodeBank(bank)),validateAttack),bank);assert.throws(()=>validateBank({...bank,version:23},validateAttack),/version 24/);
 let modern=true;const calls=[];const remote=createClassroomBank(validateAttack,async(url,options)=>{calls.push({url,options});return {ok:true,json:async()=>url.endsWith('/capabilities')?{bankVersions:modern?[1,23,24]:[1,23],attackVersions:modern?[1,23,24]:[1,23],revisionProtection:true}:{bank,revision:2}};});
 await remote.read();assert.equal(calls.at(-1).options.headers['X-Attack-Bank-Version'],'24');await remote.write(bank,2);assert.deepEqual(JSON.parse(calls.at(-1).options.body),{bank,revision:2});modern=false;calls.length=0;await assert.rejects(remote.write(bank,2),/version 24/);assert.equal(calls.length,1);assert.notEqual(calls[0].options.method,'PUT');
});

import {attackVersion,requireGroupVersion} from '../site/shared/attack-format.js';
test('grouped rotation requires24 while unchanged attacks retain legacy versions',()=>{const a=freshAttack();assert.equal(attackVersion(a),1);a.hitboxGroups=[{id:'group_rotated',hitLimit:1,hitInterval:1,boxes:[{...a.box,id:'box_rotated',shape:'rectangle',start:0,duration:1,rotation:0}]}];assert.equal(attackVersion(a),24);assert.throws(()=>requireGroupVersion(23,[a]),/version 24/);delete a.hitboxGroups[0].boxes[0].rotation;assert.equal(attackVersion(a),3);});

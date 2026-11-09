import test from 'node:test';import assert from 'node:assert/strict';
import {freshAttack,validateAttack,simulate,defaultStats} from '../site/shared/combat-model.js';
import {emptyBank,saveToBank,validateBank,encodeBank,decodeBank,createClassroomBank} from '../site/shared/attack-bank.js';
const move=()=>({...freshAttack(),guardInteraction:{mode:'crush',recoveryFrames:20}});
test('guard version23 bank roundtrip and older-server refusal preserve data',async()=>{
 const a=move(),old=saveToBank(emptyBank(),freshAttack(),validateAttack),before=structuredClone(old),bank=saveToBank(old,a,validateAttack);assert.equal(bank.version,23);assert.deepEqual(old,before);assert.deepEqual(validateBank(decodeBank(encodeBank(bank)),validateAttack),bank);assert.throws(()=>validateBank({...bank,version:22},validateAttack),/version 23/);
 let modern=true;const calls=[];const remote=createClassroomBank(validateAttack,async(url,options)=>{calls.push({url,options});return {ok:true,json:async()=>url.endsWith('/capabilities')?{bankVersions:modern?[1,22,23]:[1,22],attackVersions:modern?[1,22,23]:[1,22],revisionProtection:true}:{bank,revision:2}};});
 await remote.read();assert.equal(calls.at(-1).options.headers['X-Attack-Bank-Version'],'23');await remote.write(bank,2);assert.deepEqual(JSON.parse(calls.at(-1).options.body),{bank,revision:2});modern=false;calls.length=0;await assert.rejects(remote.write(bank,2),/version 23/);assert.equal(calls.length,1);assert.notEqual(calls[0].options.method,'PUT');
});

test('central validation rejects malformed guard definitions',()=>{for(const guardInteraction of [null,{}, {mode:'break',recoveryFrames:0},{mode:'crush',recoveryFrames:121},{mode:'break',recoveryFrames:3,unknown:true}])assert.throws(()=>validateAttack({...freshAttack(),guardInteraction}));assert.throws(()=>validateAttack({...move(),blockable:false}));});

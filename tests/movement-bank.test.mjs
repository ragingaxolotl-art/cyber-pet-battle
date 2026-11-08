import test from 'node:test';import assert from 'node:assert/strict';
import {emptyBank,saveToBank,encodeBank,decodeBank,validateBank,createClassroomBank} from '../site/shared/attack-bank.js';
import {freshAttack,validateAttack} from '../site/shared/combat-model.js';
const attack=()=>({...freshAttack(),movementCancels:[{id:'movement_dash',action:'dash',direction:'input',start:4,duration:8,condition:'hit',cost:2}]});
test('version11 bank backup retains movement windows and untouched legacy definitions',()=>{
 const old=saveToBank(emptyBank(),freshAttack(),validateAttack),before=structuredClone(old),a=attack(),bank=saveToBank(old,a,validateAttack);
 assert.equal(bank.version,11);assert.deepEqual(old,before);assert.deepEqual(validateBank(decodeBank(encodeBank(bank)),validateAttack),bank);assert.deepEqual(bank.attacks[1],a);
 assert.throws(()=>validateBank({...bank,version:10},validateAttack),/version 11/);
});
test('version11 negotiated read and revision-protected write preserve movement definitions',async()=>{
 const bank=saveToBank(emptyBank(),attack(),validateAttack),requests=[];
 const remote=createClassroomBank(validateAttack,async(url,options)=>{requests.push({url,options});return {ok:true,json:async()=>url.endsWith('/capabilities')?{bankVersions:[1,10,11],attackVersions:[1,10,11],revisionProtection:true}:{bank,revision:4}};});
 assert.deepEqual((await remote.read()).bank,bank);assert.equal(requests.at(-1).options.headers['X-Attack-Bank-Version'],'11');
 await remote.write(bank,4);assert.deepEqual(JSON.parse(requests.at(-1).options.body),{bank,revision:4});assert.equal(requests.at(-1).options.headers['X-Attack-Bank-Version'],'11');
});
test('older classroom server cannot receive a movement-window write',async()=>{
 const bank=saveToBank(emptyBank(),attack(),validateAttack),before=structuredClone(bank),methods=[];
 const remote=createClassroomBank(validateAttack,async(url,options)=>{methods.push(options.method||'GET');return {ok:true,json:async()=>({bankVersions:[1,10],attackVersions:[1,10],revisionProtection:true})};});
 await assert.rejects(remote.write(bank,4),/version 11/);assert.deepEqual(methods,['GET']);assert.deepEqual(bank,before);
});

import test from 'node:test';import assert from 'node:assert/strict';
import {freshAttack,validateAttack,simulate,defaultStats} from '../site/shared/combat-model.js';
import {emptyBank,saveToBank,validateBank,encodeBank,decodeBank,createClassroomBank} from '../site/shared/attack-bank.js';
const move=()=>({...freshAttack('projectile'),projectileLifetime:120,projectileContact:'single'});
test('contact version19 bank roundtrip and older-server refusal preserve data',async()=>{
 const a=move(),old=saveToBank(emptyBank(),freshAttack(),validateAttack),before=structuredClone(old),bank=saveToBank(old,a,validateAttack);assert.equal(bank.version,19);assert.deepEqual(old,before);assert.deepEqual(validateBank(decodeBank(encodeBank(bank)),validateAttack),bank);assert.throws(()=>validateBank({...bank,version:18},validateAttack),/version 19/);
 let modern=true;const calls=[];const remote=createClassroomBank(validateAttack,async(url,options)=>{calls.push({url,options});return {ok:true,json:async()=>url.endsWith('/capabilities')?{bankVersions:modern?[1,18,19]:[1,18],attackVersions:modern?[1,18,19]:[1,18],revisionProtection:true}:{bank,revision:2}};});
 await remote.read();assert.equal(calls.at(-1).options.headers['X-Attack-Bank-Version'],'19');await remote.write(bank,2);assert.deepEqual(JSON.parse(calls.at(-1).options.body),{bank,revision:2});modern=false;calls.length=0;await assert.rejects(remote.write(bank,2),/version 19/);assert.equal(calls.length,1);assert.notEqual(calls[0].options.method,'PUT');
});
test('single-contact preview never schedules later repeated hits',()=>{const a={...move(),startup:0,active:60,cost:0,hitLimit:5,hitInterval:2,projectileSpeed:0,knockback:0},stats={...defaultStats(),speed:0};for(const guard of [false,true]){const result=simulate(a,stats,stats,{distance:50,guard});assert.equal(result.frames.at(-1).hits,1);assert.equal(result.frames.find(f=>f.hits).projectileAlive,false);}});

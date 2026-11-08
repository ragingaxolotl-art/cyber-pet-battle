import test from 'node:test';import assert from 'node:assert/strict';
import {freshAttack,validateAttack,validateDesign} from '../site/shared/combat-model.js';
import {attackVersion,requireGroupVersion} from '../site/shared/attack-format.js';
import {emptyBank,saveToBank,validateBank,encodeBank,decodeBank,createClassroomBank} from '../site/shared/attack-bank.js';
import {jugglePreset} from '../site/shared/hit-sequence.js';
const bounces={floor:{height:30,distance:15,frames:24}};
const move=()=>({...freshAttack(),bounces:structuredClone(bounces)});
test('bounce version16 round trip preserves old definitions and rejects mislabeled envelopes',()=>{
 const a=move(),legacy=freshAttack();validateAttack(a);assert.equal(attackVersion(a),16);assert.equal(attackVersion(legacy),1);assert.throws(()=>requireGroupVersion(15,[a]),/version 16/);
 const old=saveToBank(emptyBank(),legacy,validateAttack),before=structuredClone(old),bank=saveToBank(old,a,validateAttack);
 assert.equal(bank.version,16);assert.deepEqual(validateBank(decodeBank(encodeBank(bank)),validateAttack),bank);assert.deepEqual(old,before);
 assert.deepEqual(validateDesign({format:'cyber-pet-combat-design',version:16,attacks:[a]}).attacks[0].bounces,bounces);
 assert.throws(()=>validateBank({...bank,version:15},validateAttack),/version 16/);
});
test('bounce schema rejects conflicting slams and settings with no moving reaction',()=>{
 assert.throws(()=>validateAttack({...move(),floorSlam:true}),/either a slam/);
 validateAttack({...move(),wallSlam:true});
 assert.throws(()=>validateAttack({...move(),payload:'heal'}),/ordinary damage/);
 assert.throws(()=>validateAttack({...move(),bounces:{floor:{...bounces.floor,frames:121}}}),/Bounce frames/);
 const a={...freshAttack('area'),behaviorVersion:2,sequenceTiming:'cast',impactTrigger:'timed',hitEvents:jugglePreset(1).map(e=>({...e,bounces}))};
 validateAttack(a);assert.equal(attackVersion(a),16);assert.deepEqual(saveToBank(emptyBank(),a,validateAttack).attacks[0].hitEvents[0].bounces,bounces);
 assert.throws(()=>validateAttack({...a,bounces}),/per-hit/);
 a.hitEvents[0].reaction='none';assert.throws(()=>validateAttack(a),/moving hit/);
});
test('classroom clients negotiate16 and refuse bounce writes to older servers',async()=>{
 const bank=saveToBank(emptyBank(),move(),validateAttack),calls=[];let modern=true;
 const remote=createClassroomBank(validateAttack,async(url,options)=>{calls.push({url,options});return {ok:true,json:async()=>url.endsWith('/capabilities')?{bankVersions:modern?[1,15,16]:[1,15],attackVersions:modern?[1,15,16]:[1,15],revisionProtection:true}:{bank,revision:3}};});
 await remote.read();assert.equal(calls.at(-1).options.headers['X-Attack-Bank-Version'],'16');await remote.write(bank,3);assert.deepEqual(JSON.parse(calls.at(-1).options.body),{bank,revision:3});
 modern=false;calls.length=0;await assert.rejects(remote.write(bank,3),/version 16/);assert.equal(calls.length,1);assert.notEqual(calls[0].options.method,'PUT');
});

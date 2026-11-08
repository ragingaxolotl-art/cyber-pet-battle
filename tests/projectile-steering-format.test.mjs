import test from 'node:test';import assert from 'node:assert/strict';
import {freshAttack,validateAttack,validateDesign} from '../site/shared/combat-model.js';
import {attackVersion,requireGroupVersion} from '../site/shared/attack-format.js';
import {emptyBank,saveToBank,validateBank,encodeBank,decodeBank,createClassroomBank} from '../site/shared/attack-bank.js';
const move=()=>({...freshAttack('projectile'),projectileLifetime:120,projectileSteering:{mode:'return',turnRate:15,returnAfter:30}});
test('steering version17 round trip preserves old definitions and rejects mislabeled envelopes',()=>{
 const a=move(),legacy=freshAttack();validateAttack(a);assert.equal(attackVersion(a),17);assert.equal(attackVersion(legacy),1);assert.throws(()=>requireGroupVersion(16,[a]),/version 17/);
 const old=saveToBank(emptyBank(),legacy,validateAttack),before=structuredClone(old),bank=saveToBank(old,a,validateAttack);
 assert.equal(bank.version,17);assert.deepEqual(validateBank(decodeBank(encodeBank(bank)),validateAttack),bank);assert.deepEqual(old,before);
 assert.deepEqual(validateDesign({format:'cyber-pet-combat-design',version:17,attacks:[a]}).attacks[0].projectileSteering,a.projectileSteering);
 assert.throws(()=>validateBank({...bank,version:16},validateAttack),/version 17/);
});
test('steering requires independent lifetime and does not silently replace authored paths',()=>{
 const a=move();delete a.projectileLifetime;assert.throws(()=>validateAttack(a),/independent projectile/);
 assert.throws(()=>validateAttack({...move(),motionPath:[{x:0,y:0},{x:20,y:0}]}),/steering or/);
 assert.throws(()=>validateAttack({...move(),projectileSteering:{mode:'homing',turnRate:15,returnAfter:30}}),/Unexpected/);
 validateAttack({...move(),projectileSteering:{mode:'homing',turnRate:15}});
});
test('classroom clients negotiate17 and refuse steering writes to older servers',async()=>{
 const bank=saveToBank(emptyBank(),move(),validateAttack),calls=[];let modern=true;
 const remote=createClassroomBank(validateAttack,async(url,options)=>{calls.push({url,options});return {ok:true,json:async()=>url.endsWith('/capabilities')?{bankVersions:modern?[1,16,17]:[1,16],attackVersions:modern?[1,16,17]:[1,16],revisionProtection:true}:{bank,revision:3}};});
 await remote.read();assert.equal(calls.at(-1).options.headers['X-Attack-Bank-Version'],'17');await remote.write(bank,3);assert.deepEqual(JSON.parse(calls.at(-1).options.body),{bank,revision:3});
 modern=false;calls.length=0;await assert.rejects(remote.write(bank,3),/version 17/);assert.equal(calls.length,1);assert.notEqual(calls[0].options.method,'PUT');
});

import {attackDiagnostics} from '../site/shared/attack-diagnostics.js';
test('return expiry diagnostics distinguish unreachable return from valid timing',()=>{
 assert.ok(attackDiagnostics(move()).some(d=>d.code==='steering-return-window'));
 assert.ok(!attackDiagnostics({...move(),active:120}).some(d=>d.code==='steering-return-window'));
 assert.ok(attackDiagnostics({...move(),projectileLifetime:30}).some(d=>d.code==='steering-return-expiry'));
 assert.ok(!attackDiagnostics(move()).some(d=>d.code==='steering-return-expiry'));
});

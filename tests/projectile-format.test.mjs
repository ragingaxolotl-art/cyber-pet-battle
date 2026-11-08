import test from 'node:test';import assert from 'node:assert/strict';
import {freshAttack,validateAttack,validateDesign,defaultStats,simulate} from '../site/shared/combat-model.js';
import {attackVersion} from '../site/shared/attack-format.js';
import {emptyBank,saveToBank,validateBank,createClassroomBank} from '../site/shared/attack-bank.js';
import {jugglePreset} from '../site/shared/hit-sequence.js';
const persistent=()=>({...freshAttack('projectile'),projectileLifetime:60,startup:5,projectileSpeed:12,impactTrigger:'contact',cost:0,base:7,coefficient:0,knockback:0});
test('independent lifetime survives project and local bank round trips only in version 7',()=>{
 const attack=persistent();assert.equal(attackVersion(attack),7);
 const bank=saveToBank(emptyBank(),attack,validateAttack);assert.equal(bank.version,7);
 assert.equal(validateBank(JSON.parse(JSON.stringify(bank)),validateAttack).attacks[0].projectileLifetime,60);
 for(let version=1;version<7;version++)assert.throws(()=>validateDesign({format:'cyber-pet-combat-design',version,attacks:[attack]}),/version 7/);
 assert.equal(validateDesign({format:'cyber-pet-combat-design',version:7,attacks:[attack]}).attacks[0].projectileLifetime,60);
});
test('lifetime validation rejects invalid fields and mismatched travel startup',()=>{
 for(const value of [null,false,0,601,1.1,'30'])assert.throws(()=>validateAttack({...persistent(),projectileLifetime:value}),/lifetime/);
 assert.throws(()=>validateAttack({...persistent(),delivery:'melee'}),/projectile/);
 assert.throws(()=>validateAttack({...persistent(),projectileStart:0}),/startup/);
 assert.equal(attackVersion(freshAttack()),1);
});
test('version 6 server rejects persistence before any bank write',async()=>{
 let writes=0;const client=createClassroomBank(validateAttack,async(url,options)=>{if(options.method==='PUT')writes++;return {ok:true,json:async()=>({bankVersions:[1,2,3,4,5,6],attackVersions:[1,2,3,4,5,6],revisionProtection:true})};});
 await assert.rejects(client.write(saveToBank(emptyBank(),persistent(),validateAttack),0),/version 7/);assert.equal(writes,0);
});
for(const sequence of [false,true])test(`${sequence?'sequence':'ordinary'} preview distinguishes interruption before and after launch`,()=>{
 const attack=persistent();if(sequence)Object.assign(attack,{behaviorVersion:2,projectileMode:'attached',hitEvents:jugglePreset(3,3)});
 const stats={...defaultStats(),speed:0};
 const before=simulate(attack,stats,stats,{distance:200,incomingFrame:2,incomingDamage:1,targetHP:1});
 const after=simulate(attack,stats,stats,{distance:200,incomingFrame:6,incomingDamage:1,targetHP:1});
 assert.equal(before.frames.at(-1).hits,0);assert.equal(after.frames.at(-1).hits,sequence?3:1);
 const expired=simulate({...attack,projectileLifetime:2},stats,stats,{distance:200,targetHP:1});assert.equal(expired.frames.at(-1).hits,0);
});
test('preview separates owner recovery from traveling projectile and stops visuals at expiry',()=>{
 const attack={...persistent(),startup:0,active:1,recovery:0,projectileSpeed:1,projectileLifetime:20};
 const stats={...defaultStats(),speed:0},preview=simulate(attack,stats,stats,{distance:200,targetHP:1});
 assert.equal(preview.frames[5].ownerActive,false);assert.equal(preview.frames[5].projectileAlive,true);
 assert.equal(preview.frames[19].projectileAlive,true);assert.equal(preview.frames[20].projectileAlive,false);
});
test('independent synced owner pose does not wait for distant projectile impact',async()=>{
 const {posePlayback}=await import('../site/shared/pose-timing.js');
 const attack={...persistent(),startup:5,active:1,recovery:2};
 const pose=posePlayback(attack,8,8,{startup:5,active:1,recovery:2},100);
 assert.equal(pose.finished,true);assert.equal(pose.end,8);
 const old={...attack};delete old.projectileLifetime;assert.equal(posePlayback(old,8,8,{startup:5,active:1,recovery:2},100).finished,false);
});

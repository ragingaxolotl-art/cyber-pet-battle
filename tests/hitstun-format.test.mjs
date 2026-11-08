import test from 'node:test';import assert from 'node:assert/strict';
import {freshAttack,validateAttack} from '../site/shared/combat-model.js';import {attackVersion,requireGroupVersion} from '../site/shared/attack-format.js';
import {emptyBank,saveToBank,validateBank,encodeBank,decodeBank,createClassroomBank} from '../site/shared/attack-bank.js';
const move=()=>({...freshAttack(),hitstunScaling:{step:3,minimum:1}});
test('hitstun rules requires version15 and round trips without mutating legacy attacks',()=>{
 const a=move(),legacy=freshAttack();validateAttack(a);assert.equal(attackVersion(a),15);assert.equal(attackVersion(legacy),1);assert.throws(()=>requireGroupVersion(14,[a]),/version 15/);
 const old=saveToBank(emptyBank(),legacy,validateAttack),before=structuredClone(old),bank=saveToBank(old,a,validateAttack);assert.equal(bank.version,15);assert.deepEqual(validateBank(decodeBank(encodeBank(bank)),validateAttack),bank);assert.deepEqual(old,before);
 assert.throws(()=>validateAttack({...a,hitstunScaling:{step:121,minimum:1}}),/0 to 120/);
});
test('version15 reads negotiate support and old servers cannot receive hitstun rules writes',async()=>{
 const bank=saveToBank(emptyBank(),move(),validateAttack),calls=[];let modern=true;
 const remote=createClassroomBank(validateAttack,async(url,options)=>{calls.push({url,options});return {ok:true,json:async()=>url.endsWith('/capabilities')?{bankVersions:modern?[1,14,15]:[1,14],attackVersions:modern?[1,14,15]:[1,14],revisionProtection:true}:{bank,revision:3}};});
 assert.deepEqual((await remote.read()).bank,bank);assert.equal(calls.at(-1).options.headers['X-Attack-Bank-Version'],'15');await remote.write(bank,3);assert.deepEqual(JSON.parse(calls.at(-1).options.body),{bank,revision:3});
 modern=false;calls.length=0;await assert.rejects(remote.write(bank,3),/version 15/);assert.equal(calls.length,1);assert.notEqual(calls[0].options.method,'PUT');
});

import {validateDesign} from '../site/shared/combat-model.js';
import {validateTree} from '../site/shared/skill-tree-model.js';
test('version15 project and tree preserve hitstun rules while version14 rejects it',()=>{
 const attack=move(),project={format:'cyber-pet-combat-design',version:15,attacks:[attack]};
 assert.deepEqual(validateDesign(JSON.parse(JSON.stringify(project))).attacks[0].hitstunScaling,attack.hitstunScaling);
 assert.throws(()=>validateDesign({...project,version:14}),/version 15/);
 const tree={format:'cyber-pet-attack-skill-tree',version:15,nodes:[{id:'node_test',name:'Test',description:'Anonymous fixture',branch:'Test',effectId:'test_effect',state:'ready',requirement:'all',requires:[],x:0,y:0,attack}]};
 assert.deepEqual(validateTree(JSON.parse(JSON.stringify(tree)),new Set(['test_effect']),validateAttack),tree);
 assert.throws(()=>validateTree({...tree,version:14},new Set(['test_effect']),validateAttack),/version 15/);
});

import {jugglePreset} from '../site/shared/hit-sequence.js';
import {attackDiagnostics} from '../site/shared/attack-diagnostics.js';
test('per-event hitstun alone upgrades the bank and preserves zero versus absent values',()=>{
 const attack={...freshAttack('area'),behaviorVersion:2,sequenceTiming:'cast',impactTrigger:'timed',hitEvents:jugglePreset(3,4)};
 attack.hitEvents[0].hitstun=0;attack.hitEvents[1].hitstun=12;
 const bank=saveToBank(emptyBank(),attack,validateAttack);assert.equal(bank.version,15);
 const restored=validateBank(decodeBank(encodeBank(bank)),validateAttack).attacks[0];assert.equal(restored.hitEvents[0].hitstun,0);assert.equal(restored.hitEvents[1].hitstun,12);assert.equal(Object.hasOwn(restored.hitEvents[2],'hitstun'),false);
 assert.throws(()=>validateBank({...bank,version:14},validateAttack),/version 15/);
 assert.ok(attackDiagnostics(restored).some(d=>d.code==='hitstun-recovery'));
});

import test from 'node:test';import assert from 'node:assert/strict';
import {freshAttack,validateAttack} from '../site/shared/combat-model.js';import {attackVersion,requireGroupVersion} from '../site/shared/attack-format.js';
import {emptyBank,saveToBank,validateBank,encodeBank,decodeBank,createClassroomBank} from '../site/shared/attack-bank.js';
const move=()=>({...freshAttack(),counterHit:{phases:['startup','active'],damagePercent:150}});
test('counter-hit rules requires version14 and round trips without mutating legacy attacks',()=>{
 const a=move(),legacy=freshAttack();validateAttack(a);assert.equal(attackVersion(a),14);assert.equal(attackVersion(legacy),1);assert.throws(()=>requireGroupVersion(13,[a]),/version 14/);
 const old=saveToBank(emptyBank(),legacy,validateAttack),before=structuredClone(old),bank=saveToBank(old,a,validateAttack);assert.equal(bank.version,14);assert.deepEqual(validateBank(decodeBank(encodeBank(bank)),validateAttack),bank);assert.deepEqual(old,before);
 assert.throws(()=>validateAttack({...a,counterHit:{phases:['startup'],damagePercent:301}}),/100 to 300/);
});
test('version14 reads negotiate support and old servers cannot receive counter-hit rules writes',async()=>{
 const bank=saveToBank(emptyBank(),move(),validateAttack),calls=[];let modern=true;
 const remote=createClassroomBank(validateAttack,async(url,options)=>{calls.push({url,options});return {ok:true,json:async()=>url.endsWith('/capabilities')?{bankVersions:modern?[1,13,14]:[1,13],attackVersions:modern?[1,13,14]:[1,13],revisionProtection:true}:{bank,revision:3}};});
 assert.deepEqual((await remote.read()).bank,bank);assert.equal(calls.at(-1).options.headers['X-Attack-Bank-Version'],'14');await remote.write(bank,3);assert.deepEqual(JSON.parse(calls.at(-1).options.body),{bank,revision:3});
 modern=false;calls.length=0;await assert.rejects(remote.write(bank,3),/version 14/);assert.equal(calls.length,1);assert.notEqual(calls[0].options.method,'PUT');
});

import {validateDesign} from '../site/shared/combat-model.js';
import {validateTree} from '../site/shared/skill-tree-model.js';
test('version14 project and tree preserve counter-hit rules while version13 rejects it',()=>{
 const attack=move(),project={format:'cyber-pet-combat-design',version:14,attacks:[attack]};
 assert.deepEqual(validateDesign(JSON.parse(JSON.stringify(project))).attacks[0].counterHit,attack.counterHit);
 assert.throws(()=>validateDesign({...project,version:13}),/version 14/);
 const tree={format:'cyber-pet-attack-skill-tree',version:14,nodes:[{id:'node_test',name:'Test',description:'Anonymous fixture',branch:'Test',effectId:'test_effect',state:'ready',requirement:'all',requires:[],x:0,y:0,attack}]};
 assert.deepEqual(validateTree(JSON.parse(JSON.stringify(tree)),new Set(['test_effect']),validateAttack),tree);
 assert.throws(()=>validateTree({...tree,version:13},new Set(['test_effect']),validateAttack),/version 14/);
});

import test from 'node:test';import assert from 'node:assert/strict';
import {freshAttack,validateAttack} from '../site/shared/combat-model.js';import {attackVersion,requireGroupVersion} from '../site/shared/attack-format.js';
import {emptyBank,saveToBank,validateBank,encodeBank,decodeBank,createClassroomBank} from '../site/shared/attack-bank.js';
const move=()=>({...freshAttack(),comboScaling:{step:25,minimum:20}});
test('combo scaling requires version13 and round trips without mutating legacy attacks',()=>{
 const a=move(),legacy=freshAttack();validateAttack(a);assert.equal(attackVersion(a),13);assert.equal(attackVersion(legacy),1);assert.throws(()=>requireGroupVersion(12,[a]),/version 13/);
 const old=saveToBank(emptyBank(),legacy,validateAttack),before=structuredClone(old),bank=saveToBank(old,a,validateAttack);assert.equal(bank.version,13);assert.deepEqual(validateBank(decodeBank(encodeBank(bank)),validateAttack),bank);assert.deepEqual(old,before);
 assert.throws(()=>validateAttack({...a,comboScaling:{step:101,minimum:20}}),/0 to 100/);
});
test('version13 reads negotiate support and old servers cannot receive scaling writes',async()=>{
 const bank=saveToBank(emptyBank(),move(),validateAttack),calls=[];let modern=true;
 const remote=createClassroomBank(validateAttack,async(url,options)=>{calls.push({url,options});return {ok:true,json:async()=>url.endsWith('/capabilities')?{bankVersions:modern?[1,12,13]:[1,12],attackVersions:modern?[1,12,13]:[1,12],revisionProtection:true}:{bank,revision:3}};});
 assert.deepEqual((await remote.read()).bank,bank);assert.equal(calls.at(-1).options.headers['X-Attack-Bank-Version'],'13');await remote.write(bank,3);assert.deepEqual(JSON.parse(calls.at(-1).options.body),{bank,revision:3});
 modern=false;calls.length=0;await assert.rejects(remote.write(bank,3),/version 13/);assert.equal(calls.length,1);assert.notEqual(calls[0].options.method,'PUT');
});

import {validateDesign} from '../site/shared/combat-model.js';
import {validateTree} from '../site/shared/skill-tree-model.js';
test('version13 project and tree preserve scaling while version12 rejects it',()=>{
 const attack=move(),project={format:'cyber-pet-combat-design',version:13,attacks:[attack]};
 assert.deepEqual(validateDesign(JSON.parse(JSON.stringify(project))).attacks[0].comboScaling,attack.comboScaling);
 assert.throws(()=>validateDesign({...project,version:12}),/version 13/);
 const tree={format:'cyber-pet-attack-skill-tree',version:13,nodes:[{id:'node_test',name:'Test',description:'Anonymous fixture',branch:'Test',effectId:'test_effect',state:'ready',requirement:'all',requires:[],x:0,y:0,attack}]};
 assert.deepEqual(validateTree(JSON.parse(JSON.stringify(tree)),new Set(['test_effect']),validateAttack),tree);
 assert.throws(()=>validateTree({...tree,version:12},new Set(['test_effect']),validateAttack),/version 13/);
});

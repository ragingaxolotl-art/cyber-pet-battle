import test from 'node:test';import assert from 'node:assert/strict';
import {freshAttack,validateAttack,validateDesign} from '../site/shared/combat-model.js';
import {emptyBank,saveToBank,validateBank,encodeBank,decodeBank,createClassroomBank} from '../site/shared/attack-bank.js';
const move=()=>{const a=freshAttack();a.hurtboxes={frames:[{boxes:[{x:-14,y:-60,w:28,h:60,shape:'ellipse'}]}]};return a;};
test('hurtbox version26 bank roundtrip and older-server refusal preserve data',async()=>{
 const a=move(),old=saveToBank(emptyBank(),freshAttack(),validateAttack),before=structuredClone(old),bank=saveToBank(old,a,validateAttack);assert.equal(bank.version,26);assert.deepEqual(old,before);assert.deepEqual(validateBank(decodeBank(encodeBank(bank)),validateAttack),bank);assert.throws(()=>validateBank({...bank,version:25},validateAttack),/version 26/);
 let modern=true;const calls=[];const remote=createClassroomBank(validateAttack,async(url,options)=>{calls.push({url,options});return {ok:true,json:async()=>url.endsWith('/capabilities')?{bankVersions:modern?[1,25,26]:[1,25],attackVersions:modern?[1,25,26]:[1,25],revisionProtection:true}:{bank,revision:2}};});
 await remote.read();assert.equal(calls.at(-1).options.headers['X-Attack-Bank-Version'],'26');await remote.write(bank,2);assert.deepEqual(JSON.parse(calls.at(-1).options.body),{bank,revision:2});modern=false;calls.length=0;await assert.rejects(remote.write(bank,2),/version 26/);assert.equal(calls.length,1);assert.notEqual(calls[0].options.method,'PUT');
});

import {validateTree,treeVersion} from '../site/shared/skill-tree-model.js';
 test('hurtboxes require version26 across project and learning-tree imports',()=>{
 const a=move(), project={format:'cyber-pet-combat-design',version:26,attacks:[a]};
 assert.deepEqual(validateDesign(JSON.parse(JSON.stringify(project))),project);
 assert.throws(()=>validateDesign({...project,version:25}),/version 26/);
 const tree={format:'cyber-pet-attack-skill-tree',version:26,nodes:[{id:'sample',name:'Sample',description:'',branch:'Physical',effectId:'sample',state:'draft',requirement:'all',requires:[],x:0,y:0,attack:a}]};
 assert.equal(treeVersion(tree),26);assert.deepEqual(validateTree(tree,new Set(['sample']),validateAttack),tree);
 assert.throws(()=>validateTree({...tree,version:25},new Set(['sample']),validateAttack),/version 26/);
 });

import test from 'node:test';
import assert from 'node:assert/strict';
import {freshAttack,validateAttack,validateDesign} from '../site/shared/combat-model.js';
import {emptyBank,saveToBank,validateBank,encodeBank,decodeBank,createClassroomBank} from '../site/shared/attack-bank.js';
import {validateTree,treeVersion} from '../site/shared/skill-tree-model.js';
const canceled=()=>({...freshAttack(),cancelWindows:[{id:'cancel_first',start:3,duration:12,condition:'hit',attacks:['attack_followup']}]});
test('cancel survives mixed project, bank and tree round trips with version 5',()=>{
 const old=saveToBank(emptyBank(),freshAttack(),validateAttack),before=structuredClone(old),a=canceled(),bank=saveToBank(old,a,validateAttack);
 assert.equal(bank.version,5);assert.deepEqual(old,before);assert.deepEqual(validateBank(decodeBank(encodeBank(bank)),validateAttack),bank);
 const project={format:'cyber-pet-combat-design',version:5,attacks:bank.attacks};assert.deepEqual(validateDesign(JSON.parse(JSON.stringify(project))),project);
 const tree={format:'cyber-pet-attack-skill-tree',version:5,nodes:[{id:'one',name:'Armored strike',description:'',branch:'Earth',effectId:'sample',state:'ready',requirement:'all',requires:[],x:0,y:0,attack:a}]};
 assert.deepEqual(validateTree(JSON.parse(JSON.stringify(tree)),new Set(['sample']),validateAttack),tree);assert.equal(treeVersion(tree),5);
 for(const version of [1,2,3,4]){assert.throws(()=>validateDesign({...project,version}),/version 5/);assert.throws(()=>validateBank({...bank,version},validateAttack),/version 5/);assert.throws(()=>validateTree({...tree,version},new Set(['sample']),validateAttack),/version 5/);}
});
test('current v4 classroom server cannot receive cancel writes',async()=>{
 const calls=[],bank=saveToBank(emptyBank(),canceled(),validateAttack),before=structuredClone(bank);
 const remote=createClassroomBank(validateAttack,async(url,options)=>{calls.push(options);return {ok:true,json:async()=>({bankVersions:[1,2,3,4],attackVersions:[1,2,3,4],revisionProtection:true})};});
 await assert.rejects(remote.write(bank,7),/version 5/);assert.equal(calls.length,1);assert.notEqual(calls[0].method,'PUT');assert.deepEqual(bank,before);
});
test('v5 server negotiation preserves cancel and revision in both directions',async()=>{
 const bank=saveToBank(emptyBank(),canceled(),validateAttack),calls=[];
 const remote=createClassroomBank(validateAttack,async(url,options)=>{calls.push({url,options});if(url.endsWith('/capabilities'))return {ok:true,json:async()=>({bankVersions:[1,2,3,4,5],attackVersions:[1,2,3,4,5],revisionProtection:true})};assert.equal(options.headers['X-Attack-Bank-Version'],'5');return {ok:true,json:async()=>({bank,revision:8})};});
 assert.deepEqual((await remote.read()).bank,bank);await remote.write(bank,7);assert.deepEqual(JSON.parse(calls.at(-1).options.body),{bank,revision:7});
});

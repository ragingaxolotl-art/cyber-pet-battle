import test from 'node:test';
import assert from 'node:assert/strict';
import {freshAttack,validateAttack,validateDesign} from '../site/shared/combat-model.js';
import {emptyBank,saveToBank,validateBank,encodeBank,decodeBank,createClassroomBank} from '../site/shared/attack-bank.js';
import {validateTree,treeVersion} from '../site/shared/skill-tree-model.js';
const armored=()=>({...freshAttack(),defenseWindows:[{id:'defense_first',kind:'armor',start:3,duration:12,hits:2,against:'projectile'}]});
test('armor survives mixed project, bank and tree round trips with version 4',()=>{
 const old=saveToBank(emptyBank(),freshAttack(),validateAttack),before=structuredClone(old),a=armored(),bank=saveToBank(old,a,validateAttack);
 assert.equal(bank.version,4);assert.deepEqual(old,before);assert.deepEqual(validateBank(decodeBank(encodeBank(bank)),validateAttack),bank);
 const project={format:'cyber-pet-combat-design',version:4,attacks:bank.attacks};assert.deepEqual(validateDesign(JSON.parse(JSON.stringify(project))),project);
 const tree={format:'cyber-pet-attack-skill-tree',version:4,nodes:[{id:'one',name:'Armored strike',description:'',branch:'Earth',effectId:'sample',state:'ready',requirement:'all',requires:[],x:0,y:0,attack:a}]};
 assert.deepEqual(validateTree(JSON.parse(JSON.stringify(tree)),new Set(['sample']),validateAttack),tree);assert.equal(treeVersion(tree),4);
 for(const version of [1,2,3]){assert.throws(()=>validateDesign({...project,version}),/version 4/);assert.throws(()=>validateBank({...bank,version},validateAttack),/version 4/);assert.throws(()=>validateTree({...tree,version},new Set(['sample']),validateAttack),/version 4/);}
});
test('current v3 classroom server cannot receive armor writes',async()=>{
 const calls=[],bank=saveToBank(emptyBank(),armored(),validateAttack),before=structuredClone(bank);
 const remote=createClassroomBank(validateAttack,async(url,options)=>{calls.push(options);return {ok:true,json:async()=>({bankVersions:[1,2,3],attackVersions:[1,2,3],revisionProtection:true})};});
 await assert.rejects(remote.write(bank,7),/version 4/);assert.equal(calls.length,1);assert.notEqual(calls[0].method,'PUT');assert.deepEqual(bank,before);
});
test('v4 server negotiation preserves armor and revision in both directions',async()=>{
 const bank=saveToBank(emptyBank(),armored(),validateAttack),calls=[];
 const remote=createClassroomBank(validateAttack,async(url,options)=>{calls.push({url,options});if(url.endsWith('/capabilities'))return {ok:true,json:async()=>({bankVersions:[1,2,3,4],attackVersions:[1,2,3,4],revisionProtection:true})};assert.equal(options.headers['X-Attack-Bank-Version'],'4');return {ok:true,json:async()=>({bank,revision:8})};});
 assert.deepEqual((await remote.read()).bank,bank);await remote.write(bank,7);assert.deepEqual(JSON.parse(calls.at(-1).options.body),{bank,revision:7});
});

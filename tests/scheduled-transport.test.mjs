import test from 'node:test';import assert from 'node:assert/strict';
import {freshAttack,validateAttack,validateDesign} from '../site/shared/combat-model.js';
import {jugglePreset} from '../site/shared/hit-sequence.js';
import {emptyBank,saveToBank,encodeBank,decodeBank,validateBank,createClassroomBank} from '../site/shared/attack-bank.js';
import {validateTree,treeVersion} from '../site/shared/skill-tree-model.js';
const scheduled=()=>({...freshAttack('melee'),behaviorVersion:2,sequenceTiming:'cast',impactTrigger:'timed',hitEvents:jugglePreset(3,5)});
test('version10 project, bank and tree preserve scheduled hits alongside legacy attacks',()=>{
 const legacy=freshAttack(),attack=scheduled(),bank=saveToBank(saveToBank(emptyBank(),legacy,validateAttack),attack,validateAttack);
 assert.equal(bank.version,10);assert.deepEqual(validateBank(decodeBank(encodeBank(bank)),validateAttack),bank);
 const project={format:'cyber-pet-combat-design',version:10,attacks:bank.attacks};assert.deepEqual(validateDesign(structuredClone(project)),project);
 const tree={format:'cyber-pet-attack-skill-tree',version:10,nodes:[{id:'test',name:'Test',description:'Anonymous fixture',branch:'Earth',effectId:'',state:'ready',requirement:'all',requires:[],x:0,y:0,attack}]};
 assert.equal(treeVersion(tree),10);assert.deepEqual(validateTree(structuredClone(tree),new Set(['']),validateAttack),tree);
 for(const version of [1,2,9]){
  assert.throws(()=>validateDesign({...project,version}),/version 10/);
  assert.throws(()=>validateBank({...bank,version},validateAttack),/version 10/);
  assert.throws(()=>validateTree({...tree,version},new Set(['']),validateAttack),/version 10/);
 }
});
for(const supported of [false,true])test('scheduled bank capability negotiation supported='+supported,async()=>{
 const bank=saveToBank(emptyBank(),scheduled(),validateAttack),before=structuredClone(bank),requests=[];
 const remote=createClassroomBank(validateAttack,async(url,options)=>{
  requests.push({url,options});return {ok:true,status:200,json:async()=>url.endsWith('/capabilities')?{bankVersions:supported?[1,10]:[1,9],attackVersions:supported?[1,10]:[1,9],revisionProtection:true}:{bank,revision:5}};
 });
 if(supported){await remote.write(bank,4);assert.equal(requests[1].options.headers['X-Attack-Bank-Version'],'10');assert.deepEqual(JSON.parse(requests[1].options.body),{bank,revision:4});requests.length=0;assert.deepEqual((await remote.read()).bank,bank);assert.equal(requests[1].options.headers['X-Attack-Bank-Version'],'10');}
 else{await assert.rejects(remote.write(bank,4),/cannot safely save version 10/);assert.equal(requests.length,1);}
 assert.deepEqual(bank,before);
});

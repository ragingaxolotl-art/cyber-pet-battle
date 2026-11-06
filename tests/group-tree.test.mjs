import test from 'node:test';import assert from 'node:assert/strict';
import {validateTree,treeVersion} from '../site/shared/skill-tree-model.js';import {freshAttack,validateAttack} from '../site/shared/combat-model.js';
test('v3 skill tree roundtrip preserves grouped geometry and rejects old container versions',()=>{
 const attack={...freshAttack(),hitboxGroups:[{id:'group_first',hitLimit:1,hitInterval:2,boxes:[{id:'box_first',start:0,duration:4,shape:'diamond',x:22,y:-52,w:54,h:44}]}]};
 const tree={format:'cyber-pet-attack-skill-tree',version:3,nodes:[{id:'one',name:'Claws',description:'',branch:'Earth',effectId:'sample',state:'ready',requirement:'all',requires:[],x:0,y:0,attack}]};
 const restored=validateTree(JSON.parse(JSON.stringify(tree)),new Set(['sample']),validateAttack);assert.deepEqual(restored,tree);assert.equal(treeVersion(restored),3);
 for(const version of [1,2])assert.throws(()=>validateTree({...tree,version},new Set(['sample']),validateAttack),/version 3/);
});

import test from 'node:test';import assert from 'node:assert/strict';import {fileURLToPath} from 'node:url';
import {environment} from './dom-harness.mjs';import {installWorkshop} from '../site/workshop.js';import {freshAttack} from '../site/shared/combat-model.js';import {bankTree} from '../site/skill-trees.js';
const root=fileURLToPath(new URL('../site/',import.meta.url));
async function setup(){const env=environment(root+'index.html',root),workshop=await installWorkshop({getPet:()=>null,pause(){},changed(){},status(){},testAttack(){},cloud:{}});env.ids.get('skillTrees').disabled=false;return {env,workshop,picker:document.querySelectorAll('select').find(n=>n.getAttribute('aria-label')==='Data set / Tree')};}
test('active default and directly imported trees are represented in the selector',async()=>{
 const {env,workshop,picker}=await setup();assert.equal(picker.value,'current');assert.equal(picker.options[0].textContent,'Current tree');
 await workshop.useBank([{...freshAttack(),name:'Imported audit attack'}]);assert.equal(picker.value,'current');assert.ok(picker.options.some(o=>o.value===picker.value));
 await env.ids.get('skillTrees').click();assert.match(env.ids.get('skillsDialog').textContent,/Imported audit attack/);assert.doesNotMatch(picker.textContent,/Choose a tree/);
});
test('dataset selection restores after reopen and failed selection reports the tree still in use',async()=>{
 const {env,workshop,picker}=await setup(),first=bankTree([{...freshAttack(),name:'First attack'}]),second=bankTree([{...freshAttack(),name:'Second attack'}]);
 const bundle={format:'cyber-pet-tree-data-set',name:'Audit data',trees:[{id:'one',name:'One',tree:first},{id:'two',name:'Two',tree:second}]};
 await env.ids.get('treeFile').onchange({target:{files:[{size:1000,text:async()=>JSON.stringify(bundle)}],value:''}});assert.equal(picker.value,'0');
 env.ids.get('treeStatus').textContent='Earlier import error';picker.value='1';await picker.onchange();assert.match(env.ids.get('treeStatus').textContent,/Tree loaded/);assert.ok(workshop.registry().some(a=>a.name==='Second attack'));
 picker.value='999';await picker.onchange();assert.equal(picker.value,'1');assert.ok(workshop.registry().some(a=>a.name==='Second attack'));
 await env.ids.get('skillTrees').click();assert.equal(picker.value,'1');
 // A new controller reads the persisted active tree, without changing its choice.
 const secondController=await installWorkshop({getPet:()=>null,pause(){},changed(){},status(){},testAttack(){},cloud:{}});
 const pickers=document.querySelectorAll('select').filter(n=>n.getAttribute('aria-label')==='Data set / Tree');assert.equal(pickers[0].value,'1');assert.ok(secondController.registry().some(a=>a.name==='Second attack'));
});

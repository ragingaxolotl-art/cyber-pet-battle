import test from 'node:test';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {environment} from './dom-harness.mjs';
import {installWorkshop} from '../site/workshop.js';
const root=fileURLToPath(new URL('../site/',import.meta.url));
for(const [inputId,kind] of [['battleProfileFile','battle profile'],['treeFile','tree or data set']])test(kind+' import explains unreadable and malformed files and preserves saved records',async()=>{
 const env=environment(root+'index.html',root);const workshop=await installWorkshop({getPet:()=>null,pause(){},changed(){},status(){},cloud:{}});
 const before=new Map(env.storage),profile=structuredClone(workshop.profile()),registry=structuredClone(workshop.registry()),input=env.ids.get(inputId);
 for(const [file,expected] of [[{size:20,text:async()=>'{broken'},/not valid JSON.*Export a new copy.*saved data has not changed/],[{size:20,text:async()=>{throw Error('unreadable path');}},/Could not read.*Choose the file again/],[{size:20,text:async()=>'null'},/Choose a (battle profile|version)/]]){
  input.value='previous';input.files=[file];await input.onchange({target:input});assert.equal(input.value,'');assert.match(env.ids.get('treeStatus').textContent,expected);
  assert.deepEqual(new Map(env.storage),before);assert.deepEqual(workshop.profile(),profile);assert.deepEqual(workshop.registry(),registry);
 }
});

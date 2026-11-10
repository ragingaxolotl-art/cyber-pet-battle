import test from 'node:test';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {environment} from './dom-harness.mjs';
import {installWorkshop} from '../site/workshop.js';
import {freshAttack} from '../site/shared/combat-model.js';
import {bankTree} from '../site/skill-trees.js';
import {TREE_LIBRARY_KEY} from '../site/tree-library.js';
const root=fileURLToPath(new URL('../site/',import.meta.url));
const PROFILE='cyber-pet-battle-profile-v1:practice-demo';
const TREE='cyber-pet-battle-tree-v1';
async function setup(){
 const env=environment(root+'index.html',root);
 const workshop=await installWorkshop({getPet:()=>null,pause(){},changed(){},status(){},testAttack(){},cloud:{}});
 const picker=document.querySelectorAll('select').find(n=>n.getAttribute('aria-label')==='Data set / Tree');
 const makeBundle=name=>({format:'cyber-pet-tree-data-set',name,trees:[{id:name,name,tree:bankTree([{...freshAttack(),name}])}]});
 const load=async bundle=>{const input=env.ids.get('treeFile');input.files=[{size:1000,text:async()=>JSON.stringify(bundle)}];input.value='selected';await input.onchange({target:input});assert.equal(input.value,'');};
 return {env,workshop,picker,makeBundle,load};
}
test('rejected stale-profile import preserves collection, active tree and displayed selection',async()=>{
 const {env,workshop,picker,makeBundle,load}=await setup();
 await load(makeBundle('Original audit tree'));const original=[...env.storage.entries()];
 const concurrent=JSON.parse(env.storage.get(PROFILE));concurrent.sets[0].name='Another tab kept this';env.storage.set(PROFILE,JSON.stringify(concurrent));
 const expected=[...env.storage.entries()],registry=structuredClone(workshop.registry()),selection=picker.value,choices=picker.textContent;
 await load(makeBundle('Rejected audit tree'));
 assert.match(env.ids.get('treeStatus').textContent,/another tab/);
 assert.deepEqual([...env.storage.entries()],expected,'rejected import must not replace the saved library');
 assert.equal(picker.value,selection);assert.equal(picker.textContent,choices);
 assert.deepEqual(workshop.registry(),registry);
 await workshop.openProfile();await load(makeBundle('Recovered audit tree'));
 assert.match(env.ids.get('treeStatus').textContent,/Tree loaded/);assert.equal(picker.value,'0');
 assert.equal(workshop.profile().sets[0].name,'Another tab kept this');
 assert.match(env.storage.get(TREE),/Recovered audit tree/);assert.match(env.storage.get(TREE_LIBRARY_KEY),/Recovered audit tree/);
 assert.notDeepEqual([...env.storage.entries()],original);
});
test('invalid later tree rejects the entire dataset before replacing any saved record',async()=>{
 const {env,workshop,makeBundle,load}=await setup();await load(makeBundle('Original audit tree'));
 const before=[...env.storage.entries()],profile=structuredClone(workshop.profile());
 const bundle=makeBundle('New valid tree');bundle.trees.push({id:'broken',name:'Broken',tree:{format:'invalid'}});
 await load(bundle);assert.deepEqual([...env.storage.entries()],before);assert.deepEqual(workshop.profile(),profile);
 assert.doesNotMatch(env.ids.get('treeStatus').textContent,/Tree loaded/);
});
test('queued tree imports grant starters from the latest in-memory profile without dropping an earlier saved set',async()=>{
 const {env,workshop,makeBundle,load}=await setup();await load(makeBundle('Original audit tree'));
 const queue=[];navigator.locks={request:(_name,callback)=>_name==='cyber-pet-tree-storage-legacy'?callback():new Promise((resolve,reject)=>queue.push(async()=>{try{resolve(await callback());}catch(error){reject(error);}}))};
 const add=env.ids.get('newSet').onclick();
 const importing=load(makeBundle('Queued audit tree'));await new Promise(resolve=>setImmediate(resolve));
 assert.equal(queue.length,2);await queue.shift()();await add;assert.equal(workshop.profile().sets.length,2);
 const sets=structuredClone(workshop.profile().sets);await queue.shift()();await importing;
 assert.deepEqual(workshop.profile().sets,sets,'queued import must retain the set just committed');
 assert.deepEqual(JSON.parse(env.storage.get(PROFILE)).sets,sets);
});

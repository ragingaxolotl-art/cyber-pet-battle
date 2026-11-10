import test from 'node:test';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {environment} from './dom-harness.mjs';
import {installMatchup} from '../site/matchup.js';
import {physicalCatalog} from '../site/catalog.js';
const root=fileURLToPath(new URL('../site/',import.meta.url));
const key='cyber-pet-matchup-scenario-v1';
const values=env=>Object.fromEntries([...env.ids].filter(([id,e])=>id.startsWith('matchup')&&['INPUT','SELECT'].includes(e.tagName)).map(([id,e])=>[id,String(e.value)]));
async function setup(){const env=environment(root+'index.html',root),$=id=>env.ids.get(id);installMatchup({getAttacks:physicalCatalog,pause(){}});await $('openMatchup').click();await $('saveMatchup').click();return{env,$,saved:JSON.parse(env.storage.get(key))};}
test('malformed saved scenario never partially replaces the current setup',async()=>{
 const {env,$,saved}=await setup();$('matchupDuration').value=120;$('matchupHeightA').value=25;$('matchupDistance').value=30;
 const before=values(env);saved.options.statsB={};env.storage.set(key,JSON.stringify(saved));await $('loadMatchup').click();assert.deepEqual(values(env),before);assert.doesNotMatch($('matchupSummary').textContent,/Scenario restored/);
});
test('invalid comparison settings cannot replace a valid saved scenario',async()=>{
 const {env,$}=await setup(),before=env.storage.get(key);$('matchupDuration').value=901;await $('saveMatchup').click();assert.equal(env.storage.get(key),before);assert.match($('matchupSummary').textContent,/Could not save/);
});

test('failed loads preserve every control and the saved bytes across malformed and unavailable scenarios',async()=>{
 const {env,$,saved}=await setup();$('matchupDuration').value=120;$('matchupDistance').value=30;
 const before=values(env);
 const cases=[null,'{',JSON.stringify({...saved,version:2}),JSON.stringify({...saved,a:'missing'}),JSON.stringify({...saved,options:null})];
 for(const patch of [{statsB:{}},{statsA:null},{statsA:{...saved.options.statsA,strength:'20'}},{statsB:{...saved.options.statsB,focus:100}},{heightA:null},{frames:901},{frames:0},{distance:'30'},{followupId:'missing'},{followupFrame:null},{placement:'missing'},{actionB:'missing'},{movementA:{action:'dash',frame:2,direction:0}},{movementA:{action:'missing',frame:2}},{recoveryBFrame:900}])cases.push(JSON.stringify({...saved,options:{...saved.options,...patch}}));
 for(const raw of cases){if(raw===null)env.storage.delete(key);else env.storage.set(key,raw);await $('loadMatchup').click();assert.match($('matchupSummary').textContent,/Could not load scenario/);assert.deepEqual(values(env),before);assert.equal(env.storage.get(key),raw??undefined);}
});

test('older saves receive usable defaults before the entire setup is restored',async()=>{
 const {env,$,saved}=await setup();env.storage.set(key,JSON.stringify({version:1,a:saved.a,b:saved.b,options:{distance:30}}));
 $('matchupHeightA').value=25;$('matchupDuration').value=120;await $('loadMatchup').click();
 assert.match($('matchupSummary').textContent,/Scenario restored/);assert.equal(Number($('matchupDistance').value),30);assert.equal(Number($('matchupDuration').value),900);assert.equal(Number($('matchupHeightA').value),0);assert.equal(Number($('matchupAstrength').value),20);assert.equal(Number($('matchupEnergyB').value),100);
 await $('runMatchup').click();assert.match($('matchupSummary').textContent,/combat frames/);
});

test('invalid and blank numeric edits neither run nor overwrite a valid saved scenario',async()=>{
 const {env,$}=await setup(),before=env.storage.get(key);
 for(const [id,value] of [['matchupAstrength','100'],['matchupBfocus','-1'],['matchupAcharisma','2.5'],['matchupHeightA',''],['matchupDistance',''],['matchupOffset',''],['matchupAstrength',''],['matchupDuration','']]){
  const previous=$(id).value;$(id).value=value;await $('saveMatchup').click();assert.equal(env.storage.get(key),before);assert.match($('matchupSummary').textContent,/Could not save scenario/);await $('runMatchup').click();assert.doesNotMatch($('matchupSummary').textContent,/playback frames simulated/);$(id).value=previous;
 }
});

test('denied storage reads and failed writes leave the setup and last saved scenario intact',async()=>{
 const {env,$}=await setup(),before=values(env),raw=env.storage.get(key),storage=globalThis.localStorage;
 try{
  globalThis.localStorage={getItem(){throw Error('Storage unavailable');},setItem(){throw Error('Quota exceeded');}};
  await $('loadMatchup').click();assert.match($('matchupSummary').textContent,/Could not load scenario: Storage unavailable/);assert.deepEqual(values(env),before);
  await $('saveMatchup').click();assert.match($('matchupSummary').textContent,/Could not save scenario: Quota exceeded/);assert.deepEqual(values(env),before);assert.equal(env.storage.get(key),raw);
 }finally{globalThis.localStorage=storage;}
});

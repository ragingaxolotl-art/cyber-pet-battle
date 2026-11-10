import test from 'node:test';import assert from 'node:assert/strict';import {fileURLToPath} from 'node:url';
import {environment} from './dom-harness.mjs';import {installWorkshop} from '../site/workshop.js';import {freshProfile} from '../site/progression.js';
const root=fileURLToPath(new URL('../site/',import.meta.url)),key='cyber-pet-battle-profile-v1:practice-demo';
async function failedSetup(){
 const env=environment(root+'index.html',root),saved=freshProfile('practice-demo');saved.sets[0].name='Saved before failure';const raw=JSON.stringify(saved);env.storage.set(key,raw);
 const write=localStorage.setItem;localStorage.setItem=(name,value)=>{if(name===key&&value!==raw)throw new DOMException('full','QuotaExceededError');return write(name,value);};
 const workshop=await installWorkshop({getPet:()=>null,pause(){},changed(){},status(){},cloud:{}});return {env,workshop,saved,raw,restore:()=>localStorage.setItem=write};
}
test('a failed credit update retains the previously saved profile for display and export',async()=>{
 const ctx=await failedSetup();try{assert.deepEqual(ctx.workshop.profile(),ctx.saved);assert.equal(ctx.env.storage.get(key),ctx.raw);}finally{ctx.restore();}
});
test('blocked profile controls explain the failure and retry restores saved progress',async()=>{
 const ctx=await failedSetup();try{
  await ctx.env.ids.get('skillTrees').onclick();assert.match(ctx.env.ids.get('treeStatus').textContent,/profile.*(cannot|unavailable|not saved)/i);
  const retry=ctx.env.ids.get('skillsDialog').querySelectorAll('button').find(b=>b.textContent==='Retry profile storage');assert.ok(retry);assert.equal(retry.hidden,false);
  ctx.restore();await retry.click();assert.equal(retry.hidden,true);assert.equal(ctx.workshop.profile().sets[0].name,'Saved before failure');assert.ok(ctx.workshop.profile().maxTrainingXP>0);assert.match(ctx.env.ids.get('treeStatus').textContent,/restored/);assert.equal(document.activeElement,ctx.env.ids.get('closeSkills'));
 }finally{ctx.restore();}
});
test('loadout dialog gives storage recovery guidance instead of claiming drafts were saved',async()=>{
 const ctx=await failedSetup();try{await ctx.env.ids.get('mapAttacks').onclick();assert.match(ctx.env.ids.get('mappingStatus').textContent,/profile.*(cannot|unavailable|not saved)/i);assert.equal(ctx.env.ids.get('saveMapping').disabled,true);}finally{ctx.restore();}
});
test('an unreadable saved profile stays intact and cannot be exported as an empty replacement',async()=>{
 const env=environment(root+'index.html',root);env.storage.set(key,'{broken');const workshop=await installWorkshop({getPet:()=>null,pause(){},changed(){},status(){},cloud:{}});
 assert.equal(env.storage.get(key),'{broken');assert.equal(env.ids.get('exportBattleProfile').disabled,true);await env.ids.get('skillTrees').onclick();assert.match(env.ids.get('treeStatus').textContent,/cannot be saved/);assert.equal(workshop.profile().petId,'practice-demo');
});

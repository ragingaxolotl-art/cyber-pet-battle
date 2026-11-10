import test from 'node:test';import assert from 'node:assert/strict';import {fileURLToPath} from 'node:url';
import {environment} from './dom-harness.mjs';import {installWorkshop} from '../site/workshop.js';import {freshProfile} from '../site/progression.js';import {freshAttack} from '../site/shared/combat-model.js';import {bankTree} from '../site/skill-trees.js';
const root=fileURLToPath(new URL('../site/',import.meta.url));
const deferred=()=>{let resolve;const promise=new Promise(r=>resolve=r);return {promise,resolve};};
async function setup(cloud={}){const env=environment(root+'index.html',root);let pet={id:'audit_a',skills:{},config:{animations:{},animation_reviewed:{}},images:new Map()};const messages=[];const workshop=await installWorkshop({getPet:()=>pet,pause(){},changed(){},status:s=>messages.push(s),cloud});const button=name=>document.querySelectorAll('button').find(b=>b.textContent===name);return {env,workshop,button,messages,switchPet:async id=>{pet={...pet,id};await workshop.openProfile();}};}
const reviews=()=>document.querySelectorAll('button').filter(b=>b.textContent==='Load website version');
test('cloud response is invalidated even when the user switches away and back to the same pet',async()=>{
 const pending=deferred();const ctx=await setup({readBattleProfile:()=>pending.promise});const load=ctx.button('Load website battle progress').click();await ctx.switchPet('audit_b');await ctx.switchPet('audit_a');const before=new Map(ctx.env.storage);
 pending.resolve({profile:freshProfile('audit_a'),revision:3});await load;assert.equal(reviews().length,0);assert.deepEqual(new Map(ctx.env.storage),before);
});
test('closing skill trees cancels pending cloud review without reopening a dialog',async()=>{
 const pending=deferred();const ctx=await setup({readBattleProfile:()=>pending.promise});await ctx.env.ids.get('skillTrees').onclick();const load=ctx.button('Load website battle progress').click();await ctx.env.ids.get('closeSkills').click();
 pending.resolve({profile:freshProfile('audit_a'),revision:3});await load;assert.equal(reviews().length,0);
});
test('cloud controls serialize pending operations',async()=>{
 const pending=deferred();const ctx=await setup({readBattleProfile:()=>pending.promise});const load=ctx.button('Load website battle progress').click();
 const busy=[ctx.button('Save battle progress to website').disabled,ctx.button('Load classroom trees').disabled];pending.resolve({profile:null,revision:0});await load;
 assert.deepEqual(busy,[true,true]);assert.equal(ctx.button('Save battle progress to website').disabled,false);
});
test('a classroom tree response cannot mutate a newly selected pet or its library',async()=>{
 const pending=deferred();const ctx=await setup({readTrees:()=>pending.promise});const load=ctx.button('Load classroom trees').click();await ctx.switchPet('audit_b');const before=new Map(ctx.env.storage),registry=structuredClone(ctx.workshop.registry());
 pending.resolve({items:[{release:bankTree([{...freshAttack(),name:'Late classroom move'}])}]});await load;
 assert.deepEqual(new Map(ctx.env.storage),before);assert.deepEqual(ctx.workshop.registry(),registry);
});
test('profile refresh failure is reported for the selected pet and preserves saved records',async()=>{
 const ctx=await setup();const before=new Map(ctx.env.storage),read=localStorage.getItem;localStorage.getItem=()=>{throw new DOMException('denied','SecurityError');};
 try{await assert.doesNotReject(ctx.switchPet('audit_b'));assert.equal(ctx.workshop.profile().petId,'audit_b');assert.ok(ctx.messages.some(s=>/Cannot save this battle profile/.test(s)));assert.deepEqual(new Map(ctx.env.storage),before);}finally{localStorage.getItem=read;}
 await ctx.switchPet('audit_b');assert.equal(ctx.workshop.profile().petId,'audit_b');
});
test('reviewed cloud load keeps training and a subsequent save uses the reviewed revision',async()=>{
 const incoming=freshProfile('audit_a');incoming.sets[0].name='Reviewed website set';const calls=[];
 const ctx=await setup({readBattleProfile:async()=>({profile:incoming,revision:4}),saveBattleProfile:async(profile,revision)=>{calls.push({profile,revision});return {revision:5};}});
 const training=ctx.workshop.profile().maxTrainingXP;await ctx.button('Load website battle progress').click();assert.equal(reviews().length,1);await reviews()[0].click();assert.equal(ctx.workshop.profile().sets[0].name,'Reviewed website set');assert.equal(ctx.workshop.profile().maxTrainingXP,training);
 await ctx.button('Save battle progress to website').click();assert.equal(calls.length,1);assert.equal(calls[0].revision,4);assert.equal(calls[0].profile.sets[0].name,'Reviewed website set');
});
test('unreviewed differing cloud data refuses saving and releases buttons for recovery',async()=>{
 const incoming=freshProfile('audit_a');incoming.sets[0].name='Keep website set';let writes=0;const ctx=await setup({readBattleProfile:async()=>({profile:incoming,revision:2}),saveBattleProfile:async()=>{writes++;}});
 await ctx.button('Save battle progress to website').click();assert.equal(writes,0);assert.equal(ctx.button('Load website battle progress').disabled,false);assert.match(ctx.env.ids.get('skillsDialog').textContent,/Load and review/);
});
test('changing pets closes an existing review without replacing the new profile',async()=>{
 const ctx=await setup({readBattleProfile:async()=>({profile:freshProfile('audit_a'),revision:2})});await ctx.button('Load website battle progress').click();assert.equal(reviews().length,1);await ctx.switchPet('audit_b');assert.equal(reviews().length,0);assert.equal(ctx.workshop.profile().petId,'audit_b');
});
test('network failures preserve data and allow another cloud request',async()=>{
 let calls=0;const ctx=await setup({readBattleProfile:async()=>{if(++calls===1)throw Error('Offline audit');return {profile:null,revision:0};}});const before=new Map(ctx.env.storage);
 await ctx.button('Load website battle progress').click();assert.deepEqual(new Map(ctx.env.storage),before);assert.match(ctx.env.ids.get('skillsDialog').textContent,/Offline audit/);
 await ctx.button('Load website battle progress').click();assert.match(ctx.env.ids.get('skillsDialog').textContent,/No website battle progress yet/);
});

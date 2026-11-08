import test from 'node:test';import assert from 'node:assert/strict';import path from 'node:path';import {fileURLToPath} from 'node:url';
import {environment} from './dom-harness.mjs';import {installMatchup} from '../site/matchup.js';import {freshAttack} from '../site/shared/combat-model.js';
const root=fileURLToPath(new URL('../site/',import.meta.url));
test('follow-up comparison controls save and restore named references and report missing attacks',async()=>{
 const env=environment(path.join(root,'index.html'),root),$=id=>env.ids.get(id);const first={...freshAttack(),name:'First',startup:0,cost:0,recovery:30},follow={...freshAttack(),name:'Second',cost:0};first.cancelWindows=[{id:'cancel_ui',start:0,duration:20,condition:'any',attacks:[follow.id]}];let list=[first,follow];const matchup=installMatchup({getAttacks:()=>list,pause:()=>{}});
 await $('openMatchup').click();$('matchupA').value=first.id;$('matchupB').value=follow.id;$('matchupActionB').value='guard';$('matchupFollowup').value=follow.id;$('matchupFollowupFrame').value='3';await $('runMatchup').click();assert.match($('matchupSummary').textContent,/cancel succeeded/);
 await $('saveMatchup').click();const saved=JSON.parse(env.storage.get('cyber-pet-matchup-scenario-v1'));assert.equal(saved.options.followupId,follow.id);assert.equal(saved.options.followupFrame,3);
 $('matchupFollowup').value='';$('matchupFollowupFrame').value='8';await $('loadMatchup').click();assert.equal($('matchupFollowup').value,follow.id);assert.equal(Number($('matchupFollowupFrame').value),3);
 saved.b=first.id;env.storage.set('cyber-pet-matchup-scenario-v1',JSON.stringify(saved));list=[first];await $('loadMatchup').click();assert.match($('matchupSummary').textContent,/saved follow-up is unavailable/);
 delete saved.options.followupId;delete saved.options.followupFrame;env.storage.set('cyber-pet-matchup-scenario-v1',JSON.stringify(saved));await $('loadMatchup').click();assert.equal($('matchupFollowup').value,'');assert.equal(Number($('matchupFollowupFrame').value),12);
 const transferred={...freshAttack(),name:'Transferred only'};const before=[...env.storage.entries()];matchup.openStudioTest({attacks:[transferred,follow],first:transferred.id,followup:follow.id,frame:7});assert.equal($('matchupA').value,transferred.id);assert.equal($('matchupFollowup').value,follow.id);assert.equal(Number($('matchupFollowupFrame').value),7);assert.deepEqual([...env.storage.entries()],before);await $('closeMatchup').click();await $('openMatchup').click();assert.ok(!$('matchupA').options.some(o=>o.value===transferred.id));
 transferred.cancelWindows=[{id:'cancel_auto',automatic:true,start:0,duration:30,condition:'any',attacks:[follow.id]}];matchup.openStudioTest({attacks:[transferred,follow],first:transferred.id,followup:follow.id,frame:0,automatic:true});assert.equal($('matchupFollowup').value,'');await $('runMatchup').click();assert.match($('matchupSummary').textContent,/1 automatic follow-up/);assert.doesNotMatch($('matchupLog').textContent,/Follow-up rejected/);
});

test('comparison duration includes delayed automatic follow-ups and survives scenario save/load',async()=>{
 const env=environment(path.join(root,'index.html'),root),$=id=>env.ids.get(id);
 const first={...freshAttack('projectile'),name:'Delayed opener',startup:0,active:2,recovery:100,cost:0,projectileSpeed:0,impactTrigger:'contact'},follow={...freshAttack(),name:'Late follow-up',cost:0};
 first.cancelWindows=[{id:'cancel_late',automatic:true,start:650,duration:20,condition:'whiff',attacks:[follow.id]}];
 installMatchup({getAttacks:()=>[first,follow],pause:()=>{}});await $('openMatchup').click();$('matchupA').value=first.id;$('matchupB').value=follow.id;$('matchupActionB').value='guard';$('matchupDistance').value=800;
 await $('runMatchup').click();assert.match($('matchupSummary').textContent,/1 automatic follow-up/);
 $('matchupDuration').value=600;await $('runMatchup').click();assert.match($('matchupSummary').textContent,/0 automatic follow-up/);assert.match($('matchupSummary').textContent,/later contacts or follow-ups may be omitted/);
 await $('saveMatchup').click();$('matchupDuration').value=900;await $('loadMatchup').click();assert.equal(Number($('matchupDuration').value),600);
 $('matchupDuration').value=901;await $('runMatchup').click();assert.match($('matchupSummary').textContent,/duration of 1–900/);
});

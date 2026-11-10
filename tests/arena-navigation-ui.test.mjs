import test from 'node:test';import assert from 'node:assert/strict';import {fileURLToPath} from 'node:url';
import {environment} from './dom-harness.mjs';
import {attackSlotStatus} from '../site/attack-slot-state.js';
import {installMatchup,compareAttacks} from '../site/matchup.js';
import {physicalCatalog} from '../site/catalog.js';
const root=fileURLToPath(new URL('../site/',import.meta.url));
test('free attacks show action blockers and cooldown instead of claiming readiness',()=>{
 const attack={name:'Jab',cost:0};
 for(const reason of ['Finish the current move','Recovering from a hit','Lower your guard before attacking','Not enough energy'])assert.equal(attackSlotStatus({attack,reason}),reason);
 assert.equal(attackSlotStatus({attack,reason:'Cooling down',cooldown:30}),'Cooling down · 0.5s');
 assert.equal(attackSlotStatus({attack,paused:true}),'Paused · resume to attack');
 assert.equal(attackSlotStatus({attack,finished:true,paused:true}),'Round finished · restart to attack');
 assert.equal(attackSlotStatus({attack}),'Ready · free');assert.equal(attackSlotStatus({attack:{cost:12},costMultiplier:.8}),'Ready · 10 energy');
 assert.equal(attackSlotStatus({attack:null,paused:true}),'Empty slot');
});
test('normal and fullscreen slots agree; loadout key names include letters and assigned moves',async()=>{
 const env=environment(root+'index.html',root),$=id=>env.ids.get(id);
 await import('../site/app.js');await new Promise(r=>setImmediate(r));
 await $('start').click();await $('attackSlots').children[8].click();env.frames.shift()(16);
 for(const id of ['attackSlots','fullscreenSlots']){
  const button=$(id).children[0],visible=button.querySelector('small').textContent;
  assert.equal(visible,'Finish the current move');assert.ok(button.getAttribute('aria-label').endsWith(' · '+visible));assert.equal(button.title,visible);
 }
 await $('mapAttacks').click();let keys=$('mappingKeys').querySelectorAll('button');assert.equal(keys.length,9);
 assert.equal(keys[8].getAttribute('aria-label'),'C: Empty slot');await keys[8].click();assert.equal($('selectedMappingKey').textContent,'Choose an attack for C');
 const select=$('mappingKeys').querySelectorAll('select')[8];select.value='attack_quick_jab';select.onchange();
 assert.equal($('mappingKeys').querySelectorAll('button')[8].getAttribute('aria-label'),'C: Quick jab');
});
test('optional comparison help opens without losing setup, closes back to its trigger and preserves simulation',async()=>{
 const env=environment(root+'index.html',root),$=id=>env.ids.get(id),attacks=physicalCatalog();installMatchup({getAttacks:()=>attacks,pause(){}});
 await $('openMatchup').click();$('matchupDistance').value='30';
 const help=$('matchupDurationTitle').querySelector('button');assert.equal(help.getAttribute('aria-label'),'Help: Test duration (frames)');assert.equal($('matchupDurationHelp').hidden,true);
 await help.click();const dialog=document.querySelectorAll('dialog').find(d=>d.getAttribute('aria-label')==='Test duration (frames) help');
 assert.equal(dialog.open,true);assert.match(dialog.textContent,/Shorter tests may end before a follow-up/);assert.equal($('matchupDialog').open,true);
 await dialog.querySelector('button').click();assert.equal(dialog.open,false);assert.equal(document.activeElement,help);assert.equal($('matchupDistance').value,'30');
 const jab=attacks.find(a=>a.id==='attack_quick_jab');const result=compareAttacks(jab,jab,{distance:30,frames:120});assert.deepEqual(result.damage,[15,15]);assert.match(result.outcome,/Trade/);
});

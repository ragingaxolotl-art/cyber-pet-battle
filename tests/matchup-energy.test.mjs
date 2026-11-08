import test from 'node:test';import assert from 'node:assert/strict';import path from 'node:path';import {fileURLToPath} from 'node:url';
import {compareAttacks,installMatchup} from '../site/matchup.js';import {freshAttack} from '../site/shared/combat-model.js';import {environment} from './dom-harness.mjs';
const root=fileURLToPath(new URL('../site/',import.meta.url));
const fixture=()=>({projectile:{...freshAttack('projectile'),startup:0,active:1,recovery:0,projectileLifetime:60,impactTrigger:'contact',projectileSpeed:10,cost:0},defense:{...freshAttack(),startup:90,cost:0,defenseWindows:[{id:'defense_reward',kind:'absorb',against:'projectile',start:0,duration:60,hits:1,energyGain:25}]}});
test('comparison exposes actual absorption energy and preserves attack costs',()=>{
 const {projectile,defense}=fixture(),result=compareAttacks(projectile,defense,{distance:200,frames:35,energyB:20});
 assert.equal(result.projectileDefenses.length,1);assert.equal(result.projectileDefenses[0].energyRestored,25);assert.ok(result.rows.some(row=>row.event.includes('25 energy restored')));
 const final=result.replay.at(-1).fighters[1];assert.ok(Math.abs(final.energy-(final.maxEnergy*.2+35*.055+25))<1e-9);
 const denied=compareAttacks({...projectile,cost:12},defense,{frames:1,energyA:0});assert.equal(denied.started[0],false);
 for(const energyB of [-1,101,.5,NaN,null,'20'])assert.throws(()=>compareAttacks(projectile,defense,{energyB}),/energy percentages/);
});
test('energy controls persist and older scenarios restore full energy',async()=>{
 const env=environment(path.join(root,'index.html'),root),$=id=>env.ids.get(id),{projectile,defense}=fixture();const api=installMatchup({getAttacks:()=>[projectile,defense],pause:()=>{}});
 await $('openMatchup').click();$('matchupA').value=projectile.id;$('matchupB').value=defense.id;$('matchupDistance').value='200';$('matchupEnergyA').value='60';$('matchupEnergyB').value='20';await $('runMatchup').click();assert.match($('matchupLog').textContent,/25 energy restored/);assert.match($('matchupFrameLabel').textContent,/energy/);
 await $('saveMatchup').click();let saved=JSON.parse(env.storage.get('cyber-pet-matchup-scenario-v1'));assert.equal(saved.options.energyA,60);assert.equal(saved.options.energyB,20);
 $('matchupEnergyB').value='100';await $('loadMatchup').click();assert.equal(Number($('matchupEnergyB').value),20);
 delete saved.options.energyA;delete saved.options.energyB;env.storage.set('cyber-pet-matchup-scenario-v1',JSON.stringify(saved));await $('loadMatchup').click();assert.equal(Number($('matchupEnergyA').value),100);assert.equal(Number($('matchupEnergyB').value),100);
 $('matchupEnergyA').value='';await $('runMatchup').click();assert.match($('matchupSummary').textContent,/energy percentages/);
 $('matchupEnergyB').value='0';api.openStudioTest({attacks:[projectile,defense],first:projectile.id,followup:defense.id,frame:1});assert.equal(Number($('matchupEnergyA').value),100);assert.equal(Number($('matchupEnergyB').value),100);
});

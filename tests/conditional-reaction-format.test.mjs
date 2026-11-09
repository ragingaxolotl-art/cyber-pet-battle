import test from 'node:test';import assert from 'node:assert/strict';
import {freshAttack,validateAttack,validateDesign} from '../site/shared/combat-model.js';
import {attacksVersion} from '../site/shared/attack-format.js';
import {emptyBank,saveToBank,validateBank} from '../site/shared/attack-bank.js';
import {resolveReactionAlternative} from '../site/shared/conditional-reactions.js';
const make=()=>({...freshAttack(),impactTrigger:'timed',behaviorVersion:2,sequenceTiming:'cast',hitEvents:[{id:'hit_alt',offset:0,duration:1,damage:10,reaction:'launch',height:40,knockback:0,frames:24,hold:5,target:'any',reactionAlternatives:[{when:'airborne',reaction:'spike',height:0,knockback:0,frames:18,hold:5,bounces:{floor:{height:20,distance:10,frames:15}}}]}]});
test('conditional reactions roundtrip in project and bank format33; old containers refuse',()=>{
 const a=make();validateAttack(a);assert.equal(attacksVersion([a]),33);
 const p={format:'cyber-pet-combat-design',version:33,attacks:[a]};assert.deepEqual(validateDesign(JSON.parse(JSON.stringify(p))),p);
 assert.throws(()=>validateDesign({...p,version:32}),/version 33/);
 const bank=saveToBank(emptyBank(),a,validateAttack);assert.equal(bank.version,33);assert.deepEqual(validateBank(JSON.parse(JSON.stringify(bank)),validateAttack),bank);assert.throws(()=>validateBank({...bank,version:32},validateAttack),/version 33/);
});
test('alternative owns its bounce settings independently',()=>{const e=make().hitEvents[0],r=resolveReactionAlternative(e,{airborne:true});assert.equal(r.bounces.floor.height,20);r.bounces.floor.height=90;assert.equal(e.reactionAlternatives[0].bounces.floor.height,20);e.reactionAlternatives[0].reaction='suspend';assert.throws(()=>validateAttack({...make(),hitEvents:[e]}),/moving alternative/);});

test('Arena catalog accepts conditional format33 and refuses mislabeled32',async()=>{const {validateCatalog}=await import('../site/catalog.js');const a=make(),p={format:'cyber-pet-combat-design',version:33,attacks:[a]};assert.deepEqual(validateCatalog(p),[a]);assert.throws(()=>validateCatalog({...p,version:32}),/version 33/);});

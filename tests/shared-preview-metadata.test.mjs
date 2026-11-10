import test from 'node:test';
import assert from 'node:assert/strict';
import {freshAttack} from '../site/shared/combat-model.js';
import {attackDiagnostics} from '../site/shared/attack-diagnostics.js';
import {projectileVisualInstances} from '../site/shared/projectile-preview-view.js';
import {validateTree} from '../site/shared/skill-tree-model.js';

test('an uncast attack does not report missed follow-ups as a collision problem',()=>{
 const attack=freshAttack(),hitResults=[{result:'Missed'}];
 assert.equal(attackDiagnostics(attack,{cast:false,hitResults,frames:[]}).some(f=>f.code==='missed-followups'),false);
 assert.equal(attackDiagnostics(attack,{cast:true,hitResults,frames:[]}).some(f=>f.code==='missed-followups'),true);
});

test('projectile artwork identifies its source attack as well as its projectile and layer',()=>{
 const effect={times:[100],canvas:[16,16],columns:1,anchor:[8,8],sheet:'sheet'};
 const attack={...freshAttack('projectile'),id:'attack_source',visuals:[{effectId:'spark',x:10,y:-20,scale:1,start:0,rate:1,loop:true}]};
 const [instance]=projectileVisualInstances([{id:7,age:0,impact:null,box:{x:30,y:-40,w:20,h:20,facing:1},attack,facing:1}],new Map([['spark',effect]]),{x:100,y:0});
 assert.equal(instance.attackId,'attack_source');assert.equal(instance.projectileId,7);assert.equal(instance.index,0);
});

test('invalid tree guidance names the current supported version',()=>{
 assert.throws(()=>validateTree({format:'cyber-pet-attack-skill-tree',version:37,nodes:[]}),/version 1–36/);
});

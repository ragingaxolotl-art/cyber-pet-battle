import test from 'node:test';import assert from 'node:assert/strict';
import {compareAttacks} from '../site/matchup.js';
import {freshAttack} from '../site/shared/combat-model.js';
test('comparison captures detached authored vulnerable shapes and falls back after action ends',()=>{
 const a={...freshAttack(),cost:0,startup:0,active:2,recovery:0,coefficient:0,base:0,hurtboxes:{frames:[{boxes:[{x:-12,y:-80,w:24,h:20,shape:'ellipse',rotation:15}]}]}};
 const result=compareAttacks(a,freshAttack(),{distance:400,offset:180,frames:20});
 const authored=result.replay.find(f=>f.fighters[0].hurtboxes[0].shape==='ellipse');assert.ok(authored);
 assert.equal(authored.fighters[0].hurtboxes[0].rotation,15);
 a.hurtboxes.frames[0].boxes[0].rotation=99;assert.equal(authored.fighters[0].hurtboxes[0].rotation,15);
 assert.equal(result.replay.at(-1).fighters[0].hurtboxes[0].h,60);
});

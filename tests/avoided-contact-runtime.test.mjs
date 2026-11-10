import test from 'node:test';
import assert from 'node:assert/strict';
import {Arena,fighter} from '../site/shared/combat-runtime.js';
import {freshAttack,defaultStats,validateAttack} from '../site/shared/combat-model.js';
import {combatPreviewFrame} from '../site/shared/combat-preview-frame.js';
const stats={...defaultStats(),speed:0};
function setup(){
 const a={...freshAttack('projectile'),id:'attack_probe',name:'Audit projectile',startup:0,active:10,recovery:0,cost:0,base:7,coefficient:0,knockback:0,hitstun:0,projectileSpeed:0,projectileLifetime:30,projectileContact:'single',hitLimit:1};
 const b={...freshAttack(),startup:30,cost:0,defenseWindows:[{id:'defense_one',kind:'invulnerability',start:0,duration:5,against:'all'}]};validateAttack(a);validateAttack(b);
 const p=fighter('A',stats),o=fighter('B',stats),game=new Arena(p,o,[a,b]);game.ai=false;game.paused=false;p.x=450;o.x=500;game.attack(p,a);game.attack(o,b);return {game,p,o};
}
test('avoided overlaps are detached facts without damage feedback or consumed hits',()=>{
 const {game,p,o}=setup(),cast=p.cast;game.tick();const shot=combatPreviewFrame(game);
 assert.equal(shot.avoidedContacts.length,1);assert.equal(shot.avoidedContacts[0].outcome,'invulnerable');assert.equal(shot.avoidedContacts[0].target,1);
 assert.equal(cast.hits,0);assert.equal(o.hp,o.maxHP);assert.deepEqual(game.contactFeedback,[]);assert.equal(o.cast.defenseState.size,0);
 shot.avoidedContacts[0].name='edited';assert.equal(game.lastAvoidedContacts[0].name,'Audit projectile');assert.doesNotThrow(()=>JSON.stringify(shot));
 game.tick();assert.equal(game.lastAvoidedContacts.length,0);
 for(let i=0;i<4;i++)game.tick();assert.equal(cast.hits,1);assert.equal(o.maxHP-o.hp,7);
});
test('leaving and reentering the projectile yields a new overlap observation',()=>{
 const {game,o}=setup();game.tick();assert.equal(game.lastAvoidedContacts.length,1);o.x=800;game.tick();assert.equal(game.lastAvoidedContacts.length,0);o.x=500;game.tick();assert.equal(game.lastAvoidedContacts.length,1);
});
test('waiting projectile does not report invulnerability while separated',()=>{
 const {game,o}=setup();o.x=800;for(let i=0;i<8;i++){game.tick();assert.equal(game.lastAvoidedContacts.length,0);}assert.equal(o.hp,o.maxHP);
});

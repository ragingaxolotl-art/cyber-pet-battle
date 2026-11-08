import test from 'node:test';import assert from 'node:assert/strict';
import {Arena,fighter} from '../site/engine.js';import {freshAttack,defaultStats} from '../site/shared/combat-model.js';
function setup(first=1,second=1){
 const stats={...defaultStats(),speed:0},a=fighter('A',stats),b=fighter('B',stats);
 const attack={...freshAttack('projectile'),startup:0,active:1,recovery:0,impactTrigger:'contact',projectileSpeed:10,cost:0,base:7,coefficient:0,knockback:0};
 const arena=new Arena(a,b,[attack]);arena.ai=false;arena.paused=false;a.x=450;b.x=550;arena.attack(a,attack);arena.attack(b,attack);arena.frame=1;
 const one=arena.launchProjectile(a,50),two=arena.launchProjectile(b,50);if(first!==null)one.durability=first;if(second!==null)two.durability=second;
 return {arena,a,b,one,two};
}
test('equal projectiles clash before either can reach a fighter',()=>{
 const {arena,a,b}=setup();for(let i=0;i<10;i++)arena.tick();assert.equal(a.hp,a.maxHP);assert.equal(b.hp,b.maxHP);assert.equal(arena.projectiles.entries.length,0);assert.ok(arena.events.some(e=>e.text==='CLASH'));
});
test('surviving projectile spends durability then reaches the opposing fighter',()=>{
 const {arena,a,b,one}=setup(2,1);arena.tick();assert.equal(one.durability,1);assert.equal(arena.lastProjectileClashes.length,1);
 for(let i=0;i<10;i++)arena.tick();assert.equal(a.hp,a.maxHP);assert.equal(b.hp,b.maxHP-7);
});
test('existing unconfigured projectiles retain simultaneous fighter trades',()=>{
 const {arena,a,b}=setup(null,null);for(let i=0;i<10;i++)arena.tick();assert.equal(a.hp,a.maxHP-7);assert.equal(b.hp,b.maxHP-7);assert.equal(arena.events.some(e=>e.text==='CLASH'),false);
});

import test from 'node:test';import assert from 'node:assert/strict';
import {Arena,fighter} from '../site/engine.js';
import {freshAttack,defaultStats,simulate,validateAttack,validateDesign} from '../site/shared/combat-model.js';
import {jugglePreset} from '../site/shared/hit-sequence.js';
import {attackVersion} from '../site/shared/attack-format.js';
const move=()=>({...freshAttack('projectile'),startup:0,active:60,recovery:30,cooldown:0,cost:0,base:7,coefficient:0,hitLimit:5,hitInterval:2,knockback:0,hitstun:0,projectileSpeed:0,projectileLifetime:90,projectileContact:'single'});
function setup(attack=move(),defense){const stats={...defaultStats(),speed:0},a=fighter('A',stats),b=fighter('B',stats),arena=new Arena(a,b,[attack]);arena.ai=false;arena.paused=false;a.x=300;b.x=350;arena.attack(a,attack);if(defense)arena.attack(b,{...freshAttack(),startup:90,cost:0,defenseWindows:[defense]});return {arena,a,b,stats};}
for(const outcome of ['hit','block','armor'])test('single contact stops after '+outcome+' and keeps owner recovery',()=>{
 const {arena,a,b}=setup(move(),outcome==='armor'?{id:'armor_one',kind:'armor',against:'all',start:0,duration:60,hits:2}:undefined);if(outcome==='block')b.guarding=true;
 const ownerCast=a.cast;for(let i=0;i<20;i++)arena.tick();assert.equal(ownerCast.hits,1);assert.equal(arena.projectiles.entries.length,0);assert.equal(a.cast,ownerCast);assert.ok(b.hp<b.maxHP);
});
test('omitted policy preserves repeated contact; explicit repeat is equivalent',()=>{for(const policy of [undefined,'repeat']){const attack={...move(),projectileContact:policy},{arena,a}=setup(attack);const cast=a.cast;for(let i=0;i<20;i++)arena.tick();assert.equal(cast.hits,5);assert.equal(arena.projectiles.entries.length,1);}});
test('invulnerability does not consume single-contact projectile',()=>{const {arena,b}=setup(move(),{id:'invulnerable_one',kind:'invulnerability',against:'all',start:0,duration:60});for(let i=0;i<4;i++)arena.tick();assert.equal(b.hp,b.maxHP);assert.equal(arena.projectiles.entries.length,1);});
test('ordinary and attached sequence previews stop at first contact',()=>{
 const attack=move(),stats={...defaultStats(),speed:0};
 for(const guard of [false,true]){const result=simulate(attack,stats,stats,{distance:50,guard});assert.equal(result.frames.at(-1).hits,1);assert.ok(result.events.some(e=>e.text.includes('first successful contact')));const hit=result.frames.find(f=>f.hits===1);assert.equal(hit.projectileAlive,false);}
 const sequence={...attack,behaviorVersion:2,impactTrigger:'contact',projectileMode:'attached',hitEvents:jugglePreset(3,3)};const result=simulate(sequence,stats,stats,{distance:50});assert.equal(result.frames.at(-1).hits,1);assert.equal(result.hitResults.filter(h=>h.result==='Connected').length,1);assert.match(result.hitResults[1].reason,/first successful contact/);
 const {arena,a}=setup(sequence),cast=a.cast;for(let i=0;i<20;i++)arena.tick();assert.equal(cast.hits,1);assert.equal(arena.projectiles.entries.length,0);
});
test('contact policy requires version19 and strict independent projectile validation',()=>{
 const attack=move();validateAttack(attack);assert.equal(attackVersion(attack),19);assert.throws(()=>validateDesign({format:'cyber-pet-combat-design',version:18,attacks:[attack]}),/version 19/);validateDesign({format:'cyber-pet-combat-design',version:19,attacks:[attack]});
 for(const projectileContact of [null,{},'pierce',true])assert.throws(()=>validateAttack({...attack,projectileContact}));
 assert.throws(()=>validateAttack({...attack,projectileLifetime:undefined}),/independent/);
});

test('single contact waits through invulnerability without using its hit budget',()=>{const attack={...move(),hitLimit:1};const {arena,a,b}=setup(attack,{id:'invulnerable_short',kind:'invulnerability',against:'all',start:0,duration:5});const cast=a.cast;for(let i=0;i<12;i++)arena.tick();assert.equal(b.maxHP-b.hp,7);assert.equal(cast.hits,1);assert.equal(arena.projectiles.entries.length,0);});
test('overlapping independent hit groups cannot double a single contact',()=>{const attack={...move(),hitboxGroups:['one','two'].map(id=>({id:'group_'+id,hitLimit:3,hitInterval:1,boxes:[{id:'box_'+id,start:0,duration:30,shape:'rectangle',x:22,y:-52,w:54,h:44}]}))};validateAttack(attack);const {arena,a,b,stats}=setup(attack),cast=a.cast;for(let i=0;i<12;i++)arena.tick();assert.equal(cast.hits,1);assert.equal(b.maxHP-b.hp,7);assert.equal(simulate(attack,stats,stats,{distance:50}).frames.at(-1).hits,1);});
test('single contact passes a dodge and hits after the dodge window',()=>{const attack={...move(),hitLimit:1};const {arena,a,b}=setup(attack);const cast=a.cast;b.dodgeStart=0;b.dodgeUntil=8;for(let i=0;i<25;i++)arena.tick();assert.equal(cast.hits,1);assert.equal(b.maxHP-b.hp,7);assert.equal(arena.projectiles.entries.length,0);});
for(const kind of ['reflect','absorb'])test('single contact respects '+kind+' before consumption',()=>{
 const attack={...move(),projectileSpeed:5,impactTrigger:'contact',hitLimit:1};const {arena,a,b}=setup(attack,{id:'defense_projectile',kind,against:'projectile',start:0,duration:60,hits:1});for(let i=0;i<35;i++)arena.tick();assert.equal(b.hp,b.maxHP);assert.equal(a.maxHP-a.hp,kind==='reflect'?7:0);assert.equal(arena.projectiles.entries.length,0);
});
import {compareAttacks} from '../site/matchup.js';
test('comparison explains zero-damage block removal exactly once through hitstop',()=>{const a={...move(),contactFeedback:{hitstop:4,blockstop:4,blockstun:4}},r=compareAttacks(a,freshAttack(),{distance:50,frames:60,actionB:'guard'});const rows=r.rows.filter(x=>x.event.includes('Projectile ended on block'));assert.equal(rows.length,1);assert.equal(r.damage[1],0);assert.equal(r.contacts[0],1);assert.equal(r.remainingProjectiles,0);});

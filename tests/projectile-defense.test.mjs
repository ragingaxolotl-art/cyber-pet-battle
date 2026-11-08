import test from 'node:test';import assert from 'node:assert/strict';
import {Arena,fighter} from '../site/engine.js';import {freshAttack,defaultStats,validateAttack,validateDesign} from '../site/shared/combat-model.js';import {attackVersion} from '../site/shared/attack-format.js';
const window=kind=>({id:'defense_projectile',kind,against:'projectile',start:0,duration:60,hits:1});
function setup(kind,extra=[]){const a=fighter('A',defaultStats()),b=fighter('B',defaultStats());const attack={...freshAttack('projectile'),startup:0,active:1,recovery:0,projectileLifetime:60,impactTrigger:'contact',projectileSpeed:10,cost:0,base:7,coefficient:0,knockback:0};
 const defense={...freshAttack(),startup:90,cost:0,defenseWindows:[...extra,window(kind)]};const arena=new Arena(a,b,[attack,defense]);arena.ai=false;arena.paused=false;a.x=200;b.x=400;arena.attack(a,attack);arena.attack(b,defense);return {arena,a,b,attack};}
for(const kind of ['reflect','absorb'])test(kind+' window prevents damage and consumes one charge',()=>{
 const {arena,a,b}=setup(kind),cast=b.cast;for(let i=0;i<45;i++)arena.tick();
 assert.equal(b.hp,b.maxHP);assert.equal(a.hp,a.maxHP-(kind==='reflect'?7:0));assert.equal(cast.defenseState.get('defense_projectile'),1);assert.ok(arena.events.some(e=>e.text===kind.toUpperCase()));
});
test('invulnerability takes precedence without spending a reflection charge',()=>{
 const {arena,a,b}=setup('reflect',[{id:'defense_invulnerable',kind:'invulnerability',against:'all',start:0,duration:60}]),cast=b.cast;
 for(let i=0;i<35;i++)arena.tick();assert.equal(a.hp,a.maxHP);assert.equal(b.hp,b.maxHP);assert.equal(cast.defenseState.get('defense_projectile'),undefined);
});
test('projectile defenses require version 9 and a projectile-only filter',()=>{
 const attack={...freshAttack(),defenseWindows:[window('reflect')]};validateAttack(attack);assert.equal(attackVersion(attack),9);
 assert.throws(()=>validateDesign({format:'cyber-pet-combat-design',version:8,attacks:[attack]}),/version 9/);
 assert.doesNotThrow(()=>validateDesign({format:'cyber-pet-combat-design',version:9,attacks:[attack]}));
 for(const patch of [{against:'all'},{hits:0},{hits:11}])assert.throws(()=>validateAttack({...attack,defenseWindows:[{...window('absorb'),...patch}]}));
});
test('absorption charge exhaustion lets the next projectile deal damage',()=>{
 const {arena,a,b,attack}=setup('absorb'),defense=b.cast;
 for(let i=0;i<20;i++)arena.tick();assert.equal(defense.defenseState.get('defense_projectile'),1);
 assert.equal(arena.attack(a,{...attack,id:'attack_second'}),true);
 for(let i=0;i<20;i++)arena.tick();assert.equal(b.hp,b.maxHP-7);assert.equal(defense.defenseState.get('defense_projectile'),1);
});
for(const kind of ['reflect','absorb'])test(kind+' sequence comparison reports defense and correct returning damage',async()=>{
 const {compareAttacks}=await import('../site/matchup.js');const {jugglePreset}=await import('../site/shared/hit-sequence.js');
 const projectile={...freshAttack('projectile'),startup:0,cost:0,projectileSpeed:10,projectileLifetime:90,behaviorVersion:2,projectileMode:'attached',impactTrigger:'contact',hitEvents:jugglePreset(3,3)};
 const defense={...freshAttack(),startup:90,cost:0,defenseWindows:[window(kind)]};
 const result=compareAttacks(projectile,defense,{distance:200,frames:70});
 assert.equal(result.projectileDefenses.length,1);assert.equal(result.projectileDefenses[0].result,kind==='reflect'?'Reflected':'Absorbed');assert.equal(result.damage[1],0);
 assert.equal(result.damage[0],kind==='reflect'?21:0);assert.ok(result.rows.some(row=>row.event.includes('0 defense charges left')));
});
test('legacy cast-owned projectiles are not silently absorbed',()=>{
 const {arena,a,b,attack}=setup('absorb');a.cast=null;const legacy={...attack,id:'attack_legacy'};delete legacy.projectileLifetime;arena.attack(a,legacy);const defense=b.cast;
 for(let i=0;i<35;i++)arena.tick();assert.equal(b.hp,b.maxHP-7);assert.equal(defense.defenseState.get('defense_projectile'),undefined);
});
test('a defense window ending before contact does not intercept the projectile',()=>{
 const {arena,b}=setup('reflect');b.cast.a.defenseWindows[0].duration=2;
 for(let i=0;i<35;i++)arena.tick();assert.equal(b.hp,b.maxHP-7);
});

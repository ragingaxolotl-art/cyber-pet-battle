import test from 'node:test';
import assert from 'node:assert/strict';
import {Arena,fighter,RULES} from '../site/engine.js';
import {defaultStats,freshAttack,simulate} from '../site/shared/combat-model.js';
import {jugglePreset} from '../site/shared/hit-sequence.js';
import {movementMultiplier,statusMultiplier} from '../site/shared/status-rules.js';
const stats=defaultStats();
function setup(a){const p=fighter('P',stats),o=fighter('O',stats),arena=new Arena(p,o,[a]);p.x=450;o.x=500;arena.paused=false;arena.ai=false;return {p,o,arena};}
const effect=(type,power)=>({type,power,next:999,until:999,interval:10});
for(const power of [0,25,100])for(const type of ['slow','haste'])test(`${type} ${power}% controls actual movement`,()=>{
 const {p,arena}=setup(freshAttack());p.statuses=[effect(type,power)];arena.tick(new Set(['ArrowRight']));
 const factor=type==='slow'?1-power/100:1+power/100;
 assert.ok(Math.abs(p.x-450-(RULES.move+stats.speed*.012)*factor)<1e-8);
});
test('slow and haste combine, repeated statuses do not multiply themselves',()=>{
 assert.equal(movementMultiplier([effect('slow',50),effect('haste',100)]),1);
 assert.equal(statusMultiplier([effect('weaken',25),effect('weaken',50)],'weaken'),.5);
});
for(const sequence of [false,true])test(`weaken reduces ${sequence?'sequence':'legacy'} damage`,()=>{
 const a={...freshAttack('projectile'),startup:0,active:1,base:20,coefficient:0,knockback:0};
 if(sequence)Object.assign(a,{behaviorVersion:2,impactTrigger:'contact',projectileMode:'attached',hitEvents:[{...jugglePreset()[0],damage:20}]});
 const {p,o,arena}=setup(a);p.statuses=[effect('weaken',50)];arena.attack(p,a);arena.tick();assert.equal(o.maxHP-o.hp,10);
});
test('weaken does not reduce healing',()=>{
 const a={...freshAttack('heal'),startup:0,active:1,base:20,coefficient:0};const {p,arena}=setup(a);p.hp=50;p.statuses=[effect('weaken',100)];arena.attack(p,a);arena.tick();assert.equal(p.hp,70);
});
test('Studio incoming attack honors authored weaken percentage',()=>{
 const a={...freshAttack(),startup:0,active:1,base:0,coefficient:0,knockback:0,hitstun:0,status:'weaken',statusPower:50,statusDuration:60};
 const sim=simulate(a,stats,stats,{distance:50,incomingDamage:20,incomingFrame:40,selfHP:1});assert.equal(sim.frames[40].self.hp,sim.frames[40].self.maxHP-10);
});
test('expired movement effect stops changing movement',()=>{
 const {p,arena}=setup(freshAttack());p.statuses=[{...effect('slow',100),until:2}];arena.tick(new Set(['ArrowRight']));assert.equal(p.x,450);arena.tick(new Set(['ArrowRight']));assert.ok(p.x>450);
});

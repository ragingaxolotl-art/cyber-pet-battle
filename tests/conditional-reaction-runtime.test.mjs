import test from 'node:test';import assert from 'node:assert/strict';
import {Arena,fighter} from '../site/shared/combat-runtime.js';
import {freshAttack,defaultStats,simulate,validateAttack} from '../site/shared/combat-model.js';
const stats={...defaultStats(),speed:0};
function move(){return {...freshAttack(),impactTrigger:'timed',cost:0,startup:0,active:1,recovery:1,status:'none',behaviorVersion:2,sequenceTiming:'cast',box:{x:0,y:-100,w:150,h:100},hitEvents:[{id:'hit_branch',offset:0,duration:1,damage:10,reaction:'launch',height:40,knockback:0,frames:24,hold:5,target:'any',reactionAlternatives:[{when:'airborne',reaction:'spike',height:0,knockback:0,frames:18,hold:5,hitstun:12}]}]};}
function setup(y){const a=fighter('A',stats),b=fighter('B',stats),attack=move(),arena=new Arena(a,b,[attack]);a.x=450;b.x=510;b.y=y;arena.ai=false;arena.paused=false;arena.attack(a,attack);return {a,b,arena,attack};}
test('Arena chooses launch on ground and spike in air with identical damage',()=>{
 for(const [height,reaction] of [[0,'launch'],[-40,'spike']]){const {arena,b}=setup(height);arena.tick();assert.equal(b.pulseMotion.event.reaction,reaction);assert.equal(b.hp,b.maxHP-10);}
});
test('reaction choice survives target mutation after collision snapshot',()=>{
 const {arena,a,b}=setup(-40);arena.frame=1;const snapshot=arena.prepare(a,b);b.y=0;arena.resolveSequence(a,b,snapshot);assert.equal(b.pulseMotion.event.reaction,'spike');
});
test('alternative authored hitstun is scaled after selecting the branch',()=>{
 const {arena,a,b,attack}=setup(-40);a.cast.a.hitstunScaling={step:3,minimum:1};arena.combos.contact(a,b,'hit',1);arena.combos.beginFrame(1,new Map([[b,{locked:true}]]));arena.frame=1;arena.resolveSequence(a,b,arena.prepare(a,b));assert.equal(b.pulseMotion.event.hitstun,9);
});
test('Studio preview selects corresponding grounded and airborne reactions',()=>{
 const attack=move();validateAttack(attack);
 for(const [height,reaction] of [[0,'launch'],[40,'spike']]){const sim=simulate(attack,stats,stats,{distance:60,targetHeight:height});assert.equal(sim.frames[0].target.pulseMotion.event.reaction,reaction);assert.equal(sim.frames[0].hits,1);}
});
test('malformed alternatives fail attack validation',()=>{const attack=move();attack.hitEvents[0].reactionAlternatives[0].when='blocked';assert.throws(()=>validateAttack(attack));});

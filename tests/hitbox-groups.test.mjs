import test from 'node:test';import assert from 'node:assert/strict';
import {validateHitboxGroups,activeGroupBoxes,activeGroupContacts,createGroupHitTracker} from '../site/shared/hitbox-groups.js';
const box=id=>({id,start:2,duration:3,shape:'rectangle',x:0,y:0,w:20,h:20});
const group=(id='group_one')=>({id,hitLimit:2,hitInterval:3,boxes:[box('box_one'),box('box_two')]});
test('overlapping shapes in a group yield one contact and obey exclusive window end',()=>{const groups=validateHitboxGroups([group()]),target={x:5,y:5,w:5,h:5};assert.equal(activeGroupContacts(groups,1,target).length,0);assert.equal(activeGroupContacts(groups,2,target).length,1);assert.equal(activeGroupContacts(groups,4,target).length,1);assert.equal(activeGroupContacts(groups,5,target).length,0);});
test('hit claims are independent per target and group and enforce rehit timing',()=>{const tracker=createGroupHitTracker(),g=group();assert.equal(tracker.claim('A',g,2),true);assert.equal(tracker.claim('A',g,2),false);assert.equal(tracker.claim('A',g,4),false);assert.equal(tracker.claim('B',g,2),true);assert.equal(tracker.claim('A',group('group_two'),2),true);assert.equal(tracker.claim('A',g,5),true);assert.equal(tracker.claim('A',g,8),false);});
test('malformed and oversized groups are rejected',()=>{assert.throws(()=>validateHitboxGroups([group(),group()]));const g=group();g.boxes[1].id=g.boxes[0].id;assert.throws(()=>validateHitboxGroups([g]));assert.throws(()=>validateHitboxGroups([{...group(),hitInterval:0}]));assert.throws(()=>validateHitboxGroups([{...group(),boxes:[{...box('box_one'),duration:601}]}]));});

import {Arena,fighter} from '../site/engine.js';
import {freshAttack,defaultStats,simulate,validateAttack} from '../site/shared/combat-model.js';
const stats=defaultStats();
for(const direction of [-1,1])for(const separate of [false,true])test(`runtime and preview groups direction=${direction} separate=${separate}`,()=>{
 const hitbox=id=>({id,start:0,duration:7,shape:'rectangle',x:22,y:-52,w:54,h:44});
 const first={id:'group_first',hitLimit:2,hitInterval:3,boxes:[hitbox('box_a'),hitbox('box_b')]};
 const groups=separate?[{...first,boxes:[hitbox('box_a')]},{...first,id:'group_second',boxes:[hitbox('box_b')]}]:[first];
 const a={...freshAttack(),startup:0,active:7,base:5,coefficient:0,knockback:0,hitstun:0,hitboxGroups:groups};validateAttack(a);
 const sim=simulate(a,stats,stats,{distance:50,targetHP:1,facing:direction,targetSide:direction});
 const p=fighter('P',stats),o=fighter('O',stats),arena=new Arena(p,o,[a]);p.x=450;o.x=450+50*direction;arena.paused=false;arena.ai=false;arena.attack(p,a);
 for(let age=0;age<8;age++){arena.tick();assert.equal(o.hp,sim.frames[age].target.hp,`HP at ${age}`);}
 assert.equal(o.maxHP-o.hp,separate?20:10);
});
test('groups outside active duration and ambiguous sequence combinations are rejected',()=>{
 const a={...freshAttack(),hitboxGroups:[group()]};a.active=4;assert.throws(()=>validateAttack(a),/active duration/);
 a.active=12;a.impactTrigger='contact';assert.throws(()=>validateAttack(a),/timed damage/);
});

for(const defense of ['block','dodge'])test(`group hits respect authored ${defense} windows`,()=>{
 const a={...freshAttack(),startup:0,active:4,base:10,coefficient:0,knockback:0,hitstun:0,hitboxGroups:[{id:'group_first',hitLimit:1,hitInterval:1,boxes:[{id:'box_defense',start:0,duration:4,shape:'rectangle',x:22,y:-52,w:54,h:44}]}]};
 const d={...freshAttack(),startup:0,active:4,payload:defense,delivery:'self',blockPercent:100};
 const p=fighter('P',stats),o=fighter('O',stats),arena=new Arena(p,o,[a,d]);p.x=450;o.x=500;arena.paused=false;arena.ai=false;arena.attack(p,a);arena.attack(o,d);arena.tick();assert.equal(o.hp,o.maxHP);assert.ok(arena.events.some(e=>e.text.includes(defense==='block'?'GUARD':'DODGE')));
});
test('group windows control contact independently of the legacy primary box',()=>{
 const a={...freshAttack(),startup:0,active:6,base:5,coefficient:0,knockback:0,hitstun:0,box:{x:-400,y:-400,w:1,h:1},hitboxGroups:[{id:'group_delayed',hitLimit:1,hitInterval:1,boxes:[{id:'box_delayed',start:3,duration:1,shape:'rectangle',x:22,y:-52,w:54,h:44}]}]};
 const sim=simulate(a,stats,stats,{distance:50,targetHP:1});assert.equal(sim.frames[2].hits,0);assert.equal(sim.frames[3].hits,1);assert.equal(sim.frames[5].hits,1);
 const p=fighter('P',stats),o=fighter('O',stats),arena=new Arena(p,o,[a]);p.x=450;o.x=500;arena.paused=false;arena.ai=false;arena.attack(p,a);
 for(let frame=0;frame<6;frame++){arena.tick();assert.equal(o.hp,sim.frames[frame].target.hp);}
});

test('preview boxes expose only active shapes with stable selection IDs',()=>{
 const groups=[group()];assert.deepEqual(activeGroupBoxes(groups,1),[]);
 const boxes=activeGroupBoxes(groups,2,b=>({...b,x:b.x+100}));assert.equal(boxes.length,2);assert.equal(boxes[0].x,100);assert.equal(boxes[0].groupId,'group_one');assert.equal(boxes[1].boxId,'box_two');assert.deepEqual(activeGroupBoxes(groups,5),[]);
 const a={...freshAttack(),startup:0,active:6,hitboxGroups:groups};const sim=simulate(a,stats,stats,{distance:50});assert.equal(sim.frames[1].boxes.length,0);assert.equal(sim.frames[2].boxes.length,2);assert.equal(sim.frames[5].boxes.length,0);
});

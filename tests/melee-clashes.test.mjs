import test from 'node:test';import assert from 'node:assert/strict';
import {validateMeleeClash,resolveMeleeClashes,meleeClashBoxes} from '../site/shared/melee-clashes.js';
const snapshot=(id,priority,x=0)=>({id,owner:id,attack:{delivery:'melee',payload:'damage',...(priority===undefined?{}:{meleeClash:{priority}})},boxes:[{x,y:0,w:20,h:20,shape:'rectangle'}]});
test('ordinary attacks and one-sided opt-in retain normal contact handling',()=>{
 assert.equal(resolveMeleeClashes([snapshot('a'),snapshot('b')]).contacts.length,0);
 assert.equal(resolveMeleeClashes([snapshot('a',9),snapshot('b')]).contacts.length,0);
});
test('equal priorities clash while unequal priorities stop only the weaker move',()=>{
 assert.deepEqual([...resolveMeleeClashes([snapshot('a',2),snapshot('b',2)]).stopped],['a','b']);
 const a=snapshot('a',1),b=snapshot('b',3),before=structuredClone([a,b]);
 const result=resolveMeleeClashes([a,b]);assert.deepEqual([...result.stopped],['a']);assert.equal(result.contacts[0].winner,'b');assert.deepEqual(resolveMeleeClashes([b,a]),result);assert.deepEqual([a,b],before);
});
test('geometry and ownership gate clashes; overlapping regions count once',()=>{
 assert.equal(resolveMeleeClashes([snapshot('a',2),snapshot('b',2,30)]).contacts.length,0);
 const a=snapshot('a',2),b=snapshot('b',2);b.owner=a.owner;assert.equal(resolveMeleeClashes([a,b]).contacts.length,0);
 b.owner='b';a.boxes.push({...a.boxes[0]});b.boxes.push({...b.boxes[0]});assert.equal(resolveMeleeClashes([a,b]).contacts.length,1);
});
test('clash definitions reject incompatible delivery and malformed priorities',()=>{
 validateMeleeClash({});for(const rule of [null,{},[],{priority:-1},{priority:10},{priority:.5},{priority:1,damage:99}])assert.throws(()=>validateMeleeClash({delivery:'melee',payload:'damage',meleeClash:rule}));
 assert.throws(()=>validateMeleeClash({delivery:'projectile',payload:'damage',meleeClash:{priority:1}}));
});

test('scheduled active geometry honors group references without consuming events',()=>{
 const attack={delivery:'melee',meleeClash:{priority:1},hitEvents:[{id:'hit_one',offset:2,duration:1,hitboxGroup:'group_one'}]};
 const state={startFrame:3,contactFrame:null,consumed:new Set(),cancelled:null};
 const one={groupId:'group_one'},two={groupId:'group_two'};
 const sample={age:5,cast:{a:attack,tm:{startup:3},sequence:state},boxes:[one,two],box:{}};
 assert.deepEqual(meleeClashBoxes(sample),[one]);assert.equal(state.consumed.size,0);
 assert.deepEqual(meleeClashBoxes({...sample,age:4}),[]);assert.deepEqual(meleeClashBoxes({...sample,age:6}),[]);
 state.consumed.add('hit_one');assert.deepEqual(meleeClashBoxes(sample),[]);
});

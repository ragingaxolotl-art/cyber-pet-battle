import test from 'node:test';import assert from 'node:assert/strict';
import {ProjectileClashes} from '../site/shared/projectile-clashes.js';
const shape=(x=0,kind='rectangle')=>({x,y:0,w:20,h:20,shape:kind});
const source=(id,owner,durability=1,boxes=[shape()])=>({id,owner,durability,boxes});
test('equal durability cancels both; stronger projectile spends one point',()=>{
 const resolver=new ProjectileClashes();let result=resolver.resolve([source(1,'A'),source(2,'B')]);assert.deepEqual([...result.destroyed],[1,2]);
 resolver.clear();result=resolver.resolve([source(1,'A',3),source(2,'B')]);assert.equal(result.remaining.get(1),2);assert.deepEqual([...result.destroyed],[2]);
});
test('continuous overlap counts once, separation permits another clash',()=>{
 const resolver=new ProjectileClashes(),a=source(1,'A',3),b=source(2,'B',3);
 let result=resolver.resolve([a,b]);a.durability=result.remaining.get(1);b.durability=result.remaining.get(2);
 assert.equal(resolver.resolve([a,b]).contacts.length,0);
 b.boxes=[shape(100)];resolver.resolve([a,b]);b.boxes=[shape()];
 result=resolver.resolve([a,b]);assert.equal(result.remaining.get(1),1);assert.equal(result.contacts.length,1);
});
test('all simultaneous contacts resolve regardless of source processing order',()=>{
 const sources=[source(1,'A'),source(2,'B'),source(3,'B')];
 for(const ordered of [sources,[sources[2],sources[0],sources[1]],[...sources].reverse()]){
  const result=new ProjectileClashes().resolve(ordered);assert.deepEqual(result.contacts,[{first:1,second:2},{first:1,second:3}]);assert.deepEqual([...result.destroyed],[1,2,3]);
 }
 assert.deepEqual(sources.map(s=>s.durability),[1,1,1]);
});
test('multiple overlapping hitboxes spend one point per projectile pair',()=>{
 const result=new ProjectileClashes().resolve([source(1,'A',3,[shape(),shape(2)]),source(2,'B',3,[shape(),shape(3)])]);assert.equal(result.contacts.length,1);assert.equal(result.remaining.get(1),2);
});
test('friendly, unconfigured and nonoverlapping shapes do not clash',()=>{
 const resolver=new ProjectileClashes();assert.equal(resolver.resolve([source(1,'A'),source(2,'A')]).contacts.length,0);
 const plain=source(2,'B');delete plain.durability;assert.equal(resolver.resolve([source(1,'A'),plain]).contacts.length,0);
 const corner={...shape(15,'diamond'),y:15};assert.equal(resolver.resolve([source(1,'A',1,[shape(0,'diamond')]),source(2,'B',1,[corner])]).contacts.length,0);
});
test('reset clears contact history and retired sources do not retain pair entries',()=>{
 const resolver=new ProjectileClashes(),sources=[source(1,'A',5),source(2,'B',5)];resolver.resolve(sources);resolver.clear();assert.equal(resolver.resolve(sources).contacts.length,1);
 resolver.resolve([]);assert.equal(resolver.overlaps.size,0);assert.equal(resolver.resolve(sources).contacts.length,1);
});

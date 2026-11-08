import test from 'node:test';
import assert from 'node:assert/strict';
import {createClassroomBank,emptyBank} from '../site/shared/attack-bank.js';

for(const status of [401,502,200])test('unreadable classroom response retains status '+status,async()=>{
 let requests=0;
 const remote=createClassroomBank(()=>{},async()=>{requests++;return {status,ok:status===200,json:async()=>{throw new SyntaxError('HTML, not JSON');}};});
 remote.restore({token:'a'.repeat(64),expires:Date.now()/1000+3600});
 const bank=emptyBank(),before=structuredClone(bank);
 await assert.rejects(remote.write(bank,4),error=>{
  assert.equal(error.status,status);assert.match(error.message,status===401?/connection expired/:/unreadable response/);return true;
 });
 assert.equal(remote.connected(),status!==401);assert.equal(requests,1,'uncertain writes must not be automatically retried');assert.deepEqual(bank,before);
});
test('conflict fallback explains recovery without mutating or retrying the bank',async()=>{
 let calls=0;const remote=createClassroomBank(()=>{},async()=>{calls++;return {status:409,ok:false,json:async()=>null};});
 const bank=emptyBank();await assert.rejects(remote.write(bank,3),error=>error.status===409&&/changed on another device/.test(error.message));
 assert.equal(calls,1);assert.deepEqual(bank,emptyBank());
});
